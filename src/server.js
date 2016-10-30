const path = require('path');

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

const baseDir = path.join(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

const showSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  airsDayOfWeek: String,
  airsTime: String,
  firstAired: Date,
  genre: [String],
  network: String,
  overview: String,
  rating: Number,
  ratingCount: Number,
  status: String,
  poster: String,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  episodes: [{
    season: Number,
    episodeNumber: Number,
    episodeName: String,
    firstAired: Date,
    overview: String,
  }],
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  return bcrypt.genSalt(10, (err1, salt) => {
    if (err1) {
      return next(err1);
    }

    return bcrypt.hash(this.password, salt, (err2, hash) => {
      if (err2) {
        return next(err2);
      }

      this.password = hash;
      return next();
    });
  });
});

userSchema.methods.comparePassword = (candidatePassword, cb) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    return cb(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);
const Show = mongoose.model('Show', showSchema);

mongoose.connect('localhost');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(publicDir));

app.listen(
  app.get('port'),
  () => console.log(`Express server listening on port ${app.get('port')}`)
);
