const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Registrazione
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verifica se l'email esiste già
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Verifica se lo username esiste già
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Crea nuovo utente
    user = new User({
      username,
      email,
      password
    });

 
    await user.save();

    // Genera JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Cerca l'utente tramite email o username
    let user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Controlla la password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Genera JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login.html',
    session: false 
  }),
  (req, res) => {
    console.log('Google callback received:', req.user); // Aggiungi log

    const payload = {
      user: {
        id: req.user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.redirect('/login.html');
        }
        
        if (!req.user.isUsernameSet) {
          return res.redirect(`/setup-username.html?token=${token}&email=${req.user.email}`);
        }
        
        res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user.id,
          username: req.user.username,
          email: req.user.email
        }))}`);
      }
    );
  }
);

// Nuova route per impostare l'username
router.post('/set-username', async (req, res) => {
  try {
    const { username, token } = req.body;

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica se username è già in uso
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Aggiorna l'utente
    const user = await User.findByIdAndUpdate(
      decoded.user.id,
      { 
        username,
        isUsernameSet: true 
      },
      { new: true }
    ).select('-password');

    // Genera un nuovo token JWT
    const newPayload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      newPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, newToken) => {
        if (err) throw err;
        res.json({
          token: newToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;