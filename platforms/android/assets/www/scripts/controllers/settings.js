'use strict';
snApp
  .controller('settingsController', function($scope, $rootScope, $location, $http) {
    if (!wcsLocalStorage.has('currentUser')) {
      $location.path('/');
      return;
    } else {
      $rootScope.user = wcsLocalStorage.get('currentUser');
    }

    $scope.onLogout = function() {
      wcsLocalStorage.destroy('currentUser');
      $rootScope.user = null;
      $rootScope.isLoggedIn = false;
      $rootScope.$evalAsync();
      $location.path('/');
      return;
    };
  });

  

