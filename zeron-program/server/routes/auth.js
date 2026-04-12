const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

router.post('/register', async (req, res) => {
  const { team_name, username, password, volunteer_name, volunteer_phone, members, access_code } = req.body;
  try {
    if (!access_code) {
      return res.status(400).json({ error: "Access code is required to register." });
    }

    const codeCheck = await pool.query('SELECT * FROM access_codes WHERE code = $1', [access_code]);
    if (codeCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid access code." });
    }
    if (codeCheck.rows[0].is_used) {
      return res.status(400).json({ error: "Access code has already been used." });
    }

    const checkTeam = await pool.query('SELECT * FROM teams WHERE team_name = $1 OR username = $2', [team_name, username]);
    if (checkTeam.rows.length > 0) {
      if (checkTeam.rows[0].team_name === team_name) {
        return res.status(400).json({ error: "Team name already taken. Please choose another name." });
      }
      return res.status(400).json({ error: "Username already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query('BEGIN');
    const newTeam = await pool.query(
      'INSERT INTO teams (team_name, username, password_hash, volunteer_name, volunteer_phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, team_name, username, total_score',
      [team_name, username, password_hash, volunteer_name, volunteer_phone]
    );
    const teamId = newTeam.rows[0].id;

    if (members && members.length > 0) {
      for (let member of members) {
        await pool.query('INSERT INTO team_members (team_id, name, phone_number) VALUES ($1, $2, $3)', [teamId, member.name, member.phone_number]);
      }
    }
    
    // Mark access code as used
    await pool.query('UPDATE access_codes SET is_used = TRUE, used_by_team_id = $1 WHERE code = $2', [teamId, access_code]);

    await pool.query('COMMIT');

    const payload = { team_id: teamId, team_name, username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, team: payload });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM teams WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });
    
    const team = result.rows[0];
    const isMatch = await bcrypt.compare(password, team.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const payload = { team_id: team.id, team_name: team.team_name, username: team.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, team: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
