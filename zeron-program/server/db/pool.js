const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db;
let initializePromise;

const getDb = async () => {
  if (!db) {
    const dbPath = path.join(__dirname, 'zeron_data');
    const isNew = !fs.existsSync(dbPath);
    db = new PGlite(dbPath);
    
    if (isNew) {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await db.exec(schemaSql);
      console.log('PGlite persistent DB initialized and schema applied.');
    } else {
      console.log('PGlite persistent DB loaded.');
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
