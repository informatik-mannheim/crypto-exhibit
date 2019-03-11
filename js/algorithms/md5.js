var forge = require('node-forge');

exports.name = 'md5';
exports.displayName = 'MD5 (Message-Digest Algorithm 5)';
exports.group = 'Hash Functions';
exports.action = 'hash';
exports.output = 'hex';

exports.apply = function(input, parameters, action) {
    var md = forge.md['md5'].create();
    md.update(input); // input converted to text / bytes always
    return md.digest().toHex();
};