var forge = require('node-forge');
var BigInteger = forge.jsbn.BigInteger;

exports.name = 'rsa';
exports.displayName = 'RSA (Rivest, Shamir and Adleman)';
exports.group = 'Asymmetric Cryptography';

function randomE(tab) {
	return jQuery.Deferred(function(defer) {
		(function wait() {
			var p = jQuery.parameter(tab, 'rsa', 'p').val(), q = jQuery.parameter(tab, 'rsa', 'q').val();
			if(p&&q) {
				var n = new BigInteger(p).multiply(new BigInteger(q));
				defer.resolve(n.toString());
			} else setTimeout(wait, 50);
		})();
	}).promise();
}

exports.randomE = randomE;

exports.apply = function() {

};