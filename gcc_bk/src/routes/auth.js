// backend/src/routes/auth.js
const router = require('express').Router();
const authController = require('../controllers/authController');

router.get('/nonce/:address', authController.getNonce);

module.exports = router;