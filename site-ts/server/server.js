// server/index.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Stockage des fichiers avec multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

// Enregistrement des devis (simple fichier JSON)
const devisFile = path.join(__dirname, "devis.json");
function saveDevis(devis) {
    let devisList = [];
    if (fs.existsSync(devisFile)) {
        devisList = JSON.parse(fs.readFileSync(devisFile));
    }
    devisList.push(devis);
    fs.writeFileSync(devisFile, JSON.stringify(devisList, null, 2));
}

// Route POST
app.post("/api/devis", upload.array("photos"), (req, res) => {
    try {
        const { nom, email, telephone, service, quantite, details, prixEstime } = req.body;
        const photos = req.files.map((file) => `/uploads/${file.filename}`);

        const nouveauDevis = {
            nom,
            email,
            telephone,
            service,
            quantite: Number(quantite),
            details,
            prixEstime: Number(prixEstime),
            photos,
            date: new Date().toISOString(),
        };

        saveDevis(nouveauDevis);
        res.status(200).json({ message: "Devis reçu", devis: nouveauDevis });
    } catch (error) {
        console.error("Erreur lors de l’enregistrement du devis :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
