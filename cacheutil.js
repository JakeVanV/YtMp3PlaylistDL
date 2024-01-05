const fs = require('node:fs');

let videoCache = {}
function readCache(){
    const data = fs.readFileSync('cache.json', 'ascii');
    videoCache = JSON.parse(data)
}

function saveCache(){
    fs.writeFile('cache.json', JSON.stringify(videoCache), {flag: 'w+'},err => {
        if(err){
            console.error(err);
        }
    })
}

readCache();

function getCachedVideo(url){
    return videoCache[url]
}
function onVideoDownload(url, file){
    videoCache[url] = file.replace('｜', '');
    saveCache();
}


module.exports = {readCache, saveCache, getCachedVideo, onVideoDownload}