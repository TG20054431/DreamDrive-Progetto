'use strict';

const { db, insertWithLog, logDbOperation } = require('../db');

class Pagamento {
  constructor(pagamento) {
    this.id = pagamento.id;
    this.idPrenotazione = pagamento.idPrenotazione;
    this.idUtente = pagamento.idUtente;
    this.importo = pagamento.importo;
    this.metodoPagamento = pagamento.metodoPagamento;
    this.dataPagamento = pagamento.dataPagamento || new Date().toISOString();
  }

  // Salva un nuovo pagamento
  async save() {
    try {
      // Modifichiamo la tabella PAGAMENTI per aggiungere le colonne mancanti
      await this.assicuraColonne();

      const pagamentoData = {
        ID_prenotazione: this.idPrenotazione,
        ID_utente: this.idUtente,
        importo: this.importo,
        metodo_pagamento: this.metodoPagamento,
        data_pagamento: this.dataPagamento
      };

      const pagamentoId = await insertWithLog('PAGAMENTI', pagamentoData);
      this.id = pagamentoId;
      return this;
    } catch (err) {
      throw err;
    }
  }

  // Assicura che le colonne necessarie esistano
  async assicuraColonne() {
    try {
      // Verifica se le colonne esistono già
      const cols = db.prepare("PRAGMA table_info(PAGAMENTI)").all();
      const colNames = cols.map(col => col.name);
      
      // Se non esiste la colonna importo, aggiungila
      if (!colNames.includes('importo')) {
        db.prepare("ALTER TABLE PAGAMENTI ADD COLUMN importo DECIMAL(10,2) DEFAULT 0").run();
      }
      
      // Se non esiste la colonna metodo_pagamento, aggiungila
      if (!colNames.includes('metodo_pagamento')) {
        db.prepare("ALTER TABLE PAGAMENTI ADD COLUMN metodo_pagamento TEXT").run();
      }
      
      // Se non esiste la colonna data_pagamento, aggiungila
      if (!colNames.includes('data_pagamento')) {
        db.prepare("ALTER TABLE PAGAMENTI ADD COLUMN data_pagamento DATE DEFAULT CURRENT_TIMESTAMP").run();
      }
      
      return true;
    } catch (err) {
      logDbOperation('ALTER', 'PAGAMENTI', {}, err);
      throw err;
    }
  }
}

module.exports = Pagamento;
