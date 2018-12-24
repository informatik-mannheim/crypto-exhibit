global.isNode = true;
global.helper = require('./helper');
const express = require('express');

let app = express(), router = express.Router();

// list all algorithms & build help
global.algorithms = helper.requireAlgorithms();
global.help = helper.groupArray(helper.buildHelp(), 'step');

// set view engine
app.set('view engine', 'ejs');

// expose static folders
['css', 'ext', 'img', 'js'].forEach((folder) => {
    app.use('/'+folder, express.static(folder));
});

// expose static files
['/favicon.ico'].forEach((path) => {
    app.get(path, function(req, res) {
        res.sendFile(path.substr(1), { root: __dirname });
    });
});

// temporary landing page
app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Coming soon...');
});

// expose index template
app.get('/preview', (req, res) => {
    res.render('index');
});

// listen to the server
app.listen(5000, 'localhost');