const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const authenticateTeam = require('../middleware/authenticateTeam');

router.get('/tasks/:round_id', authenticateTeam, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM treasure_tasks WHERE round_id = $1 ORDER BY order_index ASC', [req.params.round_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/submit', authenticateTeam, async (req, res) => {
  const { task_id, submission_proof } = req.body;
  const teamId = req.team.team_id;

  try {
    const result = await pool.query(
      'INSERT INTO treasure_submissions (team_id, task_id, submission_proof) VALUES ($1, $2, $3) RETURNING *',
      [teamId, task_id, submission_proof]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch('/submission/:id/approve', authenticateAdmin, async (req, res) => {
  const submissionId = req.params.id;
  try {
    await pool.query('BEGIN');
    const subRes = await pool.query("UPDATE treasure_submissions SET status = 'approved' WHERE id = $1 AND status = 'pending' RETURNING *", [submissionId]);
    if (subRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: "Submission not found or already processed" });
    }

    const taskRes = await pool.query('SELECT points FROM treasure_tasks WHERE id = $1', [subRes.rows[0].task_id]);
    const points = taskRes.rows[0].points;
    const teamId = subRes.rows[0].team_id;

    await pool.query('UPDATE treasure_submissions SET points_awarded = $1 WHERE id = $2', [points, submissionId]);
    await pool.query('UPDATE teams SET total_score = total_score + $1 WHERE id = $2', [points, teamId]);
    
    await pool.query('COMMIT');

    const leaderboardRes = await pool.query(`
      SELECT
        team_name,
        id AS team_id,
        total_score,
        ROW_NUMBER() OVER (
          ORDER BY total_score DESC, created_at ASC, id ASC
        ) AS rank
      FROM teams
      ORDER BY total_score DESC, created_at ASC, id ASC
    `);
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update', { leaderboard: leaderboardRes.rows });
    }

    res.json({ message: "Approved successfully" });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch('/submission/:id/reject', authenticateAdmin, async (req, res) => {
  const submissionId = req.params.id;
  try {
    const result = await pool.query("UPDATE treasure_submissions SET status = 'rejected' WHERE id = $1 RETURNING *", [submissionId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Submission not found" });
    res.json({ message: "Rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
