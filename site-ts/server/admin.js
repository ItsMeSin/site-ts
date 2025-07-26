// server/routes/admin.js
const express = require("express");
const router = express.Router();
const Devis = require("../models/Devis");

router.get("/devis", async (req, res) => {
    try {
        const devis = await Devis.find().sort({ createdAt: -1 });
        res.json(devis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
