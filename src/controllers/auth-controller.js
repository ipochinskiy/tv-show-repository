exports.makeAuthController = ({ userModel }) => {
	return {
		signup: (email, password) => userModel.createUser({ email, password }),
		// FIXME: req and res should not be there
		login: (req, res) => {
			// TODO: replace the user with something more secure
			res.cookie('user', JSON.stringify(req.user));
			respond.ok(res, req.user);
		},
		// FIXME: req and res should not be there
		logout: (req, res) => {
			req.logout();
			respond.ok(res);
		},
	};
};