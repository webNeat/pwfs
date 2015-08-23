app.controller('DashboardController', function($scope, $routeParams, $location, $http, ngDialog, Projects, Alerts, Classes){

	$scope.project = {};
	$scope.selectedClassName = Classes.selected;
	$scope.$watch(Classes.getSelected, function(){
		$scope.selectedClassName = Classes.selected;
	});

	$scope.selectClass = function(name){
		$location.search('className', name);
		Classes.select(name);
	};
	$scope.getClass = function(name){
		if(name.trim() !== '')
			return Classes.get(name, true);
	};

	Projects.load(function(){
		if(!$routeParams.project || !Projects.exists($routeParams.project))
			$location.path('/');
		$scope.project = Projects.get($routeParams.project);
		Classes.load(function(){

		});
	});
	if($location.search().className){
		Classes.select($location.search().className);
	}
});