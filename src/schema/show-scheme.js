const mongoose = require('mongoose');

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
	posterLink: String,
	posterData: String,
});

const Show = mongoose.model('Show', showSchema);
module.exports = Show;
