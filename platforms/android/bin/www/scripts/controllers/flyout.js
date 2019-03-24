'use strict';
snApp
	.controller('flyoutController', function($scope, $rootScope, $location, Api) {
	 	
    $scope.logout = function(){
      wcsLocalStorage.destroy('currentUser');
      $rootScope.user = null;
      $rootScope.isLoggedIn = false;
      $rootScope.$evalAsync();
	  //navigator.app.exitApp();
      $location.path('/');
    }

    $scope.open_patient_list = function(){
      $location.path('/allpatients');
    }

    $scope.open_active_patients = function(){
      $location.path('/activepatients');
    }

	 }
);
