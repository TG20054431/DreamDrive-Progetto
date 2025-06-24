'use strict';

const fs = require('fs');
const path = require('path');
const db = require('./db');

// Directory per i log
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// File di log per le operazioni del database
const DB_LOG_FILE = path.join(LOG_DIR, 'db-operations.log');

/**
 * Registra un'operazione sul database
 * @param {string} operation - Tipo di operazione (INSERT, UPDATE, DELETE, SELECT)
 * @param {string} table - Nome della tabella
 * @param {Object} data - Dati coinvolti nell'operazione
 * @param {Error} error - Eventuale errore
 */
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

/**
 * Wrapper per l'inserimento di dati con logging
 * @param {string} table - Nome della tabella
 * @param {Object} data - Dati da inserire
 * @returns {Promise}
 */
function insertWithLog(table, data) {
  return new Promise((resolve, reject) => {
    // Costruisci la query dinamicamente
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const columns = keys.join(',');
    const values = keys.map(key => data[key]);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    
    db.run(sql, values, function(err) {
      if (err) {
        logDbOperation('INSERT', table, data, err);
        reject(err);
      } else {
        // this.lastID contiene l'ID dell'ultimo record inserito
        logDbOperation('INSERT', table, {...data, id: this.lastID});
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Controlla se i dati esistono nel database
 * @param {string} table - Nome della tabella
 * @param {Object} criteria - Criteri di ricerca
 * @returns {Promise<boolean>}
 */
function checkDataExists(table, criteria) {
  return new Promise((resolve, reject) => {
    // Costruisci la WHERE clause dinamicamente
    const whereConditions = Object.keys(criteria).map(key => `${key} = ?`).join(' AND ');
    const values = Object.keys(criteria).map(key => criteria[key]);
    
    const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereConditions}`;
    
    db.get(sql, values, (err, row) => {
      if (err) {
        logDbOperation('CHECK', table, criteria, err);
        reject(err);
      } else {
        const exists = row.count > 0;
        logDbOperation('CHECK', table, {...criteria, exists});
        resolve(exists);
      }
    });
  });
}

module.exports = {
  logDbOperation,
  insertWithLog,
  checkDataExists
};
