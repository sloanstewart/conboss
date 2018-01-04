const router = require('express').Router();
const { User } = require('../models/user');

const { authenticate } = require('../middleware/authenticate');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

router.get('/users/signup', (req, res) => {
  res.status(200).render('user-new');
});

router.get('/users/login', (req, res) => {
  res.status(200).render('user-login');
});

router.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password)
    .then((user) =>
      user.generateAuthToken().then((token) => {
        res
          .header('x-auth', token)
          .status(200)
          // .send(user);
          .redirect(`/users/dashboard/${user.id}`)
      })
    )
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get('users/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).render('/login');
    },
    () => {
      res.status(400);
    }
  );
});

router.get('/users/dashboard/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).render('user-dashboard');
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

router.post('/users', (req, res) => {
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

router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

module.exports = router;