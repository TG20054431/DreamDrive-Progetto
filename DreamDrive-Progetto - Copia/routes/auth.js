const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('pages/login');
});

// Login process
router.post('/login', (req, res) => {
  // TODO: Implement login logic
  res.redirect('/utente');
});

// Register page
router.get('/register', (req, res) => {
  res.render('pages/register');
});

// Register process
router.post('/register', (req, res) => {
  // TODO: Implement registration logic
  res.redirect('/login');
});

// Logout
router.get('/logout', (req, res) => {
  // TODO: Implement logout logic
  res.redirect('/');
});

module.exports = router;
