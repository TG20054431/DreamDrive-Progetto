'use strict';

const { db } = require('./db');
const fs = require('fs');
const path = require('path');

// Determina e stampa il percorso assoluto del database
const DB_NAME = process.env.DB_NAME || 'dreamdrivedb.sqlite';
const DB_PATH = path.resolve(process.cwd(), DB_NAME);
console.log('\n===== INFORMAZIONI DATABASE =====');
console.log('Nome del database:', DB_NAME);
console.log('Directory corrente:', process.cwd());
console.log('Percorso assoluto del database:', DB_PATH);
console.log('Il file esiste:', fs.existsSync(DB_PATH) ? 'Sì' : 'No');
if (fs.existsSync(DB_PATH)) {
  const stats = fs.statSync(DB_PATH);
  console.log('Dimensione del file:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('Ultima modifica:', stats.mtime);
}
console.log('================================\n');

// Funzione per esportare i dati in un file JSON
function exportData() {
  const tables = ['UTENTE', 'AUTO', 'PRENOTAZIONE', 'PAGAMENTI', 'RECENSIONI'];
  const data = {};
  
  for (const table of tables) {
    try {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      data[table] = rows;
      console.log(`Esportati ${rows.length} record dalla tabella ${table}`);
    } catch (err) {
      console.error(`Errore nell'esportazione della tabella ${table}:`, err.message);
      data[table] = { error: err.message };
    }
  }
  
  const exportPath = path.join(__dirname, 'database-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
  console.log(`Dati esportati in ${exportPath}`);
}

// Esegui l'esportazione
exportData();
