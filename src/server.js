const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const session = require('express-session');
const compress = require('compression');

exports.initialize = ({ env = 'dev', publicPath, sessionSecret, auth }) => {
	const app = express();

	app.use(compress());

	app.use(logger(env));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());

	app.use(cookieParser());
	app.use(session({ secret: sessionSecret }));

	app.use(auth.initialize());
	app.use(auth.session());

	// TODO: replace with config property
	// 1 day
	app.use(express.static(publicPath, { maxAge: 86400000 }));

	return {
		useRoutes: routesConfig => {
			routesConfig.forEach(route => {
				if (route.auth) {
					app[route.method](route.endpoint, route.auth, route.action);
				}

				app[route.method](route.endpoint, route.action);
			});

			app.use((err, req, res) => {
				console.error(err.stack);
				res.status(500).send({ message: err.message });
			});
		},

		start: (port = 3000) => app.listen(port, () =>
			console.log(`Express server listening on port ${port}`)),
	};
};
