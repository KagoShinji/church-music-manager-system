const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock Data
const masses = [];

// API Endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend is running', time: new Date() });
});

app.post('/api/masses', (req, res) => {
  const newMass = req.body;
  newMass.id = Date.now().toString();
  masses.push(newMass);
  res.status(201).json(newMass);
});

app.get('/api/masses', (req, res) => {
  res.json(masses);
});

// PDF Generation Endpoint (Mock/Stub for future implementation)
app.post('/api/export-pdf', (req, res) => {
  // In a full implementation, you would use puppeteer or pdfkit here
  // to generate a printable format of the mass lineup.
  const { lineupId } = req.body;
  res.json({ message: 'PDF generated successfully (mock)', downloadUrl: '/mock/download.pdf' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
