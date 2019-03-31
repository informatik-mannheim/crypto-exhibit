var forge = require('node-forge');

exports.name = 'des';
exports.displayName = 'DES (Data Encryption Standard)';
exports.group = 'Symmetric Key Algorithms';
exports.parameters = [
    { 
        name: 'mode', label: 'Mode of Operation', type: 'select', value: 'CBC', options: [
            { value: 'ECB', label: 'Electronic Codebook (ECB)' },
            { value: 'CBC', label: 'Cipher Block Chaining (CBC)' }
        ]
    },
    { name: 'triple', label: 'Enforce to always use Triple-DES', type: 'checkbox', value: 'false', },
    { name: 'key', label: 'Symmetric Key', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' },
    { name: 'iv', label: 'Initialization Vector', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' }
];

exports.apply = function(input, parameters, action) {
    var cipher = (action=='encrypt'?forge.cipher.createCipher:forge.cipher.createDecipher)(
        (parameters.triple?'3':String())+'des-'+parameters.mode, parameters.key);
    cipher.start({iv: parameters.iv});
    cipher.update(forge.util.createBuffer(input));			
    if(cipher.finish()) {
        return cipher.output.getBytes();
    } else {
        //TODO ERROR
    }
};

