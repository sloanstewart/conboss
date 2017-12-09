/*jshint esversion:6*/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport =require('passport');
const {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config/config');
const {Event} = require('./models/event');
const {User} = require('./models/user');
const {router: authRouter, basicStrategy, jwtStrategy} = require('./auth');
const flash = require('connect-flash');

mongoose.Promise = global.Promise;

const app = express();
app.use(express.static('public'));

// ejs templating
app.set('view engine', 'ejs');

// typical config
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser('cookiesecret'));

// express session
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({url: DATABASE_URL}),
  cookie: {maxAge: 60000}
  // cookie: { secure: true } //use with https
}));

// passport authentication
app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);
app.use('/api/auth/', authRouter);
app.use(passport.session());

// flash
app.use(flash());

// ROUTES ===================

//flash test route
app.get("/flash", (req, res) => {
  req.flash('info', 'ayyy lmao this is a flash message');
  res.redirect(301, '/');
});


// JWT protected test route
app.get("/jwt",
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    return res.json({message: 'jwt is good!'});
    // if (req.isAuthenticated == true) {
    //   var success = 'Authenticate success';
    //   req.flash('info', success);
    //   return res.json({
    //     message: success,
    //     user: req.user});
    // }
    // else {
    //   var failure = 'Authenticate failed';
    //   req.flash('info', failure );      
    //   return res.json({
    //     message: failure });
    // }
});

// Landing Page
app.get("/", (req, res) => {
  console.log('Authenticated: '+req.isAuthenticated());
  res
  .status(200)
  .render('index', { message: req.flash('info') });
});


// 404 for requests to everything that's not specified
app.use('*', function(req, res) {
  res.status(404)
  .render('404');
});

let server;
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
      if (err) {
        return reject(err);
      }
    });

    server = app.listen(port, () => {
      console.log(`Listening on port ${port}`);
      resolve();
    })
    .on('error', err => {
      mongoose.disconnect();
      reject(err);
    });
  });
}

function closeServer(){
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, bodyParser, runServer, closeServer};
