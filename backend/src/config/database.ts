import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Retrying...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err);
    });
  } catch (error) {
    console.error('❌  Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
