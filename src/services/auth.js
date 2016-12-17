 /* eslint-disable arrow-body-style */
exports.initialize = (jwt, crypto, userModel, { sessionSecret, fbSecret, validityPeriod }) => {
	return {
		createToken: (user) => {
			const payload = {
				user,
				iat: new Date().getTime(),
				exp: new Date(Date.now() + (validityPeriod * 1000)),
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
				return { parseError: true };
			}
		},

		// FIXME: think about decoupling hashing from composing a signature
		getFacebookSignature: (payload) => {
			const hash = crypto.createHmac('sha256', fbSecret).update(payload).digest('base64');
			return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		},
	};
};
