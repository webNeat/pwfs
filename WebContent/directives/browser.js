app.directive('browser', function($rootScope, $http, ngDialog){
	return {
		templateUrl: 'views/partials/browser.html',
		restrict: 'E',
		scope: {
			ids: '=',
			onSelected: '&'
		},
		link: function($scope, $element, $attr){

			$scope.msg =  {
				type: 'danger',
				text: ''
			};
			
			$scope.project = $rootScope.project;
			$scope.classes = { all: [], index: {} };
			$scope.loadingClasses = false;
			$scope.loadingInstances = false;

			$scope.currentClassIndex = -1;
			$scope.instances = [];
			$scope.properties = [];
			$scope.currentInstance = null;

			$scope.dialog = null;
			
			$scope.propertiesChoices = [];
			$scope.showingFilter = false;
			$scope.filters = [];
			$scope.separators = [];

			var sortClasses = function(){
				$scope.classes.all.forEach(function(c){
					c.childs.sort(function(a, b){
						return $scope.getClass(a).name > $scope.getClass(b).name;
					});
				});
			}

			$scope.shorten = function(name){
				return name.substring(name.indexOf("#") + 1)
			}

			$scope.getClass = function(index){
				if(typeof index === 'number')
					return $scope.classes.all[index];
				return $scope.classes.all[$scope.classes.index[index]];
			}

			$scope.toggleChildsOf = function(index){
				$scope.getClass(index).showChilds = ! $scope.getClass(index).showChilds;
			}

			var loadClasses = function(){
				$scope.loadingClasses = true;
				$http({url: apiURL + 'classes', method:'GET', params: { project: $scope.project.name }})
					.success(function(response){
						console.log('/classes response: ', response);
						$scope.classes = { all: [], index: {} };
						$scope.classes.all = response;
						if(response.length < 1){
							$scope.alert('danger', "Project doesn't match expected configuration. See documentation for more details");
						} else {
							$scope.alert('danger', '');
							for(var i = 0; i < $scope.classes.all.length; i++){
								$scope.classes.index[$scope.classes.all[i].name] = i;
								$scope.classes.all[i].fullName = $scope.classes.all[i].name;
								$scope.classes.all[i].name = $scope.shorten($scope.classes.all[i].name);
								$scope.classes.all[i].showChilds = true;
							}
							sortClasses();
							if($scope.ids == null)
								$scope.ids = $scope.getSuperClassesIndexes();
							$scope.loadingClasses = false;
						}
					})
					.error(function(){
						$scope.alert('danger', 'Some error happened on server side; Please check the server console !');
						$scope.loadingClasses = false;
					});
			}

			$scope.getSuperClassesIndexes = function(){
				var isSuperClass = $scope.classes.all.map(function(c){
					return true;
				});
				var size = $scope.classes.all.length;
				for(var i = 0; i < size; i++)
					for(var j = 0; j < $scope.classes.all[i].childs.length; j ++)
						isSuperClass[$scope.classes.index[$scope.classes.all[i].childs[j]]] = false;
				var superClassesIndexes = [];
				for(var i = 0; i < size; i++)	
					if(isSuperClass[i])
						superClassesIndexes.push(i);
				return superClassesIndexes;
			}

			$scope.alert = function(type, msg){
				$scope.msg.type = type;
				$scope.msg.text = msg;
				setTimeout(function(){
					$scope.msg.text = '';
					$scope.$apply();
				}, 7000);
			}

			$scope.loadInstancesOf = function(index){
				$scope.instanceClicked();
				$scope.loadingInstances = true;
				$scope.currentClassIndex = index;

				var className = $scope.getClass(index).name;
				$http({url: apiURL + 'instances', method:'GET', params: { 
					project: $scope.project.name,
					'class': $scope.getClass(index).fullName
				}})
				.success(function(response){
					if(response.length < 1){
						$scope.alert('info', "This class doesn't contain any instance");
						console.log('$scope.msg: ', $scope.msg);
						$scope.instances = [];
						$scope.properties = [];
						$scope.instanceClicked();
					} else {
						$scope.instances = response.sort(function(a, b){
							return a.name - b.name;
						});
						$scope.properties = $scope.getClass(index).properties.map(function(p){
							if(p.classes != undefined){
								p.classes = p.classes.map(function(c){
									return $scope.classes.index[c] || -1;
								}).filter(function(c){
									return c != -1;
								});
								if(p.classes.length == 0)
									p.classes = null;
							}
							return p;
						});
						$scope.properties.sort(function(a, b){
							return a.type - b.type;
						});
						$scope.propertiesChoices = $scope.properties.map(function(p){
							return $scope.shorten(p.name);
						});
						$scope.propertiesChoices.push(' ');
						console.log('$scope.propertiesChoices: ', $scope.propertiesChoices);

						// $scope.instanceClicked($scope.instances[0]);
					}
					$scope.loadingInstances = false;
				})
				.error(function(){
					$scope.alert('danger', 'Some error happened on server side; Please check the server console !');
					$scope.loadingClasses = false;
				});
			}

			$scope.instanceClicked = function(i){
				if(i == undefined){
					$scope.onSelected({
						className: null,
						instance: null,
						properties: null
					});					
				} else {
					$scope.currentInstance = i.name;
					$scope.onSelected({
						className: $scope.getClass($scope.currentClassIndex).fullName,
						instance: i,
						properties: $scope.properties
					});
				}
			}

			$scope.createInstance = function(){
				if($scope.currentClassIndex == -1 || $scope.getClass($scope.currentClassIndex) === undefined)
					return;
				var prefix = ''; // Doit être changer !!
				var instanceNumber = 1;
				var className = $scope.getClass($scope.currentClassIndex).name;
				$scope.instances.forEach(function(i){
					var name = $scope.shorten(i.name);
					var uIndex = name.lastIndexOf('_');
					if(uIndex != -1){
						name = parseInt(name.substring(uIndex + 1));
						if(! isNaN(name) && name >= instanceNumber)
							instanceNumber = name + 1;
					}
				});
				var newName = prefix + className + '_' + instanceNumber;
				$http({url: apiURL + 'instances', method:'POST', params: { 
					project: $scope.project.name,
					'class': $scope.getClass($scope.currentClassIndex).fullName,
					instance: newName,
					action: 'create'
				}})
				.success(function(response){
					if(response.done){
						$scope.loadInstancesOf($scope.currentClassIndex);
						$scope.alert('info', "Instance was successfully created with the name '" + newName + "'");
					} else {
						$scope.alert('danger', response.error);
					}
				})
				.error(function(){
					$scope.alert('danger', 'Some error happened on server side; Please check the server console !');
				});
			}

			$scope.removeInstance = function(i){
				$http({url: apiURL + 'instances', method:'POST', params: { 
					project: $scope.project.name,
					instance: i.name,
					action: 'remove'
				}})
				.success(function(response){
					if(response.done){
						$scope.loadInstancesOf($scope.currentClassIndex);
					} else {
						$scope.alert('danger', response.error);
					}
				})
				.error(function(){
					$scope.alert('danger', 'Some error happened on server side; Please check the server console !');
				});
			}

			$scope.showFilter = function(){
				console.log('Showing Filter Window');
				$scope.showingFilter = true;
				console.log('$scope.filters: ', $scope.filters);
				console.log('$scope.separators: ', $scope.separators);
			};

			$scope.applySelectedFilter = function(filters, separators){
				if(filters == undefined || separators == undefined)
					return;

				$scope.filters = filters;
				$scope.separators = separators;
				$scope.showingFilter = false;

				$http({url: apiURL + 'class-settings', method:'POST', params: { 
					project: $scope.project.name,
					'class': $scope.getClass($scope.currentClassIndex).fullName,
					filters: filters,
					separators: separators
				}})
				.success(function(response) {
					if(response.done){
						$scope.alert('success', 'Settings saved successfully');
						loadClasses();
						$scope.loadInstancesOf($scope.currentClassIndex);
					} else {
						$scope.alert('danger', "Error while saving settings");
					}
				})
				.error(function(){
					$scope.alert('danger', 'Some error happened on server side; Please check the server console !');
					$scope.loadingClasses = false;
				});
			}

			loadClasses();
		}
	};
});