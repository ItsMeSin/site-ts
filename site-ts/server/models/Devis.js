const mongoose = require("mongoose");

const devisSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    details: String,
    photos: [String],
    pdfPath: String, // lien vers le PDF généré

    prestations: [
        {
            designation: { type: String, required: true },   // Ex: "Nettoyage toiture"
            quantite: { type: Number, required: true },      // Ex: 120 (m², unités…)
            prixUnitaire: { type: Number, required: true },  // Ex: 15 (€/m²)
        },
    ],

    totalHT: Number,
    tva: Number,
    totalTTC: Number,
}, { timestamps: true });

module.exports = mongoose.model("Devis", devisSchema);
