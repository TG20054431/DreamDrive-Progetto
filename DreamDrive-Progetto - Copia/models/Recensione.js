'use strict';

const { db, insertWithLog, logDbOperation } = require('../db');

class Recensione {
  constructor(recensione) {
    this.id = recensione.id;
    this.idUtente = recensione.idUtente;
    
    // Verifica che idUtente sia definito
    if (!this.idUtente) {
      throw new Error('ID utente mancante. Impossibile creare la recensione.');
    }
    
    this.contenuto = recensione.contenuto;
    this.voto = recensione.voto;
    this.dataRecensione = recensione.dataRecensione || new Date().toISOString().split('T')[0];
  }

  // Salva una nuova recensione
  async save() {
    try {
      console.log('Tentativo di salvare recensione:', {
        utente: this.idUtente,
        contenuto: this.contenuto,
        voto: this.voto
      });
      
      // Verifica aggiuntiva che idUtente sia definito
      if (!this.idUtente) {
        throw new Error('ID utente mancante. Impossibile salvare la recensione.');
      }
      
      // Assicuriamo che la colonna voto esista
      await this.assicuraColonne();

      // Prepariamo i dati per l'inserimento, usando i nomi di colonna corretti
      const recensioneData = {
        ID_utente: this.idUtente,
        contenuto: this.contenuto
      };
      
      // Aggiungiamo le colonne estese solo se esistono
      if (this.voto) {
        recensioneData.voto = this.voto;
      }
      
      if (this.dataRecensione) {
        recensioneData.data_recensione = this.dataRecensione;
      }

      // Eseguiamo l'inserimento direttamente per avere più controllo
      const columns = Object.keys(recensioneData).join(', ');
      const placeholders = Object.keys(recensioneData).map(() => '?').join(', ');
      const values = Object.values(recensioneData);
      
      const sql = `INSERT INTO RECENSIONI (${columns}) VALUES (${placeholders})`;
      console.log('SQL Query:', sql);
      console.log('Parametri:', values);
      
      // Esecuzione diretta con transazione esplicita
      db.prepare('BEGIN TRANSACTION').run();
      const stmt = db.prepare(sql);
      const result = stmt.run(values);
      db.prepare('COMMIT').run();
      
      // Ottenere l'ID dell'ultimo record inserito
      const id = result.lastInsertRowid;
      console.log('Recensione salvata con ID:', id);
      
      this.id = id;
      return this;
    } catch (err) {
      // In caso di errore facciamo rollback
      try { db.prepare('ROLLBACK').run(); } catch (e) { /* ignore */ }
      
      console.error('Errore nel salvataggio della recensione:', err);
      logDbOperation('INSERT', 'RECENSIONI', {
        ID_utente: this.idUtente,
        contenuto: this.contenuto, 
        voto: this.voto
      }, err);
      throw err;
    }
  }

  // Ottiene tutte le recensioni
  static async getAll() {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare(`
          SELECT r.*, u.nome, u.cognome 
          FROM RECENSIONI r
          JOIN UTENTE u ON r.ID_utente = u.ID_utente
          ORDER BY r.data_recensione DESC
        `);
        const rows = stmt.all();
        logDbOperation('SELECT', 'RECENSIONI', { count: rows.length });
        resolve(rows);
      } catch (err) {
        logDbOperation('SELECT', 'RECENSIONI', {}, err);
        reject(err);
      }
    });
  }

  // Assicura che le colonne necessarie esistano
  async assicuraColonne() {
    try {
      // Verifica se le colonne esistono già
      const cols = db.prepare("PRAGMA table_info(RECENSIONI)").all();
      const colNames = cols.map(col => col.name);
      
      let alterRequired = false;
      
      // Se non esiste la colonna voto, aggiungila
      if (!colNames.includes('voto')) {
        console.log('Aggiunta colonna voto alla tabella RECENSIONI');
        db.prepare("ALTER TABLE RECENSIONI ADD COLUMN voto INTEGER").run();
        alterRequired = true;
      }
      
      // Se non esiste la colonna data_recensione, aggiungila
      if (!colNames.includes('data_recensione')) {
        console.log('Aggiunta colonna data_recensione alla tabella RECENSIONI');
        db.prepare("ALTER TABLE RECENSIONI ADD COLUMN data_recensione TEXT").run();
        alterRequired = true;
      }
      
      if (alterRequired) {
        // Stampa la struttura aggiornata
        console.log('Struttura tabella RECENSIONI aggiornata:');
        const updatedCols = db.prepare("PRAGMA table_info(RECENSIONI)").all();
        console.log(updatedCols);
      }
      
      return true;
    } catch (err) {
      console.error('Errore durante la modifica della tabella RECENSIONI:', err);
      logDbOperation('ALTER', 'RECENSIONI', {}, err);
      throw err;
    }
  }
}

module.exports = Recensione;
