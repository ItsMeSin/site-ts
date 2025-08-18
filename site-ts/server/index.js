const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// ✅ Création des dossiers si pas existants
["uploads", "pdfs"].forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// ✅ Multer (upload photos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Transporter Nodemailer (Ethereal pour tests)
let transporter;
(async () => {
  let testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false, // 🚑 corrige l'erreur "self-signed certificate"
    },
  });
  console.log("📧 Ethereal prêt :", testAccount.user);
  console.log("👉 Voir les mails : https://ethereal.email/login");
})();

// ✅ Fonction de génération PDF
function generatePDF(data, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Devis Client", { align: "center" }).moveDown();

    doc.fontSize(12).text(`Nom : ${data.nom}`);
    doc.text(`Email : ${data.email}`);
    doc.text(`Téléphone : ${data.telephone}`);
    doc.text(`Service : ${data.service}`);
    doc.text(`Prix estimé : ${data.prixEstime} €`);
    doc.moveDown();
    doc.text("Détails :");
    doc.text(data.details || "Aucun détail fourni.");
    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

// ✅ ROUTE API : réception du formulaire
app.post("/api/devis", upload.array("photos"), async (req, res) => {
  try {
    const { nom, email, telephone, service, prixEstime, details } = req.body;
    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    // 📄 Générer le PDF
    const pdfPath = path.join(__dirname, `pdfs/devis-${Date.now()}.pdf`);
    await generatePDF({ nom, email, telephone, service, prixEstime, details }, pdfPath);

    // 📧 Envoyer email avec PDF
    let info = await transporter.sendMail({
      from: '"Site Artisans" <no-reply@artisans.com>',
      to: "artisan@example.com", // 👉 à remplacer par ton vrai mail quand tu passes en Gmail
      subject: "📄 Nouveau devis reçu",
      html: `
        <h2>Nouveau devis reçu</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Service :</strong> ${service}</p>
        <p><strong>Prix estimé :</strong> ${prixEstime} €</p>
        <p><strong>Photos :</strong></p>
        ${photos.length > 0
          ? photos.map((p) => `<a href="http://localhost:4000${p}" target="_blank">${p}</a>`).join("<br>")
          : "Aucune photo"
        }
      `,
      attachments: [{ filename: "devis.pdf", path: pdfPath }],
    });

    res.json({
      message: "✅ Devis envoyé avec succès",
      previewUrl: nodemailer.getTestMessageUrl(info), // 👈 lien Ethereal
    });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du devis" });
  }
});

// ✅ Route test
app.get("/", (req, res) => {
  res.send("API en ligne 🚀");
});

// ✅ Lancer serveur
app.listen(4000, () => {
  console.log("✅ Serveur lancé sur http://localhost:4000");
});
