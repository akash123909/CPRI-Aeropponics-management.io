/**
 * CPRI Aeroponics Management System - Backend Server
 * Node.js + Express + MongoDB
 * 
 * Features:
 * - REST API for data management
 * - User authentication with JWT
 * - Role-based access control
 * - Real-time data persistence
 * - CORS enabled for GitHub Pages frontend
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        process.env.FRONTEND_URL || 'https://akash123909.github.io/CPRI-Aeropponics-management.io'
    ],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB:`, error.message);
        // For development without MongoDB
        console.log('⚠️ Running in mock mode without database...');
    }
};

// Import Models
const User = require('./models/User');
const Entry = require('./models/Entry');
const Unit = require('./models/Unit');

// Import Routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const userRoutes = require('./routes/users');
const unitRoutes = require('./routes/units');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/units', unitRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'API is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🥔 CPRI Aeroponics Management System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            entries: '/api/entries',
            users: '/api/users',
            units: '/api/units'
        }
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Connect to Database and Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║  🥔 CPRI Aeroponics Backend Server     ║
║  ✅ Server running on port ${PORT}        ║
║  📡 API Base: http://localhost:${PORT}/api ║
╚════════════════════════════════════════╝
        `);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    // Still start server for development
    app.listen(PORT, () => {
        console.log(`⚠️  Server running in mock mode on port ${PORT}`);
    });
});

module.exports = app;
