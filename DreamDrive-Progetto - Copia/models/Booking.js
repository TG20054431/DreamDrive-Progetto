const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  servizio: {
    type: String,
    required: true
  },
  auto: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  ora: String,
  circuito: String,
  durata: Number,
  nome: String,
  cognome: String,
  email: String,
  telefono: String,
  note: String,
  status: {
    type: String,
    default: 'Confermata'
  },
  amount: String,
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
