const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set in environment — dbConnect will likely fail.');
}

/**
 * Connect to MongoDB with mongoose and reuse the connection in dev
 */
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return mongoose.connection.asPromise();

  // Use a global to preserve the connection across module reloads in dev
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = mongoose.connect(MONGODB_URI, {
      // useUnifiedTopology and useNewUrlParser are default in recent mongoose
    });
  }

  return global._mongoClientPromise;
}

module.exports = dbConnect;
