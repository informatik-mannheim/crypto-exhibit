importScripts('../ext/polyfill/polyfill.min.js');
importScripts('../ext/requirejs/require.min.js');

var window = self, shared;

requirejs.config({
    baseUrl: '',
    paths: {
        'amd-loader': '../ext/amd-loader', 'cjs': '../ext/cjs',
        'node-forge': '../ext/forge/forge.min'
    }
});

requirejs(['cjs!shared'], function(module) {
    shared = module;
});

self.addEventListener('message', function(message) {
    shared.requireAlgorithm(message.data.algorithm).then(function(module) {
        var apply = module.apply||module[message.data.action];
        if(typeof apply!=='function') {
            //TODO
        }

        // execute the algorithm and calculate the time it needed
        var startTime = performance.now(),
            result = apply(message.data.input, message.data.parameters, message.data.action),
            time = performance.now()-startTime;
        
        self.postMessage({
            // send back algorithm, action and tab, in order for the callee to know whether it was his message
            algorithm: message.data.algorithm, action: message.data.action, tab: message.data.tab,
            // also pass the result and time it took to execute the algorithm
            result: result, time: time
        });
    });
});