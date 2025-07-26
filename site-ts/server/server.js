const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/TSCouverture")
    .then(() => console.log("✅ Connexion MongoDB réussie"))
    .catch((err) => console.error("Erreur MongoDB :", err));

// Routes
const adminRoutes = require("./routes/admin"); // 👈 ici
const devisRoutes = require("./routes/devis"); // si tu en as
app.use("/api/admin", adminRoutes);
app.use("/api/devis", devisRoutes); // si présent

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
