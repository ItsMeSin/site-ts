const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const Devis = require("./models/Devis");

const app = express();
const PORT = 4000;

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/TSCouverture")
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer : stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Fonction PDF
function genererPDF(devis) {
  const doc = new PDFDocument();
  const fileName = `devis-${devis._id}.pdf`;
  doc.pipe(fs.createWriteStream(`./pdfs/${fileName}`));
  doc.text(`Devis pour ${devis.nom}`, { align: "center" });
  doc.text(`Service : ${devis.service}`);
  doc.text(`Prix estimé : ${devis.prixEstime} €`);
  doc.end();
  return fileName;
}

// Mail config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "votreemail@gmail.com",
    pass: "votreMotDePasseOuAppPassword",
  },
});

async function envoyerConfirmationEmail(devis) {
  await transporter.sendMail({
    from: "votreemail@gmail.com",
    to: devis.email,
    subject: "Confirmation de votre demande de devis",
    text: `Bonjour ${devis.nom}, nous avons bien reçu votre demande.`,
  });
}

// ✅ ROUTE POST : enregistrer un devis
app.post("/api/devis", upload.array("photos"), async (req, res) => {
  try {
    const { nom, email, telephone, service, quantite, details, prixEstime } = req.body;
    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    const nouveauDevis = new Devis({
      nom,
      email,
      telephone,
      service,
      quantite: Number(quantite),
      details,
      prixEstime: Number(prixEstime),
      photos
    });

    await nouveauDevis.save();

    // Générer PDF et envoyer mail (optionnel)
    genererPDF(nouveauDevis);
    await envoyerConfirmationEmail(nouveauDevis);

    res.status(200).json({ message: "Devis enregistré avec succès", devis: nouveauDevis });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ ROUTE GET : récupérer les devis pour admin
app.get("/api/admin/devis", async (req, res) => {
  try {
    const devis = await Devis.find().sort({ date: -1 });
    res.json(devis);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des devis" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
