const express = require("express");
const jwt = require("jsonwebtoken");
const Devis = require("../models/Devis"); // 👈 ton modèle MongoDB
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const generateStyledPDF = require("../utils/generateStylePDF");

console.log("✅ routes/admin.js chargé");

// 🔑 Clé secrète pour JWT
const JWT_SECRET = "super_secret_key"; // ⚠️ mets ça dans .env en prod

// ✅ Middleware pour protéger les routes admin
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ message: "Token manquant" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token invalide" });
        req.user = user;
        next();
    });
}

// 📌 Route de connexion admin (login)
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("Tentative de connexion :", email, password); // 👈 log côté serveur

    try {
        if (email === "admin@tscouverture.fr" && password === "admin123") {
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "2h" });
            console.log("✅ Connexion réussie :", email);
            return res.json({ token });
        } else {
            console.log("❌ Identifiants invalides");
            return res.status(401).json({ message: "Identifiants invalides" });
        }
    } catch (err) {
        console.error("🔥 Erreur dans /login :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get("/test", (req, res) => {
    res.json({ message: "✅ Route admin OK" });
});

// 📌 Route pour récupérer tous les devis (protégée)
router.get("/devis", verifyToken, async (req, res) => {
    try {
        const devis = await Devis.find().sort({ date: -1 });
        res.json(devis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 📌 Générer un PDF pour un devis
router.get("/devis/:id/pdf", verifyToken, async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé" });
        }

        const fileName = `devis-${devis._id}.pdf`;
        const filePath = path.join(__dirname, `../pdfs/${fileName}`);

        await generateStyledPDF(devis, filePath);

        res.download(filePath, fileName);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur génération PDF" });
    }
});

module.exports = router;
