const express = require("express");
const Demande = require("../models/Demande");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const demande = new Demande(req.body);
        await demande.save();
        res.status(201).json({ message: "Demande enregistrée avec succès", demande });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const demandes = await Demande.find();
        res.json(demandes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
