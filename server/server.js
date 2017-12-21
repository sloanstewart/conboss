/* jshint esversion:6 */
require('./config/config');

// const morgan = require('morgan');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

mongoose.Promise = global.Promise; // avoids promise deprecation error???

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.set('view engine', 'ejs');
// app.use(morgan('common'));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({  extended: true }));

// Front end routes
app.get('/', (req, res) => {
  res.status(200).render('index');
});

app.get('/signup', (req, res) => {
  res.status(200).render('user-new');
});

app.get('/login', (req, res) => {
  res.status(200).render('user-login');
});

app.get('/dashboard/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ message: 'id no good!' });
  }

  return User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).send('user not found');
      }
      return res.status(200).render('user-dashboard', { user });
    })
    .catch((err) => res.status(400).send(err));
});

app.get('/events', (req, res) => {
  res.status(200).render('event-all');
});

app.get('/event/new', (req, res) => {
  res.status(200).render('event-new');
});

app.get('/event/:id', (req, res) => {
  res.status(200).render('event-details');
});

app.get('/event/edit/:id', (req, res) => {
  res.status(200).render('event-edit');
});

// API: EVENTS =====================
app.post('/api/events', (req, res) => {
  const { id } = req.user; // watch for error trying to find _id
  const event = new Event({
    title: req.body.title,
    details: req.body.description,
    start: req.body.start,
    end: req.body.end,
    _creator: id
  });

  event.save().then(
    (doc) => {
      res.send(doc);
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

app.get('/api/events', (req, res) => {
  Event.find().then(
    (events) => {
      res.send({ events });
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

app.get('/api/events/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  return Event.findOne({
    _id: id
    // _creator: req.user._id
  })
    .then((event) => {
      if (!event) {
        return res.status(404).send();
      }

      return res.send({ event });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('ID invalid');
  }

  return Event.findByIdAndRemove(id)
    .then((event) => {
      if (!event) {
        return res.status(404).send();
      }

      return res.send({ event });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.patch('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, ['title', 'details', 'start', 'end', 'users']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  return Event.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((event) => {
      if (!event) {
        return res.status(404).send();
      }

      return res.send({ event });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// API: USERS =====================
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user
    .save()
    .then(() => {
      user.generateAuthToken();
    })
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) =>
      user.generateAuthToken().then((token) => {
        res
          .header('x-auth', token)
          .status(200)
          .render('user-dashboard', user);
      })
    )
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400);
    }
  );
});

// 404 for requests to everything that's not specified
app.use('*', (req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  // console.log(`Started on port ${port}`);
});

module.exports = { app };
