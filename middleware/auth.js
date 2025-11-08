const jwt = require('jsonwebtoken');
const config = require('../config');
const userStore = require('../models/userStore');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'missing or malformed authorization header' });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // attach user minimal info
    const user = userStore.getUserByEmail(payload.email);
    if (!user) return res.status(401).json({ error: 'invalid token or user not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = { requireAuth };
