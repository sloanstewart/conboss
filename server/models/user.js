const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    name: {
      firstName: {type: String, default: "", required: false},
      lastName: {type: String, default: "", required: false}
    },
    location: {type: String, default: "", required: false},
    bio: {type: String, default: "", required: false},
    created: {type: Date, default: Date.now, required: true},
    role: {type: String, default: "user", required: true},
    // saved_events: {type: Array, default: []}
    saved_events: [
      {type: Schema.Types.ObjectId,
      ref: 'Event'}]
  });
  
  UserSchema.virtual('fullName').get(function() {
    return `
    ${this.name.firstName} ${this.name.lastName}`.trim();
  });
  
  // the nice public USER without password and a nice looking fullName!
  UserSchema.methods.apiRepr = function() {
    return {
      id: this._id,
      name: this.fullName,
      location: this.location,
      bio: this.bio,
      created: this.created,
      role: this.role,
      saved_events: this.saved_events
      // saved_events: [
      //   {type: Schema.Types.ObjectId,
      //   ref: 'Event'} ]
    };
  };
  
  UserSchema.methods.validatePassword = function(password) {
    return bcrypt
      .compare(password, this.password)
      .then(isValid => isValid);
  };
  
  UserSchema.statics.hashPassword = function(password) {
    return bcrypt
      .hash(password, 10)
      .then(hash => hash);
  };

  const User = mongoose.model('User', UserSchema);

  module.exports = {User};