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
		link: function($scope, $element, $attr){

			// $scope.choices = [' ', 'A', 'B', 'C'];
			// $scope.properties.forEach(function(p){
			// 	$scope.choices.push(p);
			// });

			while($scope.filters.length < 6){
				$scope.filters.push(' ');
			}
			if($scope.separators == undefined)
				$scope.separators = [];
			while($scope.separators.length < 5){
				$scope.separators.push(' ');
			}

			console.log('directive filters: ', $scope.filters);

			$scope.apply = function(){
				var data = {
					filters: $scope.filters,
					separators: $scope.separators
				};
				console.log('data: ', data);
				$scope.onApplied(data);
			}
		}
	};
});