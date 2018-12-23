var forge = require('node-forge');

exports.name = 'template';
exports.displayName = 'Template Algorithm (will NOT be shown on the UI!)';
exports.group = 'Template Algorithms';
exports.parameters = [
    {
        name: 'mode', label: 'Mode of Operation', type: 'select', value: 'CBC', options: [
            { value: 'ECB', label: 'Electronic Codebook (ECB)' },
            { value: 'CBC', label: 'Cipher Block Chaining (CBC)' },
            { value: 'CFB', label: 'Cipher Feedback (CFB)' },
            { value: 'OFB', label: 'Output Feedback (OFB)' },
            { value: 'CTR', label: 'Counter (CTR)' },
            { value: 'GCM', label: 'Galois/Counter Mode (GCM)' }
        ]
    },
    { name: 'key', label: 'Symmetric Key', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' },
    { name: 'iv', label: 'Initialization Vector', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' }
];
exports.input = 'text'; //possible options: text (bytes / string), dec, hex
exports.output = 'text';

exports.apply = function(input, parameters, action) {
    var cipher = (action=='encrypt'?forge.cipher.createCipher:forge.cipher.createDecipher)
        ('AES-'+parameters.mode, parameters.key);
    cipher.start({ iv: parameters.iv });
    cipher.update(forge.util.createBuffer(input));			
    if(cipher.finish()) {
        return cipher.output.getBytes();
    } else {
        //TODO ERROR
    }
};

