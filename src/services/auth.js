exports.initialize = (jwt, userModel, sessionSecret, validityPeriod) => {
	const getExpiryDate = () => new Date(Date.now() + validityPeriod * 1000);

	return {
		createToken: (user) => {
			var payload = {
				user,
				iat: new Date().getTime(),
				exp: getExpiryDate(),
			};
			return jwt.encode(payload, sessionSecret);
		},

		getAuthToken: (headers = {}) => {
			if (!headers.authorization) {
				return null;
			}

			const chunks = headers.authorization.split[' '];
			return chunks.length > 0 ? chunks[1] : null;
		},

		validateToken: (token) => {
			try {
				const decodedToken = jwt.decode(token, sessionSecret);
				return decodedToken.exp > Date.now() ?
					{ tokenExpired: true } :
					{ ok: true, decodedToken };
			} catch (err) {
				return { parseError: true }
			}
		},
	};
};
