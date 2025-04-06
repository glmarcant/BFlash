const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Set'
  }], // Aggiunto campo sets
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deck', deckSchema);