const audio = document.querySelector(".audio");
const fileInput = document.querySelector(".file");

const audioTrackName = document.querySelector(".track-name");
const artistName = document.querySelector(".artist");

const playBtn = document.querySelector(".play");
const pauseBtn = document.querySelector(".pause");
const forwardBtn = document.querySelector(".forward");
const backwardBtn = document.querySelector(".backward");

const progressBarFluid = document.querySelector(".fluid");
const progressBar = document.querySelector(".progress-bar");
const currentTimer = document.querySelector(".ct");
const maxTimer = document.querySelector(".mt");

const appHead = document.querySelector(".head");
const appBannerBg = document.querySelector(".banner-bg");
const appBanner = document.querySelector(".banner");

const changeTrackBtn = document.querySelector("#change");
const changeTrackSettingsBtn = document.querySelector(".ch-set");

const volumeSlider = document.querySelector("#vol-slider");
const volumeSliderText = document.querySelector(".vol-info-text");

const app = document.querySelector(".app");
const appMenu = document.querySelector(".bg");

const loaderBg = document.querySelector(".loader-bg");
const loadingText = document.querySelector(".loading-txt");

const selectBtn = document.querySelector(".sel");

let previousURL = null;
let audioFileSelected = false;

const trimLastPart = (value) => {
    const trimmedValue = value.substring(value.lastIndexOf("/") + 1);
    return trimmedValue;
}

const updateTiming = () => {
    var min = Math.floor(audio.duration / 60);
    var sec = Math.floor(audio.duration % 60);
    if (sec < 10) {
        sec = '0' + String(sec);
    }
    return maxTimer.innerText = `${min}:${sec}`;
}

const showCurrentTiming = () => {
    var min = Math.floor(audio.currentTime / 60);
    var sec = Math.floor(audio.currentTime % 60);
    if (sec < 10) {
        sec = '0' + String(sec);
    }

    currentTimer.innerText = `${min}:${sec}`;

    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const percentageDuration = (currentTime / duration) * 100;

    progressBarFluid.style.width = `${percentageDuration}%`;

    if (audio.currentTime === audio.duration) return audio.pause();
}

const trimFileName = (filename) => {
    const index = filename.lastIndexOf('.');
    return filename.substring(0, index);
}

const initialBackground = {
    head: appHead.style.backgroundImage,
    bannerBg: appBannerBg.style.backgroundImage,
    banner: appBanner.style.backgroundImage,
};

const displayMetaData = (tag, file) => {
    const title = tag.tags.title;
    const artist = tag.tags.artist;
    const album = tag.tags.album;
    const picture = tag.tags.picture;

    if (artist && title && picture) {
        var base64String = '';
        for (let i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
        }
        const imgURL = `data:${picture.format};base64,${window.btoa(base64String)}`;
        appHead.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${imgURL}")`;
        appBannerBg.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${imgURL}")`;
        appBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${imgURL}")`;
        audioTrackName.innerText = `${artist} - ${title}`;
        artistName.innerText = `${artist}`;
    } else if (artist && title && !picture) {
        audioTrackName.innerText = `${artist} - ${title}`;
        artistName.innerText = `${artist}`;
        // Revert to initial background styles if no picture is found
        appHead.style.backgroundImage = initialBackground.head;
        appBannerBg.style.backgroundImage = initialBackground.bannerBg;
        appBanner.style.backgroundImage = initialBackground.banner;
    } else {
        // Revert to initial background styles if no metadata is found
        appHead.style.backgroundImage = initialBackground.head;
        appBannerBg.style.backgroundImage = initialBackground.bannerBg;
        appBanner.style.backgroundImage = initialBackground.banner;
    }
}

const readMediaData = (file) => {
    jsmediatags.read(file, {
        onSuccess: (tag) => {
            return displayMetaData(tag,file);
        },
        onError: (error) => {
            alert(`Error reading metadata: ${error.message}`);
        }
    });
}


const getAudioFile = async (file, audioURL) => {
    try {
        audio.src = audioURL;
        audio.load();
        console.log(audioURL);
        audioTrackName.innerText = trimFileName(file.name);
        artistName.innerText = `Unknown`;
        return readMediaData(file);
    } catch (error) {
        alert(error.message);
        return console.error(error);
    }
}

audio.addEventListener("canplaythrough", async(e) => {
    if (audio.src) {
        closeSetCard();
        await audio.play();
        visualize();
        setInterval(showCurrentTiming, 10);
        setInterval(updateTiming, 10);
    }
})

audio.addEventListener("play", (e) => {
    console.log('Audio is playing!');
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
})

audio.addEventListener("pause", (e) => {
    console.log('Audio is pasued!');
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
})

playBtn.addEventListener("click", async(e) => {
    if (!audio.src || !audioFileSelected) {
        alert("Please select an audio file first.");
        return;
    }
    return await audio.play();
});
pauseBtn.addEventListener("click", (e) => {
    return audio.pause();
})

fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isAudio = file.type.startsWith('audio/');
    if(!isAudio) {
        alert(`Please select a proper audio file!`);
        return fileInput.value = '';
    } else{
        audioFileSelected = true;
        const bloblURL = URL.createObjectURL(file);
        await getAudioFile(file, bloblURL);
        if (previousURL) {
            console.log(`Cleared previous object url!`);
            return URL.revokeObjectURL(previousURL);
        }
    }
}


changeTrackBtn.addEventListener("click", async(e) => {
    return await fileInput.click();
})

changeTrackSettingsBtn.addEventListener("click", async (e) => {
    return await fileInput.click();
})

forwardBtn.addEventListener("click", (e) => {
    if (!audioFileSelected) return;
    audio.currentTime += 5;
})

backwardBtn.addEventListener("click", (e) => {
    if (!audioFileSelected) return;
    audio.currentTime -= 5;
})

progressBar.addEventListener("click", (e) => {
    let progressWidth = progressBar.clientWidth;
    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;
    audio.play();
})

volumeSlider.addEventListener("input", (e) => {
    volumeSliderText.innerText = `${volumeSlider.value}%`
    audio.volume = e.currentTarget.value / 100;
})

selectBtn.addEventListener("click", async(e) => {
    return await fileInput.click();
})

window.addEventListener("DOMContentLoaded", (e) => {
    volumeSlider.value = audio.volume * 100;
    volumeSliderText.innerText = `${volumeSlider.value}%`;
})

window.addEventListener("load", (e) => {
    let count = 0;
    let counter = setInterval(() => {
        count++;
        loadingText.innerText = `Loading...(${count}%)`;
        if (count >= 100) {
            clearInterval(counter);
            setTimeout(() => {
                loaderBg.classList.add("hide");
                app.classList.add("open");
                appMenu.classList.add("load-app");
            }, 1000);
            return setTimeout(() => {
                return openWelcomeCard();
            }, 1500);
        }
    }, 70);
})