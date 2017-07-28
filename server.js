/*jshint esversion:6*/

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const {DATABASE_URL,TEST_DATABASE_URL, PORT} = require('./config');
const {User, Event} = require('./models');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve static files from '/public'
app.use(express.static('public'));

// Serve index.html to root
app.get("/", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/index.html');
});

app.get("/register", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/register.html');
});

app.get("/schedule", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/schedule.html');
});

app.get("/users", (req, res) => {
  res
  .status(200)
  .sendFile(__dirname + '/views/users.html');
});

// 404 for requests to everything that's not specified
app.use('*', function(req, res) {
  res.status(404)
  .sendFile(__dirname + '/views/404.html');
});

let server;
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Listening on port ${port}`);
      resolve(server);
    })
    .on('error', err => {
      reject(err);
    });
  });
}

function closeServer(){
  return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
}
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, bodyParser, runServer, closeServer};
