const express = require('express');
const { register, login, getMe, getUsers, deleteUserById } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (protected route)
router.get('/me', auth, getMe);

// Get all users (admin only)
router.get('/users', auth, getUsers);

// Delete a user (admin only)
router.delete('/users/:id', auth, deleteUserById);

module.exports = router;