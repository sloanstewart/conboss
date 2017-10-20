/*jshint esversion:6*/
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var passport =require('passport');
var {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config');
var {Event} = require('./models/event');
var {User} = require('./models/user');
var {router: authRouter, localStrategy, basicStrategy, jwtStrategy} = require('./auth');
var flash = require('connect-flash');

mongoose.Promise = global.Promise;

var app = express();
app.use(express.static('public'));

// ejs templating
app.set('view engine', 'ejs');

// typical config
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('cookiesecret'));

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
app.use(passport.session());
passport.use(basicStrategy);
passport.use(jwtStrategy);
app.use('/api/auth/', authRouter);

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
    if (req.isAuthenticated == true) {
      return res.json({
        message: "You have a mighty dank JWT and are authorized to see this!",
        user: req.user});
    }
    else {
      return res.json({
        message: "You are not JWT authorized." });
    }
});

// Landing Page
app.get("/", (req, res) => {
  console.log('Authenticated: '+req.isAuthenticated());
  res
  .status(200)
  .render('index', { message: req.flash('info') });
});


// EVENT ROUTES
app.get("/events", (req, res) => {
  if (req.isAuthenticated()) {
    res
    .status(200)
    .render('events');
  }
  else {
    console.log('Must be authenticated to view events');
    res.redirect('/');
  }
});

app.get("/events/new/", (req, res) => {
  if (req.isAuthenticated()) {
    res
    .status(200)
    .render('new-event');
  }
  else {
    console.log('Must be authenticated to create events');
    res.redirect('/');
  }
});

app.get("/events/edit/:id", (req, res) => {
  if (req.isAuthenticated()) {
    Event
    .findById(req.params.id)
    .exec()
    .then( event => {
      const data = {
        _id: event._id,
        title: event.title,
        start: event.start.toISOString().slice(0, -1),
        end: event.end.toISOString().slice(0, -1),
        details: event.details
      };
      return data;
    })
    .then( data => {
      res
      .status(200)
      .render('edit-event', data);
    });
  }
  else {
    console.log('Must be authenticated to edit events');
    res.redirect('/');
  }
});

app.get("/events/view/:id", (req, res) => {
  if (req.isAuthenticated()) {
    Event
    .findById(req.params.id)
    .exec()
    .then( event => {
      const data = {
        _id: event._id,
        title: event.title,
        start: event.start.toISOString().slice(0, -1),
        end: event.end.toISOString().slice(0, -1),
        details: event.details
      };
      return data;
    })
    .then( data => {
      res
      .status(200)
      .render('event-view', data);
    });
  }
  else {
    console.log('Must be authenticated to edit events');
    res.redirect('/');
  }
});


// EVENTS API
app.get("/api/event/:id", (req, res) => {
  Event
    .findById(req.params.id)
    .then( event => {
      res
      .status(200)
      .json({
        events: event
      });
    });
});

app.get("/api/events", (req, res) => {
  Event
    .find()
    .limit(50 )
    .then( events => {
      res
      // .sendFile(__dirname + '/views/schedule.html')
      .status(200)
      .json({
        events: events
      });
    });
});

app.post('/api/events', (req, res) => {
  const required = ['title', 'start', 'end'];
  for (let i=0; i<required.length; i++) {
    const field = required[i];
    if(!(field in req.body)) {
      const message = `Missing data for required field "${field}" in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Event
    .create({
      title: req.body.title,
      details: req.body.details,
      start: req.body.start,
      end: req.body.end
    })
    .then(event => res.status(201).json(event))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: "Did not post successfullly"});
    });
});

app.put('/api/events/:id', (req, res) => {
  if (req.isAuthenticated()) {
    if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
      console.log(req.params.id);
      console.log(req.body._id);
      res.status(400).json({
        error: "Request path ID and request body _ID values must match"
      });
    }

    const updated = {};
    const updateableFields = ['title', 'details', 'start', 'end', 'users'];
    updateableFields.forEach(field => {
      if (field in req.body) {
        if(field === 'start' || field === 'end'){
          updated[field] = new Date(req.body[field]);
        }
        else {
          updated[field] = req.body[field];
        }
      }
    });
    Event
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedEvent => {res.status(201).json(updatedEvent);})
    .catch(err => {
      console.error(err);
      res.status(500).json({message: err });
    });
  }
  else {
    console.log('Must be authenticated to update events');
    res.redirect('/');
  }
});

app.delete('/api/events/:id', (req, res) => {
  if (req.isAuthenticated()) {
    Event
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      const message = `Deleted event ${req.params.id}`;
      res.status(200).json({message: message});
    });
  }
  else {
    console.log('Must be authenticated to delete events');
    res.redirect('/');
  }
});

// save event to user
app.put('/api/events/save/:id', (req, res) => {
  // check user is authenticated and request matches
  if (req.isAuthenticated()) {
    // if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    //   console.log(req.params.id);
    //   console.log(req.body._id);
    //   res.status(400).json({
    //     error: "Request path ID and request body _ID values must match"
    //   });
    // }
    // if eventID does not exist: push eventID to saved_events array
    if ( req.user.saved_events.indexOf(req.params.id) == -1 ) {
      User
      .findByIdAndUpdate(
        req.user.id,
        {$push: {saved_events: req.params.id}},
        {new: true})
      .exec()
      .then(updatedUser => {res.status(201).json(updatedUser);})
      .catch(err => {
        console.error(err);
        res.status(500).json({message: err });
      });
    }
// TODO: fix saving events that are already saved
    // if eventID exists : throw error > 'event already exists'
    else {
      let err = 'Event ' + req.params.id + ' already saved to this user';
      console.log(err);
      res.status(400).json({message: err});      
    }
  }
  else {
    authMessage = 'Must be authenticated to save events';
    console.log(authMessage);
    window.alert(authMessage);
    res.status(401).json({message: authMessage});
    // res.redirect('/login');
  }
});

// remove event from saved
app.put('/api/events/remove/:id', (req, res) => {
  // check user is authenticated and request matches
  if (req.isAuthenticated()) {
    // if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    //   console.log(req.params.id);
    //   console.log(req.body._id);
    //   res.status(400).json({
    //     error: "Request path ID and request body _ID values must match"
    //   });
    // }
    // find User by ID
    User
    .findByIdAndUpdate(
      req.user.id,
      {$pull: {saved_events: req.params.id}},
      {new: true}
    )
    .exec()
    .then(updatedUser => {res.status(201).json(updatedUser);})
    .catch(err => {
      console.error(err);
      res.status(500).json({message: err });
    });
  }
  else {
    authMessage = 'Must be authenticated to remove events';
    console.log(authMessage);
    window.alert(authMessage);
    // res.redirect('/login');
  }
});


// USERS ROUTES

// Login User
app.get("/login", (req, res) => {
  // console.log('User: '+req.user.username);
  console.log('Authenticated: '+req.isAuthenticated());
  if (!req.isAuthenticated()) {
    res
    .status(200)
    .render('login');
  }
  else {
    console.log('Must be logged out to log in!');
    res.redirect("/dashboard");
  }
});

// Create User
app.get("/user/create", (req, res) => {
  if (!req.isAuthenticated()) {
    res
    .status(200)
    .render('create-user');
  }
  else {
    console.log('Must be logged out to create new user!');
    // res.redirect("/login");
  }
});

// Logout User
app.get('/logout', function(req, res){
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect('/api/auth/logout');
  }
  else {
    console.log('Must be logged in to log out!');
    res.redirect("/login");
  }
});

// User Dashboard
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    var id = req.user.id;
    res
    .status(200)
    .redirect('/user/dashboard/'+id);
  }
  else {
    console.log('Must be logged in to view your dashboard.');
    res.redirect("/login");
  }
});

app.get("/user/dashboard/:id", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.id == req.params.id) {
      console.log('User match, loading dashboard...');
      User
      .findById(req.params.id)
      .populate('saved_events')
      .exec()
      .then( user => {
        const data = {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.name.firstName,
          lastName: user.name.lastName,
          location: user.location,
          bio: user.bio,
          role: user.role,
          created: user.created,
          saved_events: user.saved_events
        };
        return data;
      })
      .then( data => {
        res
        .status(200)
        .render('dashboard', data);
      });
    }
    else {
      console.error('Cannot access other user\'s data.');
    }
  }
  else {
    console.log('Must be logged in to access dashboard');
    res.redirect("/login");
  }
});

// Get All Users
app.get("/users", (req, res) => {
  if (req.isAuthenticated()) {
    console.log('user authenticated; rendering...');
    res
      .status(200)
      .render('users');
  }
  else {
    console.log('user not authenticated; redirecting...');
    res.redirect("/login");
  }
});

// Edit User
app.get("/user/edit/:id", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.id == req.params.id) {
      console.log('User match, edit away my dude');
      User
      .findById(req.params.id)
      .exec()
      .then( user => {
        const data = {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.name.firstName,
          lastName: user.name.lastName,
          location: user.location,
          bio: user.bio,
          role: user.role,
          created: user.created
        };
        return data;
      })
      .then( data => {
        res
        .status(200)
        .render('edit-user', data);
      });
    }
    else {
      console.error('Cannot edit other user\'s data.');
    }
  }
  else {
    console.log('Must be logged in to edit user');
    res.redirect("/login");
  }
});




// USERS API

// read all USERS
app.get("/api/users", (req, res) => {
  User
  .find()
  .limit(50)
  .then( users => {
    res
    .status(200)
    .json({
      users
    });
  });
});

// create USER
app.post('/api/user', (req, res) => {

  // check if there is a request body
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  // ensure there is data in every field
  const required = ['username', 'email', 'password'];
  for (let i=0; i<required.length; i++) {
    const field = required[i];
    if(!(field in req.body)) {
      const message = `Missing data for "${field}" in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  let {username, email, password} = req.body;
  // trim out the junk! Need an error about space in required fields...
  username = username.trim();
  email = email.trim();
  password = password.trim();
  // check that email and password are strings
  if (typeof username !== 'string') {
    return res.status(422).json({message: 'username must be a string'});
  }
  if (typeof email !== 'string') {
    return res.status(422).json({message: 'email must be a string'});
  }
  if (typeof password !== 'string') {
    return res.status(422).json({message: 'password must be a string'});
  }

  // const sizedFields = {
  //   username: {
  //     min: 5,
  //     max: 50 // that's reasonable, right?
  //   },
  //   password: {
  //     min: 10,
  //     max: 72 // bcrypt max
  //   }
  // };
  // const tooSmallField = Object.keys(sizedFields).find(field =>
  //   'min' in sizedFields[field] &&
  //   req.body[field].trim().length < sizedFields[field].min
  // );
  // const tooLargeField = Object.keys(sizedFields).find (field =>
  //   'max' in sizedFields[field] &&
  //   req.body[field].trim().length < sizedFields[field].max
  // );
  //
  // if (tooSmallField || tooLargeField) {
  //   return res.status(422).json({
  //     code: 442,
  //     reason: 'ValidationError',
  //     message: tooSmallField ?
  //       'Must be at least ${sizedFields[tooSmallField].min} characters long' :
  //       'Must be at least ${sizedFields[tooLargeField].max} characters long',
  //       location: tooSmallField || tooLargeField
  //   });
  // }

  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'username already in use',
          location: 'username'
        });
      }
      // if user does not exist, hash password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User
        .create({
          username: username,
          email: email,
          password: hash,
          name: {
            lastName: req.body.lastName,
            firstName: req.body.firstName
          },
          location: req.body.location,
          bio: req.body.bio,
          role: req.body.role
        });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// update USER information
app.put('/api/user/:id', (req, res) => {
  if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    // console.log(req.params.id);
    // console.log(req.body._id);
    res.status(400).json({
      error: "Request path ID and request body _ID values must match"
    });
  }

  const updated = {};
  const updateableFields = ['username', 'email', 'password', 'name', 'location', 'bio'];
  updateableFields.forEach(field => {
    if (field in req.body) {
        updated[field] = req.body[field];
    }
  });
  User
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedUser => {res.status(201).json(updatedUser);})
    .catch(err => {
      res.status(500).json({message: err });
    });
});

// delete USER
app.delete('/api/user/:id', (req, res) => {
  User
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      const message = `Deleted user ${req.params.id}`;
      res.status(200).json({message: message});
    });
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
