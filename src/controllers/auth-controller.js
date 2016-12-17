 /* eslint-disable arrow-body-style */
exports.makeAuthController = ({ auth, userModel }) => {
	return {
		signup: (email, password) => userModel.createUser({ email, password }),
		// FIXME: req and res should not be there
		login: (email, password) => {
			userModel.findOne({ email, password })
				.then((user) => {
					const result = user ? auth.createToken(user) : null;
					return Promise.resolve(result);
				});
		},
		// FIXME: req and res should not be there
		// FIXME: don't use response from here
		// logout: (req, res) => {
		// 	req.logout();
		// 	respond.ok(res);
		// },

		fb: (profile, signature, payload) => {
			if (signature !== auth.getFacebookSignature(payload)) {
				return Promise.reject({ invalidSignature: true });
			}

			return userModel.findOne({ facebook: profile.id })
				.then((existingUser) => {
					let newUser;
					if (!existingUser) {
						newUser = userModel.createOne({
							facebook: profile.id,
							firstName: profile.first_name,
							lastName: profile.last_name,
						});
					}
					const token = auth.createJwtToken(existingUser || newUser);
					return { ok: true, token };
				});
		},
	};
};
