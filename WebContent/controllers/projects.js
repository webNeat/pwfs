app.controller('ProjectsController', function($scope, $location, Projects, Alerts){
	$scope.projects = Projects.all();
	$scope.$watch(Projects.all, function(){
		$scope.projects = Projects.all();
	});

	$scope.newProject = '';
	$scope.uploadURL = apiURL + 'projects';
	$scope.uploading = false;
	$scope.uploadProgress = 0;
	$scope.loading = true;

	$scope.load = function(project){
		$location.path('/dashboard/' + project.name);
	}

	$scope.validName = function(){
		$scope.newProject = $scope.newProject.trim();
		return (
			$scope.newProject != '' && 
			! Projects.exists($scope.newProject)
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
	    	Alerts.success('Project uploaded');
	    },
	    error: function() {
    		Alerts.error('Erreur lors de la communication avec le serveur !');
	    },
		complete: function(xhr) {
			var response = $.parseJSON(xhr.responseText);
			$scope.uploading = false;
			if(response.done){
				Alerts.success("Le projet est ajouté avec succés");
				$scope.loading = true;
				Projects.load(function(){
					$scope.loading = false;
				});
			}
		}
	});

	Projects.load(function(){
		$scope.loading = false;
		Alerts.success('Projects loaded successfully');
	});
});