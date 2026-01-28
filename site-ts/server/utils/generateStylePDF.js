const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateStyledPDF(devis, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        /* ================== DONNÉES FIXES ENTREPRISE ================== */
        const ENTREPRISE = {
            nom: "TS Couverture Peinture",
            adresse: "8 cours des figuiers",
            ville: "72100 Le Mans",
            telephone: "07 83 89 76 43",
            email: "tscouverturepeinture@gmail.com",
            siret: "99973427000013",
            statut: "Entreprise Individuelle",
            tva: "TVA 20%",
            validite: "30 jours",
        };

        const dateDevis = new Date().toLocaleDateString("fr-FR");
        const numeroDevis = devis._id.toString();

        /* ================== HEADER ================== */
        const logoPath = path.join(__dirname, "../assets/logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 80 });
        }

        doc
            .fillColor("#2C3E50")
            .fontSize(18)
            .text(ENTREPRISE.nom, 150, 50)
            .fontSize(10)
            .fillColor("#555")
            .text(ENTREPRISE.adresse, 150, 70)
            .text(ENTREPRISE.ville, 150, 85)
            .text(`Téléphone : ${ENTREPRISE.telephone}`, 150, 100)
            .text(`Email : ${ENTREPRISE.email}`, 150, 115);

        /* ================== BANDEAU ================== */
        doc.rect(0, 150, doc.page.width, 40).fill("#3d3d3d");
        // Texte DEVIs à gauche
        doc
            .fillColor("#fff")
            .fontSize(20)
            .text("DEVIS", 50, 160);

        // Bloc numéro + date ALIGNÉ À DROITE
        doc
            .fontSize(10)
            .fillColor("#fff")
            .text(
                `N° ${numeroDevis}\nDate : ${dateDevis}`,
                doc.page.width - 250,
                160,
                {
                    width: 200,
                    align: "right",
                }
            );


        /* ================== CLIENT ================== */
        doc.moveDown(3);
        const boxY = doc.y;

        doc
            .roundedRect(50, boxY, 500, 90, 10)
            .fillOpacity(0.1)
            .fill("#bdc3c7")
            .stroke();

        doc.fillOpacity(1).fillColor("#2C3E50").fontSize(12);
        doc.text(`Client : ${devis.nom}`, 60, boxY + 10);
        doc.text(`Email : ${devis.email}`);
        doc.text(`Téléphone : ${devis.telephone}`);
        if (devis.details) {
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor("#555").text(`Message : ${devis.details}`);
        }

        /* ================== PRESTATIONS ================== */
        doc.moveDown(2);
        doc.fontSize(14).fillColor("#2C3E50").text("Détails des prestations", { underline: true });
        doc.moveDown();

        const tableTop = doc.y;
        const itemX = 50, quantityX = 300, unitPriceX = 380, totalX = 470;

        doc.rect(itemX - 5, tableTop, 500, 25).fill("#3d3d3d");
        doc.fillColor("white").fontSize(12)
            .text("Désignation", itemX, tableTop + 7)
            .text("Qté", quantityX, tableTop + 7)
            .text("PU HT (€)", unitPriceX, tableTop + 7)
            .text("Total HT (€)", totalX, tableTop + 7);

        let y = tableTop + 30;
        let totalHT = 0;

        devis.prestations.forEach((p, i) => {
            const lineTotal = p.quantite * p.prixUnitaire;
            totalHT += lineTotal;

            doc.rect(itemX - 5, y - 5, 500, 22)
                .fill(i % 2 === 0 ? "#ecf0f1" : "#ffffff")
                .stroke();

            doc.fillColor("#2C3E50").fontSize(11)
                .text(p.designation, itemX, y)
                .text(p.quantite, quantityX, y)
                .text(p.prixUnitaire.toFixed(2), unitPriceX, y)
                .text(lineTotal.toFixed(2), totalX, y);

            y += 25;
        });

        /* ================== TOTAUX ================== */
        const tva = totalHT * 0.2;
        const totalTTC = totalHT + tva;

        doc.moveDown(2);
        const totalBoxY = doc.y;

        doc.rect(300, totalBoxY, 200, 90).fill("#3d3d3d");
        doc.fillColor("#fff").fontSize(11)
            .text(`Total HT : ${totalHT.toFixed(2)} €`, 310, totalBoxY + 10)
            .text(`TVA (20%) : ${tva.toFixed(2)} €`, 310, totalBoxY + 30)
            .font("Helvetica-Bold")
            .text(`Total TTC : ${totalTTC.toFixed(2)} €`, 310, totalBoxY + 55);

        /* ================== MENTIONS LÉGALES ================== */
        doc.moveDown(4);
        doc.fontSize(9).fillColor("#555")
            .text(`Devis valable ${ENTREPRISE.validite} à compter du ${dateDevis}.`)
            .text(`Statut juridique : ${ENTREPRISE.statut}`)
            .text(`SIRET : ${ENTREPRISE.siret}`)
            .text(`TVA applicable : ${ENTREPRISE.tva}`);

        /* ================== FOOTER ================== */
        doc.moveTo(50, doc.page.height - 70)
            .lineTo(doc.page.width - 50, doc.page.height - 70)
            .stroke("#ccc");

        doc.fontSize(9).fillColor("#777")
            .text(`${ENTREPRISE.nom} – ${ENTREPRISE.ville}`, { align: "center" })
            .text(`Contact : ${ENTREPRISE.email} – ${ENTREPRISE.telephone}`, { align: "center" });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

module.exports = generateStyledPDF;
