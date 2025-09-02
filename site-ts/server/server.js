const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Routes
const demandeRoutes = require("./routes/demande");
const adminRoutes = require("./admin");
const devisRoutes = require("./routes/devis"); // si tu en as

const app = express();
app.use(cors());
app.use(express.json());

// Dossiers statiques
app.use("/uploads", express.static("uploads"));
app.use("/pdfs", express.static("pdfs"));

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/TSCouverture")
    .then(() => console.log("✅ Connexion MongoDB réussie"))
    .catch((err) => console.error("❌ Erreur MongoDB :", err));

// Utilisation des routes
app.use("/api/demandes", demandeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/devis", devisRoutes); // si présent

// Lancement serveur
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
