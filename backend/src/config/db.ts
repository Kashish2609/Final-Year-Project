import mongoose from 'mongoose';
import { autoSeedIfEmpty } from '../seeders/autoSeed.js';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager_saas';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${mongoose.connection.host}`);
    await autoSeedIfEmpty();
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to primary MongoDB at ${uri.split('@')[1] || uri}.`);
    console.warn(`   Reason: ${err.message}`);
    console.warn(`   Initializing MongoMemoryServer fallback so the application runs with 0 downtime...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected via MongoMemoryServer fallback at ${mongoUri}`);
      await autoSeedIfEmpty();
    } catch (fallbackError) {
      console.error('❌ MongoDB connection failed:', fallbackError);
      process.exit(1);
    }
  }
};
