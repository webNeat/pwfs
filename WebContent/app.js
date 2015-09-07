'use strict';

// Le lien du web service
var apiURL = 'api/';

// Définition de l'application
var app = angular.module('protege', ['ngRoute', 'ngResource', 'ngDialog', 'dndLists']);

// Configuration de l'application
app.config(function($routeProvider) {
	// Définition des routes de l'app
	// chaque route est défini par un lien, un controlleur et une vue
	$routeProvider
	  .when('/', {
	    templateUrl: 'views/projects.html',
	    controller: 'ProjectsController'
	  })
	  .when('/dashboard/:project', {
	    templateUrl: 'views/dashboard.html',
	    controller: 'DashboardController',
	    reloadOnSearch: false
	  })
	  .otherwise({
	    redirectTo: '/'
	  });
});