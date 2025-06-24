const express = require('express');
const router = express.Router();

// User profile page
router.get('/', (req, res) => {
  // Mock user data - in a real app this would come from auth/database
  const user = req.user || { name: 'Demo User', email: 'demo@example.com' };
  const bookings = []; // Mock bookings - in a real app this would come from database
  res.render('pages/utente', { user, bookings });
});

module.exports = router;
