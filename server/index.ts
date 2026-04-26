import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import analyzeRoutes from './routes/analyze';
import adminRoutes from './routes/admin';
import googleAuthRoutes from './routes/googleAuth';
import gmailRoutes from './routes/gmail';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
// Using 3001 to avoid any silent conflicts with port 3000
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Register Routes
app.use('/api/v1', analyzeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/api/v1/gmail', gmailRoutes);
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER STARTED ON PORT: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// DEBUG: Catch unexpected exits
process.on('exit', (code) => {
    console.log(`⚠️ PROCESS EXITING WITH CODE: ${code}`);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT (Ctrl+C). Shutting down...');
    server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
    process.exit(1);
});
