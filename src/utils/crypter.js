const bcrypt = require('bcryptjs');

const genSalt = () => new Promise((resolve, reject) =>
	bcrypt.genSalt(10, (err, salt) => (err ? reject(err) : resolve(salt))));

const hashIt = (thing, salt) => new Promise((resolve, reject) =>
	bcrypt.hash(thing, salt, (err, hash) => (err ? reject(err) : resolve(hash))));

exports.encrypt = thing => genSalt()
	.then(salt => hashIt(thing, salt));

exports.compare = (actual, expected) => new Promise((resolve, reject) =>
	bcrypt.compare(actual, expected, (err, isMatch) => {
		if (err) {
			return reject(err);
		}
		return resolve(isMatch);
	})
);
