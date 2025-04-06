const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Deck = require('../models/Deck');
const Card = require('../models/Card');



// Get all cards for a deck
router.get('/:deckId/cards', auth, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ msg: 'Deck not found' });
    }

    const cards = await Card.find({ deck: req.params.deckId });
    res.json(cards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new card to a deck
router.post('/:deckId/cards', auth, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ msg: 'Deck not found' });
    }

    const newCard = new Card({
      front: req.body.front,
      back: req.body.back,
      deck: req.params.deckId
    });

    const card = await newCard.save();
    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a card
router.put('/:deckId/cards/:cardId', auth, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ msg: 'Deck not found' });
    }

    const card = await Card.findOneAndUpdate(
      { _id: req.params.cardId, deck: req.params.deckId },
      { $set: { front: req.body.front, back: req.body.back } },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ msg: 'Card not found' });
    }

    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a card
router.delete('/:deckId/cards/:cardId', auth, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ msg: 'Deck not found' });
    }

    const card = await Card.findOneAndRemove({
      _id: req.params.cardId,
      deck: req.params.deckId
    });

    if (!card) {
      return res.status(404).json({ msg: 'Card not found' });
    }

    res.json({ msg: 'Card removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;