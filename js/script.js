const playBtn = document.querySelector(".play-btn");
const pauseBtn = document.querySelector(".pause-btn");
const forwardBtn = document.querySelector(".forawrd-btn");
const backwardBtn = document.querySelector(".backward-btn");
const audio = document.getElementById('audio');
const forward = document.getElementById('forward');
const backward = document.getElementById('backward');
const audioName = document.getElementById("name");
const uploadBox = document.querySelector(".upload-box");
const file = document.getElementById("thefile");
const audiolength = document.getElementById('audio-length')
const endtime = document.getElementById('end-time')
const timer = document.getElementById('current-time')
const volumeUP = document.getElementById("volume-high");
const volumeDOWN = document.getElementById("volume-low");
const volumeBAR = document.getElementById("volume-bar");
const field = document.querySelector(".field");
const play = document.querySelector(".linker");

uploadBox.addEventListener('click',(e)=>{
    file.click();
});

play.onclick = function(){
    audio.src = `${field.value}`;
    if (field.value === ''| field.value == null){
        audioName.innerText = 'Select an Audio Track first';
    }else{
       // audioName.innerText = `${field.value}`;
          audioName.innerHTML = "<Marquee>" + field.value + "</Marquee>";
    }
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
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

var update = setInterval(function(){
    var mins = Math.floor(audio.currentTime / 60);
    var secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    timer.innerHTML = mins + ':' + secs;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const percent = (currentTime / duration)*100;
    audiolength.style.width = `${percent}%`;
},10);

forward.onclick = function(){
    audio.currentTime +=5;
}

backward.onclick = function(){
    audio.currentTime -=5;
}

volumeUP.onclick = function(){
    audio.volume = 100;
}
volumeDOWN.onclick = function(){
    audio.mute;
}

volumeBAR.addEventListener("input",(e) =>{
    audio.volume = e.currentTarget.value/100;
})


playBtn.onclick = function(){
    audio.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
}
pauseBtn.onclick = function(){
    audio.pause();
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'block';
}
file.onchange = function() {
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
    audio.load();
    audio.play();
    var filename = file.files[0].name;
    audioName.innerHTML = "<Marquee>" + filename + "</Marquee>";
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
};

const toggle = document.getElementById("toggle");
const container = document.querySelector(".container");
const heading = document.getElementById("player-namer");

toggle.addEventListener('input',(e) =>{
    const isChecked = e.target.checked;
    if (isChecked){
        container.classList.add('dark-theme');
        volumeUP.classList.add('dark-theme');
        volumeDOWN.classList.add('dark-theme');
        forwardBtn.classList.add('dark-theme');
        backwardBtn.classList.add('dark-theme');
        uploadBox.classList.add('dark-theme');
        field.classList.add('dark-theme');
    }else{
        container.classList.remove('dark-theme');
        volumeUP.classList.remove('dark-theme');
        volumeDOWN.classList.remove('dark-theme');
        forwardBtn.classList.remove('dark-theme');
        backwardBtn.classList.remove('dark-theme');
        uploadBox.classList.remove('dark-theme');
        field.classList.remove('dark-theme');
    }
});
