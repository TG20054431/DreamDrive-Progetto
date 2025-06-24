'use strict';

const { db, insertWithLog, logDbOperation } = require('../db');

class Auto {
  constructor(auto) {
    this.id = auto.id;
    this.modello = auto.modello;
    this.marca = auto.marca;
    this.nazione = auto.nazione;
    this.motore = auto.motore;
  }

  // Salva una nuova auto nel database
  async save() {
    try {
      const autoData = {
        modello: this.modello,
        marca: this.marca,
        nazione: this.nazione,
        motore: this.motore
      };

      // Esecuzione diretta con transazione esplicita
      db.prepare('BEGIN TRANSACTION').run();
      const stmt = db.prepare(`
        INSERT INTO AUTO (modello, marca, nazione, motore) VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(this.modello, this.marca, this.nazione, this.motore);
      db.prepare('COMMIT').run();
      
      const id = result.lastInsertRowid;
      console.log('Auto salvata con ID:', id);
      
      this.id = id;
      return this;
    } catch (err) {
      try { db.prepare('ROLLBACK').run(); } catch (e) { /* ignore */ }
      console.error('Errore nel salvataggio dell\'auto:', err);
      throw err;
    }
  }

  // Trova auto per nome/identificatore (es. "ferrari-458")
  static async findBySlug(slug) {
    try {
      // Estrai marca e modello dal formato "marca-modello"
      const parts = slug.split('-');
      const marca = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Capitalizza prima lettera
      
      const stmt = db.prepare(`SELECT * FROM AUTO WHERE LOWER(marca) LIKE ? OR LOWER(modello) LIKE ?`);
      const row = stmt.get(`%${marca}%`, `%${parts.slice(1).join(' ')}%`);
      
      if (row) {
        console.log(`Auto trovata: ${row.marca} ${row.modello} (ID: ${row.ID_auto})`);
        return new Auto({
          id: row.ID_auto,
          modello: row.modello,
          marca: row.marca,
          nazione: row.nazione,
          motore: row.motore
        });
      }
      return null;
    } catch (err) {
      console.error('Errore nella ricerca dell\'auto:', err);
      return null;
    }
  }

  // Verifica se ci sono auto nel database, altrimenti ne aggiunge alcune
  static async initializeAutos() {
    try {
      // Verifica se esistono auto
      const count = db.prepare('SELECT COUNT(*) as count FROM AUTO').get().count;
      console.log(`Auto presenti nel database: ${count}`);
      
      if (count === 0) {
        console.log('Inizializzazione delle auto di default...');
        
        // Auto predefinite da aggiungere
        const defaultAutos = [
          { marca: 'Ferrari', modello: '458 Italia', nazione: 'Italia', motore: 'V8 4.5L' },
          { marca: 'Lamborghini', modello: 'Huracan', nazione: 'Italia', motore: 'V10 5.2L' },
          { marca: 'Porsche', modello: '911 GT3', nazione: 'Germania', motore: 'Boxer 6 4.0L' },
          { marca: 'McLaren', modello: '720S', nazione: 'Regno Unito', motore: 'V8 4.0L Biturbo' },
          { marca: 'Aston Martin', modello: 'Vantage', nazione: 'Regno Unito', motore: 'V8 4.0L Biturbo' }
        ];
        
        // Inserisci le auto
        db.prepare('BEGIN TRANSACTION').run();
        const stmt = db.prepare(`INSERT INTO AUTO (marca, modello, nazione, motore) VALUES (?, ?, ?, ?)`);
        
        for (const auto of defaultAutos) {
          stmt.run(auto.marca, auto.modello, auto.nazione, auto.motore);
          console.log(`Auto aggiunta: ${auto.marca} ${auto.modello}`);
        }
        
        db.prepare('COMMIT').run();
        console.log('Auto predefinite aggiunte con successo');
      }
      
      return true;
    } catch (err) {
      console.error('Errore nell\'inizializzazione delle auto:', err);
      try { db.prepare('ROLLBACK').run(); } catch (e) { /* ignore */ }
      return false;
    }
  }

  // Ottiene tutte le auto
  static async getAll() {
    try {
      const rows = db.prepare('SELECT * FROM AUTO').all();
      return rows.map(row => new Auto({
        id: row.ID_auto,
        modello: row.modello,
        marca: row.marca,
        nazione: row.nazione,
        motore: row.motore
      }));
    } catch (err) {
      console.error('Errore nel recupero delle auto:', err);
      return [];
    }
  }
}

module.exports = Auto;
