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

    // 👇 Ajout d’un tableau de prestations
    prestations: [
        {
            designation: String,   // Ex: "Nettoyage toiture"
            quantite: Number,      // Ex: 120 (m², unités…)
            prixUnitaire: Number,  // Ex: 15 (€/m²)
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Devis", devisSchema);
