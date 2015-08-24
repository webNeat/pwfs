app.directive('instanceDisplayPattern', function(Classes, Alerts){
	return {
		templateUrl: 'views/partials/instance-display-pattern.html',
		restrict: 'E',
		scope: {
			onApplied: '&'
		},
		link: function($scope, $element, $attr){ 
			$scope.setts = {};
			$scope.choices = [];
			var init = function(){
				$scope.currentClass = Classes.get(Classes.getSelected(), true);
				if($scope.currentClass){
					$scope.setts = $scope.currentClass.setts;
					while($scope.setts.filters.length < 6)
						$scope.setts.filters.push('');
					while($scope.setts.separators.length < 5)
						$scope.setts.separators.push('');
					$scope.choices = $scope.currentClass.properties.map(function(p){
						return p.name.substring(p.name.indexOf('#') + 1);
					});
					$scope.choices.push('');
				} else {
					$scope.setts = {};
					$scope.choices = [];
				}
			};
			$scope.apply = function(){
				$scope.currentClass.saveSetts(function(){
					$scope.onApplied();
					Alerts.success('Class settings saved');
				},function(){
					Alerts.error('Error while saving class settings');
				});
			};

			init();
			$scope.$watch(Classes.getSelected, init);
			$scope.$watch(Classes.all, init);
		}
	};
});