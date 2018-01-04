const router = require('express').Router();
const { Event } = require('../models/event');

const { authenticate } = require('../middleware/authenticate');



router.get('/events', (req, res) => {
  res.status(200).render('event-all');
});

router.get('/event/new', (req, res) => {
  res.status(200).render('event-new');
});

router.get('/event/:id', (req, res) => {
  res.status(200).render('event-details');
});

router.get('/event/edit/:id', (req, res) => {
  res.status(200).render('event-edit');
});

// API: EVENTS =====================
router.post('/api/events', (req, res) => {
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

router.get('/api/events', (req, res) => {
  Event.find().then(
    (events) => {
      res.send({ events });
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

router.get('/api/events/:id', authenticate, (req, res) => {
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

router.delete('/api/events/:id', (req, res) => {
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

router.patch('/api/events/:id', (req, res) => {
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

module.exports = router;