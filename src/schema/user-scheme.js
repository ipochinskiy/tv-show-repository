const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: { type: String, trim: true, required: true },
	email: { type: String, trim: true, unique: true, lowercase: true },
	password: String,
	facebook: {
		id: String,
		email: String,
	},
});

const User = mongoose.model('User', userSchema);
module.exports = User;
