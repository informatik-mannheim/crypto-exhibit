var forge = require('node-forge');
var BigInteger = forge.jsbn.BigInteger;

exports.limitedScopeEval = function() {
	for(name in arguments[1]||{}) eval(
		'var '+name+' = arguments[1][name];');
	return eval(arguments[0]);
}
function convert(str) {
	if(!('functions' in convert)) convert.functions = {
		'hex': {
			'dec': function(str) { return new BigInteger(str.replace(/ /g, String()), 16).toString(); },
			'text': function(str) { return forge.util.hexToBytes(str.replace(/[^0-9A-F]/ig, String())); },
		},
		'dec': {
			'hex': function(str) { return convert(new BigInteger(str).toString(16)).to('hex'); },
			'text': function(str) { return convert(str).from('dec').to('hex', 'text'); },
		},
		'text': {
			'hex': function(str) { return convert(forge.util.bytesToHex(str)).to('hex'); },
			'dec': function(str) { return convert(str).from('text').to('hex', 'dec'); },
		},
		false: {
			'hex': function(str) { return str.replace(/[^0-9A-F]/ig, String()).replace(/(.{2})/g, '$1 ').trim().toUpperCase(); },
			'dec': function(str) { return str.replace(/[^0-9]/g, String()).trim(); },
			'text': function(str) { return str; }
		}
	};

	var to = function(from) {
		return {
			to: function() {
				jQuery.each(arguments, function(index, to) {
					if(from!=to) {
						str = convert.functions
							[from][to](str);
						from = to;
					}
				}); return str; /*arguments.length?convert.functions //last step is always to convert it to the output format
					[false][arguments[arguments.length-1]](str):*/
			}
		};
	};
	return {
		from: function(from) {
			return to(from);
		}, to: to(false).to
	};
}
exports.convert = convert;

exports.randomBytes = function(count) {
	return convert(forge.random.getBytesSync(count)).from('text').to('hex');
}
exports.randomPrime = function(bits) {
	return jQuery.Deferred(function(defer) {
		forge.prime.generateProbablePrime(bits, function(err, num) {
			if(!err) defer.resolve(num.toString()); else defer.reject(err);
		});
	}).promise();
}