app.directive('instanceDisplayPattern', function($rootScope, $http, ngDialog){
	return {
		templateUrl: 'views/partials/instance-display-pattern.html',
		restrict: 'E',
		scope: {
			choices: '=',
			filters: '=',
			separators: '=',
			onApplied: '&'
		},
		link: function($scope, $element, $attr){}
	};
});