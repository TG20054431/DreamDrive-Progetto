const connectDB = require('./config/db');
const express = require('express');
const app = express();

// Middleware per parsing del corpo delle richieste
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const recensioniRoutes = require('./routes/recensioniRoutes');
const trackDayRoutes = require('./routes/trackDayRoutes');

// Connect to database
// connectDB(); // Commentato perché stiamo usando SQLite con better-sqlite3

// Register routes
app.use('/recensioni', recensioniRoutes);
app.use('/track-day', trackDayRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
