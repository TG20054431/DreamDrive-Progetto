'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Utilizziamo un valore di default se la variabile d'ambiente non è impostata
const DB_NAME = process.env.DB_NAME || 'dreamdrivedb.sqlite';

// Ottieni il percorso assoluto del file database
const DB_PATH = path.resolve('./' + DB_NAME);
console.log('Percorso assoluto del database:', DB_PATH);

// Directory per i log
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// File di log per le operazioni del database
const DB_LOG_FILE = path.join(LOG_DIR, 'db-operations.log');

// Apertura del database
let db;
try {
  // Modifico le opzioni per migliorare la compatibilità con DBeaver
  db = new Database(DB_PATH, { 
    verbose: console.log,
    fileMustExist: false
  });
  console.log(`Connessione al database '${DB_NAME}' avvenuta con successo...`);
  
  // Verifica che le tabelle esistano, creale se necessario
  const userTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='UTENTE'").get();
  const trackDayTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TRACK_DAY'").get();
  const recensioniTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='RECENSIONI'").get();
  
  if (!userTableExists || !trackDayTableExists) {
    console.log('Alcune tabelle non trovate, inizializzazione del database...');
    
    // Inizializzazione standard dal file SQL
    if (!userTableExists) {
      console.log('Tabelle utente non trovate, inizializzazione dal file SQL...');
      const createScript = fs.readFileSync(path.join(__dirname, 'dreamdrivedb.sql'), 'utf8');
      // Dividiamo lo script in singole query
      const queries = createScript.replace(/^--.*$/gm, '').split(';').filter(query => query.trim());
      
      db.prepare('BEGIN TRANSACTION').run();
      try {
        for (const query of queries) {
          if (query.trim()) {
            db.prepare(query).run();
          }
        }
        db.prepare('COMMIT').run();
        console.log('Tabelle base inizializzate con successo');
      } catch (error) {
        db.prepare('ROLLBACK').run();
        console.error('Errore durante l\'inizializzazione delle tabelle base:', error);
      }
    }
    
    // Creazione tabella TRACK_DAY se non esiste
    if (!trackDayTableExists) {
      console.log('Tabella TRACK_DAY non trovata, creazione...');
      db.prepare('BEGIN TRANSACTION').run();
      try {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS TRACK_DAY (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UTENTE_ID INTEGER NOT NULL,
            AUTO_ID INTEGER NOT NULL,
            DATA_EVENTO TEXT NOT NULL,
            CIRCUITO TEXT NOT NULL,
            DATA_CREAZIONE TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (UTENTE_ID) REFERENCES UTENTE(ID),
            FOREIGN KEY (AUTO_ID) REFERENCES AUTO(ID)
          )
        `).run();
        db.prepare('COMMIT').run();
        console.log('Tabella TRACK_DAY creata con successo');
      } catch (error) {
        db.prepare('ROLLBACK').run();
        console.error('Errore durante la creazione della tabella TRACK_DAY:', error);
      }
    }
    
    // Creazione tabella RECENSIONI se non esiste
    if (!recensioniTableExists) {
      console.log('Tabella RECENSIONI non trovata, creazione...');
      db.prepare('BEGIN TRANSACTION').run();
      try {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS RECENSIONI (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UTENTE_ID INTEGER NOT NULL,
            SERVIZIO TEXT NOT NULL,
            AUTO TEXT NOT NULL,
            COMMENTO TEXT NOT NULL,
            VALUTAZIONE INTEGER NOT NULL CHECK (VALUTAZIONE BETWEEN 1 AND 5),
            DATA_CREAZIONE TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (UTENTE_ID) REFERENCES UTENTE(ID)
          )
        `).run();
        db.prepare('COMMIT').run();
        console.log('Tabella RECENSIONI creata con successo');
      } catch (error) {
        db.prepare('ROLLBACK').run();
        console.error('Errore durante la creazione della tabella RECENSIONI:', error);
      }
    }
  }
  
  // Abilitare i vincoli di chiave esterna
  db.pragma('foreign_keys = ON');
  console.log('Vincoli di chiave esterna attivati');
  
  // Disabilito la modalità WAL che può causare problemi di visibilità con DBeaver
  db.pragma('journal_mode = DELETE');
  console.log('Modalità journal impostata a DELETE per compatibilità con DBeaver');
  
  // Forza il commit al disco dopo ogni transazione
  db.pragma('synchronous = FULL');
  console.log('Sincronizzazione impostata a FULL per garantire la persistenza dei dati');
  
  // Verifica e stampa il numero di utenti nel database
  const userCount = db.prepare('SELECT COUNT(*) as count FROM UTENTE').get();
  console.log(`Numero di utenti nel database: ${userCount.count}`);
  
} catch (err) {
  console.error('Errore nella connessione al database:', err.message);
}

// Funzione per registrare operazioni del database
function logDbOperation(operation, table, data, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    table,
    success: !error,
    data: data ? JSON.stringify(data) : null,
    error: error ? error.message : null
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(DB_LOG_FILE, logLine);
  
  console.log(`[DB ${operation}] ${table} - ${error ? 'ERROR: ' + error.message : 'SUCCESS'}`);
}

// Adattamento per mantenere API simile a sqlite3
// Assicura che ogni operazione venga immediatamente scritta sul disco
function insertWithLog(table, data) {
  try {
    console.log(`Inserimento dati in ${table}:`, data);
    
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const columns = keys.join(',');
    const values = keys.map(key => data[key]);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    console.log('SQL Query:', sql);
    console.log('Valori:', values);
    
    // Eseguo tutto in una transazione esplicita per garantire coerenza
    db.prepare('BEGIN TRANSACTION').run();
    const stmt = db.prepare(sql);
    
    // Utilizzo array di valori invece di un oggetto spread
    const info = stmt.run(...values);
    db.prepare('COMMIT').run();
    
    // Forza sync sul disco
    db.pragma('wal_checkpoint');
    
    const lastId = info.lastInsertRowid;
    console.log(`Record inserito in ${table} con ID:`, lastId);
    
    logDbOperation('INSERT', table, {...data, id: lastId});
    return Promise.resolve(lastId);
  } catch (err) {
    console.error(`Errore durante l'inserimento in ${table}:`, err);
    // Eseguiamo il rollback in caso di errore
    try { db.prepare('ROLLBACK').run(); } catch (e) { /* ignora errori nel rollback */ }
    logDbOperation('INSERT', table, data, err);
    return Promise.reject(err);
  }
}

function checkDataExists(table, criteria) {
  try {
    const whereConditions = Object.keys(criteria).map(key => `${key} = ?`).join(' AND ');
    const values = Object.keys(criteria).map(key => criteria[key]);
    
    const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereConditions}`;
    
    const stmt = db.prepare(sql);
    const row = stmt.get(values);
    
    const exists = row.count > 0;
    logDbOperation('CHECK', table, {...criteria, exists});
    return Promise.resolve(exists);
  } catch (err) {
    logDbOperation('CHECK', table, criteria, err);
    return Promise.reject(err);
  }
}

// Esportiamo le funzioni
module.exports = {
  db,
  logDbOperation,
  insertWithLog,
  checkDataExists
};