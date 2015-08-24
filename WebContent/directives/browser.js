app.directive('browser', function(Alerts, Classes, Instances, ngDialog){
	return {
		templateUrl: 'views/partials/browser.html',
		restrict: 'E',
		scope: {
			names: '=',
			currentClassName: '=',
			onClassClicked: '&',
			onInstanceClicked: '&',
			showButtons: '@'
		},
		link: function($scope, $element, $attr){
			$scope.loadingClasses = true;
			$scope.classes = {};
			$scope.$watch(Classes.all, function(){
				$scope.classes = Classes.allByName();
			});
			$scope.loadingInstances = true;
			$scope.instances = [];
			$scope.$watch(Instances.all, function(){
				$scope.instances = Instances.ofClass($scope.currentClassName);
			});
			$scope.currentInstanceName = '';
			$scope.showingPatternForm = false;

			$scope.classClicked = function(name){
				$scope.currentClassName = name;
				if($scope.onClassClicked)
					$scope.onClassClicked({className: name});
				$scope.currentInstanceName = '';
				$scope.instances = Instances.ofClass($scope.currentClassName);
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
			$scope.removeInstances = function(){
				var selectedInstances = $scope.instances.filter(function(i){
					return i.selected;
				});
				console.log(selectedInstances);

				if(confirm('Are you sure about removing all the selected instances ?'))
					selectedInstances.forEach(function(i){
						console.log(i.name);
						$scope.removeInstance(i.name);
					});
			};
			$scope.showPatternForm = function(){
				console.log('showingPatternForm !');
				$scope.showingPatternForm = true;
			};
			$scope.patternApplied = function(){
				$scope.showingPatternForm = false;
				$scope.loadingInstances = true;
				Instances.load(function(){
					$scope.instances = Instances.ofClass(Classes.getSelected());
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