const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const {app, bodyParser, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);
app.use(bodyParser.json());

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

describe('GET "/register"', function(){
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should return http status 200', function() {
    return chai.request(app)
    .get('/register')
    .then(function(res) {
      res.should.have.status(200);
    });
  });
});

// USERS
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

describe('GET "/api/users"', function(){
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should return all existing users', function() {
    return chai.request(app)
    .get('/api/users')
    .then(function(_res) {
      res = _res;
      res.should.have.status(200);
      res.should.be.json;
      res.body.users.should.have.lengthOf.at.least(1);
      return User.count();
    })
    .then(function(){
      res.body.users.should.have.lengthOf(count);
    });
  });
});


// EVENTS
function generateTitle() {
  const titles = [
    'Dank Post', 'Suh Dude', 'Top Ten List', 'Cool Title', 'Stuff N Thangs'];
  return titles[Math.floor(Math.random() * titles.length)];
}
function generateContent() {
  const contents = ['Oh hai!', 'Loreum Ipsum', '...and so forth and so on...'];
  return contents[Math.floor(Math.random() * contents.length)];
}

function generateEventData() {
  return {
    title: generateTitle(),
    details: generateContent(),
  };
}


describe('GET "/events"', function(){
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should return http status 200', function() {
    return chai.request(app)
    .get('/schedule')
    .then(function(res) {
      res.should.have.status(200);
    });
  });
});

describe('GET "/api/events"', function(){
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

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
    .then(function(){
      res.body.events.should.have.lengthOf(count);
    });
  });
});

describe('POST "/api/events"', function(){
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should create a new event', function() {
    return chai.request(app)
    .post('/api/events')
    .then(function(_res) {
      res = _res;
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.have.lengthOf.at.least(1);
      return Event.count();
    })
    .then(function(){
      res.body.events.should.have.lengthOf(count);
    });
  });
});
