const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  set: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Set',
    required: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  known: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no' // Default value
  },
  prossimaRipetizione: {
    type: Date,
    default: Date.now // Imposta la prossima ripetizione come ora corrente per default
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

// Aggiorna la data di modifica prima di salvare
cardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Controlla se il modello è già stato definito
module.exports = mongoose.models.Card || mongoose.model('Card', cardSchema);