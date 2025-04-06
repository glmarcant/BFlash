const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Set', SetSchema);