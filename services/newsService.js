const axios = require('axios');
const config = require('../config');

// Simple in-memory cache keyed by JSON.stringify(sorted preferences)
const cache = new Map();
const DEFAULT_TTL_MS = 1000 * 60 * 5; // 5 minutes

function prefsKey(preferences) {
  if (!preferences || !Array.isArray(preferences) || preferences.length === 0) return '::all::';
  // normalize and sort
  return JSON.stringify([...preferences].map(p => String(p).toLowerCase()).sort());
}

async function fetchFromApi(preferences) {
  const apiKey = process.env.NEWS_API_KEY || config.newsApiKey;
  if (!apiKey) throw new Error('NEWS_API_KEY not configured');

  const requests = [];
  if (!preferences || preferences.length === 0) {
    requests.push(
      axios.get('https://newsapi.org/v2/top-headlines', { params: { language: 'en', pageSize: 20, apiKey } })
    );
  } else {
    for (const pref of preferences.slice(0, 5)) {
      requests.push(
        axios.get('https://newsapi.org/v2/top-headlines', { params: { category: pref, language: 'en', pageSize: 10, apiKey } })
      );
    }
  }

  const responses = await Promise.allSettled(requests);
  const articles = [];
  for (const r of responses) {
    if (r.status === 'fulfilled' && r.value && r.value.data && Array.isArray(r.value.data.articles)) {
      for (const a of r.value.data.articles) {
        articles.push({ title: a.title, description: a.description, url: a.url, source: a.source && a.source.name });
      }
    }
  }

  // dedupe by URL
  const seen = new Set();
  const news = [];
  for (const a of articles) {
    if (!a.url) continue;
    if (seen.has(a.url)) continue;
    seen.add(a.url);
    news.push(a);
  }
  return news;
}

async function getNewsForPreferences(preferences, options = {}) {
  const key = prefsKey(preferences);
  const now = Date.now();
  const entry = cache.get(key);
  const ttl = options.ttlMs || DEFAULT_TTL_MS;
  if (entry && (now - entry.ts) < ttl) {
    return { news: entry.news, cached: true };
  }

  try {
    const news = await fetchFromApi(preferences);
    cache.set(key, { ts: Date.now(), news });
    return { news, cached: false };
  } catch (err) {
    // if we have stale data, return it instead of failing outright
    if (entry && entry.news) return { news: entry.news, cached: true, warning: 'using stale cache due to fetch error' };
    throw err;
  }
}

function getCachedKeys() {
  return Array.from(cache.keys());
}

// force refresh for a given preferences key
async function refreshKey(key, preferences) {
  try {
    const news = await fetchFromApi(preferences);
    cache.set(key, { ts: Date.now(), news });
    return true;
  } catch (err) {
    console.error('refreshKey error', err && err.message ? err.message : err);
    return false;
  }
}

module.exports = { getNewsForPreferences, prefsKey, getCachedKeys, refreshKey };
