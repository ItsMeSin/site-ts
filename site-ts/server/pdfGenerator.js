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
                // --- HEADER avec Logo + Infos Entreprise ---
                {
                    columns: [
                        {
                            image: path.resolve(__dirname, "logo.jpg"), // ou logo.png
                            width: 100,
                        },
                        [
                            { text: "Entreprise TS COUVERTURE", style: "title" },
                            { text: "15 rue de la République\n75000 Paris", style: "small" },
                            { text: "Tel: 01 02 03 04 05 | contact@stonyrenov.com", style: "small" },
                        ],
                    ],
                },

                { text: "\n\n" },

                // --- Infos Devis ---
                {
                    columns: [
                        [
                            { text: `DEVIS N°: ${data.devisNumero || "0001"}`, style: "header" },
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
                                ? prestations.map((p) => [
                                    p.designation,
                                    p.quantite,
                                    p.prixUnitaire.toFixed(2),
                                    (p.quantite * p.prixUnitaire).toFixed(2),
                                ])
                                : [["Aucune prestation", "", "", ""]]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                },

                { text: "\n" },

                // --- Totaux ---
                {
                    columns: [
                        { text: "" },
                        {
                            table: {
                                widths: ["*", "auto"],
                                body: [
                                    ["Total HT", `${(data.totalHT || 0).toFixed(2)} €`],
                                    ["TVA (10%)", `${(data.tva || 0).toFixed(2)} €`],
                                    [
                                        { text: "TOTAL TTC", bold: true },
                                        { text: `${(data.totalTTC || 0).toFixed(2)} €`, bold: true },
                                    ],
                                ],
                            },
                            layout: "lightHorizontalLines",
                            alignment: "right", // ✅ aligné à droite
                        },
                    ],
                },

                { text: "\n\nConditions de règlement : acompte 30% à la commande, solde à la livraison.", style: "small" },
                { text: "Merci de nous retourner ce devis signé avec la mention « Bon pour accord »", style: "small" },
            ],

            styles: {
                title: { fontSize: 16, bold: true },
                header: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                small: { fontSize: 9 },
                tableHeader: { bold: true, fillColor: "#eeeeee" },
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
