"use strict";

const express = require("express");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const flash = require("connect-flash");

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const utenteRoutes = require('./routes/utente');

const PORT = process.env.PORT;
const app = express();

app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProd = process.env.NODE_ENV === "production";
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite:'strict',
    maxAge: 60 * 60 * 1000
  }
}));

app.use(flash());
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

// Setup routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/utente', utenteRoutes);
app.use('/admin', adminRoutes );

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});