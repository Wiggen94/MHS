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
      res.render('index.ejs', {
        message: req.flash('loginMessage')
      });
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
            userService.getPastEvents((pastEvents) => {
            userService.getThisVakter(req.user.id,(thisVakter) => {
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
                krav: ["Hjelpekorpsprøve", "Maritimt VHF-sertifikat", "Båtførerprøven", "Videregående sjøredningskurs"]
              },
              {
                key: "Båtmedhjelper",
                krav: ["Hjelpekorpsprøve", "Ambulansesertifisering", "Kvalifisert sjøredningskurs"]
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
              muligRolle: muligRolle,
              pastEvents: pastEvents,
              thisVakter: thisVakter
            });
          });
        });
      });
    });
  });
    });
        });


  // FUNKSJON FOR Å SLETTE EN KOMPETANSE
  app.post('/remove-kompetanse', function(req, res) {
    connection.query('DELETE FROM users_kompetanse WHERE users_id=? AND kompetanse_navn=?', [req.user.id, req.body.thisKompetanse], function(error, result) {
      if (error) throw error;
      res.redirect('/profile');
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
  app.post('/edit-profile', function(req, res, user) {

      if (req.body.changeName === "") {
        req.body.changeName = req.body.thisName;
      }
      if (req.body.changePhone == "") {
        req.body.changePhone = req.body.thisPhone;
      }
      if (req.body.changeEmail === "") {
        req.body.changeEmail = req.body.thisEmail;
      }
      userService.addKompetanse(req.body.thisUser, req.body.addCompetence, req.body.gyldigFra, req.body.gyldigTil, (kompetanse) => {
      Usermodel.findByIdAndUpdate(req.body.thisUser, {
        local: {
          name: req.body.changeName,
          email: req.body.changeEmail,
          phone: req.body.changePhone,
          bday: req.body.thisBday,
          password: req.body.thisPassword
        }
      }, function(err, response) {
        res.redirect('/profile');
      });
    });
  });

  //DEAKTIVER BRUKER
  app.post('/deactivate-user', function(req, res) {
    connection.query('UPDATE users_rettigheter SET isGodkjent=0 WHERE users_id=?', [req.body.thisUser], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/login');
    });

    //ENDRE EN ANNENS PROFIL
    app.post('/change-profile', function(req, res) {
      userService.getUser(req.user.id, (isAdmin) => {
        if (isAdmin[0].isAdmin != 0) {
        Usermodel.findOne({_id: req.body.thisUser}, function (err, user) {
        res.render('editprofile.ejs', {
          user: user,
          isAdmin: isAdmin,
          });
        });
      } else {
        res.redirect('/profile');
      }
    });
    });

  // ADMIN-PANEL ===========================
  app.get('/admin', function(req, res) {
    userService.getUser(req.user.id, (isAdmin) => {
      if (isAdmin[0].isAdmin === 0) {
        res.redirect('/profile');
      }
    });
    userService.getIkkeGodkjenteBrukere((result) => {
      userService.getIkkeGodkjentKompetanse((kompetanse) => {
    userService.getDeltakelse((deltakelse) => {
      res.render('admin.ejs', {
        ikkeGodkjent: result,
        deltakelse: deltakelse,
        ikkeGodkjentKompetanse: kompetanse
      });
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

  // GODKJENNE KOMPETANSE
  app.post('/approve-kompetanse', function(req, res) {
    connection.query('UPDATE users_kompetanse SET isGodkjent=1 WHERE users_id=? AND kompetanse_navn=?', [req.body.thisUser, req.body.thisKompetanse], function(error, result) {
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
    connection.query('UPDATE deltakelse SET isGodkjent=1 WHERE users_id=? AND arr_id=?', [req.body.thisUser, req.body.thisArr], function(error, result) {
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
      // SJEKKER OM BRUKER ER ADMIN
  if (isAdmin[0].isAdmin === 0) {
       res.redirect('/profile');
      }
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
    userService.getEvent(req.params.arr_id,(thisEvent) => {
      userService.countDeltakelse(req.params.arr_id, (deltakelse) => {
      userService.getThisDeltakelse(req.params.arr_id, (thisDeltakelse) => {
      userService.getUser(req.user.id, (isAdmin) => {
        res.render('event.ejs', {
          id: req.params.arr_id,
          event: thisEvent[0],
          isAdmin: isAdmin,
          eventMal: eventMal,
          muligRolle: req.session.muligRolle,
          deltakelse: deltakelse,
          thisDeltakelse: thisDeltakelse,
          user: req.user
        });
      });
    });
    });
    });
  });

  // FUNKSJON SOM  FOR Å LEGGE TIL EN VAKT I DATABASEN
  app.post('/add-vakt', function(req, res) {
    connection.query('INSERT INTO deltakelse (arr_id, users_id, rolleNavn, poengMottatt) values (?, ?, ?, 10);', [req.body.thisEvent, req.user.id, req.body.addVakt], function(error, result) {
      if (error) throw error;
    });
    connection.query('UPDATE users_poeng SET poeng=poeng+10 WHERE users_id=?;', [req.user.id], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/profile');
  });
  // FUNKSJON SOM  FOR Å TA BORT EN VAKT I DATABASEN
  app.post('/remove-deltakelse', function(req, res) {
    connection.query('DELETE FROM deltakelse WHERE users_id=? AND arr_id=?', [req.body.thisUser, req.body.thisArr], function(error, result) {
      if (error) throw error;
    });
    connection.query('UPDATE users_poeng SET poeng=poeng-10 WHERE users_id=?;', [req.body.thisUser], function(error, result) {
      if (error) throw error;
    });
    res.redirect('/profile');
  });


  // OPRETTE ARRANGEMENTER ==========================
  // FUNKSJON SOM  FOR Å LEGGE TIL ET ARRANGEMENT I DATABASEN
  app.post('/add-event', function(req, res) {
    connection.query('INSERT INTO Arrangement (navn, fraDato, tilDato, startTid, sluttTid, postSted, adresse, kontaktPerson, beskrivelse, eventKrav) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [req.body.eventName, req.body.fromDate, req.body.toDate, req.body.fromTime, req.body.toTime, req.body.poststed, req.body.adresse, req.body.kontaktPerson, req.body.beskrivelse, req.body.vaktmal], function(error, result) {
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
  userService.getUser(req.user.id, (isGodkjent) => {
  if (req.isAuthenticated() && isGodkjent[0].isGodkjent == 1) {
    return next();
}
  res.redirect('/');
  });
}
