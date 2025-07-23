const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json()); // parse JSON bodies

app.get('/api/devis', (req, res) => {
  res.send('API devis OK');
});

app.post('/api/devis', (req, res) => {
  console.log('POST /api/devis reçu:', req.body);
  res.json({ message: "Demande reçue !" });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
