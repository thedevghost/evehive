const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db;
const schemaPath = path.join(__dirname, 'schema.sql');

const getDb = async () => {
  if (db) return db;

  // Option 1: Use Real PostgreSQL (Production)
  if (process.env.DATABASE_URL) {
    console.log('Connecting to real PostgreSQL database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Render/Cloud providers
    });
    
    // Test connection and initialize schema if needed
    try {
      await pool.query('SELECT 1');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      // We use a simple check to see if tables exist (checking teams table)
      const tableCheck = await pool.query("SELECT FROM information_schema.tables WHERE table_name = 'teams'");
      if (tableCheck.rows.length === 0) {
        console.log('Initializing schema for real PostgreSQL...');
        await pool.query(schemaSql);
      } else {
        // Migration: Ensure submitted_by exists
        await pool.query("ALTER TABLE treasure_submissions ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(100)");
      }
      db = pool;
      return db;
    } catch (err) {
      console.error('Failed to connect to real PostgreSQL, falling back to PGlite:', err);
    }
  }

  // Option 2: Use PGlite (Fallback/Local)
  console.log('Using PGlite local database...');
  const initializePGlite = async (dbPath) => {
    const isNew = dbPath && !fs.existsSync(dbPath);
    const instance = new PGlite(dbPath);
    await instance.query('SELECT 1');
    if (isNew || !dbPath) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await instance.exec(schemaSql);
    }
    return instance;
  };

  const paths = [
    path.join(__dirname, 'zeron_data'),
    '/tmp/zeron_pglite',
    undefined // Memory-only fallback
  ];

  for (const p of paths) {
    try {
      db = await initializePGlite(p);
      console.log(`PGlite initialized with ${p || 'memory storage'}`);
      return db;
    } catch (e) {
      console.warn(`PGlite path ${p} failed, trying next...`);
    }
  }
  
  throw new Error('All database initialization strategies failed.');
};

const pool = {
  query: async (text, params) => {
    const database = await getDb();
    return database.query(text, params);
  }
};

module.exports = pool;
