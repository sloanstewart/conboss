const mongoose = require('mongoose');

const Event = mongoose.model('Event', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  details: {
    type: String,
    trim: true
  },
  start: {
    type: Date,
    // required: true
  },
  end: {
    type: Date,
    // required: true
  },
  users: [],
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  // _creator: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true
  // }
});

module.exports = {Event};
