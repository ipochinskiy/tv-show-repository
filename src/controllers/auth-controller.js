 /* eslint-disable arrow-body-style */
exports.makeAuthController = ({ auth, userModel }) => {
	function authSocial(authMethod, profile) {
		return userModel.findOne({ [`${authMethod}.id`]: profile.id })
			.then((existingUser) => {
				let newUser;
				if (!existingUser) {
					newUser = userModel.createOne({
						name: profile.name,
						[authMethod]: {
							id: profile.id,
							email: profile.email,
						},
					});
				}
				const token = auth.createJwtToken(existingUser || newUser);
				return { ok: true, token };
			});
	}

	return {
		signup: (name, email, password) => userModel.createUser({ name, email, password }),

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
			return authSocial('facebook', profile);
		},

		google: (profile) => authSocial('google', profile),
	};
};
