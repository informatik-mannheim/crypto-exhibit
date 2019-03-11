var forge = require('node-forge');
var BigInteger = forge.jsbn.BigInteger;

exports.name = 'rsa';
exports.displayName = 'RSA (Rivest, Shamir and Adleman)';
exports.group = 'Asymmetric Cryptography';
exports.parameters = [
    { name: 'p', label: 'Primefactor P', type: 'number', value: 'cryptoExhibit.util.randomPrime(32)', placeholder: 'TODO' },
    { name: 'q', label: 'Primefactor Q', type: 'number', value: 'cryptoExhibit.util.randomPrime(32)', placeholder: 'TODO' },
    { name: 'e', label: 'Exponent E', type: 'number', value: 'cryptoExhibit.algorithms.rsa.randomE(tab)', placeholder: 'TODO' }
];
exports.input = exports.output = 'dec';

exports.randomE = function(tab) {
	return jQuery.Deferred(function(defer) {
		(function wait() {
			var p = jQuery.parameter(tab, 'rsa', 'p').val(), q = jQuery.parameter(tab, 'rsa', 'q').val();
			if(p&&q) {
				var n = (p=new BigInteger(p)).multiply(q=new BigInteger(q)),
					phiN = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE)), e;
				// generate 1 < e < phiN, which is propable prime
				while((e=new BigInteger(phiN.bitLength(), {
					nextBytes: function(array) {
						var random = forge.random.getBytesSync(array.length);
						for(var index=0; index<array.length; index++)
							array[index] = random.charCodeAt(index);
					}
				})).compareTo(phiN)>=0||!e.isProbablePrime());
				defer.resolve(e.toString());
			} else setTimeout(wait, 50);
		})();
	}).promise();
};

exports.encrypt = function(input, parameters) {
	var n = new BigInteger(parameters.p).multiply(new BigInteger(parameters.q));
	return new BigInteger(input).modPow(new BigInteger(parameters.e), n).toString();
};

exports.decrypt = function(input, parameters) {
	var n = new BigInteger(parameters.p).multiply(new BigInteger(parameters.q)),
		phiN = new BigInteger(parameters.p).subtract(BigInteger.ONE).multiply(new BigInteger(parameters.q).subtract(BigInteger.ONE)),
		d = new BigInteger(parameters.e).modInverse(phiN);
	return new BigInteger(input).modPow(d, n).toString();
}