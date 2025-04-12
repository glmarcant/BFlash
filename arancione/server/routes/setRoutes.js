const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Set = require('../models/Set');
const Deck = require('../models/Deck');
const Card = require('../models/Card');

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

// Get a specific set by ID
router.get('/:deckId/sets/:setId', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;
    const deck = await Deck.findById(deckId);

    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    const set = await Set.findById(setId);
    if (!set || set.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Set not found or unauthorized' });
    }

    res.json(set);
  } catch (err) {
    console.error('Errore nel caricamento del set:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Elimina un set da un deck
router.delete('/:deckId/sets/:setId', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;
    console.log(`Eliminazione set: deckId=${deckId}, setId=${setId}`);

    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      console.error('Deck non trovato o non autorizzato');
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    const set = await Set.findById(setId);
    if (!set || set.deck.toString() !== deckId) {
      console.error('Set non trovato o non autorizzato');
      return res.status(404).json({ message: 'Set not found or unauthorized' });
    }

    // Usa findByIdAndDelete per eliminare il set
    await Set.findByIdAndDelete(setId);

    // Rimuovi il set dall'elenco dei set del deck
    deck.sets = deck.sets.filter(id => id.toString() !== setId);
    await deck.save();

    console.log('Set eliminato con successo');
    res.json({ message: 'Set eliminato con successo' });
  } catch (err) {
    console.error('Errore del server:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Modifica un set in un deck
router.put('/:deckId/sets/:setId', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;
    const { name } = req.body;

    // Trova il deck e verifica che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Trova e aggiorna il set
    const set = await Set.findById(setId);
    if (!set || set.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Set not found or unauthorized' });
    }

    set.name = name || set.name;
    await set.save();

    res.json(set);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Aggiungi questa route a setRoutes.js
router.get('/:deckId/sets/:setId/stats', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Verifica che il set esista e appartenga al deck
    const set = await Set.findById(setId);
    if (!set || set.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Set not found or unauthorized' });
    }

    // Calcola le statistiche
    const knownCount = await Card.countDocuments({ 
      set: setId, 
      known: 'yes' 
    });
    
    const unknownCount = await Card.countDocuments({ 
      set: setId, 
      known: 'no' 
    });

    res.json({
      known: knownCount,
      unknown: unknownCount
    });

  } catch (err) {
    console.error('Errore nel caricamento delle statistiche:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;