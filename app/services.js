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
/* ========================================================
========================================================
===================================================== TA BORT GET USERS */
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
  // HENTER ALLE ARRANGEMENTER FOR Å PUTTE DE INN I KALENDEREN
  getEvents(callback) {
    connection.query('SELECT * FROM Arrangement', (error, results) => {
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
    connection.query('SELECT kompetanse_navn FROM users_kompetanse WHERE users_id=?', [id], (error, kompetanse) => {
      if (error) throw error;
      callback(kompetanse);
    });
  },
  // SPØRRING FOR Å LEGGE TIL KOMPETANSE
  addKompetanse(id, kompetanse, gyldigFra, gyldigTil, callback) {
    if (kompetanse != ""){
    connection.query('INSERT INTO users_kompetanse SET users_id=?, kompetanse_navn=?, gyldigFra=?, gyldigTil=?  ON DUPLICATE KEY UPDATE kompetanse_navn=kompetanse_navn', [id, kompetanse, gyldigFra, gyldigTil], (error, kompetanse) => {
      if (error) throw error;
      callback();
    });
  } else {
    callback();
  }
  },
  getDeltakelse(callback) {
    connection.query('SELECT * FROM deltakelse INNER JOIN Arrangement ON deltakelse.arr_id = Arrangement.arr_id INNER JOIN users ON deltakelse.users_id = users.id', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
  getIkkeGodkjenteBrukere(callback) {
    connection.query('SELECT * FROM users_rettigheter INNER JOIN users ON users_rettigheter.users_id = users.id', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  }
};
