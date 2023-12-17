const audio = document.querySelector(".audio");
const audioTrackInput = document.querySelector("#file");

const playBtn = document.querySelector(".play");
const pauseBtn = document.querySelector(".pause");
const forwardBtn = document.querySelector(".fr");
const backwardBtn = document.querySelector(".br");

const progressBar = document.querySelector(".fluid");
const audioName = document.querySelector("#nm");

const uploadAudio = document.querySelector("#chn");

const currentTiming = document.querySelector(".ct");
const maxTime = document.querySelector(".et");

const welBg = document.querySelector(".wel-bg");
const welCard = document.querySelector(".wel-card");

const Body = document.querySelector("body");

const chooseBtn = document.querySelector(".choose");

const progressArea = document.querySelector("#pr");

const volCard = document.querySelector(".vol-card");
const volBg = document.querySelector(".vol-bg");
const volLabel = document.querySelector("#lbl");
const volInput = document.querySelector("#vol");
const volBtn = document.querySelector("#vol-btn");
const doneBtn = document.querySelector(".done");

const setBg = document.querySelector(".set-bg");
const setCard = document.querySelector(".set-card");
const closeSetCardBtn = document.querySelector(".close");
const settingsBtn = document.querySelector("#set");

const linkBg = document.querySelector(".li-bg");
const linkCard = document.querySelector(".li-card");
const linkCardCloseBtn = document.querySelector(".cl");
const linkInput = document.querySelector(".in");
const linkPlayBtn = document.querySelector(".cn");

const playWithLinkBtn = document.querySelector("#pl");
const changeTrackBtn = document.querySelector("#cq");
const reportIssuesBtn = document.querySelector("#re");


OpenResult();

reportIssuesBtn.addEventListener("click",(e) => {
    alert("Please wait while your request is being processed...");
    const url = 'https://github.com/blazeinferno64/blaze-audio-player/issues';
    setTimeout(() => {
        window.location.href = url;
    }, 3000);
})

changeTrackBtn.addEventListener("click",(e) => {
    CloseSettings();
    audioFileInput.click();
})

playWithLinkBtn.addEventListener("click",(e) => {
    OpenLink();
})

linkCardCloseBtn.addEventListener("click",(e) => {
    CloseLink();
})

linkInput.addEventListener("input",(e) => {
    if(linkInput.value.length < 4) {
        linkPlayBtn.classList.add("none");
    }
    else{
        linkPlayBtn.classList.remove("none");
    }
})

linkPlayBtn.addEventListener("click",(e) => {
    audio.src = `${linkInput.value}`;
    const fieldItem = linkInput.value.substring(linkInput.value.lastIndexOf("/") + 1);
    audioName.innerText = fieldItem;
    audio.load();
    audio.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';

    setTimeout(() => {
        CloseLink();
    }, 500);
})

settingsBtn.addEventListener("click",(e) => {
    OpenSettings();
})

closeSetCardBtn.addEventListener("click",(e) => {
    CloseSettings();
})

volLabel.innerText = `${volInput.value}%`;

volInput.addEventListener("input",(e) => {
    volLabel.innerText = `${volInput.value}%`;
})

volInput.addEventListener("input",(e) => {
    volLabel.innerText = `${volInput.value}%`;
    audio.volume = e.currentTarget.value/100;
})

volBtn.addEventListener("click",(e) => {
    OpenVol();
})

doneBtn.addEventListener("click",(e) => {
    CloseVol();
})

chooseBtn.addEventListener("click",(e) => {
    audioTrackInput.click();
    CloseResult();
})


uploadAudio.addEventListener("click",(e) => {
    audioTrackInput.click();
})

progressArea.addEventListener("click",(e) => {
    let progressWidth = progressArea.clientWidth;

    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    audio.play();
})

playBtn.addEventListener("click",(e) => {
    if(audioTrackInput.files.length == 0){
        alert("Please select an audio file to play!");
        OpenResult();
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

audioTrackInput.onchange = function(){
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
            maxTime.innerHTML = '0';
        }
        maxTime.isNaN = function(){}
        maxTime.innerHTML = min + ':' + sec;
    }, 10);
}

forwardBtn.onclick = function(){
    if(audioTrackInput.files[0].length == 0){
        alert("Please choose an audio file first!");
        audioFileInput.click();
    }
    else{
        audio.currentTime +=5; 
    }
}

backwardBtn.onclick = function(){
    if(audioTrackInput.files[0].length == 0){
        alert("Please choose an audio file first!");
        audioFileInput.click();
    }
    else{
        audio.currentTime -=5;
    }
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

function OpenLink() {
    linkBg.classList.remove("hide");
    linkCard.classList.add("ani");
    linkCard.classList.remove("hide");

    setTimeout(() => {
        linkCard.classList.remove("down");
    }, 500);
}

function CloseLink() {
    linkCard.classList.add("up");
    linkCard.classList.add("anti");
    setTimeout(() => {
        linkCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        linkBg.classList.add("hide");
        linkCard.classList.remove("anti");
        linkCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        linkCard.classList.add("down");
        linkCard.classList.remove("up");
        linkCard.classList.remove("ani");
    }, 1200);
}

function OpenSettings() {
    setBg.classList.remove("hide");
    setCard.classList.add("ani");
    setCard.classList.remove("hide");

    setTimeout(() => {
        setCard.classList.remove("down");
    }, 500);
}

function CloseSettings () {
    setCard.classList.add("up");
    setCard.classList.add("anti");
    setTimeout(() => {
        setCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        setBg.classList.add("hide");
        setCard.classList.remove("anti");
        setCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        setCard.classList.add("down");
        setCard.classList.remove("up");
        setCard.classList.remove("ani");
    }, 1200);
}

function OpenVol() {
    volBg.classList.remove("hide");
    volCard.classList.add("ani");
    volCard.classList.remove("hide");

    setTimeout(() => {
        volCard.classList.remove("down");
    }, 500);
}

function CloseVol () {
    volCard.classList.add("up");
    volCard.classList.add("anti");
    setTimeout(() => {
        volCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        volBg.classList.add("hide");
        volCard.classList.remove("anti");
        volCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        volCard.classList.add("down");
        volCard.classList.remove("up");
        volCard.classList.remove("ani");
    }, 1200);
}

function OpenResult() {
    welBg.classList.remove("hide");
    welCard.classList.add("ani");
    welCard.classList.remove("hide");

    setTimeout(() => {
        welCard.classList.remove("down");
    }, 500);
}

function CloseResult () {
    welCard.classList.add("up");
    welCard.classList.add("anti");
    setTimeout(() => {
        welCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        welBg.classList.add("hide");
        welCard.classList.remove("anti");
        welCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        welCard.classList.add("down");
        welCard.classList.remove("up");
        welCard.classList.remove("ani");
    }, 1200);
}