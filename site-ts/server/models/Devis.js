const mongoose = require("mongoose");

const devisSchema = new mongoose.Schema({
    nom: String,
    email: String,
    telephone: String,
    service: String,
    quantite: Number,
    prixEstime: Number,
    details: String,
    photos: [String],
    pdfPath: String, // ✅ si tu veux sauvegarder le PDF
}, { timestamps: true });

module.exports = mongoose.model("Devis", devisSchema);
