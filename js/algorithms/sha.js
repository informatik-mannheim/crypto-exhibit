exports.name = 'sha';
exports.displayName = 'SHA (Secure Hash Algorithm)';
exports.group = 'Hash Functions';
exports.actions = ["hash"];
exports.paramters = [
    {
        name: 'version', label: 'Version', type: 'select', value: '1', options: [
            { value: '1', label: 'SHA-1' },
            { value: '256', label: 'SHA-256' },
            { value: '384', label: 'SHA-384' },
            { value: '512', label: 'SHA-512' }
        ]
    }
];

exports.apply = function() {
    var md = forge.md[algorithm+(algorithm=='sha'?parameterValue(tab, algorithm, 'version'):new String())].create();
    md.update(input); // input converted to text / bytes always
    output = convert(md.digest().toHex()).to('hex');
}