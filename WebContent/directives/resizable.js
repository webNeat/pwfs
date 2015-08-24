app.directive('resizable', function(Classes, Alerts){
	return {
		restrict: 'A',
		link: function($scope, $element, $attr){
			$element.resizable();
		}
	};
});