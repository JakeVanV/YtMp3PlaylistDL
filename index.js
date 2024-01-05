const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cacheutil = require('./cacheutil.js')
const cmdutils = require('./cmdutils.js');
const io = new Server(server);

app.get('/*', (req, res) => {
    console.log(req.url)
    res.sendFile(__dirname + req.url)
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('submit url', (msg) => {
        console.log('Downloading: ' + msg)
        //https://www.youtube.com/playlist?list=PL5tiQxdILpcBBqMM2xkOKVJwhhNkmoUdz
        cmdutils.getVideoURLs(msg, function (urls){
            for (let i = 0; i < urls.length; i++){
                console.debug("video url: " + urls[i][0] + " title: " + urls[i][1])
            }
            socket.emit("url_list", urls)

            downloadAndSendComplete(socket, urls, 0);
        })
    })
});
function downloadAndSendComplete(socket, urls, i){
    console.debug('Downloading/sendcomplete: ' + i);
    if(i === urls.length){
        console.debug('done d');
        cmdutils.zipFiles(urls, (fname) => {
            socket.emit('all_done', fname);
        });
        return;
    }
    let vid = cacheutil.getCachedVideo(urls[i][0]);
    if(vid === undefined){
        console.debug('Video not in cache');
        cmdutils.downloadVideo(urls[i][0], (ret) => {
            downloadAndSendComplete(socket, urls, i+1);
            socket.emit('dl_complete', i);
        });
    }else{
        downloadAndSendComplete(socket, urls, i+1);
        socket.emit('dl_complete', i);
    }
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});