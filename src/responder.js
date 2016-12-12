const STATUS = {
	ALREADY_EXISTS: '409',
	NOT_FOUND: '404',
	OK: '200',
	UNAUTHORIZED: '401',
	TOKEN_EXPIRED: '400',
	INTERNAL_ERROR: '500',
};

const respond = code => (res, body) => res.status(code).send(body || '');

module.exports = {
	STATUS,

	createHttpError: (key) => {
		const result = {};
		result[key] = true;
		return result;
	},

	alreadyExists: respond(STATUS.ALREADY_EXISTS),
	notFound: respond(STATUS.NOT_FOUND),
	ok: respond(STATUS.OK),
	unauthorized: respond(STATUS.UNAUTHORIZED),
	tokenExpired: respond(STATUS.TOKEN_EXPIRED, 'Access token has expired'),
	internalError: respond(STATUS.INTERNAL_ERROR, 'Internal error happened!'),
};
