var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../app/models/user');
var userService = require('../app/services.js');

var configAuth = require('./auth');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // lar oss sjekke om brukeren er pålogget
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // hvis feil, returner
                if (err)
                    return done(err);
                // hvis ingen bruker er funnet, returner meldingen
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Bruker ikke funnet.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Feil passord.'));

            userService.getUser(user.id,(result) => {
                if (result[0].isGodkjent != 1)
                        return done(null, false, req.flash('loginMessage', 'Brukeren er ikke godkjent.'));
                // all is well, return user
                else
                    return done(null, user);
            });
        });
        });
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        nameField     : 'name',
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // lar oss sjekke om bruker er pålogget
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {

            User.findOne({'local.email': email}, function(err, existingUser) {

                // hvis det er noen feil returner feil
                if (err)
                    return done(err);
                // sjekker om det allerede eksisterer en bruker med denne eposten
                if (existingUser)
                    return done(null, false, req.flash('signupMessage', 'Denne eposten er allerede i bruk.'));

                //  Hvis vi er logget inn kobler vi til en ny lokal bruker
                if(req.user) {
                    var user            = req.user;
                    user.local.email    = email;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
                //  Vi er ikke logget inn så vi lager en helt ny bruker
                else {
                    // lager bruker
                    var newUser            = new User();

                    newUser.local.name     = req.body.name;
                    newUser.local.bday    = req.body.bday;
                    newUser.local.phone    = req.body.phone;
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : configAuth.facebookAuth.profileFields,
        passReqToCallback : true // lar oss sjekke om bruker er logget inn eller ikke


    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // sjekker om bruker er logget inn eller ikke
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'Bruker ikke funnet.'));
                    }
                    if (user) {

                        // Hvis brukeren finnes men ikke er tilkoblet facebook
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // bruker funnet, returnerer brukeren
                    } else {
                        return done(null, false, req.flash('loginMessage', 'Det er ingen bruker registrert med denne facebook-brukeren'));
                    }
                });

            } else {
                // // Hvis brukeren finnes men ikke er tilkoblet facebook
                var user            = req.user; //  tar user ut av session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // lar oss sjekke om bruker er logget inn eller ikke

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // sjekker om brukeren allerede er logget inn
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'Bruker ikke funnet.'));
                    }
                    if (user) {

                        // Hvis brukeren finnes men ikke er tilkoblet google
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = profile.emails[0].value; // tar den første e-posten

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        return done(null, false, req.flash('loginMessage', 'Det er ingen bruker registrert med denne google-brukeren'));
                    }
                });

            } else {
                // hvis brukeren allerede eksisterer og er logget inn må de kobles sammen
                var user               = req.user; // tar user ut av session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = profile.emails[0].value; // tar den første e-posten

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));

};
