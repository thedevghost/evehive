const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const authenticateTeam = require('../middleware/authenticateTeam');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { Readable } = require('stream');

const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/round/:round_id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE round_id = $1 ORDER BY order_index ASC', [req.params.round_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/:id/hint', async (req, res) => {
  try {
    const qId = req.params.id;
    // We only select the non-sensitive fields so players can't cheat!
    const result = await pool.query("SELECT id, round_id, question_text, question_image_url, points, time_limit_seconds, order_index FROM questions WHERE id = $1", [qId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Hint not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { round_id, question_text, correct_answer, points, time_limit_seconds, order_index } = req.body;
  try {
    let question_image_url = null;
    
    if (req.file) {
      question_image_url = `http://${req.headers.host}/uploads/${req.file.filename}`;
    }
    
    const qRes = await pool.query(
      'INSERT INTO questions (round_id, question_text, question_image_url, correct_answer, points, time_limit_seconds, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [round_id, question_text, question_image_url, correct_answer, points || 10, time_limit_seconds || 30, order_index]
    );
    res.status(201).json(qRes.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/current', authenticateTeam, async (req, res) => {
  // Team can fetch the active question if they just joined and need to sync.
  // Actually, the prompt says "get current active question for the active round (for teams)".
  // This state is pushed via socket, but a REST fallback is good.
  // We'll rely mostly on socket for active question state or store it in Redis.
  try {
    const redisClient = require('../utils/redis');
    if (redisClient) {
      const activeQ = await redisClient.get('active_question');
      if (activeQ) return res.json(JSON.parse(activeQ));
    }
    res.status(404).json({ message: "No active question" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/:id/answer', authenticateTeam, async (req, res) => {
  const { submitted_answer } = req.body;
  const questionId = req.params.id;
  const teamId = req.team.team_id;

  try {
    const qRes = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not found" });
    const question = qRes.rows[0];

    const answerRes = await pool.query('SELECT * FROM answers WHERE team_id = $1 AND question_id = $2', [teamId, questionId]);
    if (answerRes.rows.length > 0) return res.status(400).json({ error: "Already answered" });

    const correct = question.correct_answer.trim().toLowerCase() === submitted_answer.trim().toLowerCase();
    const points_awarded = correct ? question.points : 0;

    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO answers (team_id, question_id, submitted_answer, is_correct, points_awarded) VALUES ($1, $2, $3, $4, $5)',
      [teamId, questionId, submitted_answer, correct, points_awarded]
    );

    if (correct) {
      await pool.query('UPDATE teams SET total_score = total_score + $1 WHERE id = $2', [points_awarded, teamId]);
    }
    await pool.query('COMMIT');

    if (correct) {
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
    }

    res.json({ is_correct: correct, points_awarded: points_awarded, correct_answer: question.correct_answer });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Server Error" });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const qId = req.params.id;
    const result = await pool.query("DELETE FROM questions WHERE id = $1 RETURNING *", [qId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
