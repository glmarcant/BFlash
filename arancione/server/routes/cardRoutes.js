const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Card = require('../models/Card');
const Set = require('../models/Set');
const Deck = require('../models/Deck');

// Crea una nuova flashcard in un set
router.post('/:deckId/sets/:setId/cards', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;
    const { question, answer } = req.body;

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

    // Crea la nuova flashcard
    const newCard = new Card({
      question,
      answer,
      set: set._id,
      deck: deck._id
    });

    await newCard.save();

    // Aggiorna il set con la nuova flashcard
    set.cards.push(newCard._id);
    await set.save();

    res.status(201).json(newCard);

  } catch (err) {
    console.error('Errore nella creazione della flashcard:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ottieni tutte le flashcard di un set
router.get('/:deckId/sets/:setId/cards', auth, async (req, res) => {
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

    // Trova tutte le flashcard del set
    const cards = await Card.find({ set: setId }).sort({ createdAt: -1 });
    res.json(cards);

  } catch (err) {
    console.error('Errore nel caricamento delle flashcard:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Modifica una flashcard
router.put('/:deckId/sets/:setId/cards/:cardId', auth, async (req, res) => {
  try {
    const { deckId, setId, cardId } = req.params;
    const { question, answer } = req.body;

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

    // Trova e aggiorna la flashcard
    const card = await Card.findById(cardId);
    if (!card || card.set.toString() !== setId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    card.question = question || card.question;
    card.answer = answer || card.answer;
    await card.save();

    res.json(card);

  } catch (err) {
    console.error('Errore nella modifica della flashcard:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Elimina una flashcard
router.delete('/:deckId/sets/:setId/cards/:cardId', auth, async (req, res) => {
  try {
    const { deckId, setId, cardId } = req.params;

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

    // Verifica che la flashcard esista e appartenga al set
    const card = await Card.findById(cardId);
    if (!card || card.set.toString() !== setId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    // Elimina la flashcard
    await Card.findByIdAndDelete(cardId);

    // Rimuovi la flashcard dall'elenco del set
    set.cards = set.cards.filter(id => id.toString() !== cardId);
    await set.save();

    res.json({ message: 'Flashcard eliminata con successo' });

  } catch (err) {
    console.error('Errore nell\'eliminazione della flashcard:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;