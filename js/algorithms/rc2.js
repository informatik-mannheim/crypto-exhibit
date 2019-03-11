var forge = require('node-forge');

exports.name = 'rc2';
exports.displayName = 'RC2 (Rivest Cipher / Ron\'s Code)';
exports.group = 'Symmetric Key Algorithms';
exports.parameters = [
    { name: 'key', label: 'Symmetric Key', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' },
    { name: 'iv', label: 'Initialization Vector', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(8)', placeholder: 'TODO' }
];

exports.apply = function(input, parameters, action) {
    var cipher = (action=='encrypt'?forge.rc2.createEncryptionCipher:forge.rc2.createDecryptionCipher)(parameters.key);
    cipher.start(parameters.iv);
    cipher.update(forge.util.createBuffer(input));			
    if(cipher.finish()) {
        return cipher.output;
    } else {
        //TODO ERROR
    }
};