String.prototype.rot = function(places) {
	return this.replace(/[a-zA-Z]/g, function(character){
		return String.fromCharCode((character<='Z'?90:122)>=(character=
			character.charCodeAt(0)+((places%26+26)%26))?character:character-26);
	});
};

exports.name = 'rot';
exports.displayName = 'ROT-N (Rotate by N) / Caesar Chiffre';
exports.group = 'Substitution Ciphers';

exports.apply = function(input, parameters, action) {
	input.rot((action=="encrypt"?1:-1)*parameters.places);
};