angular.module('MyApp').factory(
	'Auth',
	function ($http, $location, $rootScope, $alert, $window) {
		const parseCurrentUser = (token = '') => {
			const firstChunk = token.split('.')[1];
			const payloadString = $window.atob(firstChunk);
			const payload = JSON.parse(payloadString);
			return payload.user;
		};

		const token = $window.localStorage.token;
		if (token) {
			$rootScope.currentUser = parseCurrentUser(token);
		}

		$window.fbAsyncInit = function () {
			FB.init({
				appId: '624059410963642',
				responseType: 'token',
				version: 'v2.0',
			});
		};

		(function (doc, script, id) {
			if (doc.getElementById(id)) {
				return;
			}

			const js = doc.createElement(script);
			js.id = id;
			js.src = `//connect.facebook.net/en_US/sdk.js`;

			const fjs = doc.getElementsByTagName(script)[0];
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));

		return {
			facebookLogin() {
				FB.login(function (response) {
					FB.api('/me', function (profile) {
						const data = {
							profile,
							signedRequest: response.authResponse.signedRequest,
						};
						$http.post('/auth/facebook', data).success(function (token) {
							const payload = JSON.parse($window.atob(token.split('.')[1]));
							$window.localStorage.token = token;
							$rootScope.currentUser = parseCurrentUser(token);
							$location.path('/');
							$alert({
								title: 'Cheers!',
								content: 'You have successfully signed-in with Facebook.',
								placement: 'top-right',
								type: 'success',
								duration: 3,
							});
						});
					});
				}, { scope: 'email, public_profile' });
			},
			login(user) {
				return $http.post('/auth/login', user)
					.success((data, status, headers, config) => {
						$window.localStorage.token = data.token;
						$rootScope.currentUser = parseCurrentUser(data.token);
						$location.path('/');

						$alert({
							title: 'Cheers!',
							content: 'You have successfully logged in.',
							placement: 'top-right',
							type: 'success',
							duration: 3,
						});
					})
					.error(() => {
						delete $window.localStorage.token;			// TODO: consider setting to null
						$alert({
							title: 'Error!',
							content: 'Invalid username or password.',
							placement: 'top-right',
							type: 'danger',
							duration: 3,
						});
					});
			},
			signup(user) {
				return $http.post('/auth/signup', user)
					.success(() => {
						$location.path('/login');

						$alert({
							title: 'Congratulations!',
							content: 'Your account has been created.',
							placement: 'top-right',
							type: 'success',
							duration: 3,
						});
					})
					.error((response) => {
						$alert({
							title: 'Error!',
							content: response.data,
							placement: 'top-right',
							type: 'danger',
							duration: 3,
						});
					});
			},
			logout() {
				delete $window.localStorage.token;			// TODO: consider setting to null
				$rootScope.currentUser = null;
				$alert({
					content: 'You have been logged out.',
					placement: 'top-right',
					type: 'info',
					duration: 3,
				});
			},
		};
	}
);
