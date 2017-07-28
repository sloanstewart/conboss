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

  it('should return http status 200.', function() {
    return chai.request(app)
    .get('/')
    .then(function(res) {
      res.should.have.status(200);
    });    
  });
});
