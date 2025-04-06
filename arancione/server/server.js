const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connessione MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Corretto da MONGO_URI a MONGODB_URI
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
app.use('/api/decks', require('./routes/cardRoutes')); 
app.use('/api/sets', require('./routes/setRoutes'));


// Servi contenuti statici in produzione
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client'));
}

// Definisci porta e avvia il server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});