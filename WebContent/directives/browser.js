app.directive('browser', function(Alerts, Classes, Instances){
	return {
		templateUrl: 'views/partials/browser.html',
		restrict: 'E',
		scope: {
			names: '=',
			selectedClassName: '=',
			onClassClicked: '&',
			onInstanceClicked: '&'
		},
		link: function($scope, $element, $attr){
			$scope.loadingClasses = true;
			$scope.classes = Classes.allByName();
			$scope.$watch(Classes.all, function(){
				$scope.classes = Classes.allByName();
			});
			$scope.loadingInstances = true;
			$scope.instances = [];
			$scope.$watch(Instances.all, function(){
				$scope.instances = Instances.ofClass(Classes.getSelected());
			});
			$scope.$watch(Classes.getSelected, function(){
				$scope.instances = Instances.ofClass(Classes.getSelected());
				console.log($scope.instances);
			});
			$scope.currentInstanceName = '';

			$scope.classClicked = function(name){
				$scope.currentClassName = name;
				if($scope.onClassClicked)
					$scope.onClassClicked({className: name});
			};
			$scope.instanceClicked = function(name){
				$scope.currentInstanceName = name;
				if($scope.onInstanceClicked)
					$scope.onInstanceClicked({instanceName: name});
			};
			$scope.createInstance = function(){
				$scope.loadingInstances = true;
				Instances.create(function(){
					$scope.instances = Instances.ofClass(Classes.getSelected());
					Alerts.success('Instance created');
					$scope.loadingInstances = false;
				});
			};
			$scope.removeInstance = function(name){
				$scope.loadingInstances = true;
				Instances.remove(name, function(){
					$scope.instances = Instances.ofClass(Classes.getSelected());
					Alerts.success('Instance "'+name+'" removed');
					$scope.loadingInstances = false;
				});
			};

			Classes.load(function(){
				if(! $scope.names)
					$scope.names = Classes.superClassesNames();
				$scope.loadingClasses = false;
				Instances.load(function(){
					$scope.loadingInstances = false;
				});
			});
		}
	};
});