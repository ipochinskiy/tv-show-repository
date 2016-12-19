 /* eslint-disable arrow-body-style */
exports.makeAuthController = ({ auth, userModel }) => {
	return {
		signup: (email, password) => userModel.createUser({ email, password }),

		login: (email, password) => {
			userModel.findOne({ email, password })
				.then((user) => {
					const result = user ? auth.createToken(user) : null;
					return Promise.resolve(result);
				});
		},

		fb: (profile, signature, payload) => {
			if (signature !== auth.getFacebookSignature(payload)) {
				return Promise.reject({ invalidSignature: true });
			}

			return userModel.findOne({ facebook: profile.id })
				.then((existingUser) => {
					let newUser;
					if (!existingUser) {
						newUser = userModel.createOne({
							name: profile.name,
							facebook: {
								id: profile.id,
								email: profile.email,
							},
						});
					}
					const token = auth.createJwtToken(existingUser || newUser);
					return { ok: true, token };
				});
		},
	};
};
