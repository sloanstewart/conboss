/*jshint esversion:6*/
// require('dotenv').config();
require('./config/config');

const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {Event} = require('./models/event');
const {User} = require('./models/user');

mongoose.Promise = global.Promise;

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));

// ejs templating
app.set('view engine', 'ejs');

// typical config
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Landing Page
app.get("/", (req, res) => {
  res
  .status(200)
  .render('index', { message: req.flash('info') });
});


// 404 for requests to everything that's not specified
app.use('*', function(req, res) {
  res.status(404)
  .render('404');
});

app.listen(port, () => {
  console.log(`Started on port ${port}`)
})

module.exports = {app};
