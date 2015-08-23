app.factory('Projects', function(Alerts, $http){
	// La classe Project
	function Project(object){
		this.make(object);
	};
	Project.prototype.make = function(object) {
		this.name = object.name;
		if(object.setts)
			this.setts = object.setts;
		else
			this.setts = null;
	};
	Project.prototype.refresh = function(){
		var self = this;
		f.load(function(){
			self.make(f.get(self.name));
		});
	};

	// Le factory des projets
	var f = {
		list : [], // la liste de tous les projets
		indexes: {} // hashmap associant le nom de chaque projet à son indice dans l'array list
	};
	f.load = function(done, error){
		$http({url: apiURL + 'projects', method:'GET'})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.list = [];
				f.indexes = {};
				response.forEach(function(item){
					f.indexes[item.name] = f.list.length;
					f.list.push(new Project(item));
				});
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
	f.exists = function(name){
		return (f.indexes[name] !== undefined);
	};
	f.get = function(id){
		if(typeof id === 'string')
			if(f.indexes[id])
				id = f.indexes[id];
			else {
				Alerts.error('Project "' + id + '" not found');
				return null;
			}
		if(f.list[id])
			return f.list[id];
		return null;
	}

	return f;
});