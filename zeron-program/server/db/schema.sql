CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  volunteer_name VARCHAR(100),
  volunteer_phone VARCHAR(20),
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  round_name VARCHAR(100) NOT NULL,
  round_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  round_id INTEGER REFERENCES rounds(id) ON DELETE CASCADE,
  question_text TEXT,
  question_image_url TEXT,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 30,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  question_id INTEGER REFERENCES questions(id),
  submitted_answer TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasure_tasks (
  id SERIAL PRIMARY KEY,
  round_id INTEGER REFERENCES rounds(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  clue_text TEXT,
  points INTEGER DEFAULT 20,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS treasure_submissions (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  task_id INTEGER REFERENCES treasure_tasks(id),
  submission_proof TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_team_id INTEGER REFERENCES teams(id)
);
