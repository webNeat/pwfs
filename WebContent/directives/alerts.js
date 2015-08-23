app.directive('alerts', function(Alerts){
	return {
		templateUrl: 'views/partials/alerts.html',
		restrict: 'E',
		scope: {},
		link: function($scope){
			$scope.msgs = Alerts.all();
			$scope.$watch(Alerts.all, function(){
				$scope.msgs = Alerts.all();
			});
		}
	};
});