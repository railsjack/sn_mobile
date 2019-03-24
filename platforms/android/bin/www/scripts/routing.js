'use strict';
snApp
	.config(function($routeProvider) {
	  $routeProvider
	    .when('/', {
	      templateUrl: 'pages/login.html',
	      controller: 'loginController'
	    })
	    .when('/register', {
	      templateUrl: 'pages/register.html',
	      controller: 'registerController'
	    })
	    .when('/flyout', {
	      templateUrl: 'pages/flyout.html',
	      controller: 'flyoutController'
	    })
	    .when('/activepatients', {
	      templateUrl: 'pages/activepatients.html',
	      controller: 'activePatientsController'
	    })
	    .when('/allpatients', {
	      templateUrl: 'pages/allpatients.html',
	      controller: 'allPatientsController'
	    });
	})
