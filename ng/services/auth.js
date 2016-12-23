/* eslint-disable prefer-arrow-callback */

const makeAlert = ($alert) => (title, content) => $alert({
	title,
	content,
	type: 'material',
	animation: 'fadeZoomFadeDown',
	duration: 3,
});

const makeParser = ($window) => (token = '') => {
	const firstChunk = token.split('.')[1];
	const payloadString = $window.atob(firstChunk);
	const payload = JSON.parse(payloadString);
	return payload.user;
};

function initializeFbSdk($window) {
	$window.fbAsyncInit = () => FB.init({
		appId: '624059410963642',
		responseType: 'token',
		version: 'v2.0',
	});
}

function loadFbSdk(doc, script, id) {
	if (doc.getElementById(id)) {
		return;
	}

	const js = doc.createElement(script);
	js.id = id;
	js.src = '//connect.facebook.net/en_US/sdk.js';

	const fjs = doc.getElementsByTagName(script)[0];
	fjs.parentNode.insertBefore(js, fjs);
}

function loadGoogleSdk(document) {
	const po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = true;
	po.src = 'https://apis.google.com/js/client:plusone.js';

	const s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);
}

angular.module('MyApp').factory(
	'Auth',
	function ($http, $location, $rootScope, $alert, $window) {
		const alert = makeAlert($alert);
		const parseCurrentUser = makeParser($window);

		const authCallback = (network) => (receivedToken) => {
			$window.localStorage.token = receivedToken;
			$rootScope.currentUser = parseCurrentUser(receivedToken);
			$location.path('/');
			alert('Cheers!', `You have successfully signed-in with ${network}.`);
		};

		const googleKeys = {
			client_id: '55262601920-5jhf3qth89okujq6a7lh8bqc9epr8475.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
			immediate: false,
		};

		const token = $window.localStorage.token;
		if (token) {
			$rootScope.currentUser = parseCurrentUser(token);
		}

		initializeFbSdk($window);
		loadFbSdk(document, 'script', 'facebook-jssdk');
		loadGoogleSdk(document);

		return {
			facebookLogin() {
				FB.login(function (response) {
					FB.api('/me', function (profile) {
						const data = {
							profile,
							signedRequest: response.authResponse.signedRequest,
						};
						$http.post('/auth/facebook', data)
							.success(authCallback('Facebook'));
					});
				}, { scope: 'email, public_profile' });
			},
			googleLogin() {
				gapi.auth.authorize(googleKeys, (receivedToken) => {		// eslint-disable-line no-unused-vars, max-len
					gapi.client.load('plus', 'v1', () => {
						const request = gapi.client.plus.people.get({ userId: 'me' });
						request.execute((response) => {
							$http.post('/auth/google', { profile: response })
								.success(authCallback('Google'));
						});
					});
				});
			},
			login(user) {
				return $http.post('/auth/login', user)
					// .success((data, status, headers, config) => {
					.success((data) => {
						$window.localStorage.token = data.token;
						$rootScope.currentUser = parseCurrentUser(data.token);
						$location.path('/');

						alert('Cheers!', 'You have successfully logged in.');
					})
					.error(() => {
						delete $window.localStorage.token;			// TODO: consider setting to null
						alert('Error!', 'Invalid username or password.');
					});
			},
			signup(user) {
				return $http.post('/auth/signup', user)
					.success(() => {
						$location.path('/login');
						alert('Congratulations!', 'Your account has been created.');
					})
					.error((response) => alert('Error!', response.data));
			},
			logout() {
				delete $window.localStorage.token;			// TODO: consider setting to null
				$rootScope.currentUser = null;
				alert('', 'You have been logged out.');
			},
		};
	}
);
/* eslint-enable prefer-arrow-callback */
