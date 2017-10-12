const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();
const flash = require('connect-flash');
const {User} = require('../models/user');

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// /api/auth/login
router.post('/login',
  passport.authenticate('local',
    {
      successRedirect: '/events',
      failureRedirect: '/'
    })
);
// /api/auth/logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/refresh',
  // The user exchanges an existing valid JWT for a new one with a later
  // expiration
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const token = createAuthToken(req.user);
    res.json({token});
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = {router};
