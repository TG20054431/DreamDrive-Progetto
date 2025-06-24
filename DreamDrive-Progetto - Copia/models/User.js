'use strict';

const { db, insertWithLog, checkDataExists, logDbOperation } = require('../db');
const crypto = require('crypto');

class User {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.ruolo = user.ruolo || 'utente';
  }

  // Metodo statico per trovare un utente tramite email
  static async findOne({ email }) {
    try {
      // better-sqlite3 ha una sintassi diversa: prima prepariamo la query, poi la eseguiamo
      const sql = `SELECT * FROM UTENTE WHERE email = ?`;
      const stmt = db.prepare(sql);
      const row = stmt.get(email);
      
      logDbOperation('SELECT', 'UTENTE', { email, found: !!row });
      return row ? new User({
        id: row.ID_utente,
        name: row.nome + ' ' + row.cognome,
        email: row.email,
        password: row.password,
        ruolo: row.ruolo
      }) : null;
    } catch (err) {
      logDbOperation('SELECT', 'UTENTE', { email }, err);
      throw err;
    }
  }

  // Metodo per salvare un nuovo utente
  async save() {
    // Hash della password prima del salvataggio
    const hashedPassword = crypto
      .createHash('sha256')
      .update(this.password)
      .digest('hex');

    const userData = {
      nome: this.name,
      cognome: this.name.split(' ')[1] || '', // Semplice gestione del cognome
      data_nascita: new Date().toISOString().split('T')[0], // Data corrente come placeholder
      email: this.email,
      password: hashedPassword,
      ruolo: this.ruolo
    };

    try {
      // Usa la funzione insertWithLog dal db-logger
      const userId = await insertWithLog('UTENTE', userData);
      this.id = userId;
      return this;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;
