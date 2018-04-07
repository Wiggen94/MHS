const mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'mysql.stud.iie.ntnu.no',
  user: 'g_oops_2',
  password: '4JqXIUT3',
  database: 'g_oops_2'
});

var Usermodel      = require('../app/models/user');
var userService = require('./services.js');
module.exports = function(app, passport) {

  var nodeMailer = require('nodemailer');
  // normal routes =============================================================
  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/profile');
    } else {
      res.render('index.ejs');
    }
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
    userService.getUsers((result) => {
    userService.getPoints(req.user.id, (points) => {
      console.log (points);
      userService.getEvents((results) => {
        res.render('profile.ejs', {
          users: result,
          events: results,
          user: req.user,
          points: points
        });
      });
      });
    });
  });

  // CHANGE PROFILE SECTION =========================
  app.get('/profile/editprofile', function(req, res) {
        res.render('editprofile.ejs', {
          user: req.user
        });
  });

  app.post('/edit-profile', function(req, res) {
Usermodel.findByIdAndUpdate(req.user.id,{
  local:{
    name: req.body.changeName,
    phone: req.body.changePhone,
    email: req.body.changeEmail
  }
},    function(err, response){
        console.log(response);
        res.redirect('/profile');
    console.log(res);
  });
    });
  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  // CONTACT SECTION =======================
  app.get('/contact', function(req, res) {
    res.render('contact.ejs', {
      user: req.user
    });
  });

  // SEARCH SECTION ========================
  app.get('/search', function(req, res) {
    var test = "";
    res.render('search.ejs', {
      user: req.user,
      data: test
    });

  });

  app.post('/search-user', function(req, res) {
    if (req.body.searchInput == "")  {
    } else {
    connection.query('SELECT * from users where localName like ? order by localName', ["%" + req.body.searchInput + "%"], function(error, result) {
      if (error) throw error;
      console.log(result);


      res.render('search.ejs', {
        user: req.user,
        data: result
      });
    });
}
  });

  // EVENT SECTION ========================
  app.get('/events', function(req, res) {
    var test = "";
    res.render('events.ejs', {
      user: req.user,
    });

  });
  var i=0;
  app.get("/event/:arr_id", function(req, res) {
    userService.getEvents((results) => {
      res.render('event.ejs', {
        id: req.params.arr_id,
        events: results
      });

    });
  });

  // OPRETTE ARRANGEMENTER ==========================

  app.post('/add-event', function(req, res) {
    connection.query('INSERT INTO Arrangement (navn, fraDato, tilDato, startTid, sluttTid) values (?, ?, ?, ?, ?);', [req.body.eventName, req.body.fromDate, req.body.toDate, req.body.fromTime, req.body.toTime], function(error, result) {
      if (error) throw error;
    });
    connection.query('INSERT INTO Sted (postSted, adresse) values (?, ?);', [req.body.poststed, req.body.adresse], function(error, result) {
      if (error) throw error;
    });
    res.render('events.ejs', {
      user: req.user,
    });

  });


  // SEND-EMAIL ==============================
  app.post('/send-email', function(req, res) {
    let transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mhsmail7@gmail.com',
        pass: 'mhsmail1'
      }
    });
    let mailOptions = {
      from: req.body.from, // sender address
      to: 'mhsmail7@gmail.com', // list of receivers
      subject: req.body.subject, // Subject line
      html: req.body.body + '<br>' + '</br>' + 'Du har mottatt denne meldingen fra ' + req.body.from // plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      res.redirect('/profile');
    });
  });

  /* ===========================================================================
  IKKE ENDRE NOE UNDER HER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!============
  */
  // ===========================================================================
  // AUTHENTICATE (FIRST LOGIN) ================================================
  // ===========================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/firstlogin', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // first login
  app.get('/firstlogin', function(req,res){
  userService.firstLogin(req.user.id);
  res.render('login.ejs', {
    message: "Bruker opprettet, du kan nå logge inn"
  });
});
  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // ===========================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) ===========
  // ===========================================================================

  // locally --------------------------------
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // ===========================================================================
  // UNLINK ACCOUNTS ===========================================================
  // ===========================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', function(req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });



    // route middleware to ensure user is logged in



  });








};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
