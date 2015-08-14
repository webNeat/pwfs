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
	$scope.selectedClass = '';
	$scope.selectedProperty = '';
	$scope.isSelectedPropertyMultiple = true;
	$scope.ids = null;
	$scope.dialog = null;

	$scope.shorten = function(name){
		return name.substring(name.indexOf("#") + 1)
	}

	$scope.updateClass = function(className){
		$scope.selectedClass = className;
	}

	$scope.loadValuesOf = function(className, instance, properties){
		if(instance == null){
			$scope.values = {};
			$scope.properties = [];
			$scope.selectedInstance = $scope.selectedProperty = '';
		} else {
			var dataProps = properties.filter(function(a){
				return a.type == 'data';
			}).sort(function(a, b){
				a = $scope.shorten(a.name).toLowerCase();
				b = $scope.shorten(b.name).toLowerCase();
				if( a < b )
					return -1;
				else if(a > b)
					return 1;
				else
					return 0;
			});
			var objProps = properties.filter(function(a){
				return a.type != 'data';
			}).sort(function(a, b){
				a = $scope.shorten(a.name).toLowerCase();
				b = $scope.shorten(b.name).toLowerCase();
				if( a < b )
					return -1;
				else if(a > b)
					return 1;
				else
					return 0;
			});

			$scope.properties = dataProps.concat(objProps);

			var lastY = 0;
			$scope.properties.map(function(p){
				if(p.setts && p.setts.y)
					lastY = Math.max(lastY, p.setts.y);
			});

			$scope.properties.map(function(p){
				if(! p.setts){
					lastY ++;
					p.setts = {
						x: 0, // n'est pas utilisé pour le moment
						y: lastY,
						w: 0, // n'est pas utilisé pour le moment
						h: 50
					};
					$scope.savePropertySettings(p);
				}
			});

			$scope.properties.sort(function(a, b){
				return a.setts.y - b.setts.y;
			});

			$scope.selectedInstance = instance;
			$scope.selectedClass = className;
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
					$scope.values[p.name] = instance.values[p.name];
				}
			});
		}
	}

	$scope.savePropertySettings = function(p){
		$http({url: apiURL + 'property-settings', method:'POST', params: { 
			project: $scope.project.name,
			'class': $scope.selectedClass,
			property: p.name,
			x: p.setts.x,
			y: p.setts.y,
			w: p.setts.w,
			h: p.setts.h
		}})
		.success(function(response){
			if(!response.done){
				$scope.msg.text = response.error;
			}
		}).error(function(){
			$scope.msg.text = 'Some error happened on server side; Please check the server console !';
		});
	}

	$scope.savePropertiesOrder = function(){
		for(var i = 0; i < $scope.properties.length; i ++){
			if($scope.properties[i].setts.y != i + 1){
				$scope.properties[i].setts.y = i + 1;
				$scope.savePropertySettings($scope.properties[i]);
			}
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