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


// handleRequest = (req, res) => {

// }

// Front end routes
app.get("/", (req, res) => {
  res
  .status(200)
  .render('index');
});

app.get("/signup", (req, res) => {
  res
  .status(200)
  .render('user-new');
});

app.get("/login", (req, res) => {
  res
  .status(200)
  .render('user-login');
});

app.get("/dashboard/:id", (req, res) => {
  let id = req.params.id;
  
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  
  User
  .findById(id)
  .populate('savedEvents')
  .exec()
  // .then( user => {
    //   // const data = {
      //   //   _id: user._id,
      //   //   username: user.username,
      //   //   email: user.email,
      //   //   password: user.password,
      //   //   firstName: user.name.firstName,
      //   //   lastName: user.name.lastName,
      //   //   location: user.location,
      //   //   bio: user.bio,
      //   //   role: user.role,
      //   //   created: user.created,
      //   //   savedEvents: user.savedEvents
      //   // };
      //   return user;
      // })
      .then( user => {
        res
        .status(200)
        .render('user-dashboard', user);
      });
    })
    
    app.get("/events", (req, res) => {
      res
      .status(200)
      .render('event-all');
    });

    app.get("/event/new", (req, res) => {
      res
      .status(200)
      .render('event-new');
    });

    app.get("/event/:id", (req, res) => {
      res
      .status(200)
      .render('event-details');
    });

    app.get("/event/edit/:id", (req, res) => {
      res
      .status(200)
      .render('event-edit');
    });
    




// API: EVENTS =====================
app.post('/api/events', (req, res) => {
  let event = new Event({
    title: req.body.title,
    details: req.body.description,
    start: req.body.start,
    end: req.body.end,
    _creator: req.user._id
  });

  event.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  }); 
});

app.get('/api/events', (req, res) => {
  Event.find().then((events) => {
    res.send({events});
  }, (err) => {
    res.status(400).send(err);
  })
});

app.get('/api/events/:id', authenticate, (req, res) => {
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

app.delete('/api/events/:id', (req, res) => {
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

app.patch('/api/events/:id', (req, res) => {
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

// API: USERS =====================
app.post('/api/users', (req, res) => {
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

app.get('/api/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/api/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  
  User.findByCredentials(body.email, body.password).then((user) => {
     return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
     });
  }).catch((e) => {
      res.status(400).send();
  });
});

app.delete('/api/users/me/token', authenticate, (req, res) => {
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