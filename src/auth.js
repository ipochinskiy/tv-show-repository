const jwt = require('jwt-simple');

exports.initialize = (userModel, sessionSecret, getAuthTokenExpiryDate) => {
	return {
		createToken: (user) => {
			var payload = {
				user,
				iat: new Date().getTime(),
				exp: getAuthTokenExpiryDate(),
			};
			return jwt.encode(payload, sessionSecret);
		},

		getAuthToken: req => {
			if (!req.headers.authorization) {
				return null;
			}

			const chunks = req.headers.authorization.split[' '];
			return chunks.length > 0 ? chunks[1] : null;
		},

		validateToken: (token) => {
			try {
				const decoded = jwt.decode(token, sessionSecret);
				return decoded.exp > Date.now() ?
					{ tokenExpired: true } :
					{ ok: true };
			} catch (err) {
				return { parseError: true }
			}
		},
	};
};
