const http = {
	STATUS: {
		ALREADY_EXISTS: 409,
		NOT_FOUND: 404,
		OK: 200,
		UNAUTHORIZED: 401,
	},
};

const respond = code => (res, body) => res.status(code).send(body || '');

const createHttpError = ({ key }) => ({
	[key]: true
});

module.exports = {
	alreadyExists: respond(http.STATUS.ALREADY_EXISTS),
	notFound: respond(http.STATUS.NOT_FOUND),
	ok: respond(http.STATUS.OK),
	unauthorized: respond(http.STATUS.UNAUTHORIZED),
}
