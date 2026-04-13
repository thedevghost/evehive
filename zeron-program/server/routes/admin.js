const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const ADMIN_SECRET = (process.env.ADMIN_SECRET || 'admin123').trim();

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 't' || normalized === '1';
  }
  return false;
};

const deleteTeamAndCleanup = async (teamId, { removeAccessCode } = { removeAccessCode: false }) => {
  const accessCodeResult = await pool.query('SELECT id FROM access_codes WHERE used_by_team_id = $1', [teamId]);

  await pool.query('DELETE FROM answers WHERE team_id = $1', [teamId]);
  await pool.query('DELETE FROM treasure_submissions WHERE team_id = $1', [teamId]);

  if (removeAccessCode) {
    if (accessCodeResult.rows.length > 0) {
      await pool.query('DELETE FROM access_codes WHERE used_by_team_id = $1', [teamId]);
    }
  } else {
    await pool.query('UPDATE access_codes SET used_by_team_id = NULL, is_used = FALSE WHERE used_by_team_id = $1', [teamId]);
  }

  await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
};

// Public seed endpoint - generates test access codes (dev only)
router.post('/seed-codes', async (req, res) => {
  try {
    const codes = ['TEAM001', 'TEAM002', 'TEAM003', 'TEAM004', 'TEAM005', 'DEMO01', 'DEMO02', 'DEMO03'];
    for (let code of codes) {
      await pool.query('INSERT INTO access_codes (code, is_used) VALUES ($1, FALSE) ON CONFLICT DO NOTHING', [code]);
    }
    const result = await pool.query('SELECT code FROM access_codes LIMIT 10');
    res.json({ message: "Test codes generated", codes: result.rows.map(r => r.code) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to seed codes" });
  }
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if ((password || '').trim() === ADMIN_SECRET) {
    res.json({ token: ADMIN_SECRET });
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
});

router.get('/teams', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.team_name, t.username, t.volunteer_name, t.total_score,
             ROW_NUMBER() OVER (ORDER BY t.total_score DESC, t.created_at ASC, t.id ASC) AS rank,
             (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS memory_count
      FROM teams t
      ORDER BY t.total_score DESC, t.created_at ASC, t.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/submissions', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ts.id, ts.submission_proof, ts.status, ts.submitted_at, ts.submitted_by,
             t.team_name,
             tt.task_description
      FROM treasure_submissions ts
      JOIN teams t ON ts.team_id = t.id
      JOIN treasure_tasks tt ON ts.task_id = tt.id
      ORDER BY
        CASE ts.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END,
        ts.submitted_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/questions/bulk', authenticateAdmin, async (req, res) => {
  const { questions } = req.body; // array of questions
  try {
    await pool.query('BEGIN');
    for (let q of questions) {
      await pool.query(
        'INSERT INTO questions (round_id, question_text, question_image_url, correct_answer, points, time_limit_seconds, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [q.round_id, q.question_text, q.question_image_url, q.correct_answer, q.points, q.time_limit_seconds, q.order_index]
      );
    }
    await pool.query('COMMIT');
    res.status(201).json({ message: "Bulk import successful" });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/push-question', authenticateAdmin, async (req, res) => {
  const { question_id } = req.body;
  try {
    const qRes = await pool.query('SELECT * FROM questions WHERE id = $1', [question_id]);
    if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not found" });

    const question = qRes.rows[0];
    const io = req.app.get('io');
    const redisClient = require('../utils/redis');
    
    const activeQuestionData = {
      question_id: question.id,
      question_text: question.question_text,
      question_image_url: question.question_image_url,
      time_limit_seconds: question.time_limit_seconds,
      order_index: question.order_index
    };

    if (redisClient) {
      await redisClient.set('active_question', JSON.stringify(activeQuestionData));
    }

    if (io) {
      io.emit('question_revealed', activeQuestionData);
    }

    res.json({ message: "Question pushed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/end-game', authenticateAdmin, async (req, res) => {
  try {
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
      io.emit('game_over', { final_leaderboard: leaderboardRes.rows });
    }
    res.json({ message: "Game over emitted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/access-codes', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ac.id, ac.code, ac.is_used, t.team_name as used_by
      FROM access_codes ac
      LEFT JOIN teams t ON ac.used_by_team_id = t.id
      ORDER BY ac.id ASC
    `);
    res.json(result.rows.map(row => ({
      ...row,
      is_used: toBoolean(row.is_used),
    })));
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/access-codes/generate', authenticateAdmin, async (req, res) => {
  const { count } = req.body;
  const numToGenerate = count || 1;
  const codes = [];
  
  try {
    await pool.query('BEGIN');
    for (let i = 0; i < numToGenerate; i++) {
      // Generate standard random 6 character alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
      await pool.query('INSERT INTO access_codes (code) VALUES ($1)', [code]);
    }
    await pool.query('COMMIT');
    res.json({ message: `Generated ${numToGenerate} codes successfully`, codes });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Server Error" });
  }
});

router.delete('/access-codes/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT id, used_by_team_id FROM access_codes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Access code not found' });
    }

    const teamId = existing.rows[0].used_by_team_id;

    await pool.query('BEGIN');

    if (teamId) {
      await deleteTeamAndCleanup(teamId, { removeAccessCode: false });
      await pool.query('DELETE FROM access_codes WHERE id = $1', [id]);
    } else {
      await pool.query('DELETE FROM access_codes WHERE id = $1', [id]);
    }

    await pool.query('COMMIT');

    res.json({
      message: teamId
        ? 'Access code and linked team deleted successfully'
        : 'Access code deleted successfully',
      deleted_team_id: teamId || null,
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/teams/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT id FROM teams WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await pool.query('BEGIN');
    await deleteTeamAndCleanup(id, { removeAccessCode: false });
    await pool.query('COMMIT');
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
