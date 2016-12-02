const STATUS = {
	ALREADY_EXISTS: '409',
	NOT_FOUND: '404',
	OK: '200',
	UNAUTHORIZED: '401',
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
};
