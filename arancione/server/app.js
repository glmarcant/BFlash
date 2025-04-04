const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const deckRoutes = require('./routes/deckRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to NomeApp API' });
});

module.exports = app;