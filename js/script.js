const audio = document.querySelector("#audio");

const playBtn = document.querySelector(".play-btn");
const pauseBtn = document.querySelector(".pause-btn");

const forwardBtn = document.querySelector("#forward");
const backwardBtn = document.querySelector("#backward");

const volumeRange = document.querySelector(".volume-bar");
const volumeInfo = document.querySelector(".vol-info");
const volumeInfoParent = document.querySelector(".volume-info");

const progressArea = document.querySelector(".progress-area");
const progressBar = document.querySelector(".progress-bar");

const audioFile = document.querySelector("#file");
//const uploadBox = document.querySelector(".upload-box");

const time = document.querySelector("#cuurent-time");
const maxTime = document.querySelector("#max-time");

const filename = document.querySelector("#name");

const uploadBtn = document.querySelector("#btn");

const navList1 = document.querySelector(".list");

const crossLinkPlayBtn = document.querySelector(".submit");
const crossLinkAudioInput = document.querySelector(".field");
const forms = document.querySelector("#form");

const container = document.querySelector(".container");

const inputAudioLinkBackground1 = document.querySelector(".input-link");



document.addEventListener("keydown",(e) => {
    if(e.keyCode === 13){
        if(audioFile.value === ""|audioFile. value == null){
            alert("Please select an Audio Track First");
            audioFile.click();
        }
        else{
            if(playBtn.style.display == 'flex'){
                if(e.keyCode === 13){
                    audio.play();
                    pauseBtn.style.display = 'flex';
                    playBtn.style.display = 'none';
                }
            }
            else{
                if(playBtn.style.display == 'none'){
                    if(e.keyCode === 13){
                        audio.pause();
                        pauseBtn.style.display = 'none';
                        playBtn.style.display = 'flex';
                    }
                }
            }
        }
    }
    else{
        console.log(e);
    }
})

container.addEventListener("contextmenu",(e) => {
    e.preventDefault();
    if(audioFile.value === ""|audioFile. value == null){
        alert("Please select an Audio Track First");
        audioFile.click();
    }
    else{
        console.log(e)
        /*if(playBtn.style.display == 'flex'){
            if(e.keyCode === 13){
                audio.play();
                pauseBtn.style.display = 'flex';
                playBtn.style.display = 'none';
            }
        }
        else{
            if(playBtn.style.display == 'none'){
                if(e.keyCode === 13){
                    audio.pause();
                    pauseBtn.style.display = 'none';
                    playBtn.style.display = 'flex';
                }
            }
        }*/
    }
})


forms.addEventListener("submit",(e) => {
    e.preventDefault();
    const fieldItem = crossLinkAudioInput.value.substring(crossLinkAudioInput.value.lastIndexOf("/") + 1);
    
    if (crossLinkAudioInput.value === ''| crossLinkAudioInput.value == null){
        filename.innerText = "Select a Track First";
        maxTime.innerText = '0:00';
        alert("Please enter a proper url");
    }
    else{
        audio.src = `${crossLinkAudioInput.value}`;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        audio.load();
        audio.play();
        filename.innerHTML = "<Marquee>" + fieldItem + "</Marquee>";
        setInterval(function(){
            var min = Math.floor(audio.duration / 60);
            var sec = Math.floor(audio.duration % 60);
            if (sec < 10) {
                sec = '0' + String(sec);
            }
            if(min==NaN){
                endtime.innerHTML = '0';
            }
            maxTime.isNaN = function(){}
            maxTime.innerHTML = min + ':' + sec;
        },10);
    }
})

crossLinkPlayBtn.addEventListener("click",function(e){
    e.preventDefault();
    const fieldItem = crossLinkAudioInput.value.substring(crossLinkAudioInput.value.lastIndexOf("/") + 1);
    
    if (crossLinkAudioInput.value === ''| crossLinkAudioInput.value == null){
        filename.innerText = "Select a Track First";
        maxTime.innerText = '0:00';
        alert("Please enter a proper url")
    }
    else{
        audio.src = `${crossLinkAudioInput.value}`;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        audio.load();
        audio.play();
        filename.innerHTML = "<Marquee>" + fieldItem + "</Marquee>";
        setInterval(function(){
            var min = Math.floor(audio.duration / 60);
            var sec = Math.floor(audio.duration % 60);
            if (sec < 10) {
                sec = '0' + String(sec);
            }
            if(min==NaN){
                endtime.innerHTML = '0';
            }
            maxTime.isNaN = function(){}
            maxTime.innerHTML = min + ':' + sec;
        },10);
    }
})

progressArea.addEventListener("click",(e) => {
    let progressWidth = progressArea.clientWidth;

    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    audio.play();
})

uploadBtn.addEventListener("click",(e) => {
    audioFile.click();
})

/*uploadBox.addEventListener("click",(e) => {
    audioFile.click();
})
*/
playBtn.addEventListener("click",(e) => {
    if(audioFile.value.length == 0l){
        alert("Please Select an Audio file first!");
        audioFile.click();
    }
    else{
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        audio.play();
    }
})

setInterval(function(){
    var mins = Math.floor(audio.currentTime / 60);
    var secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    time.innerHTML = mins + ':' + secs;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const percent = (currentTime / duration)*100;
    progressBar.style.width = `${percent}%`;
    if(audio.currentTime == audio.duration){
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
    }
},10);

forwardBtn.onclick = function(e){
    audio.currentTime +=5;
}

backwardBtn.onclick = function(){
    audio.currentTime -=5;
}

pauseBtn.addEventListener("click",(e) => {
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'flex';
    audio.pause();
})

audioFile.onchange = function(e) {
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    audio.load();
    audio.play();
    navList1.style.right = '-100%';
    var name = this.files[0].name;
    filename.innerHTML = "<Marquee>" + name + "</Marquee>";
    setInterval(function(){
        var min = Math.floor(audio.duration / 60);
        var sec = Math.floor(audio.duration % 60);
        if (sec < 10) {
            sec = '0' + String(sec);
        }
        if(min==NaN){
            endtime.innerHTML = '0';
        }
        maxTime.isNaN = function(){}
        maxTime.innerHTML = min + ':' + sec;
    },10);
}


volumeRange.addEventListener("input",(e) => {
    audio.volume = e.currentTarget.value/100;
})

volumeRange.addEventListener("mouseover",(e) => {
    volumeInfoParent.classList.remove("hidden");
})

volumeRange.addEventListener("mouseout",(e) => {
    volumeInfoParent.classList.add("hidden");
})

volumeRange.addEventListener("input",(e) => {
    volumeInfo.innerText = `${volumeRange.value}%`;
})

volumeRange.onchange = function(e){
    volumeInfo.innerText = `${volumeRange.value}%`;
}
