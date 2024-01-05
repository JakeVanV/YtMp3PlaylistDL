var socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
    const node = document.getElementById("subbtn");
    node.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            submit();
        }
    });
});

function getPlaylistUrl(){

}
function submit(){
    console.debug('sbmit fured')
    const url = document.getElementById("urlbox").value;
    socket.emit('submit url', url);
    setLoadBarName("Fetching metadata...");
}

function download(){
    window.open(dl_url);
}

let total = 0;
socket.on('url_list', function (urls){
    console.debug(urls)
    let p = document.getElementById("load1");
    for (let i = 0; i < urls.length; i++){
        let cl = null;
        if(i === 0){
            cl = p;
        }else{
            cl = p.cloneNode(true);
        }

        cl.setAttribute("id", "load" + (i+1));
        let qs = cl.querySelector(".load_bar_loading")
        qs.innerHTML = urls[i][1] + " (" + urls[i][0] + ")"
        p.parentElement.append(cl);
    }
    total = urls.length;
});
let barPct = 0;
let completed = 0;

function setLoadBarName(st){
    document.getElementById('flb_text').innerHTML = st;
}

socket.on('dl_complete', function (i){
    setLoadBarName("");
    i += 1;
    let bar = document.getElementById('load' + i);
    let qs = bar.querySelector(".load_bar_checkbox");
    qs.classList.add('load_bar_checkbox_done')

    completed++;
    barPct = (completed/total)*100.0;
    console.debug('Finished downloading single: ' + barPct);
});
let dl_url = null;
socket.on('all_done', function (fname){
    console.debug('Finished downloading all: ' + fname);
    barPct = 100;
    window.open('paks/' + fname);
    document.getElementById('dl_btn').removeAttribute('disabled');
    dl_url = 'paks/' + fname;
});

let current = 0;
function main_loop(){
    console.debug('ran main loop');
    let elem = document.getElementById('flb');
    if(elem){
        console.debug('barpct: ' + barPct);
        if(barPct > 0){
            console.debug('3');
            if(current < barPct){
                current+= 0.1;
                console.debug('4');
            }
            elem.setAttribute("style","width:" + current + '%')
            console.debug(current);
        }
    }
    setTimeout(main_loop, 10);
}
main_loop();