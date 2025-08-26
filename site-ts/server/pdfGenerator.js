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

function generatePDF(data, outputPath) {
    return new Promise((resolve, reject) => {
        const prestations = data.prestations || []; // ✅ fallback si undefined

        const docDefinition = {
            content: [
                // --- Bandeau avec Logo + Titre ---
                {
                    table: {
                        widths: ["auto", "*"],
                        body: [
                            [
                                {
                                    image: path.resolve(__dirname, "logo.jpg"),
                                    width: 80,
                                },
                                {
                                    text: "DEVIS",
                                    style: "devisTitle",
                                    alignment: "right",
                                    margin: [0, 20, 10, 0],
                                },
                            ],
                        ],
                    },
                    layout: "noBorders",
                    fillColor: "#004080", // bleu foncé
                },

                { text: "\n" },

                // --- Infos Entreprise + Client ---
                {
                    columns: [
                        [
                            { text: "Entreprise TS COUVERTURE", style: "title" },
                            { text: "15 rue de la République\n75000 Paris", style: "small" },
                            { text: "Tel: 01 02 03 04 05 | contact@stonyrenov.com", style: "small" },
                        ],
                        [
                            { text: `Devis N°: ${data.devisNumero || "0001"}`, style: "header" },
                            { text: `Date: ${new Date().toLocaleDateString()}`, style: "small" },
                            { text: `Client: ${data.nom}`, style: "small" },
                            { text: `Email: ${data.email}`, style: "small" },
                            { text: `Téléphone: ${data.telephone}`, style: "small" },
                        ],
                    ],
                },

                { text: "\n" },

                // --- Tableau prestations ---
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
                            ["Total HT", `${(data.totalHT || 0).toFixed(2)} €`],
                            ["TVA (10%)", `${(data.tva || 0).toFixed(2)} €`],
                            [
                                { text: "TOTAL TTC", bold: true, fillColor: "#004080", color: "white" },
                                { text: `${(data.totalTTC || 0).toFixed(2)} €`, bold: true, fillColor: "#004080", color: "white" },
                            ],
                        ],
                    },
                    layout: "lightHorizontalLines",
                },

                { text: "\n\nConditions de règlement : acompte 30% à la commande, solde à la livraison.", style: "small" },
                { text: "Merci de nous retourner ce devis signé avec la mention « Bon pour accord »", style: "small" },
            ],

            styles: {
                devisTitle: { fontSize: 22, bold: true, color: "white" },
                title: { fontSize: 14, bold: true },
                header: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] },
                small: { fontSize: 9 },
                tableHeader: { bold: true, fillColor: "#004080", color: "white" },
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
