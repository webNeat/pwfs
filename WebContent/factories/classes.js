app.factory('Classes', function(Alerts, $http, $routeParams){
	var shorten = function(str){
		return str.substring(str.indexOf('#') + 1);
	};

	function Classe(object){
		this.make(object);
	};
	Classe.prototype.make = function(object) {
		this.name = object.name;
		this.caption = this.name.substring(this.name.indexOf("#") + 1);
		this.childs = object.childs.sort();
		this.instances = object.instances;
		this.properties = object.properties;
		this.sortProperties();
		this.setts = object.setts;
		if(!this.setts){
			this.setts = {
				filters: [],
				separators: []
			};
		}
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
	Classe.prototype.saveSetts = function(done, error) {
		console.log('Saving settings: ', this.setts);
		f.saveSetts(this.name, done, error);
	};
	Classe.prototype.getProperties = function() {
		var result = {};
		this.properties.forEach(function(p){
			result[p.name] = p;
		});
		return result;
	};
	Classe.prototype.sortProperties = function() {
		var dataProps = this.properties.filter(function(a){
			return a.type == 'data';
		}).sort(function(a, b){
			a = shorten(a.name).toLowerCase();
			b = shorten(b.name).toLowerCase();
			if( a < b )
				return -1;
			else if(a > b)
				return 1;
			else
				return 0;
		});
		var objProps = this.properties.filter(function(a){
			return a.type != 'data';
		}).sort(function(a, b){
			a = shorten(a.name).toLowerCase();
			b = shorten(b.name).toLowerCase();
			if( a < b )
				return -1;
			else if(a > b)
				return 1;
			else
				return 0;
		});

		this.properties = dataProps.concat(objProps);
	};
	Classe.prototype.setPropertySettings = function(propertyName, setts) {
		var size = this.properties.length;
		for(var i = 0; i < size; i ++){
			if(this.properties[i].name == propertyName){
				this.properties[i].setts = setts;
				break;
			}
		}
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
	f.saveSetts = function(name, done, error){
		var c = f.get(name);
		$http({url: apiURL + 'class-settings', method:'POST', params: { 
			project: $routeParams.project,
			'class': name,
			filters: c.setts.filters,
			separators: c.setts.separators
		}})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.load(done, error);
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
	f.savePropertySettings = function(name, propertyName, done, error){
		var props = f.get(name).getProperties();
		var setts = props[propertyName].setts;
		if(!setts) setts = {};
		if(!setts.x) setts.x = 0;
		if(!setts.y) setts.y = 0;
		if(!setts.w) setts.w = 0;
		if(!setts.h) setts.h = 0;

		$http({url: apiURL + 'property-settings', method:'POST', params: { 
			project: $routeParams.project,
			'class': name,
			property: propertyName,
			x: setts.x,
			y: setts.y,
			w: setts.w,
			h: setts.h
		}})
		.success(function(response){
			if(response.done === false)
				Alerts.error(response.error);
			else {
				f.load(done, error);
			}
		})
		.error(function(response){
			Alerts.error('Some error happened on server side; Please check the server console !');
			if(error)
				error();
		});
	}
	f.select = function(name){
		f.selected = name;
	};
	f.getSelected = function(){
		return f.selected;
	};

	return f;
});