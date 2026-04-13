const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db;
let initializePromise;

const schemaPath = path.join(__dirname, 'schema.sql');

const initializeDatabaseAt = async (dbPath) => {
  const isNew = !fs.existsSync(dbPath);
  const instance = new PGlite(dbPath);

  // Force an initial query so path/storage errors surface immediately.
  await instance.query('SELECT 1');

  if (isNew) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await instance.exec(schemaSql);
    console.log(`PGlite DB initialized at ${dbPath}.`);
  } else {
    console.log(`PGlite DB loaded from ${dbPath}.`);
  }

  return instance;
};

const getDb = async () => {
  if (!db) {
    const primaryDbPath = path.join(__dirname, 'zeron_data');
    const fallbackDbPath = path.join(__dirname, 'zeron_data_pglite');
    const cloudTmpPath = '/tmp/zeron_pglite';

    try {
      db = await initializeDatabaseAt(primaryDbPath);
    } catch (error) {
      console.warn(`Primary DB path failed (${primaryDbPath}). Trying fallback...`);
      try {
        db = await initializeDatabaseAt(fallbackDbPath);
      } catch (fbError) {
        console.warn(`Fallback DB path failed (${fallbackDbPath}). Trying /tmp...`);
        db = await initializeDatabaseAt(cloudTmpPath);
      }
    }
  }
  return db;
};

const pool = {
  query: async (text, params) => {
    const database = await getDb();
    
    // PGLite doesn't support 'BEGIN'/'COMMIT' natively in .exec if it's mixed with .query transactions sometimes, 
    // but .query allows it as a statement.
    // Let's just pass it through.
    return database.query(text, params);
  }
};

module.exports = pool;
