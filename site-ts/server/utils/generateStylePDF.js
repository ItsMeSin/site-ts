const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateStyledPDF(devis, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // === HEADER ===
        const logoPath = path.join(__dirname, "../logo.png"); // mets ton logo ici
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 80 });
        }

        doc
            .fontSize(20)
            .fillColor("#2C3E50")
            .text("TS Couverture", 150, 50)
            .fontSize(10)
            .fillColor("#7F8C8D")
            .text("123 Rue des Artisans", 150, 75)
            .text("75000 Paris, France", 150, 90)
            .text("Téléphone : 06 12 34 56 78", 150, 105)
            .moveDown();

        // Bandeau
        doc.rect(0, 150, doc.page.width, 40).fill("#3498db").stroke();
        doc
            .fillColor("#fff")
            .fontSize(18)
            .text("DEVIS", 50, 160, { align: "left" });

        doc.moveDown(3);

        // === INFOS CLIENT ===
        doc
            .fillColor("#2C3E50")
            .fontSize(14)
            .text("Informations Client", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Nom : ${devis.nom}`);
        doc.text(`Email : ${devis.email}`);
        doc.text(`Téléphone : ${devis.telephone}`);
        doc.moveDown();

        // === INFOS DEVIS ===
        doc
            .fillColor("#2C3E50")
            .fontSize(14)
            .text("Détails du devis", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Service : ${devis.service}`);
        doc.text(`Quantité : ${devis.quantite || "-"}`);
        doc.text(`Prix estimé : ${devis.prixEstime} €`, {
            bold: true,
        });
        doc.moveDown();
        doc.text(`Description : ${devis.details || "Aucun"}`);

        // === PIED DE PAGE ===
        doc.moveDown(6);
        doc
            .fontSize(10)
            .fillColor("#7F8C8D")
            .text("TS Couverture - SIRET : 123 456 789 00010", { align: "center" })
            .text("Email : contact@tscouverture.fr - Site : www.tscouverture.fr", {
                align: "center",
            });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", (err) => reject(err));
    });
}

module.exports = generateStyledPDF;
