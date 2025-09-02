const mongoose = require("mongoose");

const demandeSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true },
        email: { type: String, required: true },
        telephone: { type: String, required: true },
        service: { type: String, required: true },
        besoin: { type: String }, // champ pour "besoin en détail"
        prixEstime: { type: Number }, // optionnel (à remplir par l’artisan plus tard)
        photos: [{ type: String }], // chemins vers les photos uploadées
        statut: { type: String, default: "en attente" } // ex: en attente, traité
    },
    { timestamps: true }
);

module.exports = mongoose.model("Demande", demandeSchema);
