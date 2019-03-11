exports.name = 'rot';
exports.displayName = 'ROT-N (Rotate by N) / Caesar Chiffre';
exports.group = 'Substitution Ciphers';
exports.parameters = [
    { name: 'places', label: 'Rotate by Places', type: 'number', value: '13', placeholder: 'TODO' }
];
exports.input = exports.output = 'text';

exports.apply = function(input, parameters, action) {
	var places = (action=='encrypt'?1:-1)*parameters.places;
	return input.replace(/[a-zA-Z]/g, function(character){
		return String.fromCharCode((character<='Z'?90:122)>=(character=
			character.charCodeAt(0)+((places%26+26)%26))?character:character-26);
	});
};