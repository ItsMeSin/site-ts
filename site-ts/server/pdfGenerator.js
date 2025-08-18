const PDFDocument = require("pdfkit");
const fs = require("fs");

function generatePDF(data, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.fontSize(20).text("Devis", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Nom : ${data.nom}`);
        doc.text(`Email : ${data.email}`);
        doc.text(`Téléphone : ${data.telephone}`);
        doc.text(`Service : ${data.service}`);
        doc.text(`Prix estimé : ${data.prixEstime} €`);
        doc.moveDown();
        if (data.photos && data.photos.length > 0) {
            doc.text("Photos :");
            data.photos.forEach((photo) => doc.text(photo));
        }
        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

module.exports = { generatePDF };
