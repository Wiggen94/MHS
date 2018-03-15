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


// Setup database server reconnection when server timeouts connection:



// Class that performs database queries related to customers
  getUsers(callback){
    connection.query('SELECT * FROM users', (error, result) => {
      if (error) throw error;
      callback(result);
    });
  },

  getUser(id, callback) {
    connection.query('SELECT * FROM users WHERE id=?', [id], (error, result) => {
      if (error) throw error;

      callback(result[0]);
    });
  },



  changeCustomer(name, city, id) {
    connection.query("UPDATE Customers SET firstName = ?, city = ? WHERE id = ?", [name, city, id], (error, result) => {
      if (error) throw error;

      console.log('Changed someone...');
    });
  }
};
