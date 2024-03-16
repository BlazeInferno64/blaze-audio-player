const fileInput = document.querySelector("#thefile");
const audio = document.querySelector("#audio");

// Now lets declare the controller buttons 
const playBtn = document.querySelector(".play-btn");
const pauseBtn = document.querySelector(".pause-btn");
const forwardBtn = document.getElementById("fr");
const backwardBtn = document.getElementById("br");

const progressBar = document.querySelector(".progress-bar");
const progressBarFluid = document.querySelector(".fluid");

const audioTrackName = document.querySelector(".info");
const maxTiming = document.querySelector("#end-time");
const currentTiming = document.querySelector("#current-time");

const changeAudioFileBtn = document.querySelector(".ch");

const changeAudioFile = document.querySelector("#ct");
const githubIssuesBtn = document.querySelector("#issues");
const devLinkBtn = document.querySelector("#bl");

const volumeInput = document.querySelector("#range");
const volumeOutput = document.querySelector(".vol-info");

const chooseBtn = document.querySelector(".choose");

const project = document.querySelector(".git");

let previousURL = null;

audio.addEventListener("load",(e) => {
    console.log("Audio file successfully loaded!");
})
audio.addEventListener("play",(e) => {
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
})

audio.addEventListener("pause",(e) => {
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'block';
})

const trimLastPart = (value) => {
    const trimmedValue = value.substring(value.lastIndexOf("/") + 1);
    audioTrackName.innerText = trimmedValue;
}

const updateTimeing = () => {
    var min = Math.floor(audio.duration / 60);
    var sec = Math.floor(audio.duration % 60);
    if (sec < 10) {
        sec = '0' + String(sec);
    }
    maxTiming.innerText = `${min}:${sec}`
}

const showCurrentTiming = () => {
    var mins = Math.floor(audio.currentTime / 60);
    var secs = Math.floor(audio.currentTime % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    currentTiming.innerText = `${mins}:${secs}`;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const percent = (currentTime / duration) * 100;
    progressBarFluid.style.width = `${percent}%`;
    if(audio.currentTime == audio.duration){
        audio.pause();
    }
}

const getAudioFile = (file,fileURL) => {
    fetch(fileURL)
    .then(res => {
        if(!res.ok){
            throw Error(`An error occured!`)
        }
        return res.blob();
    })
    .then(data => {
        audioTrackName.innerText = file.name;
        audio.src = fileURL;
        audio.load();
        audio.play();
        setInterval(updateTimeing,10);
        setInterval(showCurrentTiming,10);
    })
    .catch((err) => {
        console.log(`An error occured! :${err}`);
    })
}

chooseBtn.addEventListener("click",(e) => {
    fileInput.click();
})

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if(!file){
        return;
    }
    closeWelcomeCard();
    const bloblURL = URL.createObjectURL(file);
    getAudioFile(file,bloblURL);
    if(previousURL){
        URL.revokeObjectURL(previousURL);
        console.log(`Previous object url has been successfully released from browser memory`)
    }
}

project.addEventListener("click",(e) => {
    alert("Processing...");
    setTimeout(() => {
        window.location.href = 'https://github.com/blazeinferno64/blaze-audio-player/'
    }, 2000);
})

changeAudioFileBtn.addEventListener("click",(e) => {
    fileInput.click();
})

changeAudioFile.addEventListener("click",(e) => {
    fileInput.click();
})

githubIssuesBtn.addEventListener("click",(e) => {
    alert("Please wait while your request is being processed...");
    setTimeout(() => {
        window.location.href = `https://github.com/blazeinferno64/blaze-audio-player/issues`;
    }, 3000);
})

devLinkBtn.addEventListener("click",(e) => {
    window.location.href = `https://github.com/blazeinferno64`;
})

playBtn.addEventListener("click",(e) => {
    /*if(audio.src === ""|| audio.src == null) {
        alert("No audio file has been selected for playing!");
        fileInput.click();
    }*/
    audio.play();
})

pauseBtn.addEventListener("click",(e) => {
    audio.pause();
})

forwardBtn.addEventListener("click",(e) => {
    audio.currentTime +=5;
})

backwardBtn.addEventListener("click",(e) => {
    audio.currentTime -=5;
})


progressBar.addEventListener("click",(e) => {
    let progressWidth = progressBar.clientWidth;

    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;
    audio.play();
})

progressBarFluid.addEventListener("mousedown",(e) => {
    let OffsetX = e.offsetX;
    progressBarFluid.addEventListener("mousemove",(e) => {
        let progressWidth = progressBar.clientWidth;

        progressBarFluid.style.width = `${e.clientX}`
    })
    progressBarFluid.addEventListener("mouseup",(e) => {
        audio.currentTime = (OffsetX / progressWidth) * audio.duration;
        audio.play();
    })
})

progressBarFluid.addEventListener("touchstart",(e) => {
    let OffsetX = e.offsetX;
    let progressWidth = progressBar.clientWidth;
    progressBarFluid.addEventListener("touchmove",(e) => {

        progressBarFluid.style.width = `${e.clientX}`
    })
    progressBarFluid.addEventListener("touchend",(e) => {
        audio.currentTime = (OffsetX / progressWidth) * audio.duration;
        audio.play();
    })
})

volumeInput.addEventListener("input",(e) => {
    volumeOutput.innerText = `${volumeInput.value}%`;
    audio.volume = e.currentTarget.value / 100;
}) 
