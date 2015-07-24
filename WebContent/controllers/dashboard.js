app.controller('DashboardController', function($scope, $rootScope, $location, $http, ngDialog){
	$scope.msg =  {
		type: 'danger',
		text: ''
	}
	$scope.project = $rootScope.project;
	if($scope.project === undefined)
		$location.path('/');

	$scope.properties = [];
	$scope.values = {};
	$scope.selectedInstance = '';
	$scope.selectedProperty = '';
	$scope.isSelectedPropertyMultiple = true;
	$scope.ids = [];
	$scope.dialog = null;

	$scope.shorten = function(name){
		return name.substring(name.indexOf("#") + 1)
	}

	$scope.loadValuesOf = function(className, instance, properties){
		if(instance == null){
			$scope.values = {};
			$scope.properties = [];
			$scope.selectedInstance = $scope.selectedProperty = '';
		} else {		
			$scope.properties = properties.sort(function(a, b){
				if(a.type == b.type)
					return 0;
				if(a.type == 'data')
					return -1;
				return 1;
			});
			$scope.selectedInstance = instance;
			$scope.values = {};
			$scope.properties.forEach(function(p){
				if(p.type == 'data' && !p.multiple){
					if(instance.values[p.name] == undefined || instance.values[p.name].length == 0)
						$scope.values[p.name] = '';
					else if(typeof instance.values[p.name][0] === 'string')
						$scope.values[p.name] = instance.values[p.name][0];
					else
						$scope.values[p.name] = instance.values[p.name][0].id.name;
				} else {
					$scope.values[p.name] = instance.values[p.name].map(function(v){
						if(typeof v == 'string')
							return v;
						return v.id.name;
					});
				}
			});
		}
	}

	$scope.removeValue = function(p, v){
		var index = $scope.values[p.name].indexOf(v);
		if(index != -1){
			$scope.values[p.name].splice(index, 1);
			$scope.saveValue(p.name);
		}
	}

	$scope.addValueToProperty = function(p){
		if(p.type == 'data'){
			$scope.values[p.name].push('New value here');
			$scope.saveValue(p.name);
		} else {
			$scope.selectedProperty = p.name;
			$scope.isSelectedPropertyMultiple = p.multiple;
			console.log('p: ', p);
			$scope.ids = p.classes;
			$scope.dialog = ngDialog.open({
				template: 'views/partials/select-instance.html',
				scope: $scope
			});
		}
	}

	$scope.selectInstance = function(className, instance){
		if(className != null && instance != null){
			instance = instance.name;
			if($scope.values[$scope.selectedProperty] != undefined && 
				$scope.values[$scope.selectedProperty].indexOf(instance) == -1
			){
				if($scope.isSelectedPropertyMultiple)
					$scope.values[$scope.selectedProperty].push(instance);
				else
					$scope.values[$scope.selectedProperty] = [instance];
			}
			$scope.saveValue($scope.selectedProperty);
			$scope.dialog.close();
		}
	}

	$scope.saveValue = function(p){
		console.log("saving: ", p);
		if($scope.values[p] !== undefined){
			$http({url: apiURL + 'values', method:'POST', params: { 
				project: $scope.project.name,
				instance: $scope.selectedInstance.name,
				property: p,
				value: $scope.values[p]
			}})
			.success(function(response){
				if(!response.done){
					$scope.msg.text = response.error;
				}
			}).error(function(){
				$scope.msg.text = 'Some error happened on server side; Please check the server console !';
			});
		}
	}
});