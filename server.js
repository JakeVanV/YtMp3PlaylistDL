const http = require('node:http');
const url = require('node:url')
const fs = require('node:fs')
var events = require('events');
var eventEmitter = new events.EventEmitter();

const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});