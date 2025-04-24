const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = require('./app'); // Importa l'app configurata

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Connessione MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connesso con successo');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Inizializza connessione DB
connectDB();

// Definisci le routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/decks', require('./routes/deckRoutes'));
// app.use('/api/cards', require('./routes/cardRoutes')); // Rimuovi o commenta questa linea
app.use('/api/sets', require('./routes/setRoutes')); // Questa rimane come è
app.use('/api/sets', require('./routes/cardRoutes')); // Aggiungi questa linea

// Servi contenuti statici dalla cartella client
app.use(express.static(path.join(__dirname, '../client')));

// Per gestire il routing lato client (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Definisci porta e avvia il server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});