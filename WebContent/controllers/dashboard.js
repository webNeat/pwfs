app.controller('DashboardController', function($scope, $routeParams, $location, $http, ngDialog, Projects, Alerts, Classes, Instances){

	$scope.project = {};
	$scope.selectedClassName = Classes.selected;
	$scope.$watch(Classes.getSelected, function(){
		$scope.selectedClassName = Classes.selected;
	});
	$scope.instance = Instances.get(Instances.getSelected(), true);
	$scope.$watch(Instances.getSelected, function(){
		$scope.instance = Instances.get(Instances.getSelected(), true);
	});
	$scope.$watch(Instances.all, function(){
		$scope.instance = Instances.get(Instances.getSelected(), true);
	});
	$scope.selectedProperty = null;

	$scope.selectClass = function(name){
		if(Classes.getSelected() != name){
			$location.search('className', name);
			Classes.select(name);
			$scope.instance = null;
		}
	};
	$scope.selectInstance = function(name){
		$location.search('instance', name);
		Instances.select(name);
		$scope.instance = Instances.get(Instances.getSelected());
		console.log($scope.instance.values);
	};
	$scope.getClass = function(name){
		if(name.trim() !== '')
			return Classes.get(name, true);
	};
	$scope.getInstance = function(name){
		if(name.trim() !== '')
			return Instances.get(name, true);
	};
	$scope.shorten = function(word){
		return word.substring(word.indexOf('#') + 1);
	};
	$scope.addValueToObjectProperty = function(property){
		console.log('add Object Property');
		$scope.selectedProperty = property;
		$scope.names = property.classes;
		$scope.ccname = '';
		$scope.dialog = ngDialog.open({
			template: 'views/partials/select-instance.html',
			scope: $scope
		});
	};
	$scope.selectInstanceAsValue = function(instanceName){
		$scope.dialog.close();
		$scope.instance.addValue($scope.selectedProperty.name, instanceName, function(){		
			Alerts.success('Value added to property ' + $scope.selectedProperty.name);
		}, function(){
			Alerts.error('Could not add value to property ' + $scope.selectedProperty.name);
		});
	};
	$scope.addValueToDataProperty = function(property){
		console.log('add Data Property');
		$scope.instance.addValue(property.name, 'New Value Here', function(){		
			Alerts.success('Value added to property ' + property.name);
		}, function(){
			Alerts.error('Could not add value to property ' + property.name);
		});
	};
	$scope.setDataProperty = function(propertyName, index, value){
		if(index == -1){
			console.log('saving value:', $scope.instance.values[propertyName]);
		} else {
			$scope.instance.values[propertyName][index] = value;		
		}
		$scope.instance.saveValue(propertyName);
	};
	$scope.removeValue = function(propertyName, value){
		$scope.instance.removeValue(propertyName, value, function(){
			Alerts.success('Value removed');
		}, function(){
			Alerts.error('Could not remove value');
		});
	}

	Projects.load(function(){
		if(!$routeParams.project || !Projects.exists($routeParams.project))
			$location.path('/');
		$scope.project = Projects.get($routeParams.project);
		Classes.load();
	});
	if($location.search().className){
		Classes.select($location.search().className);
	}
	if($location.search().instance){
		Instances.select($location.search().instance);
	}
});