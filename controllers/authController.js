const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../models/userStore');
const config = require('../config');

const SALT_ROUNDS = 10;

async function signup(req, res) {
  const { name, email, password, preferences } = req.body || {};
  const errors = [];
  if (!name) errors.push('name is required');
  if (!email) errors.push('email is required');
  if (!password) errors.push('password is required');

  // basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) errors.push('email must be a valid email address');

  // password length
  if (password && typeof password === 'string' && password.length < 8) errors.push('password must be at least 8 characters long');

  // preferences must be array of strings if present
  if (preferences !== undefined) {
    if (!Array.isArray(preferences)) {
      errors.push('preferences must be an array');
    } else {
      const badPref = preferences.some(p => typeof p !== 'string');
      if (badPref) errors.push('each preference must be a string');
    }
  }

  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors });

  const existing = userStore.getUserByEmail(email);
  if (existing) return res.status(400).json({ error: 'user already exists' });

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    userStore.createUser({ name, email, passwordHash, preferences });
    return res.status(200).json({ message: 'user created' });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'email must be a valid email address' });

  const user = userStore.getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  try {
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const payload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}

module.exports = { signup, login };
