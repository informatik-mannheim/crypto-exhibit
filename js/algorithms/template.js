var forge = require('node-forge');

exports.name = 'template';
exports.displayName = 'Template Algorithm (will NOT be shown on the UI!)';
exports.group = 'Template Algorithms';
// note: for algorithms with only one action, the shortcut exports.action = 'action' can be use instead, default value
exports.actions = ['encrypt', 'decrypt'];
exports.parameters = [
    {
        name: 'select', label: 'Select Box', type: 'select', value: 'valueC', options: [
            { value: 'valueA', label: 'Option A' },
            { value: 'valueB', label: 'Option B' },
            { value: 'valueC', label: 'Option C' }
        ]
    },
    { name: 'text', label: 'Some Text', type: 'text', value: 'A static value', placeholder: 'TODO' },
    { name: 'editor', label: 'An Editor', type: 'editor(hex)', value: 'cryptoExhibit.util.randomBytes(16)', placeholder: 'TODO' }
];
// possible options: text (bytes / string), dec, hex; default values are:
// note: for algorithms with only one action the shortcuts exports.input = 'text', exports.output = 'hex' can be use instead
exports.input = 'text';
exports.output = 'text';

// note: for algorithms with multiple actions, the shortcuts exports[action] (e.g. exports.encrypt) can be used instead of one general apply function
exports.apply = function(input, parameters, action) {
    // apply the algorithm to the input here
    // all specified parameters are passed to the function as parameters[name]
    return input+input; // return the result in the output format 
};