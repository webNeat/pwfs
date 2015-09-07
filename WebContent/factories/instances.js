app.factory('Instances', function(Alerts, $http, $routeParams, Classes){
	var shorten = function(str){
		return str.substring(str.lastIndexOf('#') + 1);
	};
	function Instance(object){
		this.make(object);
	};
	Instance.prototype.make = function(object) {
		this.name = object.name;
		this.className = object.className;
		this.caption = shorten(this.name);
		this.parseValues(object.values);
	};
	Instance.prototype.applyFilter = function() {
		var self = this;
		var setts = Classes.get(this.className).setts;
		if(setts){
			var vals = {};
			for(var key in self.values){
				if(self.values.hasOwnProperty(key)){
					vals[shorten(key)] = '';
					if(self.values[key].forEach){
						self.values[key].forEach(function(v){
							if(typeof v === 'string')
								vals[shorten(key)] += shorten(v) + ' ';
							else if(v['id'])
								vals[shorten(key)] += shorten(v['id']['name']) + ' ';
							else 
								vals[shorten(key)] += shorten(v['name']) + ' ';
						});
					} else {
						console.log('Value?', self.values[key]);
					}
				}
			}
			var filters = setts.filters.filter(function(e){
				e = e.trim();
				return (e != '' && vals[e] != undefined && vals[e].trim() != '');
			});

			self.caption = '';
			var tempIndex = 0;
			if(setts.separators == undefined)
				setts.separators = [];
			while(tempIndex < filters.length){
				self.caption += vals[filters[tempIndex]];
				if(tempIndex < setts.separators.length && setts.separators[tempIndex] != '')
					self.caption += setts.separators[tempIndex];
				else
					self.caption += ' ';
				tempIndex ++;
			}

			self.caption = self.caption.trim();
			if(self.caption == '')
				self.caption = shorten(self.name);
		}
	};
	Instance.prototype.parseValues = function(vals){
		var self = this;
		var props = Classes.get(this.className).properties;
		self.values = {};
		if(props){
			props.forEach(function(p){
				if(p.type == 'data' && !p.multiple){
					if(vals[p.name] == undefined || vals[p.name].length == 0)
						self.values[p.name] = [''];
					else if(typeof vals[p.name][0] === 'string')
						self.values[p.name] = [vals[p.name][0]];
					else
						self.values[p.name] = [vals[p.name][0].id.name];
				} else {
					self.values[p.name] = vals[p.name].map(function(v){
						if(typeof v == 'string')
							return v;
						return v.id.name;
					});
					if(self.name == 'OBJETS_2')
						console.log(p.name, vals[p.name]);
				}
			});
		}
	};
	Instance.prototype.refresh = function(done){
		var self = this;
		f.load(function(){
			self.make(f.get(self.name));
			if(done)
				done();
		});
	};
	Instance.prototype.remove = function() {
		f.remove(this.name);
	};
	Instance.prototype.saveValue = function(propertyName, done, error) {
		var self = this;
		$http({url: apiURL + 'values', method:'POST', params: { 
			project: $routeParams.project,
			instance: self.name,
			property: propertyName,
			value: self.values[propertyName]
		}}).success(function(response){
			if(response.done === false){
				Alerts.error(response.error);
				if(error)
					error();
			} else {
				self.refresh(done);
			}
		})
		.error(function(response){
			Alerts.error('Some error happened on server side; Please check the server console !');
		});
	};
	Instance.prototype.addValue = function(propertyName, value, done, error) {
		var self = this;
		var p = Classes.get(this.className).getProperties();
		if(p[propertyName]){
			p = p[propertyName];
			if(p.type == 'data'){
				self.values[p.name].push('New value here');
			} else {
				if(self.values[p.name].indexOf(value) == -1){
					if(p.multiple)
						self.values[p.name].push(value);
					else
						self.values[p.name] = [ value ];
				}
			}
			self.saveValue(p.name, done, error);
		}
	};
	Instance.prototype.removeValue = function(propertyName, value, done, error) {
		var index = this.values[propertyName].indexOf(value);
		if(index != -1){
			this.values[propertyName].splice(index, 1);
			this.saveValue(propertyName, done, error);
		}
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
				f.list.forEach(function(instance){
					instance.applyFilter();
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
		if(f.byClass[name] === undefined)
			return null;
		var result = f.byClass[name].map(function(id){
			return f.list[id];
		});
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
				if(id.indexOf('#') != -1)
					return f.get(id.substring(id.indexOf('#') + 1), silent);
				if(!silent){
					Alerts.error('Instance "' + id + '" not found');
					console.error('Instance "' + id + '" not found');
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