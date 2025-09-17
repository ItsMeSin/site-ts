const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Devis = require("../models/Devis");
const generatePDF = require("../pdfGenerator"); // ton fichier de génération PDF

const router = express.Router();

// 📂 Config Multer (upload photos)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// 📌 Route création devis
router.post("/", upload.array("photos"), async (req, res) => {
    try {
        const { nom, email, telephone, details, prestations } = req.body;
        const photos = req.files.map(file => `/uploads/${file.filename}`);

        // ⚠️ prestations vient du front => il faut la parser si envoyée en JSON
        let parsedPrestations = [];
        if (prestations) {
            parsedPrestations = JSON.parse(prestations);
        }

        // 1️⃣ Calcul HT, TVA et TTC
        const totalHT = parsedPrestations.reduce(
            (sum, p) => sum + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tauxTVA = 0.20; // 20%
        const tva = totalHT * tauxTVA;
        const totalTTC = totalHT + tva;

        // 2️⃣ Enregistrement MongoDB
        const newDevis = new Devis({
            nom,
            email,
            telephone,
            details,
            photos,
            prestations: parsedPrestations,
            totalHT,
            tva,
            totalTTC,
        });
        await newDevis.save();

        // 3️⃣ Générer PDF et le sauvegarder
        const pdfDir = path.join(__dirname, "../pdfs");
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `devis-${newDevis._id}.pdf`);
        await generatePDF(newDevis, pdfPath);

        // 4️⃣ Mettre à jour avec le chemin PDF
        newDevis.pdfPath = `/pdfs/devis-${newDevis._id}.pdf`;
        await newDevis.save();

        // 5️⃣ Réponse front
        res.json({
            message: "✅ Devis enregistré et PDF généré",
            devis: newDevis,
        });
    } catch (err) {
        console.error("❌ Erreur lors de la création du devis :", err);
        res.status(500).json({ error: "Erreur serveur lors de la création du devis" });
    }
});

// 📌 Route GET pour tous les devis (admin)
router.get("/", async (req, res) => {
    try {
        const devis = await Devis.find().sort({ createdAt: -1 });
        res.json(devis);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
