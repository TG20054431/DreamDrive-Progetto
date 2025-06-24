'use strict';

const { db, insertWithLog, logDbOperation } = require('../db');

class Prenotazione {
  constructor(prenotazione) {
    this.id = prenotazione.id;
    this.idUtente = prenotazione.idUtente;
    this.idAuto = prenotazione.idAuto;
    this.dataPrenotazione = prenotazione.dataPrenotazione;
    this.circuito = prenotazione.circuito;
    this.tipologia = prenotazione.tipologia;

    // Validazione campi obbligatori
    if (!this.idUtente) {
      throw new Error('ID utente mancante. Impossibile creare la prenotazione.');
    }
    if (!this.idAuto) {
      throw new Error('ID auto mancante. Impossibile creare la prenotazione.');
    }
    if (!this.dataPrenotazione) {
      this.dataPrenotazione = new Date().toISOString().split('T')[0];
    }
    if (!this.tipologia) {
      throw new Error('Tipologia prenotazione mancante.');
    }

    console.log('Prenotazione costruita:', {
      utente: this.idUtente,
      auto: this.idAuto,
      data: this.dataPrenotazione,
      circuito: this.circuito,
      tipologia: this.tipologia
    });
  }

  // Salva una nuova prenotazione
  async save() {
    try {
      console.log('Tentativo di salvare prenotazione:', {
        utente: this.idUtente,
        auto: this.idAuto,
        data: this.dataPrenotazione,
        circuito: this.circuito,
        tipologia: this.tipologia
      });

      // Prepariamo i dati per l'inserimento
      const prenotazioneData = {
        ID_utente: this.idUtente,
        ID_auto: this.idAuto,
        data_prenotazione: this.dataPrenotazione,
        tipologia: this.tipologia
      };
      
      // Aggiungiamo il circuito solo se presente
      if (this.circuito) {
        prenotazioneData.circuito = this.circuito;
      }

      // Eseguiamo l'inserimento direttamente per maggior controllo
      const columns = Object.keys(prenotazioneData).join(', ');
      const placeholders = Object.keys(prenotazioneData).map(() => '?').join(', ');
      const values = Object.values(prenotazioneData);
      
      const sql = `INSERT INTO PRENOTAZIONE (${columns}) VALUES (${placeholders})`;
      console.log('SQL Query:', sql);
      console.log('Parametri:', values);
      
      // Esecuzione diretta con transazione esplicita
      db.prepare('BEGIN TRANSACTION').run();
      const stmt = db.prepare(sql);
      const result = stmt.run(values);
      db.prepare('COMMIT').run();
      
      // Ottenere l'ID dell'ultima prenotazione inserita
      const id = result.lastInsertRowid;
      console.log('Prenotazione salvata con ID:', id);
      
      this.id = id;
      return this;
    } catch (err) {
      // In caso di errore facciamo rollback
      try { db.prepare('ROLLBACK').run(); } catch (e) { /* ignore */ }
      
      console.error('Errore nel salvataggio della prenotazione:', err);
      logDbOperation('INSERT', 'PRENOTAZIONE', {
        ID_utente: this.idUtente,
        ID_auto: this.idAuto,
        data_prenotazione: this.dataPrenotazione,
        circuito: this.circuito,
        tipologia: this.tipologia
      }, err);
      throw err;
    }
  }

  // Ottiene le prenotazioni di un utente specifico
  static async getByUserId(userId) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare(`
          SELECT p.*, a.marca, a.modello 
          FROM PRENOTAZIONE p
          JOIN AUTO a ON p.ID_auto = a.ID_auto
          WHERE p.ID_utente = ?
          ORDER BY p.data_prenotazione DESC
        `);
        const rows = stmt.all(userId);
        console.log(`Trovate ${rows.length} prenotazioni per l'utente ID: ${userId}`);
        logDbOperation('SELECT', 'PRENOTAZIONE', { userId, count: rows.length });
        resolve(rows);
      } catch (err) {
        console.error(`Errore nel recupero prenotazioni per l'utente ${userId}:`, err);
        logDbOperation('SELECT', 'PRENOTAZIONE', { userId }, err);
        reject(err);
      }
    });
  }
}

module.exports = Prenotazione;
