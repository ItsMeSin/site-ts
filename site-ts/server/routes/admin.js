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

        if (!fs.existsSync(path.join(__dirname, "../pdfs"))) {
            fs.mkdirSync(path.join(__dirname, "../pdfs"));
        }

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // === HEADER moderne ===
        doc.rect(0, 0, doc.page.width, 80).fill("#1a73e8"); // bande bleue
        doc.fillColor("white").font("Helvetica-Bold").fontSize(24).text("TS Couverture", 50, 30);
        doc.font("Helvetica").fontSize(12).text("Devis détaillé", 400, 40, { align: "right" });

        doc.moveDown(4);

        // === SECTION CLIENT ===
        doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("Informations client :");
        doc.moveDown(0.5);
        doc.font("Helvetica").fontSize(12)
            .text(`👤 Nom : ${devis.nom}`)
            .text(`📧 Email : ${devis.email}`)
            .text(`📞 Téléphone : ${devis.telephone}`)
            .text(`🛠️ Service demandé : ${devis.service}`);
        doc.moveDown(2);

        // === TABLEAU DES PRESTATIONS ===
        doc.font("Helvetica-Bold").fontSize(14).fillColor("#1a73e8").text("Détails des prestations :");
        doc.moveDown();

        const tableTop = doc.y;
        const col1 = 60, col2 = 260, col3 = 360, col4 = 460;

        // Ligne d’en-tête
        doc.rect(col1 - 10, tableTop, 500, 25).fill("#1a73e8").stroke();
        doc.fillColor("white").fontSize(12);
        doc.text("Désignation", col1, tableTop + 7);
        doc.text("Quantité", col2, tableTop + 7);
        doc.text("PU (€)", col3, tableTop + 7);
        doc.text("Total (€)", col4, tableTop + 7);

        // Contenu du tableau
        const rowY = tableTop + 30;
        const total = (devis.quantite || 1) * (devis.prixEstime || 0);

        // Fond alterné (gris clair)
        doc.rect(col1 - 10, rowY, 500, 25).fill("#f9f9f9").stroke();

        doc.fillColor("black").font("Helvetica").fontSize(12);
        doc.text(devis.service || "-", col1, rowY + 7);
        doc.text(devis.quantite || "1", col2, rowY + 7);
        doc.text(`${devis.prixEstime || 0} €`, col3, rowY + 7);
        doc.text(`${total || 0} €`, col4, rowY + 7);

        doc.moveDown(4);

        // === TOTAL GÉNÉRAL ===
        doc.rect(300, doc.y, 200, 40).fill("#e63946").stroke();
        doc.fillColor("white").font("Helvetica-Bold").fontSize(14)
            .text(`💰 Total général : ${total} €`, 310, doc.y + 12);

        doc.moveDown(5);

        // === FOOTER élégant ===
        doc.fillColor("#555").font("Helvetica-Oblique").fontSize(10)
            .text("Merci pour votre confiance - TS Couverture", 50, doc.page.height - 50, { align: "center" });

        doc.end();

        stream.on("finish", () => {
            res.download(filePath, fileName);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur génération PDF" });
    }
});


module.exports = router;
