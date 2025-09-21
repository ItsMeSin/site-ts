const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateStyledPDF(devis, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // === HEADER ===
        const logoPath = path.join(__dirname, "../logo.png");
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

        // === TABLEAU DES PRESTATIONS ===
        doc.fillColor("#2C3E50").fontSize(14).text("Détails des prestations", { underline: true });
        doc.moveDown();

        const tableTop = doc.y;
        const itemX = 50;
        const quantityX = 300;
        const unitPriceX = 380;
        const totalX = 470;

        // En-têtes
        doc
            .fontSize(12)
            .fillColor("#000")
            .text("Désignation", itemX, tableTop)
            .text("Quantité", quantityX, tableTop)
            .text("PU (€)", unitPriceX, tableTop)
            .text("Total (€)", totalX, tableTop);

        doc.moveDown();

        let totalHT = 0;
        let y = tableTop + 20;

        devis.prestations.forEach((p) => {
            const total = (p.quantite || 0) * (p.prixUnitaire || 0);
            totalHT += total;

            doc
                .fontSize(12)
                .text(p.designation, itemX, y)
                .text(p.quantite, quantityX, y)
                .text(`${p.prixUnitaire.toFixed(2)} €`, unitPriceX, y)
                .text(`${total.toFixed(2)} €`, totalX, y);

            y += 20;
        });

        // === CALCULS TVA / TTC ===
        const tauxTVA = 0.20;
        const tva = totalHT * tauxTVA;
        const totalTTC = totalHT + tva;

        doc.moveDown(2);

        doc
            .fontSize(12)
            .fillColor("#000")
            .text(`Sous-total HT : ${totalHT.toFixed(2)} €`, { align: "right" })
            .text(`TVA (20%) : ${tva.toFixed(2)} €`, { align: "right" })
            .text(`Total TTC : ${totalTTC.toFixed(2)} €`, { align: "right" });

        // === PIED DE PAGE ===
        doc.moveDown(6);
        doc
            .fontSize(10)
            .fillColor("#7F8C8D")
            .text("TS Couverture Peinture - SIRET : 123 456 789 00010", { align: "center" })
            .text("Email : contact@tscouverturepeinture.fr - Site : www.tscouverturepeinture.fr", {
                align: "center",
            });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", (err) => reject(err));
    });
}

module.exports = generateStyledPDF;
