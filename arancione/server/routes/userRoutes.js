// filepath: /workspaces/BFlash/arancione/server/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Ottieni profilo utente corrente
router.get('/me', auth, async (req, res) => {
  try {
    console.log('GET /users/me - ID utente:', req.user);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('Utente non trovato con ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Utente trovato:', user.username);
    res.json(user);
  } catch (err) {
    console.error('Errore in /users/me:', err.message);
    res.status(500).send('Server error');
  }
});

// Aggiorna profilo utente
router.put('/me', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    // Costruisci l'oggetto di aggiornamento
    const updateObject = {};
    if (username) updateObject.username = username;
    if (bio) updateObject['profile.bio'] = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateObject },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;