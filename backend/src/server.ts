import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import userRoutes from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Create Express app
const app: Application = express();

// Security: HTTP headers
app.use(helmet());

// Security: Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: {
        success: false,
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
    },
});

// Apply rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/', generalLimiter);

// Body parser middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
const allowedOrigins = isProduction
    ? [process.env.FRONTEND_URL || 'https://your-frontend.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MiniHub API is running',
        environment: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);

// Error handler middleware (must be after routes)
app.use(errorHandler);

// Get port from environment
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDB();

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
            if (!isProduction) {
                console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

startServer();
