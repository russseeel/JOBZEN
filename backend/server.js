const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const authRoutes = require('./routes/auth');
const advertisementRoutes = require('./routes/advertisements');
const applicationRoutes = require('./routes/applications');
const companyRoutes = require('./routes/companies');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Job Board API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Job Board API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            advertisements: '/api/advertisements',
            applications: '/api/applications',
            companies: '/api/companies',
            users: '/api/users',
            health: '/api/health'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Backend lancé sur le port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log('=================================');
});

module.exports = app;
