const express = require('express');
var app = express();

// EVENT ROUTES
app.get("/events", (req, res) => {
    if (req.isAuthenticated()) {
      res
      .status(200)
      .render('events');
    }
    else {
      console.log('Must be authenticated to view events');
      res.redirect('/');
    }
  });
  
  app.get("/events/new/", (req, res) => {
    if (req.isAuthenticated()) {
      var success = 'You must be authenticated to create events';
      req.flash('info', success );
      res
      .status(200)
      .render('new-event');
    }
    else {
      var failure = 'You must be authenticated to create events';
      req.flash('info', failure );
      console.log('Must be authenticated to create events');
      res.redirect(301, '/');
    }
  });
  
  app.get("/events/edit/:id", (req, res) => {
    if (req.isAuthenticated()) {
      Event
      .findById(req.params.id)
      .exec()
      .then( event => {
        const data = {
          _id: event._id,
          title: event.title,
          start: event.start.toISOString().slice(0, -1),
          end: event.end.toISOString().slice(0, -1),
          details: event.details
        };
        return data;
      })
      .then( data => {
        res
        .status(200)
        .render('edit-event', data);
      });
    }
    else {
      console.log('Must be authenticated to edit events');
      res.redirect(301, '/');
    }
  });
  
  app.get("/events/view/:id", (req, res) => {
    if (req.isAuthenticated()) {
      Event
      .findById(req.params.id)
      .exec()
      .then( event => {
        const data = {
          _id: event._id,
          title: event.title,
          start: event.start.toISOString().slice(0, -1),
          end: event.end.toISOString().slice(0, -1),
          details: event.details
        };
        return data;
      })
      .then( data => {
        res
        .status(200)
        .render('event-view', data);
      });
    }
    else {
      console.log('Must be authenticated to edit events');
      res.redirect(301, '/');
    }
  });
  
  
  // EVENTS API
  app.get("/api/event/:id", (req, res) => {
    Event
      .findById(req.params.id)
      .then( event => {
        res
        .status(200)
        .json({
          events: event
        });
      });
  });
  
  app.get("/api/events", (req, res) => {
    Event
      .find()
      .limit(50 )
      .then( events => {
        res
        // .sendFile(__dirname + '/views/schedule.html')
        .status(200)
        .json({
          events: events
        });
      });
  });
  
  app.post('/api/events', (req, res) => {
    const required = ['title', 'start', 'end'];
    for (let i=0; i<required.length; i++) {
      const field = required[i];
      if(!(field in req.body)) {
        const message = `Missing data for required field "${field}" in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
  
    Event
      .create({
        title: req.body.title,
        details: req.body.details,
        start: req.body.start,
        end: req.body.end
      })
      .then(event => res.status(201).json(event))
      .catch(err => {
        console.error(err);
        res.status(500).json({error: "Did not post successfullly"});
      });
  });
  
  app.put('/api/events/:id', (req, res) => {
    if (req.isAuthenticated()) {
      if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
        console.log(req.params.id);
        console.log(req.body._id);
        res.status(400).json({
          error: "Request path ID and request body _ID values must match"
        });
      }
  
      const updated = {};
      const updateableFields = ['title', 'details', 'start', 'end', 'users'];
      updateableFields.forEach(field => {
        if (field in req.body) {
          if(field === 'start' || field === 'end'){
            updated[field] = new Date(req.body[field]);
          }
          else {
            updated[field] = req.body[field];
          }
        }
      });
      Event
      .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
      .exec()
      .then(updatedEvent => {res.status(201).json(updatedEvent);})
      .catch(err => {
        console.error(err);
        res.status(500).json({message: err });
      });
    }
    else {
      console.log('Must be authenticated to update events');
      res.redirect('/');
    }
  });
  // delete event
  app.delete('/api/events/:id', (req, res) => {
    if (req.isAuthenticated()) {
      Event
      .findByIdAndRemove(req.params.id)
      .exec()
      .then(() => {
        const message = `Deleted event ${req.params.id}`;
        res.status(200).json({message: message});
      });
    }
    else {
      console.log('Must be authenticated to delete events');
      res.redirect('/');
    }
  });
  
  // save event to user
  app.put('/api/events/save/:id', (req, res) => {
    // check user is authenticated and request matches
    if (req.isAuthenticated()) {
      // if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
      //   console.log(req.params.id);
      //   console.log(req.body._id);
      //   res.status(400).json({
      //     error: "Request path ID and request body _ID values must match"
      //   });
      // }
      // if eventID does not exist: push eventID to saved_events array
      if ( req.user.saved_events.indexOf(req.params.id) == -1 ) {
        User
        .findByIdAndUpdate(
          req.user.id,
          {$push: {saved_events: req.params.id}},
          {new: true})
        .exec()
        .then(updatedUser => {res.status(201).json(updatedUser);})
        .catch(err => {
          console.error(err);
          res.status(500).json({message: err });
        });
      }
  // TODO: fix saving events that are already saved
      // if eventID exists : throw error > 'event already exists'
      else {
        let err = 'Event ' + req.params.id + ' already saved to this user';
        console.log(err);
        res.status(400).json({message: err});      
      }
    }
    else {
      authMessage = 'Must be authenticated to save events';
      console.log(authMessage);
      window.alert(authMessage);
      res.status(401).json({message: authMessage});
      // res.redirect('/login');
    }
  });
  
  // remove event from saved
  app.put('/api/events/remove/:id', (req, res) => {
    // check user is authenticated and request matches
    if (req.isAuthenticated()) {
      // if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
      //   console.log(req.params.id);
      //   console.log(req.body._id);
      //   res.status(400).json({
      //     error: "Request path ID and request body _ID values must match"
      //   });
      // }
      // find User by ID
      User
      .findByIdAndUpdate(
        req.user.id,
        {$pull: {saved_events: req.params.id}},
        {new: true}
      )
      .exec()
      .then(updatedUser => {res.status(201).json(updatedUser);})
      .catch(err => {
        console.error(err);
        res.status(500).json({message: err });
      });
    }
    else {
      authMessage = 'Must be authenticated to remove events';
      console.log(authMessage);
      window.alert(authMessage);
      // res.redirect('/login');
    }
  });
  