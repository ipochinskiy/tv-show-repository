angular.module('MyApp').factory(
	'Auth',
	function ($http, $location, $rootScope, $cookieStore, $alert) {
		$rootScope.currentUser = $cookieStore.get('user');
		$cookieStore.remove('user');

		return {
			login(user) {
				return $http.post('/api/login', user)
					.success((data) => {
						$rootScope.currentUser = data;
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
				return $http.post('/api/signup', user)
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
				return $http.get('/api/logout')
					.success(() => {
						$rootScope.currentUser = null;
						$cookieStore.remove('user');
						$alert({
							content: 'You have been logged out.',
							placement: 'top-right',
							type: 'info',
							duration: 3,
						});
					});
			},
		};
	}
);
