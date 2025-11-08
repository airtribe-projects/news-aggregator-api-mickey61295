const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const usersRouter = require('./routes/users');
const auth = require('./middleware/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// user related routes (/users/*)
app.use('/users', usersRouter);

// protected news endpoint (uses external news API when configured)
const newsController = require('./controllers/newsController');
const newsRoutes = require('./routes/news');

// mount news routes
app.use('/news', newsRoutes);

// keep GET /news for backward compatibility
app.get('/news', auth.requireAuth, newsController.getNews);

// start server only if run directly (so supertest can import app without listening twice)
if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}
// periodic cache refresh: every 5 minutes refresh cached keys based on current users
const newsService = require('./services/newsService');
const userStore = require('./models/userStore');
function startBackgroundUpdater(intervalMs = 1000 * 60 * 5) {
    setInterval(async () => {
        try {
            // build a set of unique preference keys across users
            const keys = new Set();
            for (const u of Object.values(require.cache)) {
                // no-op to satisfy linter; we will instead iterate userStore map
            }
            // iterate users in store
            const emails = [];
            // userStore doesn't export direct iterator, so use internal map by requiring the file and reading its users map isn't available; instead get users by reading known emails from getCachedKeys
            // Simpler approach: refresh all cached keys
            const cachedKeys = newsService.getCachedKeys();
            for (const key of cachedKeys) {
                try {
                    // parse key back to preferences
                    const prefs = key === '::all::' ? [] : JSON.parse(key);
                    await newsService.refreshKey(key, prefs);
                } catch (err) {
                    // ignore per-key errors
                }
            }
        } catch (err) {
            console.error('background updater error', err && err.message ? err.message : err);
        }
    }, intervalMs);
}

startBackgroundUpdater();

module.exports = app;