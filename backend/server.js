const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const consultationRoutes = require('./routes/consultations');
const followUpRoutes = require('./routes/followups');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Astrologer CRM API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// DB + Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astrologer-crm')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
