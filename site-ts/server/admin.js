const express = require("express");
const jwt = require("jsonwebtoken");
const Devis = require("../models/Devis"); // 👈 ton modèle MongoDB
const router = express.Router();

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

    // ⚠️ Simple vérification en dur (à améliorer avec bcrypt + DB)
    if (email === "admin@tscouverture.fr" && password === "admin123") {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "2h" });
        return res.json({ token });
    }

    return res.status(401).json({ message: "Identifiants invalides" });
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

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Contenu du devis
        doc.fontSize(20).text("Devis - TS Couverture", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Nom : ${devis.nom}`);
        doc.text(`Email : ${devis.email}`);
        doc.text(`Téléphone : ${devis.telephone}`);
        doc.text(`Service : ${devis.service}`);
        doc.text(`Quantité : ${devis.quantite || "-"}`);
        doc.text(`Prix estimé : ${devis.prixEstime} €`);
        doc.moveDown();
        doc.text(`Détails : ${devis.details || "Aucun"}`);

        doc.end();

        // Quand le PDF est prêt → téléchargement
        stream.on("finish", () => {
            res.download(filePath, fileName);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur génération PDF" });
    }
});

module.exports = router;
