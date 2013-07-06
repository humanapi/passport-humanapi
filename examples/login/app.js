var express = require('express')
  , passport = require('passport')
  , util = require('util')
  // , HumanApiStrategy = require('passport-humanapi').Strategy;
  , HumanApiStrategy = require('../../lib/passport-humanapi').Strategy;

var HUMANAPI_APP_ID = "--insert-humanapi-app-id-here--";
var HUMANAPI_APP_SECRET = "--insert-humanapi-app-secret-here--";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete HumanAPI profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the HumanApiStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and HumanAPI
//   profile), and invoke a callback with a user object.
passport.use(new HumanApiStrategy({
    clientID: HUMANAPI_APP_ID,
    clientSecret: HUMANAPI_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/humanapi/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's HumanAPI profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the HumanAPI account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'congrats daltonc' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/humanapi
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in HumanAPI authentication will involve
//   redirecting the user to humanapi.com.  After authorization, HumanAPI will
//   redirect the user back to this application at /auth/humanapi/callback
app.get('/auth/humanapi',
  passport.authenticate('humanapi'),
  function(req, res){
    // The request will be redirected to HumanAPI for authentication, so this
    // function will not be called.
  });

// GET /auth/humanapi/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/humanapi/callback',
  passport.authenticate('humanapi', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}