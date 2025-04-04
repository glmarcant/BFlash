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
  cards: [{
    front: {
      type: String,
      required: true
    },
    back: {
      type: String,
      required: true
    },
    tags: [String]
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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