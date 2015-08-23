app.service('Alerts', function($timeout){
	var self = this;
	self.msgs = {
		infos: [],
		successes: [],
		errors: []
	};
	self.add = function(type, msg){
		if(self.msgs[type].indexOf(msg) == -1){
			self.msgs[type].push(msg);
			$timeout(function(){
				self.msgs[type].splice(0, 1);
			}, 3000);			
		}
	};
	self.info = function(msg){
		self.add('infos', msg);
	};
	self.success = function(msg){
		self.add('successes', msg);
	};
	self.error = function(msg){
		self.add('errors', msg);
	};
	self.all = function(){
		return self.msgs;
	}
});