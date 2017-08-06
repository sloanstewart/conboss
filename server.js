/*jshint esversion:6*/

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config');
const {User, Event} = require('./models');

mongoose.Promise = global.Promise;

// use ejs templates
app.set('view engine', 'ejs');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve static files from '/public'
app.use(express.static('public'));

// ROUTES
app.get("/", (req, res) => {
  res
  .status(200)
  .render('index');
});

app.get("/register", (req, res) => {
  res
  .status(200)
  .render('register');
});

app.get("/users", (req, res) => {
  res
  .status(200)
  .render('users');
});


app.get("/events", (req, res) => {
      res
      .status(200)
      .render('events');
});

app.get("/events/new/", (req, res) => {
      res
      .status(200)
      .render('new-event');
});

app.get("/events/edit/:id", (req, res) => {
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
});

app.delete('/api/events/:id', (req, res) => {
  Event
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      const message = `Deleted event ${req.params.id}`;
      res.status(200).json({message: message});
    });
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
app.get("/api/users", (req, res) => {
  User
  .find()
  .limit(50 )
  .then( users => {
    res
    .status(200)
    .json({
      users
    });
  });
});

// PUT: edit/update user information
app.put('/api/user/:id', (req, res) => {
  if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    // console.log(req.params.id);
    // console.log(req.body._id);
    res.status(400).json({
      error: "Request path ID and request body _ID values must match"
    });
  }

  const updated = {};
  const updateableFields = ['username', 'email', 'password', 'firstName', 'lastName', 'location', 'bio'];
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
