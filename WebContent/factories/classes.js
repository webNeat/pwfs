app.factory('Classes', function(Alerts, $http, $routeParams){
	function Classe(object){
		this.make(object);
	};
	Classe.prototype.make = function(object) {
		this.name = object.name;
		this.caption = this.name.substring(this.name.indexOf("#") + 1);
		this.childs = object.childs.sort();
		this.instances = object.instances;
		this.properties = object.properties;
		this.setts = object.setts;
		this.showChilds = true;
	};
	Classe.prototype.refresh = function(){
		var self = this;
		f.load(function(){
			self.make(f.get(self.name));
		});
	};
	Classe.prototype.toggleChilds = function(){
		this.showChilds = ! this.showChilds;
	};


	var f = {
		list : [], 
		indexes: {}, 
		selected: '' 
	};
	f.load = function(done, error){
		$http({url: apiURL + 'classes', method:'GET', params: { project: $routeParams.project }})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.list = [];
				f.indexes = {};
				response.forEach(function(item){
					f.indexes[item.name] = f.list.length;
					f.list.push(new Classe(item));
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
	}
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
	f.superClassesNames = function(){
		var isSuperClass = f.list.map(function(c){
			return true;
		});
		var size = f.list.length;
		for(var i = 0; i < size; i++)
			for(var j = 0; j < f.list[i].childs.length; j ++)
				isSuperClass[f.indexes[f.list[i].childs[j]]] = false;
		var superClassesIndexes = [];
		for(var i = 0; i < size; i++)	
			if(isSuperClass[i])
				superClassesIndexes.push(i);
		return superClassesIndexes.map(function(id){
			return f.list[id].name;
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