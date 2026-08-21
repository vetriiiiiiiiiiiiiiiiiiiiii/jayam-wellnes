const { MongoClient, ObjectId } = require('mongodb');

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Defaulting to mongodb://localhost:27017/miracletree');
}
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/miracletree';

// Extract db name from URL (assuming format mongodb://host:port/dbname)
const dbName = url.split('/').pop().split('?')[0];

const client = new MongoClient(url);

let db;

async function connectToDatabase() {
  if (db) return db;
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Immediately initiate connection
connectToDatabase().catch(console.error);

module.exports = {
  getDb: () => db,
  client,
  ObjectId
};
