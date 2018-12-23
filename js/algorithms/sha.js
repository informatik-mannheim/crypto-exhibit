exports.name = 'sha';
exports.displayName = 'SHA (Secure Hash Algorithm)';
exports.group = 'Hash Functions';
exports.actions = ["hash"];

exports.apply = function() {
    var md = forge.md[algorithm+(algorithm=='sha'?parameterValue(tab, algorithm, 'version'):new String())].create();
    md.update(input); // input converted to text / bytes always
    output = convert(md.digest().toHex()).to('hex');
}