app.controller('ProjectsController', function($scope, $rootScope, $location, $http){

	$scope.msg = {
		type: 'danger',
		text: ''
	};

	$scope.projects = [];
	$scope.newProject = '';
	$scope.uploadURL = apiURL + 'projects';
	$scope.uploading = false;
	$scope.uploadProgress = 0;
	$scope.loading = false;

	$scope.load = function(project){
		$rootScope.project = project;
		$location.path('/dashboard');
	}

	$scope.validName = function(){
		return (
			$scope.newProject.trim() != '' && 
			$scope.projects.indexOf($scope.newProject) == -1
		);
	}

	$('#uploadForm').ajaxForm({
	    beforeSend: function() {
	        $scope.$apply(function(){
	        	$scope.uploading = true;
	        	$scope.uploadProgress = 0;
	        });
	    },
	    uploadProgress: function(event, position, total, percentComplete) {
	        $scope.$apply(function(){
	        	$scope.uploadProgress = percentComplete;
	        });
	    },
	    success: function() {
	    	console.log('Success !!');
	    },
	    error: function() {
	    	$scope.$apply(function(){
	    		$scope.msg.text = 'Erreur lors de la communication avec le serveur !';
	    	});
	    },
		complete: function(xhr) {
			$scope.$apply(function(){
				var response = $.parseJSON(xhr.responseText);
				$scope.uploading = false;
				if(response.done){
					$scope.msg.text = "Le projet est ajouté avec succés";
					$scope.msg.type = "success";
					$scope.loadProjects();
				}
			});
		}
	});

	$scope.loadProjects = function(){
		$scope.loading = true;
		$http({url: apiURL + 'projects', method:'GET'})
			.success(function(response){
				$scope.projects = response;
				$scope.loading = false;
				if(response.length == 0){
					$scope.msg.type = 'info';
					$scope.msg.text = 'No project found. Please use the form below to add new projects';
				}
			})
			.error(function(){
				$scope.msg.text = 'Some error happened on server side; Please check the server console !';
				$scope.loading = false;
			});
	}

	$scope.loadProjects();

});