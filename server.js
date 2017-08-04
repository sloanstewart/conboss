/*jshint esversion:6*/

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config');
const {User, Event} = require('./models');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve static files from '/public'
app.use(express.static('public'));

// Serve index.html to root
app.get("/", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/index.html');
});

app.get("/register", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/register.html');
});

app.get("/users", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/users.html');
});

app.get("/api/users", (req, res) => {
  Event
    .find()
    .limit(50 )
    .then( users => {
      res
      // .sendFile(__dirname + '/views/schedule.html')
      .status(200)
      .json({
        users: users
      });
    });
});

app.get("/events", (req, res) => {
      res
      .status(200)
      .sendFile(__dirname + '/views/events.html');
});

app.get("/events/new/", (req, res) => {
      res
      .status(200)
      .sendFile(__dirname + '/views/new-event.html');
});

app.get("/events/edit/:id", (req, res) => {
  Event
  .findById(req.params.id)
  .exec()
  .then( event => {
    res
    .status(200)
    .sendFile(__dirname + '/views/edit-event.html')
    .then( event => {
      $('#title').val(event.title);
    });
  });
});

// API ENDPOINTS
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
    res.status(400).json({
      error: "Request path ID and request body ID values must match"
    });
  }

  const updated = {};
  const updateableFields = ['title', 'details', 'start', 'end', 'users'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Event
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedEvent => {res.status(201).json(updatedEvent);})
    .catch(err => res.status(500).json({message: 'Problem with updating event'}));
});

app.delete('/api/events/:id', (req, res) => {
  Event
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      const message = `Deleted event ${req.params.id}`;
      console.log(message);
      res.status(200).json({message: message});
    });
});

// 404 for requests to everything that's not specified
app.use('*', function(req, res) {
  res.status(404)
  .sendFile(__dirname + '/views/404.html');
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
