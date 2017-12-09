const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {BasicStrategy} = require('passport-http');
const {
  Strategy: JwtStrategy,
  ExtractJwt
} = require('passport-jwt');

const {User} = require('../models/user');
const {JWT_SECRET} = require('./../config/config');

// const localStrategy = passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validatePassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       console.log('Login accepted.');
//       return done(null, user);
//     });
//   }
// ));

const basicStrategy = new BasicStrategy((username, password, done) => {
  let user;
  User
    .findOne({username: username})
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password',
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password',
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false, err);
      }
      return done(err, false);
    });
});

const jwtStrategy = new JwtStrategy({
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
  },
  (payload, done) => {
    console.log('jwt confirmed');
    return done(null, payload.user)
  }
);

module.exports = {basicStrategy, jwtStrategy};
