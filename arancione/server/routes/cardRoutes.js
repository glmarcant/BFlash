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
      deck: deck._id,
      known: 'no' // Imposta il valore predefinito
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

// Ottieni le flashcard per ripetizione
router.get('/:deckId/sets/:setId/repetition-cards', auth, async (req, res) => {
  try {
    const { deckId, setId } = req.params;

    // Verifica che il deck e il set esistano
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    const set = await Set.findById(setId);
    if (!set || set.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Set not found or unauthorized' });
    }

    // Trova le flashcard ordinate per prossimaRipetizione
    const cards = await Card.find({ set: setId })
      .sort({ prossimaRipetizione: 1 }); // Ordina per prossimaRipetizione crescente

    res.json(cards);
  } catch (err) {
    console.error('Errore nel caricamento delle flashcard per ripetizione:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Modifica una flashcard
router.put('/:deckId/sets/:setId/cards/:cardId', auth, async (req, res) => {
  try {
    const { deckId, setId, cardId } = req.params;
    const { question, answer, known } = req.body;

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

    if (question) card.question = question;
    if (answer) card.answer = answer;
    if (known) card.known = known; // Aggiorna il campo "known"

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

router.put('/:deckId/sets/:setId/cards/:cardId/repetition', auth, async (req, res) => {
  try {
    const { deckId, setId, cardId } = req.params;
    const { difficulty } = req.body;

    // Trova la flashcard
    const card = await Card.findById(cardId);
    if (!card || card.set.toString() !== setId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    // Calcola la nuova prossimaRipetizione in base alla difficoltà
    const now = new Date();
    let nextRepetition;
    switch (difficulty) {
      case 'easy':
        nextRepetition = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ore
        break;
      case 'medium':
        nextRepetition = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 ore
        break;
      case 'hard':
        nextRepetition = new Date(now.getTime() + 60 * 60 * 1000); // 1 ora
        break;
      case 'super-hard':
        nextRepetition = new Date(now.getTime() + 5 * 60 * 1000); // 5 minuti
        break;
      default:
        return res.status(400).json({ message: 'Invalid difficulty' });
    }

    // Aggiorna la prossimaRipetizione
    card.prossimaRipetizione = nextRepetition;
    await card.save();

    res.json(card);
  } catch (err) {
    console.error('Errore nell\'aggiornamento della prossima ripetizione:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:deckId/unknown-cards', auth, async (req, res) => {
  try {
    const { deckId } = req.params;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Recupera le flashcard con known: "no"
    const cards = await Card.find({ deck: deckId, known: 'no' }).sort({ createdAt: -1 });

    res.json(cards);
  } catch (err) {
    console.error('Errore nel caricamento delle flashcard non conosciute:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// Aggiorna lo stato "known" di una flashcard (senza bisogno di setId)
router.put('/:deckId/cards/:cardId', auth, async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { question, answer, known } = req.body;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Trova e aggiorna la flashcard
    const card = await Card.findById(cardId);
    if (!card || card.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    if (question) card.question = question;
    if (answer) card.answer = answer;
    if (known) card.known = known;

    await card.save();
    res.json(card);
  } catch (err) {
    console.error('Errore nella modifica della flashcard:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// Ottieni tutte le flashcard di un deck
router.get('/:deckId/cards', auth, async (req, res) => {
  try {
    const { deckId } = req.params;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Trova tutte le flashcard del deck
    const cards = await Card.find({ deck: deckId }).sort({ createdAt: -1 });
    res.json(cards);

  } catch (err) {
    console.error('Errore nel caricamento delle flashcard del deck:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// Aggiorna la prossima ripetizione (senza bisogno di setId)
router.put('/:deckId/cards/:cardId/repetition', auth, async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { difficulty } = req.body;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Trova la flashcard
    const card = await Card.findById(cardId);
    if (!card || card.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    // Calcola la nuova prossimaRipetizione in base alla difficoltà
    const now = new Date();
    let nextRepetition;
    switch (difficulty) {
      case 'easy':
        nextRepetition = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ore
        break;
      case 'medium':
        nextRepetition = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 ore
        break;
      case 'hard':
        nextRepetition = new Date(now.getTime() + 60 * 60 * 1000); // 1 ora
        break;
      case 'super-hard':
        nextRepetition = new Date(now.getTime() + 5 * 60 * 1000); // 5 minuti
        break;
      default:
        return res.status(400).json({ message: 'Invalid difficulty' });
    }

    // Aggiorna la prossimaRipetizione
    card.prossimaRipetizione = nextRepetition;
    await card.save();

    res.json(card);
  } catch (err) {
    console.error('Errore nell\'aggiornamento della prossima ripetizione:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// Ottieni le flashcard per ripetizione di un intero deck
router.get('/:deckId/repetition-cards', auth, async (req, res) => {
  try {
    const { deckId } = req.params;

    // Verifica che il deck esista e che l'utente sia autorizzato
    const deck = await Deck.findById(deckId);
    if (!deck || deck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found or unauthorized' });
    }

    // Trova le flashcard ordinate per prossimaRipetizione
    const cards = await Card.find({ deck: deckId })
      .sort({ prossimaRipetizione: 1 }); // Ordina per prossimaRipetizione crescente

    res.json(cards);
  } catch (err) {
    console.error('Errore nel caricamento delle flashcard per ripetizione:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// Sposta una card in un altro set
router.put('/:deckId/sets/:setId/cards/:cardId/move', auth, async (req, res) => {
  try {
    const { deckId, setId, cardId } = req.params;
    const { targetDeckId, targetSetId } = req.body;

    // Verifica che il deck e set di origine esistano
    const sourceDeck = await Deck.findById(deckId);
    if (!sourceDeck || sourceDeck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Source deck not found or unauthorized' });
    }

    const sourceSet = await Set.findById(setId);
    if (!sourceSet || sourceSet.deck.toString() !== deckId) {
      return res.status(404).json({ message: 'Source set not found or unauthorized' });
    }

    // Verifica che il deck e set di destinazione esistano
    const targetDeck = await Deck.findById(targetDeckId);
    if (!targetDeck || targetDeck.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Target deck not found or unauthorized' });
    }

    const targetSet = await Set.findById(targetSetId);
    if (!targetSet || targetSet.deck.toString() !== targetDeckId) {
      return res.status(404).json({ message: 'Target set not found or unauthorized' });
    }

    // Trova e aggiorna la card
    const card = await Card.findById(cardId);
    if (!card || card.set.toString() !== setId) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    // Aggiorna i riferimenti della card
    card.set = targetSetId;
    card.deck = targetDeckId;
    await card.save();

    // Rimuovi la card dal set di origine
    sourceSet.cards = sourceSet.cards.filter(id => id.toString() !== cardId);
    await sourceSet.save();

    // Aggiungi la card al set di destinazione
    targetSet.cards.push(cardId);
    await targetSet.save();

    res.json({ message: 'Card moved successfully', card });

  } catch (err) {
    console.error('Error moving card:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;