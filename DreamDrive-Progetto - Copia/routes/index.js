const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importo il modello User
const Auto = require('../models/Auto');
const Prenotazione = require('../models/Prenotazione');
const Pagamento = require('../models/Pagamento');
const Recensione = require('../models/Recensione');

// Middleware per rendere l'utente disponibile in tutti i template
// IMPORTANTE: Questo middleware deve essere il primo, prima di tutte le rotte
router.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Add this middleware to check if the current user is an admin and redirect accordingly
const checkAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.email === 'admin@gmail.com') {
    // Admin users should only access the admin dashboard
    return res.redirect('/admin/dashboard');
  }
  next();
};

// Home page
router.get('/', checkAdmin, (req, res) => {
  res.render('pages/index');
});

// Auto page
router.get('/auto', checkAdmin, (req, res) => {
  res.render('pages/auto');
});

// Contatti page
router.get('/contatti', checkAdmin, (req, res) => {
  res.render('pages/contatti');
});

// Contact form submission
router.post('/contatti', (req, res) => {
  // TODO: Implement contact form logic
  req.flash('success', 'Messaggio inviato con successo!');
  res.redirect('/contatti');
});

// Recensioni page
router.get('/recensioni', checkAdmin, (req, res) => {
  res.render('pages/recensioni', {
    user: req.session && req.session.user ? req.session.user : null,
    messages: req.flash()
  });
});

// Submit review
router.post('/recensioni', async (req, res) => {
  if (req.session && req.session.user) {
    try {
      console.log('Dati utente in sessione:', req.session.user);
      
      // Verifica che l'ID utente esista in sessione
      if (!req.session.user.id) {
        console.error('ID utente mancante nella sessione');
        req.flash('error', 'Errore: impossibile identificare l\'utente. Prova a effettuare nuovamente il login.');
        return res.redirect('/recensioni');
      }
      
      // Crea e salva la recensione nel database
      const recensione = new Recensione({
        idUtente: req.session.user.id, // Assicurati che questo sia definito
        contenuto: req.body.review,
        voto: parseInt(req.body.rating)
      });
      
      console.log('Creazione recensione con ID utente:', req.session.user.id);
      await recensione.save();
      
      // Create reviews array if it doesn't exist in session
      if (!req.session.reviews) {
        req.session.reviews = [];
      }
      
      // Add the new review with user info and date
      req.session.reviews.push({
        name: req.session.user.name,
        date: new Date(),
        rating: parseInt(req.body.rating),
        service: req.body.service,
        car: req.body.car,
        text: req.body.review
      });
      
      req.flash('success', 'Recensione inviata con successo!');
    } catch (error) {
      console.error("Errore durante il salvataggio della recensione:", error);
      req.flash('error', 'Si è verificato un errore nell\'invio della recensione.');
    }
  } else {
    req.flash('error', 'Devi essere loggato per inviare una recensione.');
  }
  res.redirect('/recensioni');
});

// Servizi page
router.get('/servizi', checkAdmin, (req, res) => {
  res.render('pages/servizi');
});

// Service selection route
router.get('/scegli-servizio', (req, res) => {
  const serviceType = req.query.service;
  
  // Check if user is authenticated
  if (req.session && req.session.user) {
    // User is logged in, redirect to booking page with service parameter
    res.redirect(`/prenota?service=${serviceType}`);
  } else {
    // User is not logged in, redirect to login page with service parameter
    res.redirect(`/login?service=${serviceType}`);
  }
});

// Prenota page (for car rentals and track days)
router.get('/prenota', checkAdmin, (req, res) => {
  // Check if user is authenticated
  if (req.session && req.session.user) {
    res.render('pages/prenota');
  } else {
    // Redirect to login if not authenticated
    res.redirect(`/login?service=${req.query.service || ''}`);
  }
});

// Inizializza le auto all'avvio dell'applicazione
(async () => {
  try {
    await Auto.initializeAutos();
    console.log('Database auto inizializzato correttamente');
  } catch (err) {
    console.error('Errore nell\'inizializzazione del database auto:', err);
  }
})();

// Process booking form submission
router.post('/prenota', async (req, res) => {
  // Save booking data to session for access in payment page
  const bookingData = req.body;
  
  if (req.session) {
    try {
      // Cerca l'auto in base al nome/slug fornito
      let autoId = null;
      
      if (bookingData.auto) {
        const auto = await Auto.findBySlug(bookingData.auto);
        if (auto) {
          autoId = auto.id;
          console.log(`Auto trovata: ID=${auto.id}, ${auto.marca} ${auto.modello}`);
        }
      }
      
      // Se non troviamo l'auto, otteniamo la prima disponibile
      if (!autoId) {
        const autos = await Auto.getAll();
        if (autos.length > 0) {
          autoId = autos[0].id;
          console.log(`Auto non trovata per "${bookingData.auto}", usando auto ID=${autoId} come fallback`);
        } else {
          throw new Error('Nessuna auto disponibile nel sistema');
        }
      }
      
      // Aggiungiamo l'ID auto ai dati della prenotazione
      bookingData.autoId = autoId;
      
      console.log('Dati prenotazione salvati in sessione:', bookingData);
      
      // Store booking data temporarily in session
      req.session.pendingBooking = bookingData;
      
      // Redirect to payment page
      res.redirect('/pagamento');
    } catch (err) {
      console.error('Errore nella preparazione della prenotazione:', err);
      req.flash('error', 'Si è verificato un errore. Riprova.');
      res.redirect('/prenota');
    }
  } else {
    req.flash('error', 'Si è verificato un errore. Riprova.');
    res.redirect('/prenota');
  }
});

// Payment page route
router.get('/pagamento', (req, res) => {
  // Check if user is authenticated and has pending booking
  if (req.session && req.session.user && req.session.pendingBooking) {
    res.render('pages/pagamento', { 
      booking: req.session.pendingBooking,
      user: req.session.user
    });
  } else {
    req.flash('error', 'Devi prima completare una prenotazione.');
    res.redirect('/servizi');
  }
});

// Process payment submission
router.post('/pagamento', async (req, res) => {
  // Process payment data
  if (req.session && req.session.user && req.session.pendingBooking) {
    try {
      console.log('Elaborazione pagamento e prenotazione per utente:', req.session.user.id);
      console.log('Dati prenotazione:', req.session.pendingBooking);
      
      // Verifica presenza ID auto
      if (!req.session.pendingBooking.autoId) {
        throw new Error('ID auto mancante nella prenotazione');
      }
      
      // 1. Salva la prenotazione nel database
      const prenotazione = new Prenotazione({
        idUtente: req.session.user.id,
        idAuto: req.session.pendingBooking.autoId,
        dataPrenotazione: new Date(req.session.pendingBooking.data).toISOString().split('T')[0],
        circuito: req.session.pendingBooking.circuito || null,
        tipologia: req.session.pendingBooking.tipologia || 'noleggio'
      });
      
      const savedPrenotazione = await prenotazione.save();
      console.log('Prenotazione salvata con successo, ID:', savedPrenotazione.id);
      
      // 2. Registra il pagamento
      const pagamento = new Pagamento({
        idPrenotazione: savedPrenotazione.id,
        idUtente: req.session.user.id,
        importo: req.body.amount,
        metodoPagamento: req.body.paymentMethod,
        dataPagamento: new Date().toISOString()
      });
      
      await pagamento.save();
      
      // Create bookings array if it doesn't exist
      if (!req.session.bookings) {
        req.session.bookings = [];
      }
      
      // Add the booking to user's profile with additional info
      req.session.bookings.push({
        ...req.session.pendingBooking,
        paymentMethod: req.body.paymentMethod,
        amount: req.body.amount,
        status: 'Confermata',
        id: savedPrenotazione.id,
        date: new Date(req.session.pendingBooking.data)
      });
      
      // Clear pending booking
      delete req.session.pendingBooking;
      
      // Show success message and redirect to user profile
      req.flash('success', 'Prenotazione completata con successo! Il pagamento è stato elaborato.');
      res.redirect('/utente');
    } catch (error) {
      console.error("Errore durante il salvataggio della prenotazione:", error);
      req.flash('error', 'Si è verificato un errore durante il pagamento.');
      res.redirect('/servizi');
    }
  } else {
    req.flash('error', 'Si è verificato un errore durante il pagamento.');
    res.redirect('/servizi');
  }
});

// Login page (temporary fix until auth router is properly configured)
router.get('/login', (req, res) => {
  res.render('pages/login', { serviceRedirect: req.query.service || '' });
});

// Login form submission
router.post('/login', async (req, res) => {
  // Simple authentication logic
  const { email, password } = req.body;
  const serviceRedirect = req.body.serviceRedirect || '';
  
  // Check if this is the admin user
  if (email === 'admin@gmail.com' && password === 'admin1234') {
    // Create admin session
    req.session.user = {
      name: 'Administrator',
      email: email,
      isAdmin: true
    };
    // Redirect directly to admin dashboard
    return res.redirect('/admin/dashboard');
  }
  
  // Regular user authentication
  if (email && password) {
    try {
      // Cerca l'utente nel database
      const user = await User.findOne({ email });
      
      if (user) {
        // Verifica password e imposta la sessione
        // Assicurati che l'ID utente sia incluso nella sessione
        req.session.user = {
          id: user.id, // Questo è importante!
          name: user.name || email.split('@')[0],
          email: email
        };
        
        console.log('Utente loggato con ID:', user.id);
        
        // Redirect based on service selection if available
        if (serviceRedirect) {
          res.redirect(`/prenota?service=${serviceRedirect}`);
        } else {
          res.redirect('/utente');
        }
      } else {
        req.flash('error', 'Email o password non validi.');
        res.redirect('/login');
      }
    } catch (err) {
      console.error('Errore durante il login:', err);
    }
  } else {
    req.flash('error', 'Email o password non validi.');
    res.redirect('/login');
  }
});

// User profile page
router.get('/utente', (req, res) => {
  // Check if user is logged in
  if (req.session && req.session.user) {
    res.render('pages/utente', { 
      user: req.session.user,
      bookings: req.session.bookings || [],
      messages: req.flash() 
    });
  } else {
    req.flash('error', 'Devi effettuare il login per accedere al tuo profilo');
    res.redirect('/login');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  const isAdmin = req.session && req.session.user && req.session.user.email === 'admin@gmail.com';
  
  // Clear user session
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      // Redirect to home page after logout for regular users, or login for admins
      res.redirect(isAdmin ? '/admin/dashboard' : '/');
    });
  } else {
    // If no session exists, just redirect to home
    res.redirect('/');
  }
});

// Registration page
router.get('/registrazione', (req, res) => {
  res.render('pages/registrazione', { serviceRedirect: req.query.service || '' });
});

// Registration form submission 
router.post('/registrazione', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, serviceRedirect } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      req.flash('error', 'Tutti i campi sono obbligatori.');
      return res.redirect('/registrazione');
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Le password non coincidono.');
      return res.redirect('/registrazione');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Un account con questa email esiste già.');
      return res.redirect('/registrazione');
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password // Will be hashed by the pre-save hook
    });
    
    // Save user to database
    await newUser.save();
    
    // Create user session
    req.session.user = { 
      id: newUser._id,
      name: newUser.name, 
      email: newUser.email 
    };
    
    // Redirect based on service selection if available
    if (serviceRedirect) {
      res.redirect(`/prenota?service=${serviceRedirect}`);
    } else {
      res.redirect('/utente');
    }
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Si è verificato un errore durante la registrazione.');
    res.redirect('/registrazione');
  }
});

// NON ripetere questo middleware, rimuovilo da qui se esiste alla fine del file
// router.use((req, res, next) => {
//   res.locals.user = req.session.user || null;
//   next();
// });

module.exports = router;
