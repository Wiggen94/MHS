var express  = require('express');
var app      = express();
var mysql    = require('mysql');
var connection = mysql.createConnection({
    host: 'mysql.stud.iie.ntnu.no',
    user: 'g_oops_2',
    password: '4JqXIUT3',
    database: 'g_oops_2'
});

module.exports =  {


// Class that performs database queries related to customers
  firstLogin(id){
        connection.query('INSERT INTO users_poeng (users_id) values(?)', [id], (error) => {
          if (error) throw error;
        });
      },
  getUsers(callback){
    connection.query('SELECT * FROM users', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },
  editUser(name, email, id) {
    connection.query('UPDATE users SET localName=?, localEmail=? WHERE id=?', [id], (error, result) => {
      if (error) throw error;
    });
  },
  getEvents(callback) {
    connection.query('SELECT * FROM Arrangement', (error, results) => {
      if (error) throw error;
      callback(results);
    });
  },
  getPoints(id, callback) {
    connection.query('SELECT poeng FROM users_poeng WHERE users_id=?', [id], (error, points) => {
      if (error) throw error;
      callback(points);
    });
  },

};
