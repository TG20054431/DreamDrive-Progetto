'use strict';

const express = require('express');
const router = express.Router();
const { db } = require('./db');  // Nota che ora importiamo db dall'oggetto esportato
const fs = require('fs');
const path = require('path');

// Percorso del file di log
const LOG_FILE = path.join(__dirname, 'logs', 'db-operations.log');

// Endpoint per visualizzare lo stato del database
router.get('/db-status', (req, res) => {
  try {
    // Ottieni le ultime 20 operazioni dal file di log
    let recentOperations = [];
    if (fs.existsSync(LOG_FILE)) {
      const logContent = fs.readFileSync(LOG_FILE, 'utf8');
      const logLines = logContent.trim().split('\n').filter(line => line.trim());
      recentOperations = logLines
        .slice(-20) // Ultime 20 righe
        .map(line => JSON.parse(line))
        .reverse(); // Ordine cronologico inverso (più recenti prima)
    }

    // Conta i record nelle tabelle principali
    db.all(`
      SELECT 'UTENTE' as table_name, COUNT(*) as count FROM UTENTE
      UNION ALL
      SELECT 'AUTO', COUNT(*) FROM AUTO
      UNION ALL
      SELECT 'PRENOTAZIONE', COUNT(*) FROM PRENOTAZIONE
      UNION ALL
      SELECT 'PAGAMENTI', COUNT(*) FROM PAGAMENTI
      UNION ALL
      SELECT 'RECENSIONI', COUNT(*) FROM RECENSIONI
    `, [], (err, rows) => {
      if (err) {
        console.error('Errore nel conteggio dei record:', err);
        return res.status(500).send('Errore nel recupero dello stato del database');
      }

      // Formatta i dati per la visualizzazione
      const tableCounts = {};
      rows.forEach(row => {
        tableCounts[row.table_name] = row.count;
      });

      // Restituisci come JSON o HTML in base all'header Accept
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.json({
          database_status: 'OK',
          table_counts: tableCounts,
          recent_operations: recentOperations
        });
      } else {
        // Formato HTML semplice
        let html = `
          <h1>Stato del Database</h1>
          <h2>Conteggio Tabelle</h2>
          <ul>
        `;
        
        Object.entries(tableCounts).forEach(([table, count]) => {
          html += `<li><strong>${table}</strong>: ${count} record</li>`;
        });
        
        html += `
          </ul>
          <h2>Operazioni Recenti</h2>
          <table border="1">
            <tr>
              <th>Timestamp</th>
              <th>Operazione</th>
              <th>Tabella</th>
              <th>Stato</th>
              <th>Dati</th>
            </tr>
        `;
        
        recentOperations.forEach(op => {
          html += `
            <tr>
              <td>${op.timestamp}</td>
              <td>${op.operation}</td>
              <td>${op.table}</td>
              <td style="color: ${op.success ? 'green' : 'red'}">${op.success ? 'SUCCESS' : 'ERROR'}</td>
              <td><pre>${op.data || ''}</pre></td>
            </tr>
          `;
        });
        
        html += `</table>`;
        res.send(html);
      }
    });
  } catch (error) {
    console.error('Errore nella diagnostica:', error);
    res.status(500).send('Errore nella diagnostica');
  }
});

module.exports = router;
