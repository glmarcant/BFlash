const express = require('express');
const Deck = require('../models/Deck');
const Set = require('../models/Set');  
const Card = require('../models/Card'); // Aggiungi questa riga
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all decks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const decks = await Deck.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific deck (con i set associati)
router.get('/:id', auth, async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id).populate({
      path: 'sets',
      select: 'name cards createdAt',
      options: { sort: { createdAt: -1 } }
    });

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(deck);
  } catch (err) {
    console.error('Errore nel caricamento del deck:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new deck (senza cards, ora gestite dai set)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, color } = req.body;
    
    const newDeck = new Deck({
      title,
      description,
      subject,
      color,
      owner: req.user.id
    });

    const deck = await newDeck.save();
    
    // Aggiorna l'utente con il nuovo deck
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { decks: deck._id } },
      { new: true }
    );
    
    res.status(201).json(deck);
  } catch (err) {
    console.error('Error creating deck:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a deck
// Update a deck
router.put('/:id', auth, async (req, res) => {
  try {
    const { description, subject, color } = req.body;
    
    let deck = await Deck.findById(req.params.id);
    
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    
    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { 
        description, 
        subject,
        color,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a deck (con cancellazione a cascata dei set)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Trova tutti i set associati al deck
    const sets = await Set.find({ deck: deck._id });

    // Elimina tutte le card associate ai set del deck
    const setIds = sets.map(set => set._id);
    await Card.deleteMany({ set: { $in: setIds } });

    // Elimina tutti i set associati al deck
    await Set.deleteMany({ deck: deck._id });

    // Rimuovi il deck
    await Deck.findByIdAndDelete(req.params.id);

    // Aggiorna l'utente
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { decks: req.params.id } }
    );

    res.json({ message: 'Deck, sets, and cards deleted successfully' });
  } catch (err) {
    console.error('Errore durante l\'eliminazione del deck:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;