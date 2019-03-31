var forge = require('node-forge');

exports.name = 'aes';
exports.displayName = 'AES (Advanced Encryption Standard)';
exports.group = 'Symmetric Key Algorithms';
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

exports.apply = function(input, parameters, action) {
    var cipher = (action=='encrypt'?forge.cipher.createCipher:forge.cipher.createDecipher)
        ('AES-'+parameters.mode, parameters.key);
    cipher.start({ iv: parameters.iv });

    //forge.util.ByteBuffer = forge.util.DataBuffer;
    cipher.update(forge.util.createBuffer(input));			
    if(cipher.finish()) {
        return cipher.output.getBytes();
    } else {
        //TODO ERROR
    }
};

