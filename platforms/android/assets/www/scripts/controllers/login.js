'use strict';
snApp
	.controller('loginController', function($scope, $rootScope, $location, Api) {
	  $('.connecting').hide();
	  
	  $scope.loginReport = '';
	  //$scope.loginUsername = 'tollang';
	  //$scope.loginUsername = 'nahrae';
	  //$scope.loginPassword = 'fofjrj123';
	  //$scope.loginUsername = 'wipying';
	  //$scope.loginPassword = 'fofjrj123';

	  if(wcsLocalStorage.has('currentUser')){
	  	$rootScope.user = wcsLocalStorage.get('currentUser');
	  	$location.path("/allpatients");
	  }
	  
	  $scope.onLoginSubmit = function(isValid) {
	    if (!isValid) {
	      $scope.loginReport = 'Please fill the form correctly.';
	      return;
	    }

	    var data = {username: $scope.loginUsername, password: $scope.loginPassword};

	    $scope.loginReport = 'Authenticating ...';

	    var promise = Api.post(apiURL+"/employee/signin", {username: data.username, password: data.password});
	    promise.then(function(data){
	    	if(data.result){
			    $scope.loginReport = 'You are successfully logged in. Redirecting...';

			    $rootScope.user = data.employee;
			    $rootScope.user.company = data.company;
			    $rootScope.user.active_lovedones = data.active_lovedones;

			    $rootScope.isLoggedIn = true;
          wcsLocalStorage.set('isLoggedIn', true);
			    $rootScope.$evalAsync();

			    wcsLocalStorage.set('currentUser', $rootScope.user);

			    $location.path('/allpatients');
	    	}else{
	    		if (typeof data.result === 'undefined')
	    			$scope.loginReport = 'There was a problem connecting to the server.  Please contact the administrator or vendor.';
	    		else
	    			$scope.loginReport = 'Your user name or password is wrong. Please try again.';
	    	}
	    });
	  };


	  $scope.onReturnRegister = function() {
	    $scope.registerReport = '';
	  };

	}

);
