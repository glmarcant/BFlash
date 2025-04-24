const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express'); // Aggiungi questa riga
const app = require('./app');

// Carica le variabili d'ambiente dal file .env
dotenv.config();

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