const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateAdmin = require('../middleware/authenticateAdmin');

router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rounds ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { round_name, round_type, order_index } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rounds (round_name, round_type, order_index) VALUES ($1, $2, $3) RETURNING *',
      [round_name, round_type, order_index]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch('/:id/start', authenticateAdmin, async (req, res) => {
  try {
    const roundId = req.params.id;
    await pool.query("UPDATE rounds SET status = 'pending' WHERE status = 'active'");
    const result = await pool.query("UPDATE rounds SET status = 'active' WHERE id = $1 RETURNING *", [roundId]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Round not found" });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('round_started', {
        round_id: result.rows[0].id,
        round_name: result.rows[0].round_name,
        round_type: result.rows[0].round_type
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch('/:id/stop', authenticateAdmin, async (req, res) => {
  try {
    const roundId = req.params.id;
    const result = await pool.query("UPDATE rounds SET status = 'completed' WHERE id = $1 RETURNING *", [roundId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Round not found" });

    const io = req.app.get('io');
    if (io) {
      io.emit('round_ended', { round_id: result.rows[0].id });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const roundId = req.params.id;
    const result = await pool.query("DELETE FROM rounds WHERE id = $1 RETURNING *", [roundId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Round not found" });
    res.json({ message: "Round deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
