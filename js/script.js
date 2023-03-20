const audio = document.getElementById('audio')
const play = document.getElementById('play')
const pause = document.getElementById('pause')
const file = document.getElementById('thefile')
const volume = document.getElementById('volume')
const volup = document.getElementById('vol-up')
const voldown = document.getElementById('vol-down')
const audiolength = document.getElementById('audio-length')
const timer = document.getElementById('current-time')
const endtime = document.getElementById('end-time')
var minutes = Math.floor(audio.duration / 60);
var seconds = Math.floor(audio.duration % 60);
const forward = document.getElementById('forward')
const backward = document.getElementById('backward')
const btn = document.getElementById('btn')
const link = document.getElementById('link')
const img = document.getElementById('img')
//const mins = parseFloat((audio.duration)/60).toFixed(2)
//const sec = parseFloat((audio.duration)%60).toFixed(2)
var update = setInterval(function(){
    var mins = Math.floor(audio.currentTime / 60);
    var secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    timer.innerHTML = mins + ':' + secs;
    audiolength.value = Math.floor(audio.currentTime);
},10);

play.onclick = function(){
    audio.play();
    play.style.display = 'none';
    pause.style.display = 'inline-block';
}
pause.onclick = function(){
    audio.pause();
    play.style.display = 'initial';
    pause.style.display = 'none';
}
file.onchange = function() {
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    play.style.display = 'none';
    pause.style.display = 'inline-block';
    audio.load();
    audio.play();
    var end = setInterval(function(){
        var min = Math.floor(audio.duration / 60);
        var sec = Math.floor(audio.duration % 60);
        if (sec < 10) {
            sec = '0' + String(sec);
        }
        if(min==NaN){
            endtime.innerHTML = '0';
        }
        endtime.isNaN = function(){}
        endtime.innerHTML = min + ':' + sec;
    },10);
}
//setTimeout(swipe,20000);

//function swipe(){
  //  img.setAttribute('src','../img/hand-drawn-flat-design-mountain-landscape_23-2149158786.avif');
    //setTimeout(fun,10000);
    //function fun(){
      //  img.setAttribute('src','../img/beautiful-gradient-spring-landscape_23-2148448598.avif');
    //}
//}

btn.onclick = function(){
    //var files = this.urls;
    //audio.src = URL.createObjectURL(files[0]);
    audio.src = link.value;
    play.style.display = 'none';
    pause.style.display = 'inline-block';
    audio.load();
    audio.play();
    var end = setInterval(function(){
        var min = Math.floor(audio.duration / 60);
        var sec = Math.floor(audio.duration % 60);
        if (sec < 10) {
            sec = '0' + String(sec);
        }
        if(min==NaN){
            endtime.innerHTML = '0';
        }
        endtime.isNaN = function(){}
        endtime.innerHTML = min + ':' + sec;
    },10);
}

volume.addEventListener("input",(e) =>{
    audio.volume = e.currentTarget.value/100;
})
volup.onclick = function(){
    audio.volume = 100.0;
}
voldown.onclick = function(){
    audio.mute;
}
forward.onclick = function(){
    audio.currentTime +=5
}
backward.onclick = function(){
    audio.currentTime -=5
}
