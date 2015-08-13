app.directive('instanceCaption', function($rootScope, $http){
	return {
		templateUrl: 'views/partials/instance-caption.html',
		restrict: 'E',
		scope: {
			instance: '='
		},
		link: function($scope, $element, $attr){
			$scope.caption = 'loading ...';
			$scope.shorten = function(name){
				return name.substring(name.indexOf("#") + 1)
			}

			var applyFilter = function() {
				$scope.caption = $scope.instance.name;
				$http({url: apiURL + 'class-settings', method:'GET', params: { 
					project: $rootScope.project.name,
					'class': $scope.instance.className
				}})
				.success(function(response){
					console.log('class-settings:', response);
					if(response != null){
						var vals = {};
						for(var key in $scope.instance.values){
							if($scope.instance.values.hasOwnProperty(key)){
								vals[$scope.shorten(key)] = '';
								$scope.instance.values[key].forEach(function(v){
									if(typeof v === 'string')
										vals[$scope.shorten(key)] += v + ' ';
									else if(v['id'])
										vals[$scope.shorten(key)] += $scope.shorten(v['id']['name']) + ' ';
									else 
										vals[$scope.shorten(key)] += $scope.shorten(v['name']) + ' ';
								});
							}
						}
						var filters = response.filters.filter(function(e){
							e = e.trim();
							return (e != '' && vals[e] != undefined && vals[e] != '');
						});

						$scope.caption = '';
						var tempIndex = 0;
						if(response.separators == undefined)
							response.separators = [];
						while(tempIndex < filters.length){
							$scope.caption += vals[filters[tempIndex]];
							if(tempIndex < response.separators.length && response.separators[tempIndex] != '')
								$scope.caption += response.separators[tempIndex];
							else
								$scope.caption += ' ';
							tempIndex ++;
						}

						$scope.caption = $scope.caption.trim();
						if($scope.caption == '')
							$scope.caption = $scope.instance.name;
					}
				}).error(function(){
					$scope.caption = 'error ...';
				});				
			};

			console.log('Instance: ', $scope.instance);

			if($scope.instance != undefined){
				if(typeof instance === 'string'){
					$http({url: apiURL + 'instance', method:'GET', params: { 
						project: $rootScope.project.name,
						instance: $scope.shorten($scope.instance)
					}})
					.success(function(response){
						console.log('instance:', response);
						$scope.instance = response;
						applyFilter();
					});
				} else {
					console.log('Not String !');
					applyFilter();
				}
			}
		}
	};
});