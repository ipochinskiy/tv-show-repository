exports.makeAuthController = ({ auth, userModel }) => {
	return {
		signup: (email, password) => userModel.createUser({ email, password }),
		// FIXME: req and res should not be there
		login: (email, encodedPassword) => {
			userModel.findOne()
				.then((user) => {
					const result = user ? auth.createToken(user) : null;
					return Promise.resolve(result);
				});
		},
		// FIXME: req and res should not be there
		// FIXME: don't use response from here
		logout: (req, res) => {
			req.logout();
			respond.ok(res);
		},
	};
};