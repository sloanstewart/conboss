const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('./../config/config');
const router = express.Router();
const flash = require('connect-flash');
const {User} = require('../models/user');

// bad changes??? 
// const createAuthToken = user => {
//   return jwt.sign(
//     {id: user.id},
//     config.JWT_SECRET,
//     { 
//       // subject: user.username,
//       expiresIn: config.JWT_EXPIRY,
//       algorithm: 'HS256'}
//   );
// };

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// /api/auth/login
router.post('/login',
  passport.authenticate(
    'basic', {session: false}),
  (req, res) => {
    const token = createAuthToken(req.user);
    res
    .status(200)
    .json({token})
  }
);

// /api/auth/logout
router.get('/logout', function(req, res){
  // console.log('User ' + req.user.username + ' logged out.')
  req.logout();
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
