const exec = require('child_process').exec;
const cu = require('./cacheutil.js')
const {onVideoDownload, getCachedVideo} = require("./cacheutil");
var archiver = require('archiver');
var fs = require('fs');
const e = require("express");
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}

module.exports.getVideoURLs = function (url, callback){
    execute(".\\ytdl\\ytdl.exe "+url+" -j --flat-playlist -4", function (ret) {
        console.debug('done downloading log');
        const urls = []
        ret.split("\n").forEach(function(x){
            if(x.length > 1){
                let vidJson = JSON.parse(x);
                urls.push([vidJson.id, vidJson.title])
            }
        })
        callback(urls)
    })
}

module.exports.downloadVideo = function (url, callback){
    let cv = getCachedVideo(url)
    if(cv !== undefined){
        console.debug('video ' + url + ' already exists');
        callback();
        return;
    }
    execute("cd ytdl && .\\ytdl.exe -x -4 --audio-format mp3 "+url+"", function (ret) {
        // onVideoDownload(url)
        const firstIndex = "[download] Destination: "
        let fileName = ret.substring(
            ret.indexOf(firstIndex) + firstIndex.length,
            ret.indexOf(".webm")
        )
        fileName += ".mp3"
        console.debug(ret)
        console.debug("filename::" + fileName)

        onVideoDownload(url, fileName)
        callback(url)
    })
}

function getHash(urls){

}

module.exports.zipFiles = function(urls, callback){
    let now = Date.now() + '.zip';
    var output = fs.createWriteStream('paks/' + now);
    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', function(err){
        throw err;
    });

    archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
    for (let i = 0; i < urls.length; i++){
        try{
            const file1 = __dirname + '/ytdl/' + urls[i][1] + " [" + urls[i][0] +"].mp3";
            if(fs.existsSync(file1)){
                archive.file(file1, { name: urls[i][1] + ".mp3"});
            }
        }catch (error){
            console.debug('file ' + urls[i][1] + " not found");
        }

    }

    archive.finalize().then(() => callback(now));
}

//module.exports.downloadVideo("https://www.youtube.com/watch?v=VibGncxcaAE", (ret) => console.debug(ret));


// Gets a list of video urls based on playlist url
// module.exports.getVideoURLs("https://www.youtube.com/playlist?list=PL5tiQxdILpcCzBS9ZRvino9cH6omVbviu", function (urls){
//     for (let i = 0; i < urls.length; i++){
//         console.debug("video url: " + urls[i])
//     }
// })