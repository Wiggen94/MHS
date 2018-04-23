// server.js

// setup ======================================================================
// laster inn alle verktøy vi trenger
var express  = require('./node_modules/express/index.js');
var app      = express();
var helpers = require('express-helpers')(app);
var port     = process.env.PORT || 8137;
var mongoose = require('./node_modules/mongoose/lib/index.js');
var passport = require('./node_modules/passport/lib/index.js');
var flash    = require('./node_modules/connect-flash/lib/index.js');
var mysql    = require('mysql');
var morgan       = require('./node_modules/morgan/index.js');
var cookieParser = require('./node_modules/cookie-parser/index.js');
var bodyParser   = require('./node_modules/body-parser/index.js');
var session      = require('./node_modules/express-session/index.js');

const os = require('os');
// Finner ut hvilket OS bruker kjører og starter app utifra dette
if (os.platform() === "darwin") {
var exec = require('child_process').execFile;
var fun =function(){
   console.log("fun() start");
   exec('./APP-darwin-x64/APP.app/Contents/MacOS/APP', function(err, data) {
        console.log(err);
    });
};
} else if (os.platform() === "win32") {
  var exec = require('child_process').execFile;
  var fun =function(){
     exec('./APP-win32-x64/APP.exe', function(err, data) {
          console.log(err);
      });
  };
}
fun();

var configDB = require('./config/database.js');


// configuration ===============================================================
mongoose.connect(configDB.url); // kobler til MongoDB database

require('./config/passport')(passport); // henter passport konfigurasjon

// setter opp express
app.use(morgan('dev')); // logger alt til konsoll
app.use(cookieParser()); // leser cookies (for autentisering)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.set('view engine', 'ejs'); // setter opp ejs som view-engine

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch', saveUninitialized: true, resave: false })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // setter opp en  session
app.use(flash()); // bruk connect-flash for å vise flashmeldinger på siden
app.use(express.static(__dirname + '/views'));


// routes ======================================================================
require('./app/routes.js')(app, passport); // henter routes og fullt konfigurert passport for autentisering

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
