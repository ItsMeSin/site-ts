const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateStyledPDF(devis, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // === HEADER AVEC LOGO & ENTREPRISE ===
        const logoPath = path.join(__dirname, "../logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 80 });
        }

        doc.fillColor("#2C3E50")
            .fontSize(18)
            .text("TS Couverture Peinture", 150, 50)
            .fontSize(10)
            .fillColor("#7F8C8D")
            .text("123 Rue des Artisans", 150, 70)
            .text("75000 Paris, France", 150, 85)
            .text("Téléphone : 06 12 34 56 78", 150, 100);

        // Bandeau devis
        doc.rect(0, 140, doc.page.width, 40).fill("#1abc9c").stroke();
        doc.fillColor("#fff")
            .fontSize(20)
            .text("DEVIS", 50, 150);

        // === CLIENT BOX ===
        doc.moveDown(3);
        const boxY = doc.y;
        doc.roundedRect(50, boxY, 500, 80, 10).fillOpacity(0.1).fill("#bdc3c7").stroke();
        doc.fillOpacity(1).fillColor("#2C3E50").fontSize(12);
        doc.text(`Nom : ${devis.nom}`, 60, boxY + 10);
        doc.text(`Email : ${devis.email}`);
        doc.text(`Téléphone : ${devis.telephone}`);

        // === TABLEAU DES PRESTATIONS ===
        doc.moveDown(5);
        doc.fontSize(14).fillColor("#2C3E50").text("Détails des prestations", { underline: true });
        doc.moveDown();

        const tableTop = doc.y;
        const itemX = 50, quantityX = 300, unitPriceX = 380, totalX = 470;

        // En-tête tableau
        doc.rect(itemX - 5, tableTop, 500, 25).fill("#1abc9c");
        doc.fillColor("white").fontSize(12)
            .text("Désignation", itemX, tableTop + 7)
            .text("Quantité", quantityX, tableTop + 7)
            .text("PU (€)", unitPriceX, tableTop + 7)
            .text("Total (€)", totalX, tableTop + 7);

        let y = tableTop + 30;
        doc.fillColor("black");

        let totalHT = 0;
        devis.prestations.forEach((p, i) => {
            const total = (p.quantite || 0) * (p.prixUnitaire || 0);
            totalHT += total;

            const bgColor = i % 2 === 0 ? "#ecf0f1" : "#ffffff"; // alternance lignes
            doc.rect(itemX - 5, y - 5, 500, 20).fill(bgColor).stroke();

            doc.fillColor("#2C3E50").fontSize(12)
                .text(p.designation, itemX, y)
                .text(p.quantite, quantityX, y)
                .text(`${p.prixUnitaire.toFixed(2)} €`, unitPriceX, y)
                .text(`${total.toFixed(2)} €`, totalX, y);

            y += 25;
        });

        // === CALCULS TVA / TTC ===
        const tauxTVA = 0.20;
        const tva = totalHT * tauxTVA;
        const totalTTC = totalHT + tva;

        doc.moveDown(2);
        const totalBoxY = doc.y;
        doc.rect(300, totalBoxY, 200, 80).fill("#16a085").stroke();
        doc.fillColor("white").fontSize(12)
            .text(`Sous-total HT : ${totalHT.toFixed(2)} €`, 310, totalBoxY + 10)
            .text(`TVA (20%) : ${tva.toFixed(2)} €`, 310, totalBoxY + 30)
            .font("Helvetica-Bold")
            .text(`Total TTC : ${totalTTC.toFixed(2)} €`, 310, totalBoxY + 50);

        // === FOOTER ===
        doc.moveDown(6);
        doc.moveTo(50, doc.page.height - 70)
            .lineTo(doc.page.width - 50, doc.page.height - 70)
            .stroke("#bdc3c7");

        doc.fontSize(10).fillColor("#7F8C8D")
            .text("TS Couverture Peinture - SIRET : 123 456 789 00010", { align: "center" })
            .text("Email : contact@tscouverturepeinture.fr - Site : www.tscouverturepeinture.fr", { align: "center" });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", (err) => reject(err));
    });
}

module.exports = generateStyledPDF;
