var forge = require('node-forge');

exports.name = 'sha';
exports.displayName = 'SHA (Secure Hash Algorithm)';
exports.group = 'Hash Functions';
exports.action = 'hash';
exports.output = 'hex';
exports.parameters = [
    {
        name: 'version', label: 'Version', type: 'select', value: '1', options: [
            { value: '1', label: 'SHA-1' },
            { value: '256', label: 'SHA-256' },
            { value: '384', label: 'SHA-384' },
            { value: '512', label: 'SHA-512' }
        ]
    }
];

exports.apply = function(input, parameters, action) {
    var md = forge.md['sha'+parameters.version].create();
    md.update(input); // input converted to text / bytes always
    return md.digest().toHex();
}