const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// signup -> POST /users/signup
router.post('/signup', authController.signup);
// login -> POST /users/login
router.post('/login', authController.login);

// preferences
router.get('/preferences', auth.requireAuth, userController.getPreferences);
router.put('/preferences', auth.requireAuth, userController.updatePreferences);

module.exports = router;
