'use strict';

const db = require('../../db');

class UtentiDAO {
  constructor(database) {
    this.db = database;
  }

  async getUser(email) {
    const sql = `SELECT * FROM utenti WHERE email = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserById(id) {
    const sql = `SELECT * FROM utenti WHERE id = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = new utente_dao(db);