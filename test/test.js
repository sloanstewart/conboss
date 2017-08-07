const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const {app, bodyParser, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {User, Event} = require('../models');

chai.use(chaiHttp);
app.use(bodyParser.json());

describe('Html pages', function() {

  describe('GET "/"', function(){
    before(function() {
      return runServer();
    });

    after(function() {
      return closeServer();
    });

    it('should return http status 200', function() {
      return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
      });
    });
  });

  describe('GET "/user/create"', function(){
    before(function() {
      return runServer();
    });

    after(function() {
      return closeServer();
    });

    it('should return http status 200', function() {
      return chai.request(app)
      .get('/user/create')
      .then(function(res) {
        res.should.have.status(200);
      });
    });
  });

  describe('GET "/users"', function(){
    before(function() {
      return runServer();
    });

    after(function() {
      return closeServer();
    });

    it('should return http status 200', function() {
      return chai.request(app)
      .get('/users')
      .then(function(res) {
        res.should.have.status(200);
      });
    });
  });

  describe('GET "/events"', function(){
    before(function() {
      return runServer();
    });

    after(function() {
      return closeServer();
    });

    it('should return http status 200', function() {
      return chai.request(app)
      .get('/events')
      .then(function(res) {
        res.should.have.status(200);
      });
    });
  });

  describe('GET "/events/new"', function(){
    before(function() {
      return runServer();
    });

    after(function() {
      return closeServer();
    });

    it('should return http status 200', function() {
      return chai.request(app)
      .get('/events/new')
      .then(function(res) {
        res.should.have.status(200);
      });
    });
  });

});


// NEED USER TEST DATA
//
// describe('GET "/api/users"', function(){
//   it('should return all existing users', function() {
//     return chai.request(app)
//     .get('/api/users')
//     .then(function(_res) {
//       res = _res;
//       res.should.have.status(200);
//       res.should.be.json;
//       res.body.users.should.have.lengthOf.at.least(1);
//       return User.count()
//     })
//     .then(function(){
//       res.body.users.should.have.lengthOf(count);
//     });
//   });
// });

// EVENTS ==================================
function seedEventData() {
  console.info('seeding event data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateEventData());
  }
  // this will return a promise
  return Event.insertMany(seedData);
}

function generateTitle() {
  const titles = [
    'Dank Event', 'Suh Dude Meetup', 'Incredible Happening', 'LAN Party', 'Stuff N Thangs'];
    return titles[Math.floor(Math.random() * titles.length)];
  }
function generateDetails() {
    const details = ['Oh hai!', 'Loreum Ipsum', '...and so forth and so on...'];
    return details[Math.floor(Math.random() * details.length)];
  }
function generateEventData() {
    return {
      title: generateTitle(),
      details: generateDetails(),
      start: "2017-09-01T15:00:00.000Z",
      end: "2017-09-01T17:00:00.000Z"
    };
  }
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
  }

describe('Events API resource', function() {

  before(function() {
  return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedEventData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET "/api/events"', function(){
    it('should return all existing events', function() {
      return chai.request(app)
      .get('/api/events')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.should.be.json;
        res.body.events.should.have.lengthOf.at.least(1);
        return Event.count();
      })
      .then(function(count){
        res.body.events.should.have.lengthOf(count);
      });
    });
  });

  describe('POST "/api/events"', function(){
        it('should create a new event', function() {
      return chai.request(app)
      .post('/api/events')
      .send(generateEventData())
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;

        // this returns a single event, test that ONE event!
      })
    });
  });

  describe('PUT "/api/events/:id"', function() {
    it('should update an existing event', function() {
      const updateData = {
        title: 'blah blah blah',
        details: 'details etc etc etc',
        start: '0001-01-01T13:01:00.000Z',
        end: '0001-01-01T13:01:00.000Z'
      };

      return Event
        .findOne()
        .exec()
        .then(function(event) {
          updateData._id = event._id;

          return chai.request(app)
            .put(`/api/events/${event._id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(201);
          return Event.findById(updateData.id).exec();
          event.title.should.equal(updateData.title);
          event.details.should.equal(updateData.details);
          // event.start.should.equal(updateData.start);
          // event.end.should.equal(updateData.end);
        })
        .catch(err => console.log(err));
    });
  });
});
