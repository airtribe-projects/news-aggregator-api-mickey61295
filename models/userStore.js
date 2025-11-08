// Simple in-memory user store for demo/testing
const { randomUUID } = require('crypto');

const usersByEmail = new Map();

function createUser({ name, email, passwordHash, preferences = [] }) {
  const id = randomUUID();
  const user = { id, name, email, passwordHash, preferences, readArticles: [], favoriteArticles: [] };
  usersByEmail.set(email, user);
  return user;
}

function getUserByEmail(email) {
  return usersByEmail.get(email) || null;
}

function getUserById(id) {
  for (const user of usersByEmail.values()) {
    if (user.id === id) return user;
  }
  return null;
}

function updatePreferences(email, preferences) {
  const user = getUserByEmail(email);
  if (!user) return null;
  user.preferences = preferences;
  usersByEmail.set(email, user);
  return user;
}

function markArticleRead(email, article) {
  const user = getUserByEmail(email);
  if (!user) return null;
  // store by url
  const url = article && article.url ? article.url : String(article);
  if (!user.readArticles.includes(url)) user.readArticles.push(url);
  return user;
}

function markArticleFavorite(email, article) {
  const user = getUserByEmail(email);
  if (!user) return null;
  const url = article && article.url ? article.url : String(article);
  if (!user.favoriteArticles.includes(url)) user.favoriteArticles.push(url);
  return user;
}

function getReadArticles(email) {
  const user = getUserByEmail(email);
  if (!user) return null;
  return user.readArticles || [];
}

function getFavoriteArticles(email) {
  const user = getUserByEmail(email);
  if (!user) return null;
  return user.favoriteArticles || [];
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updatePreferences
  ,markArticleRead
  ,markArticleFavorite
  ,getReadArticles
  ,getFavoriteArticles
};
