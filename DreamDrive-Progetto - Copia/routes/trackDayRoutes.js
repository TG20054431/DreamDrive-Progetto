const express = require('express');
const router = express.Router();
const { db, insertWithLog } = require('../db');

// Rotta per visualizzare la pagina di prenotazione track day
router.get('/', (req, res) => {
  try {
    // Recupera le auto disponibili per track day
    const cars = db.prepare(`
      SELECT * FROM AUTO 
      WHERE DISPONIBILE = 1 
      AND CATEGORIA = 'Track Day'
      ORDER BY MARCA, MODELLO
    `).all();
    
    // Recupera i circuiti disponibili
    const circuits = db.prepare(`
      SELECT * FROM CIRCUITO
      ORDER BY NOME
    `).all();
    
    res.render('pages/track-day', { 
      user: req.session.user,
      cars: cars,
      circuits: circuits,
      messages: req.flash ? req.flash() : {}
    });
  } catch (error) {
    console.error('Errore nel caricamento della pagina track day:', error);
    if (req.flash) req.flash('error', 'Si è verificato un errore nel caricamento della pagina');
    res.redirect('/');
  }
});

// Rotta per processare la prenotazione di un track day
router.post('/', async (req, res) => {
  if (!req.session.user) {
    if (req.flash) req.flash('error', 'Devi accedere per prenotare un track day');
    return res.redirect('/login');
  }

  try {
    const { auto_id, data_evento, ora_inizio, ora_fine, circuito } = req.body;
    
    // Calcola il prezzo in base all'auto e alla durata
    const auto = db.prepare('SELECT PREZZO_GIORNALIERO FROM AUTO WHERE ID = ?').get(auto_id);
    
    // Calcola la durata in ore
    const inizio = new Date(`${data_evento}T${ora_inizio}`);
    const fine = new Date(`${data_evento}T${ora_fine}`);
    const durata = (fine - inizio) / (1000 * 60 * 60); // durata in ore
    
    const prezzo = auto.PREZZO_GIORNALIERO * (durata / 8); // Prezzo proporzionale alla durata
    
    // Verifica che la tipologia sia salvata correttamente
    // Controlla direttamente nella definizione del database qual è il valore esatto accettato
    const tipiAccettati = db.prepare(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='PRENOTAZIONE'
    `).get();
    console.log("Definizione tabella PRENOTAZIONE:", tipiAccettati.sql);
    
    // 1. Prima crea la prenotazione con tipologia esplicita
    const prenotazioneData = {
      ID_utente: req.session.user.id,
      ID_auto: auto_id,
      data_prenotazione: new Date().toISOString().split('T')[0],
      circuito: circuito,
      tipologia: 'trackday'  // Assicuriamoci che sia questo il valore corretto
    };
    
    console.log('ATTENZIONE - Creazione prenotazione con dati:', JSON.stringify(prenotazioneData));
    
    // Verifica se esistono regole nel database che modificano i valori
    const prenotazioneResult = await insertWithLog('PRENOTAZIONE', prenotazioneData);
    const idPrenotazione = prenotazioneResult.lastInsertRowid;
    
    // Verifica che la prenotazione sia stata creata correttamente
    const prenotazioneCreata = db.prepare(`
      SELECT * FROM PRENOTAZIONE WHERE ID_prenotazione = ?
    `).get(idPrenotazione);
    console.log('VERIFICA - Prenotazione creata:', JSON.stringify(prenotazioneCreata));
    
    if (prenotazioneCreata.tipologia !== 'trackday') {
      console.error('ERRORE CRITICO: La tipologia è stata modificata da "trackday" a:', prenotazioneCreata.tipologia);
      throw new Error('La tipologia della prenotazione è stata modificata durante il salvataggio!');
    }
    
    // 2. Poi inserisci il track day con riferimento alla prenotazione
    const trackDayData = {
      ID_utente: req.session.user.id,
      ID_auto: auto_id,
      ID_prenotazione: idPrenotazione,
      DATA_EVENTO: data_evento,
      CIRCUITO: circuito
      // Rimossi i campi che non esistono nello schema: ORA_INIZIO, ORA_FINE, PREZZO, STATO
    };
    
    console.log('Inserimento track day con dati:', JSON.stringify(trackDayData));
    await insertWithLog('TRACK_DAY', trackDayData);
    
    if (req.flash) req.flash('success', 'Track day prenotato con successo!');
    res.redirect('/profilo');
  } catch (error) {
    console.error('Errore nella prenotazione del track day:', error);
    if (req.flash) req.flash('error', `Si è verificato un errore nella prenotazione del track day: ${error.message}`);
    res.redirect('/track-day');
  }
});

module.exports = router;
