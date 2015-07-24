'use strict';

// Le lien du web service
var apiURL = 'http://localhost:8080/ProtegeWeb4SEAMLESS/api/';

// Définition de l'application
var app = angular.module('protege', ['ngRoute', 'ngResource', 'ngDialog']);

// Configuration de l'application
app.config(function($routeProvider) {
	// Définition des routes de l'app
	// chaque route est défini par un lien, un controlleur et une vue
	$routeProvider
	  .when('/', {
	    templateUrl: 'views/projects.html',
	    controller: 'ProjectsController'
	  })
	  .when('/dashboard', {
	    templateUrl: 'views/dashboard.html',
	    controller: 'DashboardController'
	  })
	  .otherwise({
	    redirectTo: '/'
	  });
});