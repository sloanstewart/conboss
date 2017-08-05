const mongoose = require('mongoose');

// USERS
const userSchema = mongoose.Schema({
  email: {type: String, required: true},
  name: {
    firstName: String,
    lastName: String
  },
  location: String,
  bio: String,
  created: {type: Date, default: Date.now},
  role: String,
  saved_events: []
});

userSchema.virtual('fullName').get(function() {
  return `
  ${this.name.firstName} ${this.name.lastName}`.trim();
});

userSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.fullName,
    location: this.location,
    bio: this.bio,
    created: this.created,
    role: this.role,
    saved_events: this.saved_events
  };
};

// EVENTS
const eventSchema = mongoose.Schema({
  title: {type: String, required: true},
  details: String,
  start: Date,
  end: Date,
  users: [],
  created: {type: Date, default: Date.now}
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = {User, Event};
