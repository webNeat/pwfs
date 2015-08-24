app.directive('sortable', function(Classes, Alerts){
	return {
		restrict: 'A',
		link: function($scope, $element, $attr){
			$element.sortable({
				handle: ".title",
				stop:function(event, ui) {
					Classes.get(ui.item.attr('class-name')).setPropertySettings(ui.item.attr('property-name'), {
						x: ui.offset.left,
						y: ui.offset.top
					});
					Classes.savePropertySettings(ui.item.attr('class-name'), ui.item.attr('property-name'), function(){
						Alerts.success('New Settings saved !');
					});
			    }
			});
			$element.disableSelection();
		}
	};
});