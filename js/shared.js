var algorithms = exports.algorithms = {}; // will be filled by required modules

exports.requireAlgorithm = function(algorithm) {
	return algorithms[algorithm]?Promise.resolve(algorithms[algorithm]):new Promise(function(resolve, reject) {
		require([ 'cjs!algorithms/'+algorithm/*+'.min'*/ ], function(module) { //TODO add .min here!
			resolve(algorithms[algorithm]=exports.sanitizeAlgorithm(module));
		});
	});
}
exports.sanitizeAlgorithm = function(module) {
	if(typeof module==='object') {
		if(module.action) {
			module.actions = [module.action];
			delete module.action;
		} else if(!module.actions) module.actions = ['encrypt', 'decrypt'];

		if(module.input) {
			module.inputs = {};
			module.actions.forEach(function(action) {
				module.inputs[action] = module.input;
			}); delete module.input;
		} else if(!module.inputs) module.inputs = {};

		if(module.output) {
			module.outputs = {};
			module.actions.forEach(function(action) {
				module.outputs[action] = module.output;
			}); delete module.input;
		} else if(!module.outputs) module.outputs = {};

		return module;
	} else return { apply: module };
}