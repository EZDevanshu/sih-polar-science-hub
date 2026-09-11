const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'polar_hub';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) {
    return db;
  }
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[DATABASE] Connected to MongoDB: ${DB_NAME} at ${MONGODB_URI}`);
    return db;
  } catch (error) {
    console.error(`[DATABASE ERROR] Could not connect to MongoDB: ${error.message}`);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database is not initialized. Call connectToDatabase() first.');
  }
  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[DATABASE] MongoDB connection closed cleanly.');
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
  MONGODB_URI,
  DB_NAME
};
