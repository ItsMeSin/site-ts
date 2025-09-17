const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");

// 📂 Polices Roboto (dans server/fonts/Roboto/)
const fonts = {
    Roboto: {
        normal: path.join(__dirname, "fonts/Roboto/Roboto_Condensed-Regular.ttf"),
        bold: path.join(__dirname, "fonts/Roboto/Roboto_Condensed-Bold.ttf"),
        italics: path.join(__dirname, "fonts/Roboto/Roboto_Condensed-Italic.ttf"),
        bolditalics: path.join(__dirname, "fonts/Roboto/Roboto_Condensed-BoldItalic.ttf"),
    },
};

const printer = new PdfPrinter(fonts);

function generatePDF(devis, outputPath) {
    return new Promise((resolve, reject) => {
        const prestations = devis.prestations || [];

        // Numéro et date du devis
        const numeroDevis = `DEV-${devis._id.toString().slice(-6).toUpperCase()}`;
        const dateDevis = new Date(devis.createdAt).toLocaleDateString("fr-FR");

        const docDefinition = {
            content: [
                // --- Bandeau bleu ---
                {
                    table: {
                        widths: ["*", "auto"],
                        body: [
                            [
                                { text: "TS Couverture", style: "companyName" },
                                { text: "DEVIS", style: "devisTitle", alignment: "right" },
                            ],
                        ],
                    },
                    layout: "noBorders",
                },

                { text: "\n" },

                // --- Infos Client + Devis ---
                {
                    columns: [
                        [
                            { text: "Entreprise TS COUVERTURE", style: "title" },
                            { text: "15 rue de la République\n75000 Paris", style: "small" },
                            { text: "Tel: 01 02 03 04 05 | contact@tscouverture.fr", style: "small" },
                        ],
                        [
                            { text: `Devis N°: ${numeroDevis}`, style: "header", alignment: "right" },
                            { text: `Date: ${dateDevis}`, style: "small", alignment: "right" },
                            { text: `Client: ${devis.nom}`, style: "small", alignment: "right" },
                            { text: `Email: ${devis.email}`, style: "small", alignment: "right" },
                            { text: `Téléphone: ${devis.telephone}`, style: "small", alignment: "right" },
                        ],
                    ],
                },

                { text: "\n\n" },

                // --- Tableau Prestations ---
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "auto", "auto", "auto"],
                        body: [
                            [
                                { text: "Désignation", style: "tableHeader" },
                                { text: "Quantité", style: "tableHeader" },
                                { text: "Prix unitaire (€)", style: "tableHeader" },
                                { text: "Total (€)", style: "tableHeader" },
                            ],
                            ...(prestations.length > 0
                                ? prestations.map((p, i) => [
                                    { text: p.designation, fillColor: i % 2 === 0 ? "#f9f9f9" : null },
                                    { text: p.quantite, alignment: "center", fillColor: i % 2 === 0 ? "#f9f9f9" : null },
                                    { text: p.prixUnitaire.toFixed(2), alignment: "right", fillColor: i % 2 === 0 ? "#f9f9f9" : null },
                                    { text: (p.quantite * p.prixUnitaire).toFixed(2), alignment: "right", fillColor: i % 2 === 0 ? "#f9f9f9" : null },
                                ])
                                : [["Aucune prestation", "", "", ""]]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                },

                { text: "\n" },

                // --- Totaux ---
                {
                    alignment: "right",
                    table: {
                        widths: ["*", "auto"],
                        body: [
                            ["Total HT", `${(devis.totalHT || 0).toFixed(2)} €`],
                            ["TVA (20%)", `${(devis.tva || 0).toFixed(2)} €`],
                            [
                                { text: "TOTAL TTC", bold: true, fillColor: "#1a73e8", color: "white" },
                                { text: `${(devis.totalTTC || 0).toFixed(2)} €`, bold: true, fillColor: "#1a73e8", color: "white" },
                            ],
                        ],
                    },
                    layout: "lightHorizontalLines",
                },

                { text: "\n\n" },

                // --- Conditions ---
                { text: "Conditions de règlement :", style: "title" },
                { text: "• Acompte de 30% à la commande\n• Solde à la livraison", style: "small" },
                { text: "\nMerci de nous retourner ce devis signé avec la mention « Bon pour accord »", style: "small" },
            ],

            styles: {
                companyName: { fontSize: 16, bold: true, color: "#1a73e8" },
                devisTitle: { fontSize: 22, bold: true, color: "#1a73e8" },
                title: { fontSize: 13, bold: true, margin: [0, 5, 0, 5] },
                header: { fontSize: 12, bold: true, margin: [0, 2, 0, 2] },
                small: { fontSize: 9 },
                tableHeader: { bold: true, fillColor: "#1a73e8", color: "white" },
            },
        };

        try {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            pdfDoc.pipe(fs.createWriteStream(outputPath));
            pdfDoc.end();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = generatePDF;
