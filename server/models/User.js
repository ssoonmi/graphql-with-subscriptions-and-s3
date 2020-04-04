const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretOrKey = require("../config/keys").secretOrKey;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    min: 8,
    max: 32,
    required: true
  }
});

UserSchema.statics.login = async function (username, password) {
  const User = this;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    user.token = "Bearer " + jwt.sign({ _id: user._id }, secretOrKey);
    user.loggedIn = true;
    return user;
  }
  throw new Error('Invalid username and password');
};

UserSchema.statics.signup = async function (username, password) {
  const User = this;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword })
  if (await user.save()) {
    user.token = "Bearer " + jwt.sign({ _id: user._id }, secretOrKey);
    user.loggedIn = true;
    return user;
  }
  throw new Error('Could not sign up');
};

module.exports = mongoose.model('User', UserSchema);