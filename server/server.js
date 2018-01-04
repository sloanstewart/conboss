/* jshint esversion:6 */
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const router = require('./routes');

const app = express();
const port = process.env.PORT;
mongoose.Promise = global.Promise; // avoids promise deprecation error???

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

app.listen(port, () => {
  // console.log(`Started on port ${port}`);
});

// module.exports = { app };
