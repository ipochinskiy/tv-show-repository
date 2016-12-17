const User = require('../schema/user-scheme');

// TODO: replace crypter with #validatePassword()
exports.initialize = ({ crypter }) => ({
	createUser: (params = {}) => {
		if (params.facebook) {
			return new User(params).save();
		}

		return crypter.encrypt(params.password)
			.then(hash => {
				const user = new User({
					email: params.email,
					password: hash,
				});
				return user.save();
			});
	},

	findOne: ({ id, email, facebook, password }) => {
		if (id) {
			return User.findById(id).exec();
		} else if (facebook) {
			return User.findOne({ facebook }).exec();
		} else if (!email || !password) {
			return Promise.resolve(null);
		}

		return User.findOne({ email })
			.then(user => {
				if (!user) {
					return Promise.resolve(null);
				}

				return crypter.compare(password, user.password)
					.then(isMatch => Promise.resolve(isMatch ? user : null));
			});
	},
});
