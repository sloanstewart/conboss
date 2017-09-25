/*jshint esversion:6*/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport =require('passport');
const {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config');
const {User, Event} = require('./models');
const {router: authRouter, localStrategy, basicStrategy, jwtStrategy} = require('./auth');
const flash = require('connect-flash');

mongoose.Promise = global.Promise;

const app = express();
app.set('view engine', 'ejs');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(flash());
app.use(cookieParser());
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({url: DATABASE_URL})
  // cookie: { secure: true } //use with https
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(basicStrategy);
passport.use(jwtStrategy);
app.use('/api/auth/', authRouter);
// ROUTES
//   protected test route
app.get("/secret",
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    return res.json({
      message: "You are authorized to see this!",
      user: req.user});
});

app.get("/", (req, res) => {
  // console.log('User: '+req.user.username);
  console.log('Authenticated: '+req.isAuthenticated());
  res
  .status(200)
  .render('index');
});

app.get("/user/create", (req, res) => {
  res
  .status(200)
  .render('create-user');
});

app.get("/users", (req, res) => {
  if (req.isAuthenticated()) {
    console.log('user authenticated; rendering...');
    res
      .status(200)
      .render('users');
  }
  else {
    console.log('user not authenticated; redirecting...');
    res.redirect("/");
  }
});


app.get("/events", (req, res) => {
      res
      .status(200)
      .render('events');
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


// USERS ROUTES
app.get("/user/edit/:id", (req, res) => {
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

// Logout User
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/api/auth/logout');
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
