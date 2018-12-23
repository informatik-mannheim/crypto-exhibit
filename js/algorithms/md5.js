var forge = require('node-forge');

exports.name = 'md5';
exports.displayName = 'MD5 (Message-Digest Algorithm 5)';
exports.group = 'Hash Functions';
exports.actions = ["hash"];

exports.apply = function(input, parameters, action) {
    var md = forge.md[algorithm+(algorithm=='sha'?parameterValue(tab, algorithm, 'version'):new String())].create();
    md.update(input); // input converted to text / bytes always
    output = convert(md.digest().toHex()).to('hex');
};