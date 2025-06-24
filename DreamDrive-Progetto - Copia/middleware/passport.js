"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const utenti_dao = require('../models/utenti_dao');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const utente = await utenti_dao.getUser(email);

    if (!utente) {
      return done(null, false, { message: 'Utente non trovato.' });
    }

    const isMatch = await bcrypt.compare(password, utente.password);

    if (isMatch) {
      return done(null, utente);
    } else {
      return done(null, false, { message: 'Password errata.' });
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((utente, done) => {
  done(null, utente.ID_utente);
});

passport.deserializeUser(async (ID_utente, done) => {
  try {
    const user = await utenti_dao.getUserById(ID_utente);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;