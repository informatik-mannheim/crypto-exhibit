const glob = require('glob');
const path = require('path');
const assert = require('assert');

exports.groupArray = require('group-array');

exports.requireAlgorithm = function(nameOrPath) {
    let name = path.basename(nameOrPath, '.js');
    process.stdout.write("Loading algorithm '"+name+"'... ");

    try {
        var algorithm = require(nameOrPath);
        ['name', 'displayName', 'apply'].forEach(required=>
            assert(algorithm[required], "Algorithm '"+required+"' missing"));
        algorithm.group = algorithm.group||'Miscellaneous';

        process.stdout.write("OK\n")
        return algorithm;
    } catch(e) {
        process.stdout.write('Failed ('+e+')\n');
    }
};

exports.requireAlgorithms = function() {
    console.log('Loading algorithms...');
    return glob.sync('js/algorithms/*.js', { absolute: true }).filter(path=>!path.endsWith('.min.js'))
        .map(path=>(exports.requireAlgorithm(path))).filter(algorithm=>algorithm); //remove undefined algorithms (failed to load)
};