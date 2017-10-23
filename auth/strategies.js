'use strict';

const passport = require('passport');
const Strategy = require('passport-local');
const {User} = require('../models/user');
const {JWT_SECRET} = require('../config');

passport.use(new Strategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.validatePassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          console.log('Login accepted.');
          return done(null, user);
        });
      }
));

module.exports = passport;