const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = new Map(); // In-memory for now

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.has(username)) return res.status(400).json({ error: 'User exists' });
  
  const hash = await bcrypt.hash(password, 10);
  users.set(username, { username, password: hash });
  res.json({ message: 'User created' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

module.exports = router;
