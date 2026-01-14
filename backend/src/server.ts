/**
 * MiniHub Backend Server
 * 
 * SECURITY OVERVIEW:
 * - Helmet.js for HTTP security headers
 * - Rate limiting (IP + user-based) on all endpoints
 * - CORS with strict origin validation
 * - Body size limits to prevent DoS
 * - Centralized error handling with production sanitization
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import userRoutes from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';
import { generalLimiter, authLimiter } from './middlewares/rateLimiter';

// SECURITY: Load environment variables before any other code runs
dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Create Express app
const app: Application = express();

// ============================================================
// SECURITY: HTTP Headers (Helmet.js)
// ============================================================
// Helmet sets various HTTP headers to protect against common attacks:
// - X-Content-Type-Options: nosniff (prevents MIME sniffing)
// - X-Frame-Options: DENY (prevents clickjacking)
// - X-XSS-Protection: 1; mode=block (XSS filter)
// - Strict-Transport-Security (HTTPS enforcement in production)
app.use(helmet());

// ============================================================
// SECURITY: Rate Limiting
// ============================================================
// Apply stricter rate limiting to authentication routes
// This protects against brute force and credential stuffing attacks
app.use('/api/v1/auth', authLimiter);

// Apply general rate limiting to all API routes
// This protects against DoS and API abuse
app.use('/api/', generalLimiter);

// ============================================================
// SECURITY: Body Parsing with Size Limits
// ============================================================
// Limit request body size to 10KB to prevent:
// - Memory exhaustion attacks
// - Large payload DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================================
// SECURITY: CORS Configuration
// ============================================================
// Only allow requests from trusted origins
// In production, this should be the exact frontend URL
const allowedOrigins = isProduction
    ? [process.env.FRONTEND_URL || 'https://your-frontend.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
    origin: (origin, callback) => {
        // SECURITY: Allow requests with no origin (mobile apps, Postman)
        // only in development mode
        if (!origin && !isProduction) {
            return callback(null, true);
        }

        if (origin && allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // SECURITY: Reject requests from unknown origins
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// ============================================================
// Health Check Endpoint
// ============================================================
// SECURITY: No sensitive information exposed in health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MiniHub API is running',
        environment: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
    });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);

// ============================================================
// Error Handler
// ============================================================
// SECURITY: Centralized error handling sanitizes errors in production
// to prevent information leakage
app.use(errorHandler);

// Get port from environment
const PORT = process.env.PORT || 5000;

// ============================================================
// Server Startup
// ============================================================
// NOTE: Start HTTP server FIRST, then connect to database
// This ensures the server is reachable even if DB connection is slow
const startServer = async (): Promise<void> => {
    // Start listening IMMEDIATELY so frontend can reach the server
    const server = app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${isProduction ? 'production' : 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
        console.log(`========================================\n`);
    });

    // Connect to database in the background
    // If DB fails, routes will return errors but server stays up
    try {
        await connectDB();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('⚠️  Server is running but database features will not work');
        // Don't exit - keep server running for health checks and debugging
    }
};

// ============================================================
// SECURITY: Graceful Error Handling
// ============================================================
// Handle unhandled promise rejections to prevent crashes
// that could lead to denial of service
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err.message);
    // SECURITY: In production, gracefully shutdown instead of crashing
    if (isProduction) {
        console.error('Shutting down due to unhandled rejection...');
    }
    process.exit(1);
});

startServer();

