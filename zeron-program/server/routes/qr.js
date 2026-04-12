const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const url = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/register` : 'http://localhost:5173/register';
    const qrImage = await QRCode.toBuffer(url);
    res.type('png');
    res.send(qrImage);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

router.get('/question/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
    
    // Instead of raw text, put a URL pointing to our hint viewer page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const text = `${clientUrl}/hint/${req.params.id}`;
    
    const qrImage = await QRCode.toBuffer(text, { width: 500, margin: 2 });
    res.type('png');
    res.send(qrImage);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

module.exports = router;
