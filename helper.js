const fs = require('fs');
const glob = require('glob');
const path = require('path');
const assert = require('assert');
const marked = require('marked');

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

exports.buildHelp = function() {
    console.log('Building help...');
    return glob.sync('help/**/*.md').map(path=>{
        let help = /help\/step(\d+)\/(?:algorithms\/(\w+)\/)?(\w+)\.md/.exec(path)
        if(!help) {
            console.log("Could not determine step / name / algorithm for help file at '"+path+"'")
            return null;
        }

        let tokens = marked.lexer(fs.readFileSync(path, 'utf8')),
            title = tokens.splice(0, 1)[0];
        if(!title||title.type!='heading') {
            console.log("No title defined for help file at '"+path+"'")
            return null;
        }

        return { step: help[1], algorithm: help[2]||'all', name: help[3], title: title.text, content: marked.parser(tokens) };
    }).filter(help=>help); //remove undefined help (failed to parse)
}