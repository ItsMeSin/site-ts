const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Devis = require("../models/Devis");
const generatePDF = require("../utils/generateStylePDF"); // Assure-toi que le chemin est correct

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

// ✅ Route pour créer un devis
router.post("/", upload.array("photos"), async (req, res) => {
    try {
        const { nom, email, telephone, details, prestations, service, quantite, prixEstime } = req.body;
        const photos = req.files.map(file => `/uploads/${file.filename}`);

        let parsedPrestations = [];

        // 🟢 Cas 1 : le front envoie un tableau de prestations (JSON)
        if (prestations) {
            parsedPrestations = JSON.parse(prestations);
        }

        // 🟢 Cas 2 : le front envoie juste service/quantite/prixEstime
        if (service && quantite && prixEstime) {
            parsedPrestations.push({
                designation: service,
                quantite: Number(quantite),
                prixUnitaire: Number(prixEstime),
            });
        }

        // 🔹 Calcul totaux
        const totalHT = parsedPrestations.reduce(
            (sum, p) => sum + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tauxTVA = 0.20;
        const tva = totalHT * tauxTVA;
        const totalTTC = totalHT + tva;

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

        res.json({ message: "✅ Devis créé avec succès", devis: newDevis });
    } catch (err) {
        console.error("❌ Erreur création devis :", err);
        res.status(500).json({ error: "Erreur serveur lors de la création du devis" });
    }
});

// ✅ Route pour récupérer tous les devis (admin ou test)
router.get("/", async (req, res) => {
    try {
        const devis = await Devis.find().sort({ createdAt: -1 });
        res.json(devis);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;


/* ------------------------- 📌 MODIFIER UN DEVIS ------------------------- */
router.put("/:id", upload.array("photos"), async (req, res) => {
    try {
        const { nom, email, telephone, details, prestations } = req.body;
        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ error: "Devis introuvable" });

        // Champs simples
        devis.nom = nom || devis.nom;
        devis.email = email || devis.email;
        devis.telephone = telephone || devis.telephone;
        devis.details = details || devis.details;

        // Prestations
        if (prestations) {
            devis.prestations = JSON.parse(prestations);
        }

        // Photos si re-upload
        if (req.files && req.files.length > 0) {
            devis.photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Recalcul des totaux
        const totalHT = devis.prestations.reduce(
            (sum, p) => sum + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tauxTVA = 0.20;
        devis.totalHT = totalHT;
        devis.tva = totalHT * tauxTVA;
        devis.totalTTC = totalHT + devis.tva;

        // Sauvegarde + régénération PDF
        await devis.save();
        const pdfPath = path.join(__dirname, "../pdfs", `devis-${devis._id}.pdf`);
        await generatePDF(devis, pdfPath);

        devis.pdfPath = `/pdfs/devis-${devis._id}.pdf`;
        await devis.save();

        res.json({ message: "✅ Devis mis à jour et PDF régénéré", devis });
    } catch (err) {
        console.error("❌ Erreur update devis :", err);
        res.status(500).json({ error: "Erreur serveur update devis" });
    }
});

/* ------------------------- 📌 GET TOUS LES DEVIS ------------------------- */
router.get("/", async (req, res) => {
    try {
        const devis = await Devis.find().sort({ createdAt: -1 });
        res.json(devis);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
