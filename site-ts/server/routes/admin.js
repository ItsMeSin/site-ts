const express = require("express");
const jwt = require("jsonwebtoken");
const Devis = require("../models/Devis"); // 👈 ton modèle MongoDB
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const generatePDF = require("../pdfGenerator");

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

// 📌 Supprimer un devis
router.delete("/devis/:id", verifyToken, async (req, res) => {
    try {
        const devis = await Devis.findByIdAndDelete(req.params.id);
        if (!devis) {
            return res.status(404).json({ message: "Devis introuvable" });
        }
        res.json({ message: "✅ Devis supprimé avec succès" });
    } catch (err) {
        console.error("❌ Erreur suppression devis :", err);
        res.status(500).json({ error: "Erreur serveur lors de la suppression" });
    }
});
// 📌 Mise à jour d’un devis par l’artisan
router.put("/devis/:id", verifyToken, async (req, res) => {
    try {
        const { prestations = [], details } = req.body;

        // Calculs automatiques
        const totalHT = prestations.reduce(
            (sum, p) => sum + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tauxTVA = 0.20; // 20 %
        const tva = totalHT * tauxTVA;
        const totalTTC = totalHT + tva;

        const updatedDevis = await Devis.findByIdAndUpdate(
            req.params.id,
            {
                prestations,
                details,
                totalHT,
                tva,
                totalTTC,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!updatedDevis) {
            return res.status(404).json({ message: "Devis non trouvé" });
        }

        res.json(updatedDevis);
    } catch (err) {
        console.error("❌ Erreur mise à jour devis :", err);
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

        if (!fs.existsSync(path.join(__dirname, "../pdfs"))) {
            fs.mkdirSync(path.join(__dirname, "../pdfs"));
        }

        // ✅ maintenant ça marche
        await generatePDF(devis, filePath);

        res.download(filePath, fileName);
    } catch (err) {
        console.error("Erreur génération PDF :", err);
        res.status(500).json({ message: "Erreur génération PDF" });
    }
});



module.exports = router;
