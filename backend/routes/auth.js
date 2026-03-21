import express from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded check against environment variables
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(500).json({ message: 'Server configuration error: Admin credentials not set.' });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate JWT
    const payload = {
      user: {
        username: ADMIN_USER,
        role: 'admin'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: 'Logged in successfully' });
      }
    );
  } else {
    return res.status(401).json({ message: 'Invalid Credentials' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
