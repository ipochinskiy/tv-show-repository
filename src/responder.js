const STATUS = {
	OK: '200',
	BAD_REQUEST: '400',
	UNAUTHORIZED: '401',
	NOT_FOUND: '404',
	ALREADY_EXISTS: '409',
	INTERNAL_ERROR: '500',
};

const respond = code => (res, body) => res.status(code).send(body || '');

module.exports = {
	STATUS,

	// FIXME: find more elegant way
	createHttpError: (key) => {
		const result = {};
		result[key] = true;
		return result;
	},

	alreadyExists: respond(STATUS.ALREADY_EXISTS),
	notFound: respond(STATUS.NOT_FOUND),
	ok: respond(STATUS.OK),
	unauthorized: respond(STATUS.UNAUTHORIZED),
	badRequest: respond(STATUS.BAD_REQUEST),
	internalError: (res) => respond(STATUS.INTERNAL_ERROR)(res, 'Internal error happened!'),
};
