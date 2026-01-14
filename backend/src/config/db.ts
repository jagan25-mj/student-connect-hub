import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');

    const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        connectTimeoutMS: 10000,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;


