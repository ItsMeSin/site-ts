const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");

function generatePDF(data, outputPath) {
    return new Promise((resolve, reject) => {
        const fonts = {
            Roboto: {
                normal: "node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf",
                bold: "node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf",
                italics: "node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf",
                bolditalics: "node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf",
            },
        };

        const printer = new PdfPrinter(fonts);

        const docDefinition = {
            content: [
                {
                    columns: [
                        {
                            text: "🏠 Mon Entreprise\n15 Rue de la République\n75000 Paris\nTel: 01 23 45 67 89\nEmail: contact@monentreprise.com",
                            fontSize: 10,
                            margin: [0, 0, 0, 20],
                        },
                        {
                            text: `DEVIS\nN° ${Date.now()}\nDate: ${new Date().toLocaleDateString()}`,
                            alignment: "right",
                            bold: true,
                            fontSize: 12,
                        },
                    ],
                },

                { text: "Informations Client", style: "header" },
                {
                    table: {
                        widths: ["*", "*"],
                        body: [
                            ["Nom", data.nom],
                            ["Email", data.email],
                            ["Téléphone", data.telephone],
                        ],
                    },
                    margin: [0, 10, 0, 20],
                },

                { text: "Détails du Devis", style: "header" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "auto", "auto", "auto"],
                        body: [
                            [
                                { text: "Désignation", style: "tableHeader" },
                                { text: "Qté", style: "tableHeader" },
                                { text: "Prix Unitaire", style: "tableHeader" },
                                { text: "Total HT", style: "tableHeader" },
                            ],
                            [data.service, "1", `${data.prixEstime} €`, `${data.prixEstime} €`],
                        ],
                    },
                    layout: "lightHorizontalLines",
                    margin: [0, 10, 0, 20],
                },

                {
                    text: `TOTAL HT : ${data.prixEstime} €\nTVA (10%) : ${(data.prixEstime * 0.1).toFixed(2)} €\nTOTAL TTC : ${(data.prixEstime * 1.1).toFixed(2)} €`,
                    style: "total",
                    alignment: "right",
                },

                { text: "\nConditions de règlement :\n- 30% à la commande\n- Solde à la livraison", fontSize: 9, margin: [0, 20, 0, 0] },
            ],

            styles: {
                header: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                tableHeader: { bold: true, fontSize: 12, fillColor: "#f39c12", color: "white" },
                total: { bold: true, fontSize: 12 },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const stream = fs.createWriteStream(outputPath);
        pdfDoc.pipe(stream);
        pdfDoc.end();

        stream.on("finish", () => resolve(outputPath));
        stream.on("error", reject);
    });
}

module.exports = generatePDF;
