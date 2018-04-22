var express = require('express');
var app = express();
var mysql = require('mysql');
var connection = mysql.createPool({
  connectionLimit: 10,
  host: 'mysql.stud.iie.ntnu.no',
  user: 'g_oops_2',
  password: '4JqXIUT3',
  database: 'g_oops_2'
});

module.exports = {

  // GIR EN BRUKER POENG VED FØRSTE PÅLOGGING
  firstLogin(id) {
    connection.query('INSERT INTO users_poeng (users_id) values(?)', [id], (error) => {
      if (error) throw error;
    });
    connection.query('INSERT INTO users_rettigheter (users_id, isAdmin, isGodkjent) values(?,0,0)', [id], (error) => {
      if (error) throw error;
    });
  },


  // SPØRRING FOR Å SJEKKE RETTIGHETER TIL BRUKER
  getUser(id, callback) {
    connection.query('SELECT * FROM users_rettigheter WHERE users_id=?', [id], (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
  // SPØRRING FOR Å OPPDATERE BRUKERINFO
  editUser(name, email, id) {
    connection.query('UPDATE users SET localName=?, localEmail=? WHERE id=?', [id], (error, result) => {
      if (error) throw error;
    });
  },
  // HENTER GJELDENDE ARRANGEMENT
  getEvent(thisEvent, callback) {
    connection.query('SELECT * FROM Arrangement WHERE arr_id=?', [thisEvent], (error, results) => {
      if (error) throw error;
      callback(results);
    });
  },
  // HENTER ALLE KOMMENDE ARRANGEMENTER FOR Å PUTTE DE INN I KALENDEREN
  getEvents(callback) {
    connection.query('SELECT * FROM Arrangement WHERE tilDato >= CURDATE()', (error, results) => {
      if (error) throw error;
      callback(results);
    });
  },
  // HENTER ALLE KOMMENDE ARRANGEMENTER FOR Å PUTTE DE INN I KALENDEREN
  getPastEvents(callback) {
    connection.query('SELECT * FROM Arrangement WHERE tilDato <= CURDATE()', (error, results) => {
      if (error) throw error;
      callback(results);
    });
  },
  // SPØRRING FOR Å FJERNE ET ARRANGEMENT
  removeEvent(arr_id) {
    connection.query('DELETE FROM Arrangement where arr_id=?', [arr_id], (error, results) => {
      if (error) throw error;
    });
  },
  // HENTER POENG FOR AKTUELL BRUKER
  getPoints(id, callback) {
    connection.query('SELECT poeng FROM users_poeng WHERE users_id=?', [id], (error, points) => {
      if (error) throw error;
      callback(points);
    });
  },
  // HENTER KOMPETANSE FOR AKTUELL BRUKER
  getKompetanse(id, callback) {
    connection.query('SELECT kompetanse_navn FROM users_kompetanse WHERE users_id=? AND isGodkjent=1', [id], (error, kompetanse) => {
      if (error) throw error;
      callback(kompetanse);
    });
  },
  // SPØRRING FOR Å LEGGE TIL KOMPETANSE
  addKompetanse(id, kompetanse, gyldigFra, gyldigTil, callback) {
    if (kompetanse != "") {
      connection.query('INSERT INTO users_kompetanse SET users_id=?, kompetanse_navn=?, gyldigFra=?, gyldigTil=?  ON DUPLICATE KEY UPDATE kompetanse_navn=kompetanse_navn', [id, kompetanse, gyldigFra, gyldigTil], (error, kompetanse) => {
        if (error) throw error;
        callback();
      });
    } else {
      callback();
    }
  },
  // HENTER ALLE SOM DELTAR PÅ ET ARRANGEMENT
  getDeltakelse(callback) {
    connection.query('SELECT * FROM deltakelse INNER JOIN users ON deltakelse.users_id = users.id INNER JOIN Arrangement on deltakelse.arr_id = Arrangement.arr_id', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
    // HENTER ALLE ARRANGEMENTER EN BRUKER DELTAR PÅ
  getThisDeltakelse(thisEvent, callback) {
    connection.query('SELECT * FROM deltakelse INNER JOIN users ON deltakelse.users_id = users.id WHERE arr_id=? AND isGodkjent=1', [thisEvent], (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
    // HENTER ALLE SOM DELTAR PÅ ET ARRANGEMENT OG SOM ER GODKJENT
  getThisVakter(thisVakt, callback) {
    connection.query('SELECT * FROM deltakelse INNER JOIN Arrangement ON deltakelse.arr_id = Arrangement.arr_id WHERE users_id=? AND isGodkjent=1', [thisVakt], (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
    // TELLER ALLE ROLLER OG VAKTER SOM ER GODKJENT FOR ET ARRANGEMENT
  countDeltakelse(thisEvent, callback) {
    connection.query('SELECT COUNT(rolleNavn) AS antall, rolleNavn FROM deltakelse INNER JOIN users ON deltakelse.users_id = users.id WHERE arr_id=? GROUP BY rolleNavn', [thisEvent], (error, result) => {
      console.log(result);
      if (error) throw error;
      callback(result);
    });
  },
  // HENTER ALLE BRUKERE SOM IKKE ER GODKJENT
  getIkkeGodkjenteBrukere(callback) {
    connection.query('SELECT * FROM users_rettigheter INNER JOIN users ON users_rettigheter.users_id = users.id', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
    // HENTER ALL KOMPETANSE SOM IKKE ER GODKJENT
  getIkkeGodkjentKompetanse(callback) {
    connection.query('SELECT * FROM users_kompetanse INNER JOIN users ON users_kompetanse.users_id = users.id', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  }
};
