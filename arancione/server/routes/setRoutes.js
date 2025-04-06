const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Set = require('../models/set');
const Deck = require('../models/Deck');

// Crea un nuovo set in un deck
router.post('/:deckId/sets', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const deck = await Deck.findById(req.params.deckId);

    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    const newSet = new Set({ name, deck: deck._id });
    await newSet.save();

    // Aggiorna il deck con il nuovo set
    deck.sets.push(newSet._id);
    await deck.save();

    res.status(201).json(newSet);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ottieni tutti i set di un deck
router.get('/:deckId/sets', auth, async (req, res) => {
  try {
    const sets = await Set.find({ deck: req.params.deckId });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;