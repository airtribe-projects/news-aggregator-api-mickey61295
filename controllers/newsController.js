const newsService = require('../services/newsService');

async function getNews(req, res) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const prefs = req.user.preferences || [];
    const result = await newsService.getNewsForPreferences(prefs);
    return res.json({ news: result.news, cached: result.cached, warning: result.warning });
  } catch (err) {
    console.error('newsController.getNews error', err && err.message ? err.message : err);
    if (err && err.message && err.message.includes('NEWS_API_KEY')) {
      return res.status(200).json({ news: [], warning: 'NEWS_API_KEY not configured' });
    }
    return res.status(502).json({ error: 'failed to fetch news' });
  }
}

module.exports = { getNews };
