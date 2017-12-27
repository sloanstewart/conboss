
const express = require('express');
var app = express();

// USERS ROUTES

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
      res.redirect(301, "/dashboard");
    }
  });
  
  // Logout User
  app.get('/logout', (req, res) => {
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
  app.get("/dashboard",
    (req, res) => {
      if ( req.isAuthenticated()) {
        console.log('dashboard redirecting...');
        res.redirect( '/user/dashboard/' + req.user.id );
      }
    });
  // app.get("/dashboard", (req, res) => {
  //   if (req.isAuthenticated()) {
  //     var id = req.user.id;
  //     res
  //     .status(200)
  //     .redirect('/user/dashboard/'+id);
  //   }
  //   else {
  //     console.log('Must be logged in to view your dashboard.');
  //     res.redirect("/login");
  //   }
  // });
  
  app.get("/user/dashboard/:id", (req, res) => {
    console.log('auth is: ' + req.auth);
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
      // res.redirect("/login");
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
  