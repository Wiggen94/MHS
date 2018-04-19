const mysql = require('mysql');
var connection = mysql.createPool({
  connectionLimit: 10,
  host: 'mysql.stud.iie.ntnu.no',
  user: 'g_oops_2',
  password: '4JqXIUT3',
  database: 'g_oops_2'
});

var Usermodel = require('../app/models/user');
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

  // HENTER /profile og sjekker om brukeren er logget inn via middleware funksjonen nederst i routers.js.
  app.get('/profile', isLoggedIn, function(req, res) {
    // Oppretter muligRolle array som lagrer rollene til innlogget bruker i et array for henting på andre sider.
    var muligRolle = req.session.muligRolle = [];
    // Kjører aktuelle spørringer
    userService.getPoints(req.user.id, (points) => {
      userService.getEvents((results) => {
        userService.getUser(req.user.id, (isAdmin) => {
          userService.getKompetanse(req.user.id, (kompetanse) => {
            // En liste over definerte roller i henhold til kompetanse
            let roller = [{
                key: "Sanitet",
                krav: ["Hjelpekorpsprøve"]
              },
              {
                key: "Ambulansemedhjelper",
                krav: ["Ambulansesertifisering", "Hjelpekorpsprøve"]
              },
              {
                key: "Ambulansesjåfør",
                krav: ["Hjelpekorpsprøve", "Ambulansesertifisering", "Førerkort 160 utrykningskjøring"]
              },
              {
                key: "3 mann ambulanse",
                krav: ["Hjelpekorpsprøve", "Videregående førstehjelpskurs"]
              },
              {
                key: "Båtfører",
                krav: ["Hjelpkorpsprøve", "Båtførerprøven", "Maritimt VHF-sertifikat", "Videregående sjøredningskurs"]
              },
              {
                key: "Båtmedhjelper",
                krav: ["Hjelpkorpsprøve", "Ambulansesertifisering", "Kvalifisert sjøredningskurs"]
              },
              {
                key: "Båtmannskap",
                krav: ["Hjelpekorpsprøve", "Kvalifisert sjøredningskurs"]
              },
              {
                key: "Vaktleder",
                krav: ["Hjelpekorpsprøve", "Vaktlederkurs"]
              },
              {
                key: "Scootermedhjelper",
                krav: ["Hjelpekorpsprøve", "Ambulansesertifisering", "Kvalifisert kurs søk og redning vinter"]
              },
              {
                key: "Scootersjåfør",
                krav: ["Hjelpekorpsprøve", "Kvalifisert kurs søk og redning vinter", "Kvalifisert snøscooterkurs", "Førerkort S snøscooter", "Førerkort BE tilhenger"]
              },
              {
                key: "3 mann scooter",
                krav: ["Hjelpekorpsprøve", "Videregående førstehjelpskurs", "Kvalifisert kurs søk og redning"]
              },
              {
                key: "ATV fører",
                krav: ["Hjelpekorpsprøve", "Kvalifisert kurs søk og redning sommer", "Kvalifisert ATV kurs", "Førerkort BE tilhenger"]
              },
              {
                key: "Distriktssensor",
                krav: ["Hjelpekorpsprøve", "Distriktsensorkurs"]
              },
              {
                key: "Under opplæring",
                krav: []
              },
              {
                key: "Markør",
                krav: []
              }
            ];
            // Definerer "variabler" til bruk i /views for å opprette siden for den aktuelle brukeren
            res.render('profile.ejs', {
              isAdmin: isAdmin,
              events: results,
              kompetanse: kompetanse,
              user: req.user,
              points: points,
              roller: roller,
              muligRolle: muligRolle
            });
          });
        });
      });
    });
  });

  // FUNKSJON FOR Å SLETTE ET ARRANGEMENT
  app.post('/remove-event', function(req, res) {
    connection.query('DELETE FROM Arrangement where arr_id=?', [req.body.removeEvent], function(error, result) {
      if (error) throw error;
      res.redirect('/profile');
    });
  });


  ///////////// ENDRE PROFIL SEKSJON

  // HENTER ENDRE-PROFIL SIDEN FOR AKTUELLE BRUKER
  app.get('/profile/editprofile', function(req, res) {
    userService.getUser(req.user.id, (isAdmin) => {
      res.render('editprofile.ejs', {
        user: req.user,
        isAdmin: isAdmin
      });
    });
  });
  // FUNKSJON SOM HENTER DATA TIL BRUK FOR Å OPPDATERE BRUKER I DATABASEN
  app.post('/edit-profile', function(req, res) {
    userService.addKompetanse(req.user.id, req.body.addCompetence, req.body.gyldigFra, req.body.gyldigTil, (kompetanse) => {
      if (req.body.changeName == "") {
        req.body.changeName = req.user.local.name;
      }
      if (req.body.changePhone == null) {
        req.body.changePhone = req.user.local.phone;
      }
      if (req.body.changeEmail == "") {
        req.body.changePhone = req.user.local.email;
      }
      Usermodel.findByIdAndUpdate(req.user.id, {
        local: {
          name: req.body.changeName,
          phone: req.body.changePhone,
          email: req.body.changeEmail,
          password: req.user.local.password
        }
      }, function(err, response) {
        res.redirect('/profile');
      });
    });
  });

  // ADMIN-PANEL ===========================
  app.get('/admin', function(req, res) {
    userService.getIkkeGodkjenteBrukere((result) => {
    userService.getDeltakelse((deltakelse) => {
      res.render('admin.ejs', {
        ikkeGodkjent: result,
        deltakelse: deltakelse
      });
    });
  });
  });
  // GODKJENNE BRUKERE
  app.post('/approve-user', function(req, res) {
    connection.query('UPDATE users_rettigheter SET isGodkjent=1 WHERE users_id=?', [req.body.approveUser], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/admin');

  });
  // GJØRE OM BRUKER TIL ADMIN
  app.post('/approve-admin', function(req, res) {
    connection.query('UPDATE users_rettigheter SET isAdmin=1 WHERE users_id=?', [req.body.approveAdmin], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/admin');
  });
  // GODKJENNE VAKT
  app.post('/approve-deltakelse', function(req, res) {
    connection.query('UPDATE deltakelse SET isGodkjent=1 WHERE users_id=?', [req.body.approveDeltakelse], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/admin');
  });
  // CONTACT SECTION =======================
  app.get('/contact', function(req, res) {
    userService.getUser(req.user.id, (isAdmin) => {
      res.render('contact.ejs', {
        user: req.user,
        isAdmin: isAdmin,
      });
    });
  });

  // SEARCH SECTION ========================
  app.get('/search', function(req, res) {
    userService.getUser(req.user.id, (isAdmin) => {
      test = "";

      res.render('search.ejs', {
        user: req.user,
        data: test,
        isAdmin: isAdmin
      });
    });
  });

  // FUNKSON SOM HENTER VALUE FRA SØKEFELT FOR Å SØKE ETTER BRUKER
  app.post('/search-user', function(req, res) {
    userService.getUser(req.user.id, (isAdmin) => {
      if (req.body.searchInput == "") {} else {
        connection.query('SELECT * from users where localName like ? order by localName', ["%" + req.body.searchInput + "%"], function(error, results) {
          if (error) throw error;


          res.render('search.ejs', {
            user: req.user,
            data: results,
            isAdmin: isAdmin
          });
        });
      }
    });
  });

  // EVENT SECTION ========================
  app.get('/events', function(req, res) {
    let eventMal = [{
        key: 0,
        navn: "Skihytte",
        krav: [{
          rolle: "Vaktleder",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 4
        }, {
          rolle: "Scootersjåfør",
          antall: 1
        }, {
          rolle: "Scootermedhjelper",
          antall: 1
        }, {
          rolle: "3 mann scooter",
          antall: 1
        }]
      },
      {
        key: 1,
        navn: "Fotballkamp",
        krav: [{
          rolle: "Vaktleder",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 8
        }, {
          rolle: "Ambulansesjåfør",
          antall: 4
        }, {
          rolle: "Ambulansemedhjelper",
          antall: 4
        }, {
          rolle: "3 mann ambulanse",
          antall: 4
        }]
      },
      {
        key: 2,
        navn: "Triatlon",
        krav: [{
          rolle: "Sanitet",
          antall: 2
        }, {
          rolle: "Båtfører",
          antall: 1
        }, {
          rolle: "Båtmedhjelper",
          antall: 1
        }, {
          rolle: "Båtmannskap",
          antall: 1
        }]
      },
      {
        key: 3,
        navn: "Hjelpekorpsprøve",
        krav: [{
          rolle: "Distriktsensor",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 14
        }, {
          rolle: "Markør",
          antall: 4
        }]
      }
    ];
    userService.getUser(req.user.id, (isAdmin) => {
      res.render('events.ejs', {
        user: req.user,
        eventMal: eventMal,
        isAdmin: isAdmin
      });
    });
  });
  app.get("/event/:arr_id", function(req, res) {
    let eventMal = [{
        key: 1,
        navn: "Skihytte",
        krav: [{
          rolle: "Vaktleder",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 4
        }, {
          rolle: "Scootersjåfør",
          antall: 1
        }, {
          rolle: "Scootermedhjelper",
          antall: 1
        }, {
          rolle: "3 mann scooter",
          antall: 1
        }]
      },
      {
        key: 2,
        navn: "Fotballkamp",
        krav: [{
          rolle: "Vaktleder",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 8
        }, {
          rolle: "Ambulansesjåfør",
          antall: 4
        }, {
          rolle: "Ambulansemedhjelper",
          antall: 4
        }, {
          rolle: "3 mann ambulanse",
          antall: 4
        }]
      },
      {
        key: 3,
        navn: "Triatlon",
        krav: [{
          rolle: "Sanitet",
          antall: 2
        }, {
          rolle: "Båtfører",
          antall: 1
        }, {
          rolle: "Båtmedhjelper",
          antall: 1
        }, {
          rolle: "Båtmannskap",
          antall: 1
        }]
      },
      {
        key: 4,
        navn: "Hjelpekorpsprøve",
        krav: [{
          rolle: "Distriktsensor",
          antall: 1
        }, {
          rolle: "Sanitet",
          antall: 14
        }, {
          rolle: "Markør",
          antall: 4
        }]
      }
    ];
    userService.getEvents((results) => {
      for (let event of results) {
        this.event = results;
      }
      userService.getUser(req.user.id, (isAdmin) => {
        res.render('event.ejs', {
          id: req.params.arr_id,
          events: results,
          isAdmin: isAdmin,
          eventMal: eventMal,
          muligRolle: req.session.muligRolle
        });
      });

    });
  });

  app.post('/add-vakt', function(req, res) {
    connection.query('INSERT INTO deltakelse (arr_id, users_id, rolleNavn, poengMottatt) values (?, ?, ?, 10);', [req.body.thisEvent, req.user.id, req.body.addVakt], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/profile');

  });

  // OPRETTE ARRANGEMENTER ==========================

  app.post('/add-event', function(req, res) {
    connection.query('INSERT INTO Arrangement (navn, fraDato, tilDato, startTid, sluttTid, postSted, adresse) values (?, ?, ?, ?, ?, ?, ?);', [req.body.eventName, req.body.fromDate, req.body.toDate, req.body.fromTime, req.body.toTime, req.body.poststed, req.body.adresse], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/profile');

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
     !!!!!!!!!!!!!!!!!IKKE ENDRE NOE UNDER HER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     ===========================================================================
  */
  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

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
  app.get('/firstlogin', function(req, res) {
    userService.firstLogin(req.user.id);
    res.render('login.ejs', {
      message: "Bruker opprettet, du kan nå logge inn etter at din bruker har blitt godkjent av administrator"
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
  });
};
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
