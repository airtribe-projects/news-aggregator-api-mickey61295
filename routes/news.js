const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/newsActionsController');

// GET /news (already mounted in app but keep route file for actions)
router.get('/', auth.requireAuth, controller.getNews);

// Mark read/favorite
router.post('/:id/read', auth.requireAuth, controller.markRead);
router.post('/:id/favorite', auth.requireAuth, controller.markFavorite);

// Get lists
router.get('/read', auth.requireAuth, controller.getRead);
router.get('/favorites', auth.requireAuth, controller.getFavorites);

// Search
router.get('/search/:keyword', auth.requireAuth, controller.searchNews);

module.exports = router;
