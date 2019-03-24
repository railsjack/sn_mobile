'use strict';
snApp
  .controller('registerController', function($scope, $rootScope, $location, $http) {
    $scope.registerReport = '';
    $scope.onRegisterSubmit = function(isValid) {
      if (!isValid) {
        $scope.registerReport = 'Please fill the form correctly.';
        return;
      }
    }
    $scope.onReturnLogin = function() {
      $scope.loginReport = '';
    }
  });
