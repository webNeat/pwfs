app.factory('Instances', function(Alerts, $http, $routeParams, Classes){
	function Instance(object){
		this.make(object);
	};
	Instance.prototype.make = function(object) {
		this.name = object.name;
		this.className = object.className;
		this.caption = this.name.substring(this.name.indexOf("#") + 1);
		this.values = object.values;
		this.parseValues();
	};
	Instance.prototype.applyFilter = function() {
		var setts = Classes.get(this.className).setts;
		// ...
	};
	Instance.prototype.parseValues = function() {
		// ...
	};
	Instance.prototype.refresh = function(){
		var self = this;
		f.load(function(){
			self.make(f.get(self.name));
		});
	};
	Instance.prototype.remove = function() {
		f.remove(this.name);
	};


	var f = {
		list : [],
		indexes: {}, // name => index
		byClass: {}, // className => list of indexes
		selected: ''
	};
	f.load = function(done, error){
		$http({url: apiURL + 'instances', method:'GET', params: { project: $routeParams.project }})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.list = [];
				f.indexes = {};
				f.byClass = {};
				response.forEach(function(item){
					f.indexes[item.name] = f.list.length;
					if(f.byClass[item.className] === undefined)
						f.byClass[item.className] = [];
					f.byClass[item.className].push(f.list.length);
					f.list.push(new Instance(item));
				});
				if(done)
					done();
			}
		})
		.error(function(response){
			Alerts.error('Some error happened on server side; Please check the server console !');
			if(error)
				error();
		});
	};
	f.all = function(){
		return f.list;
	};
	f.allByName = function(){
		var result = {};
		f.list.forEach(function(item){
			result[item.name] = item;
		});
		return result;
	};
	f.ofClass = function(name){
		console.log('Instances of: ' + name);
		if(f.byClass[name] === undefined)
			return null;
		var result = f.byClass[name].map(function(id){
			return f.list[id];
		});
		console.log(result);
		return result;
	};
	f.exists = function(name){
		return (f.indexes[name] !== undefined);
	};
	f.get = function(id, silent){
		if(typeof id === 'string')
			if(f.indexes[id] !== undefined)
				id = f.indexes[id];
			else {
				if(!silent){
					Alerts.error('Class "' + id + '" not found');
					console.error('Class "' + id + '" not found');
					console.log(f.indexes);
					console.log(f.list);
				}
				return null;
			}
		if(f.list[id])
			return f.list[id];
		return null;
	};
	f.create = function(done, error){
		var prefix = ''; // Doit être changé !!
		var instanceNumber = 1;
		var className = Classes.getSelected();
		className = className.substring(className.indexOf("#") + 1);
		var existtingInstances = f.ofClass(Classes.getSelected());
		if(existtingInstances){
			existtingInstances.forEach(function(i){
				var name = i.name.substring(i.name.indexOf('#') + 1);
				var uIndex = name.lastIndexOf('_');
				if(uIndex != -1){
					name = parseInt(name.substring(uIndex + 1));
					if(! isNaN(name) && name >= instanceNumber)
						instanceNumber = name + 1;
				}
			});
		}
		var newName = prefix + className + '_' + instanceNumber;
		$http({url: apiURL + 'instances', method:'POST', params: { 
			project: $routeParams.project,
			'class': Classes.getSelected(),
			instance: newName,
			action: 'create'
		}})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.load(done, error);
			}
		})
		.error(function(){
			Alerts.error('Some error happened on server side; Please check the server console !');
			if(error)
				error();
		});
	};
	f.remove = function(name, done, error){
		$http({url: apiURL + 'instances', method:'POST', params: { 
			project: $routeParams.project,
			instance: name,
			action: 'remove'
		}})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.load(done, error);
			}
		})
		.error(function(){
			Alerts.error('Some error happened on server side; Please check the server console !');
			if(error)
				error();
		});
	};
	f.select = function(name){
		f.selected = name;
	};
	f.getSelected = function(){
		return f.selected;
	};

	return f;
});