const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(
		candidatePassword,
		this.password,
		(err, isMatch) => (err ? cb(err) : cb(null, isMatch))
	);
}

const User = mongoose.model('User', userSchema);
module.exports = User;
