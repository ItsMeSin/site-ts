const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const generatePDF = require("./pdfGenerator");


const app = express();
const PORT = 4000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// ✅ Multer config (upload des photos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Transporter Nodemailer (production Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kmqlz72@gmail.com",
    pass: "uclr cghz mvbg hwvl", // ⚠️ mot de passe d'application Google
  },
  tls: {
    rejectUnauthorized: false, // ✅ accepte le certificat même s'il est self-signed
  },
});

// 📌 Route API : réception du formulaire
app.post("/api/devis", upload.array("photos"), async (req, res) => {
  try {
    const { nom, email, telephone, service, prixEstime, details } = req.body; // ✅ récupère aussi commentaire
    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    // 📄 Générer le PDF
    const pdfPath = path.join(__dirname, `pdfs/devis-${Date.now()}.pdf`);
    await generatePDF({ nom, email, telephone, service, prixEstime, photos }, pdfPath);

    // 📧 Envoyer email avec PDF
    await transporter.sendMail({
      from: '"TS Couverture" <tonemail@gmail.com>',
      to: "artisan@example.com",
      subject: "📄 Nouveau devis reçu",
      html: `
        <h2>Nouveau devis</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Service :</strong> ${service}</p>
        <p><strong>Prix estimé :</strong> ${prixEstime} €</p>
      <p><strong>Besoin en détails :</strong> ${details || "Non précisé"}</p>
        <p><strong>Photos :</strong></p>
        ${photos.length > 0
          ? photos.map((p) => `<a href="http://localhost:4000${p}" target="_blank">${p}</a>`).join("<br>")
          : "Aucune photo"
        }
      `,
      attachments: [{ filename: "devis.pdf", path: pdfPath }],
    });

    res.json({ message: "✅ Devis envoyé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du devis" });
  }
});


// 🚀 Lancement serveur
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
