const newsService = require('../services/newsService');
const userStore = require('../models/userStore');

async function getNews(req, res) {
  try {
    const prefs = req.user.preferences || [];
    const result = await newsService.getNewsForPreferences(prefs);
    return res.json({ news: result.news, cached: result.cached, warning: result.warning });
  } catch (err) {
    console.error('getNews error', err && err.message ? err.message : err);
    // if API key not configured, newsService throws - return fallback
    if (err && err.message && err.message.includes('NEWS_API_KEY')) {
      return res.status(200).json({ news: [], warning: 'NEWS_API_KEY not configured' });
    }
    return res.status(502).json({ error: 'failed to fetch news' });
  }
}

// mark a news article as read by URL passed as encoded id in path or in body.url
function markRead(req, res) {
  const id = req.params.id;
  const url = id ? decodeURIComponent(id) : (req.body && req.body.url);
  if (!url) return res.status(400).json({ error: 'article id (url) required' });
  const updated = userStore.markArticleRead(req.user.email, { url });
  if (!updated) return res.status(404).json({ error: 'user not found' });
  return res.json({ read: userStore.getReadArticles(req.user.email) });
}

function markFavorite(req, res) {
  const id = req.params.id;
  const url = id ? decodeURIComponent(id) : (req.body && req.body.url);
  if (!url) return res.status(400).json({ error: 'article id (url) required' });
  const updated = userStore.markArticleFavorite(req.user.email, { url });
  if (!updated) return res.status(404).json({ error: 'user not found' });
  return res.json({ favorites: userStore.getFavoriteArticles(req.user.email) });
}

function getRead(req, res) {
  const list = userStore.getReadArticles(req.user.email);
  if (list === null) return res.status(404).json({ error: 'user not found' });
  return res.json({ read: list });
}

function getFavorites(req, res) {
  const list = userStore.getFavoriteArticles(req.user.email);
  if (list === null) return res.status(404).json({ error: 'user not found' });
  return res.json({ favorites: list });
}

async function searchNews(req, res) {
  const keyword = req.params.keyword;
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) return res.status(400).json({ error: 'keyword required' });
  try {
    // get cached or fresh news
    const prefs = req.user.preferences || [];
    const result = await newsService.getNewsForPreferences(prefs);
    const q = keyword.toLowerCase();
    const matched = (result.news || []).filter(a => {
      return (a.title && a.title.toLowerCase().includes(q)) || (a.description && a.description.toLowerCase().includes(q));
    });
    return res.json({ results: matched });
  } catch (err) {
    console.error('searchNews error', err && err.message ? err.message : err);
    return res.status(502).json({ error: 'failed to search news' });
  }
}

module.exports = { getNews, markRead, markFavorite, getRead, getFavorites, searchNews };
