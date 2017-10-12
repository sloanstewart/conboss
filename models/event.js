const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = mongoose.Schema({
  title: {type: String, required: true},
  details: String,
  start: Date,
  end: Date,
  users: [],
  created: {type: Date, default: Date.now}
});


const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};
