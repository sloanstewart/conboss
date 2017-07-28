const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const {app, bodyParser, runServer, closeServer} = require('../server');

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

describe('GET "/schedule"', function(){
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

// describe('GET "*"', function(){
//   before(function() {
//     return runServer();
//   });
//
//   after(function() {
//     return closeServer();
//   });
//
//   it('should return http status 404', function() {
//     return chai.request(app)
//     .get('/test')
//     .then(function(res) {
//       res.should.have.status(404);
//     });
//   });
// });
