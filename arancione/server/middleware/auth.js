const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Ottieni token dall'header
  const token = req.header('x-auth-token');
  
  // Verifica se non c'è token
  if (!token) {
    console.log('Autenticazione fallita: token mancante');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Verifica token
  try {
    console.log('Verifica token JWT');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token valido, utente decodificato:', decoded);
    req.user = decoded.user;  // Assicuriamoci che req.user sia impostato correttamente
    next();
  } catch (err) {
    console.error('Token JWT non valido:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};