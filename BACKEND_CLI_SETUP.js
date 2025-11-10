// lucid-agents-backend/server-with-cli.js
// Update ke server.js dengan CLI routes
// COPY PASTE bagian bawah ke file server.js yang ada

/**
 * INSTRUKSI: Tambahkan ini ke lucid-agents-backend/server.js
 * Letakkan setelah baris: const healthRoutes = require('./routes/health');
 */

// Import CLI routes
const agentCliRoutes = require('./routes/agents-cli');

/**
 * Kemudian tambahkan route ini setelah existing routes:
 * Letakkan setelah baris: app.use('/api/health', healthRoutes);
 */

// CLI Management Routes (tidak perlu auth middleware)
app.use('/api/agents-cli', agentCliRoutes);

/**
 * COMPLETE server.js with CLI:
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Import custom modules
const logger = require('./utils/logger');
const database = require('./config/database');
const agentManager = require('./services/agentManager');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const taskRoutes = require('./routes/tasks');
const deploymentRoutes = require('./routes/deployment');
const healthRoutes = require('./routes/health');
const agentCliRoutes = require('./routes/agents-cli'); // ADD THIS

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', authMiddleware, agentRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/deployment', authMiddleware, deploymentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/agents-cli', agentCliRoutes); // ADD THIS LINE

// Socket.io configuration
io.use((socket, next) => {
    next();
});

io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-agent', (agentId) => {
        socket.join(`agent-${agentId}`);
        logger.info(`Socket ${socket.id} joined agent-${agentId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

app.set('io', io);

// Initialize and start
async function startServer() {
    try {
        await database.init();
        logger.info('Database initialized successfully');

        await agentManager.initialize();
        logger.info('Agent Manager initialized successfully');

        server.listen(PORT, () => {
            logger.info(`🚀 Lucid Agents Backend running on port ${PORT} (${NODE_ENV})`);
            logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
            logger.info(`🤖 CLI API: http://localhost:${PORT}/api/agents-cli`); // ADD THIS
            logger.info(`🔌 Socket.io enabled for real-time updates`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await agentManager.cleanup();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await agentManager.cleanup();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

startServer();

module.exports = app;
