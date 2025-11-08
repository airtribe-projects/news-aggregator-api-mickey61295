const userStore = require('../models/userStore');

function getPreferences(req, res) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  const user = userStore.getUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'user not found' });
  return res.json({ preferences: user.preferences || [] });
}

function updatePreferences(req, res) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  const { preferences } = req.body || {};
  if (!Array.isArray(preferences)) return res.status(400).json({ error: 'preferences must be an array' });
  // ensure all preferences are non-empty strings
  const bad = preferences.some(p => typeof p !== 'string' || p.trim().length === 0);
  if (bad) return res.status(400).json({ error: 'each preference must be a non-empty string' });

  const updated = userStore.updatePreferences(req.user.email, preferences);
  if (!updated) return res.status(404).json({ error: 'user not found' });
  return res.json({ preferences: updated.preferences });
}

module.exports = { getPreferences, updatePreferences };
