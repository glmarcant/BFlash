const express = require('express');
const Deck = require('../models/Deck');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Ottieni tutti i mazzi dell'utente
router.get('/', auth, async (req, res) => {
  try {
    const decks = await Deck.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ottieni un mazzo specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) return res.status(404).json({ message: 'Mazzo non trovato' });
    
    // Verifica che il mazzo appartenga all'utente
    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Crea un nuovo mazzo
router.post('/', auth, async (req, res) => {
  try {
    console.log('POST /decks - Creazione nuovo mazzo');
    console.log('Dati ricevuti:', req.body);
    console.log('Utente ID:', req.user.id);
    
    const { title, description, subject, cards } = req.body;
    
    const newDeck = new Deck({
      title,
      description,
      subject,
      cards: cards || [],
      owner: req.user.id
    });
    
    console.log('Nuovo mazzo da salvare:', newDeck);
    
    const deck = await newDeck.save();
    console.log('Mazzo salvato con ID:', deck._id);
    
    // Aggiungi il mazzo all'array dei mazzi dell'utente
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { decks: deck._id } },
      { new: true }
    );
    
    res.status(201).json(deck);
  } catch (err) {
    console.error('Errore nella creazione del mazzo:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Aggiorna un mazzo esistente
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, subject, cards } = req.body;
    
    // Verifica che il mazzo esista
    let deck = await Deck.findById(req.params.id);
    
    if (!deck) return res.status(404).json({ message: 'Mazzo non trovato' });
    
    // Verifica che il mazzo appartenga all'utente
    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    // Aggiorna il mazzo
    deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        description, 
        subject, 
        cards,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Elimina un mazzo
router.delete('/:id', auth, async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) return res.status(404).json({ message: 'Mazzo non trovato' });
    
    // Verifica che il mazzo appartenga all'utente
    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    // Rimuovi il mazzo dalla collezione
    await deck.remove();
    
    // Rimuovi il riferimento al mazzo dall'utente
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { decks: req.params.id } }
    );
    
    res.json({ message: 'Mazzo eliminato' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Aggiungi una nuova carta a un mazzo
router.post('/:id/cards', auth, async (req, res) => {
  try {
    const { front, back, tags } = req.body;
    
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) return res.status(404).json({ message: 'Mazzo non trovato' });
    
    // Verifica che il mazzo appartenga all'utente
    if (deck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    deck.cards.push({ front, back, tags: tags || [] });
    deck.updatedAt = Date.now();
    
    await deck.save();
    
    res.status(201).json(deck);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;