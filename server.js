var express = require('express');
var app = express();
var router = express.Router();

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
    res.end('Coming soon ...');
});

// expose index template
app.get('/preview', (req, res) => {
    res.render('index');
});

// listen to the server
app.listen(5000, 'localhost');