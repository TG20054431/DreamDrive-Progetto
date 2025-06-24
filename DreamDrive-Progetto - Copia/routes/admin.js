const express = require('express');
const router = express.Router();

// Admin dashboard page
router.get('/dashboard', (req, res) => {
  // Check if there are flash messages
  const messages = req.flash ? req.flash() : {};
  
  // If user is logged in and is admin
  if (req.session && req.session.user && req.session.user.email === 'admin@gmail.com') {
    // Sample booking data
    const demoBookings = [
      {
        id: 'B001',
        nome: 'Marco',
        cognome: 'Rossi',
        email: 'marco.rossi@example.com',
        servizio: 'Noleggio',
        auto: 'Ferrari 458 Italia',
        date: new Date('2023-12-15'),
        amount: '1200',
        status: 'Confermata'
      },
      {
        id: 'B002',
        nome: 'Laura',
        cognome: 'Bianchi',
        email: 'laura.b@example.com',
        servizio: 'Track Day',
        auto: 'Lamborghini Huracan',
        date: new Date('2023-12-20'),
        amount: '800',
        status: 'In attesa'
      },
      {
        id: 'B003',
        nome: 'Giovanni',
        cognome: 'Verdi',
        email: 'g.verdi@example.com',
        servizio: 'Noleggio',
        auto: 'Porsche 911 GT3',
        date: new Date('2023-11-28'),
        amount: '950',
        status: 'Cancellata'
      }
    ];
    
    // Add any session bookings if they exist
    let allBookings = demoBookings;
    if (req.session.bookings && req.session.bookings.length) {
      allBookings = [...demoBookings, ...req.session.bookings];
    }
    
    res.render('pages/dashboard_admin', { 
      user: req.session.user,
      bookings: allBookings,
      messages: messages
    });
  } else {
    // Show login form if not authenticated as admin
    res.render('pages/dashboard_admin', { 
      user: null,
      bookings: [],
      messages: messages
    });
  }
});

// Admin login processing
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@gmail.com' && password === 'admin1234') {
    // Create admin session
    req.session.user = {
      name: 'Administrator',
      email: email,
      isAdmin: true
    };
    res.redirect('/admin/dashboard');
  } else {
    req.flash('error', 'Credenziali non valide');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;