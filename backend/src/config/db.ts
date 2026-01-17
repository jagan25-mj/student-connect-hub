import mongoose from 'mongoose';

// Track connection state
let dbConnected = false;

const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('❌ MONGO_URI is not defined in environment variables');
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Log URI without credentials

    const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        connectTimeoutMS: 10000,
    });

    dbConnected = true;
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
};

// Check if database is connected
export const isDBConnected = (): boolean => {
    return dbConnected && mongoose.connection.readyState === 1;
};

// Get connection state name
export const getDBState = (): string => {
    const states: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] || 'unknown';
};

export default connectDB;


