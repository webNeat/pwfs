app.directive('field', function(Classes, Alerts){
	return {
		restrict: 'A',
		scope: {
			className: '=',
			property: '='
		},
		link: function($scope, $element, $attrs){
			var save = function(){
				Classes.savePropertySettings($scope.className, $scope.property.name, function(){
					Alerts.success('New Settings saved !');
				});
			};

			if(!$scope.property.setts){
				$scope.property.setts = {
					x: $element.offset().left,
					y: $element.offset().top,
					w: $element.width(),
					h: $element.height()
				};
				save();
			}
			$attrs.$observe('y', function(val){
				$scope.property.setts.y = val;
				save();
			});
		}
	};
});