var forge = require('node-forge');

exports.name = 'rc2';
exports.displayName = 'RC2 (Rivest Cipher / Ron\'s Code)';
exports.group = 'Symmetric Key Algorithms';
exports.parameters = [
    { name: 'key', label: 'Symmetric Key', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' },
    { name: 'iv', label: 'Initialization Vector', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(8)', placeholder: 'TODO' }
];

exports.apply = function(input, parameters, action) {
    var key = parameterValue(tab, algorithm, 'key'), iv = parameterValue(tab, algorithm, 'iv');
			
    var cipher = (encrypt?forge.rc2.createEncryptionCipher:forge.rc2.createDecryptionCipher)(key);
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(input));			
    if(cipher.finish()) {
        output = convert(cipher.output).from('text').to(mode);
    } else {
        //TODO ERROR
    }
};