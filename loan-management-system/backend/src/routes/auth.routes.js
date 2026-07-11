const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerRules), authController.register);
router.post('/login', validate(loginRules), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
