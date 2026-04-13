const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateTeam = require('../middleware/authenticateTeam');

router.get('/me', authenticateTeam, async (req, res) => {
  try {
    const teamRes = await pool.query('SELECT id, team_name, username, volunteer_name, volunteer_phone, total_score, created_at FROM teams WHERE id = $1', [req.team.team_id]);
    const membersRes = await pool.query('SELECT name, phone_number FROM team_members WHERE team_id = $1', [req.team.team_id]);
    
    if (teamRes.rows.length === 0) return res.status(404).json({ error: "Team not found" });
    
    res.json({ team: teamRes.rows[0], members: membersRes.rows });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
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
    res.json({ leaderboard: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
