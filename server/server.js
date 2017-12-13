// import { ObjectID } from '../../../Users/Dude/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/bson';

/*jshint esversion:6*/
require('./config/config');

const morgan = require('morgan');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Event} = require('./models/event');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

// mongoose.Promise = global.Promise;

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));

// ejs templating
app.set('view engine', 'ejs');

// typical config
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Landing Page
app.get("/", (req, res) => {
  res
  .status(200)
  .render('index');
});


// EVENTS
app.post('/events', (req, res) => {
  let event = new Event({
    title: req.body.title,
    details: req.body.description,
    // start: req.body.start,
    // end: req.body.end,
    // _creator: req.user._id
  });

  event.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  }); 
});

app.get('/events', (req, res) => {
  Event.find().then((events) => {
    res.send({events});
  }, (err) => {
    res.status(400).send(err);
  })
});

app.get('/events/:id', (req, res) => {
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Event.findOne({
    _id: id,
    // _creator: req.user._id
  }).then((event) => {
    if (!event) {
      return res.status(404).send();
    }

    res.send({event});
  }).catch((err) => {
    res.status(400).send();
  })
});

app.delete('/events/:id', (req, res) => {
  let id = req.params.id;
  
    if(!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Event.findByIdAndRemove(id).then((event) => {
      if(!event) {
        return res.status(404).send();
      }

      res.send({event});
    }).catch((err) => {
      res.status(400).send();
    })
});

app.patch('/events/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['title', 'details', 'start', 'end', 'users']);

  if (!ObjectID.isValid(id)) {
      return res.status(404).send();
  }

  Event.findByIdAndUpdate(id, {$set: body}, {new: true}).then((event) => {
      if (!event) {
          return res.status(404).send();
      }

      res.send({event});
  }).catch((e) => {
      res.status(400).send();
  })
});

// USERS =====================
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(()=>{
     return user.generateAuthToken();
  }).then((token) => {
      res.header('x-auth', token).send(user);
  }).catch((err)=>{
      res.status(400).send(err);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  
  User.findByCredentials(body.email, body.password).then((user) => {
     return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
     });
  }).catch((e) => {
      res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
      res.status(200).send();

  }, () => {
      res.status(400);
  });
});

// 404 for requests to everything that's not specified
app.use('*', function(req, res) {
  res.status(404)
  .render('404');
});

app.listen(port, () => {
  console.log(`Started on port ${port}`)
})

module.exports = {app};