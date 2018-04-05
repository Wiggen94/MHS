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
  getUsers(callback){
    connection.query('SELECT * FROM users', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },

  getEvents(callback) {
    connection.query('SELECT * FROM Arrangement', (error, results) => {
      if (error) throw error;
      callback(results);
    });
  },
};
