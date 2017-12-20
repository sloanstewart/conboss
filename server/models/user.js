const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
  // username: {
  //   type: String,
  //   required: false,
  //   // unique: true
  // },
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  // name: {
  //   firstName: {
  //     type: String,
  //     default: "",
  //     trim: true,
  //     required: false
  //   },
  //   lastName: {
  //     type: String,
  //     default: "",
  //     trim: true,
  //     required: false
  //   }
  // },
  // location: {
  //   type: String,
  //   default: "",
  //   trim: true,
  //   required: false
  // },
  // bio: {
  //   type: String,
  //   default: "",
  //   required: false
  // },
  // created: {
  //   type: Date,
  //   default: Date.now,
  //   required: true
  // },
  // role: {
  //   type: String,
  //   default: "user",
  //   required: true
  // },
  savedEvents: [],
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

//   UserSchema.virtual('fullName').get(function() {
//     return `
//     ${this.name.firstName} ${this.name.lastName}`.trim();
//   });

UserSchema.methods.toJSON = () => {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email', 'username', 'role']);
};

UserSchema.methods.generateAuthToken = () => {
  const user = this;
  const access = 'auth';
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  user.tokens.push({ access, token });

  return user.save().then(() => token);
};

UserSchema.methods.removeToken = (token) => {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.findByToken = (token) => {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = (email, password) => {
  const User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', (next) => {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
