const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Deck = require('../models/Deck');
const Set = require('../models/Set');
const Card = require('../models/Card');
const mongoose = require('mongoose');

// Route per la ricerca globale
router.get('/', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Query parameter must be a non-empty string' 
      });
    }

    // Escape regex special characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');

    // Prima trova tutti i deck dell'utente per avere gli ID autorizzati
    const userDecks = await Deck.find({ owner: req.user.id }).lean();
    const authorizedDeckIds = userDecks.map(deck => deck._id);

    // Cerca i deck che corrispondono alla query
    const matchingDecks = userDecks.filter(deck => 
      searchRegex.test(deck.subject) || 
      searchRegex.test(deck.description)
    );

    // Cerca i set che corrispondono alla query e appartengono ai deck autorizzati
    const matchingSets = await Set.find({
      deck: { $in: authorizedDeckIds },
      name: searchRegex
    }).lean();

    // Carica tutti i set per avere accesso ai loro nomi
    const allSets = await Set.find({
      deck: { $in: authorizedDeckIds }
    }).lean();

    // Modifica la ricerca delle card per includere più informazioni
    const matchingCards = await Card.find({
      deck: { $in: authorizedDeckIds },
      $or: [
        { question: searchRegex },
        { answer: searchRegex }
      ]
    }).lean();

    // Crea un oggetto per memorizzare i risultati raggruppati per deck
    const results = new Map();

    // Aggiungi i deck corrispondenti
    matchingDecks.forEach(deck => {
      results.set(deck._id.toString(), {
        deckId: deck._id,
        deckName: deck.subject || deck.title,
        sets: [],
        cards: []
      });
    });

    // Aggiungi i set corrispondenti e i loro deck
    matchingSets.forEach(set => {
      const deckId = set.deck.toString();
      if (!results.has(deckId)) {
        const parentDeck = userDecks.find(d => d._id.toString() === deckId);
        if (parentDeck) {
          results.set(deckId, {
            deckId: parentDeck._id,
            deckName: parentDeck.subject || parentDeck.title,
            sets: [],
            cards: []
          });
        }
      }
      if (results.has(deckId)) {
        results.get(deckId).sets.push(set);
      }
    });

    // Aggiungi le card corrispondenti e i loro deck
    matchingCards.forEach(card => {
      const deckId = card.deck.toString();
      if (!results.has(deckId)) {
        const parentDeck = userDecks.find(d => d._id.toString() === deckId);
        if (parentDeck) {
          results.set(deckId, {
            deckId: parentDeck._id,
            deckName: parentDeck.subject || parentDeck.title,
            sets: [],
            cards: []
          });
        }
      }
      if (results.has(deckId)) {
        // Trova il set a cui appartiene la card
        const parentSet = allSets.find(s => 
          s._id.toString() === card.set.toString()
        );
        
        // Aggiungi l'informazione del set alla card
        const cardWithSetInfo = {
          ...card,
          setName: parentSet ? parentSet.name : 'Set sconosciuto'
        };
        
        results.get(deckId).cards.push(cardWithSetInfo);
      }
    });

    // Converti la Map in array e filtra i risultati vuoti
    const finalResults = Array.from(results.values())
      .filter(result => result.sets.length > 0 || result.cards.length > 0 || matchingDecks.some(d => d._id.toString() === result.deckId.toString()));

    res.json(finalResults);

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;