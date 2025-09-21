const path = require("path");
const generateStyledPDF = require("./utils/generateStylePDF");

/**
 * Génère un PDF stylé à partir d'un devis
 * @param {Object} devis - L'objet devis MongoDB
 * @param {String} filePath - Chemin où sauvegarder le PDF
 */
async function generatePDF(devis, filePath) {
    try {
        // Appelle directement ton générateur stylé
        return await generateStyledPDF(devis, filePath);
    } catch (error) {
        console.error("❌ Erreur lors de la génération du PDF :", error);
        throw error;
    }
}

module.exports = generatePDF;
