const playBtn = document.querySelector(".play");
const pauseBtn = document.querySelector(".pause");

const forwardBtn = document.querySelector(".forward");
const backwardBtn = document.querySelector(".backward");

const progressBar = document.querySelector(".fluid");
const progressArea = document.querySelector(".progress-bar");

const currentTiming = document.querySelector("#current");
const endTiming = document.querySelector("#end");

const audio = document.querySelector(".audio");

const audioName = document.querySelector("#file-name");

const audioFileInput = document.querySelector("#thefile");

const welcomeBg = document.querySelector(".welcome-bg");

const changeTrackBtn = document.querySelector(".change");

const uploadAnotherTrackBtn = document.querySelector(".up");

const volumeInput = document.querySelector("#volume");
const volumeLevel = document.querySelector("#lvl");

const audioLinkerButton = document.getElementById("linker-btn");
const audioLinkerInput = document.getElementById("url-linker");
const audioLinkerBg1 = document.querySelector("#aud-bg");

const fetchReqUrlInput = document.querySelector("#req-url");
const fetchReqSendBtn = document.querySelector("#req-btn");
const reqStatus = document.querySelector(".status");

const uploadBtn = document.querySelector(".upload-btn");

audioLinkerButton.addEventListener("click",(e) => {
    const fieldItem = audioLinkerInput.value.substring(audioLinkerInput.value.lastIndexOf("/") + 1);

    if(document.getElementById("url-linker").value.length < 4){
        alert("Please enter a valid url")
    }
    else{
        audio.src = `${audioLinkerInput.value}`;
        audioLinkerBg1.classList.add("hide");
        audioName.innerText = fieldItem;
        audio.load();
        audio.play();
    }
})


uploadBtn.addEventListener("click",(e) => {
    audioFileInput.click();
    welcomeBg.classList.add("hide");
})

uploadAnotherTrackBtn.addEventListener("click",(e) => {
    audioFileInput.click();
})

changeTrackBtn.addEventListener("click",(e) => {
    audioFileInput.click();
})

playBtn.addEventListener("click",(e) => {
    if(audioFileInput.files.length == 0){
        alert("Please select an audio file to play!");
        welcomeBg.classList.remove("hide");
    }
    else{
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        audio.play();
    }
})

pauseBtn.addEventListener("click",(e) => {
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
    audio.pause();
})

progressArea.addEventListener("click",(e) => {
    let progressWidth = progressArea.clientWidth;

    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    audio.play();
})



audioFileInput.onchange = function(){
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    var name = this.files[0].name;
    audioName.innerText = name;

    setInterval(() => {
        var min = Math.floor(audio.duration / 60);
        var sec = Math.floor(audio.duration % 60);

        if (sec < 10) {
            sec = '0' + String(sec);
        }
        if(min==NaN){
            endTiming.innerHTML = '0';
        }
        endTiming.isNaN = function(){}
        endTiming.innerHTML = min + ':' + sec;
    }, 10);
}


setInterval(function(){
    var mins = Math.floor(audio.currentTime / 60);
    var secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    currentTiming.innerHTML = mins + ':' + secs;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const percent = (currentTime / duration)*100;
    progressBar.style.width = `${percent}%`;
    if(audio.currentTime == audio.duration){
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
    }
},10);

volumeInput.addEventListener("input",(e) => {
    volumeLevel.innerText = `${volumeInput.value}%`;
    audio.volume = e.currentTarget.value/100;
})

forwardBtn.onclick = function(){
    if(audioFileInput.files.length == 0){
        alert("Please choose an audio file first!");
        audioFileInput.click();
    }
    else{
        audio.currentTime +=5; 
    }
}

backwardBtn.onclick = function(){
    if(audioFileInput.files.length == 0){
        alert("Please choose an audio file first!");
        audioFileInput.click();
    }
    else{
        audio.currentTime -=5;
    }
}


fetchReqSendBtn.addEventListener("click",(e) => {
    if(fetchReqUrlInput.value.length <= 4){
        alert("Please enter a valid url!");
    }
    else{
        reqStatus.classList.remove("green");
        reqStatus.classList.remove("red");
        reqStatus.classList.add("white");
        reqStatus.innerText = 'Sending...';
        setTimeout(() => {
            fetchFile(fetchReqUrlInput.value);
        }, 1500);
    }
})

function fetchFile(url){
    fetch(url)
    .then(res => res.blob())
    .then(file => {
        var audioFile = URL.createObjectURL(file);
        audio.src = `${audioFile}`;
        audio.load();
        audio.play();
        const aTag = document.createElement("a");
        aTag.href = audioFile;
        aTag.download = url.replace(/^.*[\\\/]/, '');
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
        setTimeout(() => {
            reqStatus.classList.add("green");
            reqStatus.classList.remove("red");
            reqStatus.classList.remove("white");
            reqStatus.innerText = 'Request was successfull!'
        }, 3000);
    })
    .catch((err) => {
        console.error(err);
        reqStatus.classList.remove("green");
        reqStatus.classList.add("red");
        reqStatus.classList.remove("white");
        reqStatus.innerText = err;
    })
}