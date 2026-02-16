require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(express.json());

// Auth routes (public)
app.use('/auth', authRoutes);

// Protected route example
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Auth server running on port ${PORT}`);
  console.log(`   POST /auth/register - Create user`);
  console.log(`   POST /auth/login - Get JWT token`);
  console.log(`   GET /protected - Test protected route (needs token)`);
});
