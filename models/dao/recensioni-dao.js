'use strict';

const db = require('../../db');

class RecensioniDAO {
  constructor(database) {
    this.db = database;
  }

  async getRecensioniByUserId(userId) {
    const sql = `SELECT * FROM RECENSIONI WHERE ID_utente = ? ORDER BY data_creazione DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getRecensioneById(id) {
    const sql = `SELECT * FROM RECENSIONI WHERE ID_recensione = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async insertRecensione(recensione) {
    // Usa solo le colonne esistenti nella tabella RECENSIONI
    const sql = `INSERT INTO RECENSIONI (ID_utente, tipologia, valutazione, contenuto) 
                VALUES (?, ?, ?, ?)`;
    const params = [
      recensione.ID_utente || null,  // Può essere null per recensioni anonime
      recensione.tipologia, 
      recensione.valutazione, 
      recensione.contenuto
    ];
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  async deleteRecensione(id) {
    const sql = `DELETE FROM RECENSIONI WHERE ID_recensione = ?`;
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getAllRecensioni() {
    const sql = `SELECT R.*, U.nome AS nome_utente 
                 FROM RECENSIONI R 
                 LEFT JOIN UTENTE U ON R.ID_utente = U.ID_utente 
                 ORDER BY R.data_creazione DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new RecensioniDAO(db);