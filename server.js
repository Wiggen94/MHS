// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('./node_modules/express/index.js');
var app      = express();
var helpers = require('express-helpers')(app);
var port     = process.env.PORT || 8080;
var mongoose = require('./node_modules/mongoose/lib/index.js');
var passport = require('./node_modules/passport/lib/index.js');
var flash    = require('./node_modules/connect-flash/lib/index.js');
var mysql    = require('mysql');
var morgan       = require('./node_modules/morgan/index.js');
var cookieParser = require('./node_modules/cookie-parser/index.js');
var bodyParser   = require('./node_modules/body-parser/index.js');
var session      = require('./node_modules/express-session/index.js');
const os = require('os');

/*
if (os.platform() === "darwin") {
var exec = require('child_process').execFile;
var fun =function(){
   console.log("fun() start");
   exec('./APP-darwin-x64/APP.app/Contents/MacOS/APP', function(err, data) {
        console.log(err);
        console.log(data.toString());
    });
};
} else if (os.platform() === "win32") {
  var exec = require('child_process').execFile;
  var fun =function(){
     console.log("fun() start");
     exec('./APP-win32-x64/APP.exe', function(err, data) {
          console.log(err);
          console.log(data.toString());
      });
  };
}
fun(); */

var configDB = require('./config/database.js');


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch', saveUninitialized: true, resave: false })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/views'));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
