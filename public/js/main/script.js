/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */
const audio = document.querySelector(".audio");
const fileInput = document.querySelector(".file");

const audioTrackName = document.querySelector(".track-name");
const artistName = document.querySelector(".artist");
const titleName = document.querySelector("#title-name");

const playPauseBtn = document.querySelector(".playpause-bg");
const playPauseBtnText = document.querySelector(".playpause");
const playPauseCheckBox = document.querySelector("#playpause");
//const pauseBtn = document.querySelector(".pause");
const forwardBtn = document.querySelector(".forward");
const backwardBtn = document.querySelector(".backward");

const audioBuffered = document.querySelector(".audio-buffered");
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
const welcomeStreamBtn = document.querySelector(".wel-stream");
const welcomeStreamBtnText = document.querySelector(".wel-p");

const playerIcon = document.querySelector(".header-img");

const appName = `Blaze Audio Player`;

playerIcon.addEventListener("contextmenu", (e) => {
    return e.preventDefault();
})

let previousURL = null;
let audioFileSelected = false;

let audioLoadPhase = "idle";
// "idle" | "loading" | "ready"

let uiIntent = "none";
// "none" | "userOpenedWelcome" | "userOpenedStream"


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

    //if (audio.currentTime === audio.duration) return audio.pause();
}

const trimFileName = (filename) => {
    const index = filename.lastIndexOf('.');
    return filename.substring(0, index);
}

const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
};

let totalResources = 0;
let loadedResources = 0;
let loaderInterval = null;

const updateLoaderPercentage = () => {
    const resources = performance.getEntriesByType("resource");

    // Set total only once
    if (totalResources === 0 && resources.length > 0) {
        totalResources = resources.length;
    }

    // Count loaded resources
    loadedResources = resources.filter(r => r.responseEnd > 0).length;

    // Prevent divide by zero
    if (totalResources > 0) {
        const percent = Math.min(
            Math.round((loadedResources / totalResources) * 100),
            99
        );

        loadingText.innerText = `Loading... (${percent}%)`;
    }
};

const initialBackground = {
    head: appHead.style.backgroundImage,
    bannerBg: appBannerBg.style.backgroundImage,
    banner: appBanner.style.backgroundImage,
};

const resetBackgroundToInitial = () => {
    appHead.style.backgroundImage = initialBackground.head;
    appBannerBg.style.backgroundImage = initialBackground.bannerBg;
    appBanner.style.backgroundImage = initialBackground.banner;
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
        
        appHead.style.backgroundImage = `url("${imgURL}")`;
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
            return displayMetaData(tag, file);
        },
        onError: (error) => {
            console.error(error);
            alert(`There was an error while reading metadata of the selected audio file!\nIt might be due to the file being corrupted/damaged\nPlease try again with a fresh uncorrupted copy of the audio file\nIf you believe this is an bug/issue please report it!`);
        }
    });
}


const getAudioFile = async (file, audioURL) => {
    try {
        audioLoadPhase = "loading";
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

let isUpdating = false; // Flag to control the animation loop

const updateUI = () => {
    // Update the current time and progress bar
    showCurrentTiming();

    // Request the next frame
    if (isUpdating) {
        requestAnimationFrame(updateUI);
    }
};

const updateBufferedBar = () => {
    if (audio.buffered.length > 0 && !isNaN(audio.duration) && audio.duration > 0) {
        const end = audio.buffered.end(audio.buffered.length - 1);
        const percentage = (end / audio.duration) * 100;
        audioBuffered.style.width = `${percentage.toFixed(0)}%`;
        console.log(`Audio buffered length: ${audio.buffered.length}`);
        console.log(`Details\n${audio.buffered.end(0), audio.duration}`);
        console.log(`Audio Buffered: ${percentage.toFixed(0)}%`)
    }
};

audio.addEventListener("error", (e) => {
    playPauseCheckBox.checked = true;
    alert(`There was an error while playing the audio!\nCheck your browser console for more info!`)
    return console.log(`Audio Error:\n${e}`);
})

// You can also call this function when the audio is loaded
audio.addEventListener("canplaythrough", async () => {
    // gnore if this is not a real new load
    if (!audio.src) return;

    audioLoadPhase = "ready";

    // Only auto-close if user didn't open anything
    if (uiIntent === "none") {
        closeSetCard();
        closeWelcomeCard();
        closeStreamCard();
        closeFetchCard();
    }

    await audio.play();
    visualize();

    updateTiming();
    updateBufferedBar();

    const defaultTitle = titleName.innerText.split("|")[1].trim();
    titleName.innerText = `${audioTrackName.innerText} | Now playing in ${appName} | ${defaultTitle}`;
});


audio.addEventListener("progress", (e) => {
    if (audio.buffered.length > 0) {
        const end = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;

        if (duration > 0) {
            const loadedPercentage = (end / duration) * 100;
            audioBuffered.style.width = `${loadedPercentage.toFixed(0)}%`;
            //audioProgress.innerText = `Audio loading progress: ${loadedPercentage.toFixed(0)}%`;
        }
    }
})

audio.addEventListener("timeupdate", showCurrentTiming);

audio.addEventListener("progress", updateBufferedBar);
audio.addEventListener("loadedmetadata", updateBufferedBar);
audio.addEventListener("playing", updateBufferedBar);

audio.addEventListener("play", (e) => {
    isPlaying = true;
    console.log('Audio is playing!');
    playPauseCheckBox.checked = false;
    isUpdating = true; // Set the flag to true
    updateUI(); // Start the update loop

})

audio.addEventListener("pause", (e) => {
    isPlaying = false;
    console.log('Audio is pasued!');
    playPauseCheckBox.checked = true;
    lastBeatTime = 0;
})

// Ensure to stop the update loop when the audio ends
audio.addEventListener("ended", (e) => {
    isUpdating = false; // Stop updating when audio ends
    return audio.pause();
})

playPauseBtnText.addEventListener("click", (e) => {
    if (!audio.src || !audioFileSelected) {
        e.preventDefault();   // <- stops label from toggling checkbox
        e.stopPropagation(); // <- also stops bubbling
        alert("Please select an audio file first.");
        playPauseCheckBox.checked = true;  // Force icon to 'play'
        return;
    }
});


// Prevent checkbox click bubbling
playPauseCheckBox.addEventListener("click", (e) => {
    e.stopPropagation();
});

// Main play/pause button logic
playPauseBtn.addEventListener("click", (e) => {
    // If no audio loaded → prevent toggle
    if (!audio.src || !audioFileSelected) {
        alert("Please select an audio file first.");
        playPauseCheckBox.checked = true;  // Force icon to 'play'
        return;
    }

    // Toggle the checkbox state manually
    playPauseCheckBox.checked = !playPauseCheckBox.checked;

    // Play or pause depending on the new state
    if (!playPauseCheckBox.checked) {
        audio.play();
    } else {
        audio.pause();
    }
});


/*
pauseBtn.addEventListener("click", (e) => {
    return audio.pause();
})*/

fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isAudio = file.type.startsWith('audio/');
    if (!isAudio) {
        alert(`Please select a proper audio file!`);
        fileInput.value = ''; // Clear the file input
        return;
    } else {
        streaming = false;  // <-- Disconnect streaming when dropping a local file
        audioFileSelected = true;
        const blobURL = URL.createObjectURL(file); // Create a new blob URL
        streamResult.classList.remove('normal');
        streamResult.classList.remove('err');
        streamResult.classList.remove('ok');
        streamResult.innerText = 'Not Streaming currently';

        // Revoke the previous URL if it exists
        if (previousURL) {
            console.log(`Cleared previous object url!`);
            URL.revokeObjectURL(previousURL);
        }

        // Set the previousURL to the new blob URL
        previousURL = blobURL;

        await getAudioFile(file, blobURL); // Load the new audio file
    }
}



changeTrackBtn.addEventListener("click", async (e) => {
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

volumeSlider.addEventListener("input", (e) => {
    volumeSliderText.innerText = `${volumeSlider.value}%`
    audio.volume = e.currentTarget.value / 100;
})

selectBtn.addEventListener("click", async (e) => {
    return await fileInput.click();
})

window.addEventListener("DOMContentLoaded", (e) => {
    volumeSlider.value = audio.volume * 100;
    volumeSliderText.innerText = `${volumeSlider.value}%`;
    initPresenceSocket();
    return drawCaps();
})

// Event listener for beforeunload to prevent unwanted page refresh/reload
window.addEventListener("beforeunload", (e) => {
    if (audioFileSelected) {
        const confirmMessage = `You have an audio file selected. Are you sure you want to leave?`;
        e.preventDefault(); // This line is optional but can be included for clarity
        e.returnValue = confirmMessage; // Set the returnValue to the confirmation message
        return confirmMessage; // Some browsers may require returning the message
    }

    // Cleanup: Revoke the previous object URL if it exists
    if (previousURL) {
        URL.revokeObjectURL(previousURL);
    }
});

let appReady = false;

const loadingInterval = setInterval(updateLoaderPercentage, 100);

window.addEventListener("load", (e) => {
    clearInterval(loadingInterval);

    clearInterval(loaderInterval);

    loadingText.innerText = "Loading... (100%)";

    setTimeout(() => {
        loaderBg.classList.add("hide");
        app.classList.add("open");
        appMenu.classList.add("load-app");
        appReady = true;
    }, 300);
    setTimeout(() => {
        return openWelcomeCard();
    }, 500);

    console.log("App is ready!");
    loaderBg.classList.add("hide");
    app.classList.add("open");
    appMenu.classList.add("load-app");
    appReady = true; // Set appReady to true after loading is complete
    console.log("App is ready!");
})

const audioCurrentName = audioTrackName.innerText;

window.addEventListener("dragover", (e) => {
    audioTrackName.innerText = "Release your audio file here to start playing!";
    if (appReady) return e.preventDefault();
})

window.addEventListener("dragleave", (e) => {
    audioTrackName.innerText = audioTrackName.dataset.original || "No track playing";
    if (appReady) return e.preventDefault();
})

window.addEventListener("drop", (e) => {
    if (appReady) return handleDrop(e);
})

const handleDrop = async (event) => {
    try {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];

        if (!droppedFile.type.startsWith("audio/")) {
            return alert(`That file isn’t a valid audio format! Please drop an MP3, WAV, or similar file!`);
        }
        if (droppedFile) {
            streaming = false;  // <-- Disconnect streaming when dropping a local file
            const blobURL = URL.createObjectURL(droppedFile); // Use droppedFile here
            audioFileSelected = true;
            await getAudioFile(droppedFile, blobURL); // Pass droppedFile instead of file
            if (previousURL) {
                console.log(`Cleared previous object url!`);
                return URL.revokeObjectURL(previousURL);
            }
            previousURL = blobURL; // Store the current blob URL for future revocation
        }
    } catch (error) {
        console.error(error);
        return alert(`${error}`);
    }
};

// Function to handle welcomeStreamBtn click
welcomeStreamBtn.addEventListener("click", (e) => {
    welcomeStreamBtnText.innerText = 'Connecting to stream...';
    return streamBtn.click();
})


let isDragging = false; // Flag to track if the user is dragging the progress bar

// Function to handle mouse down event
progressBar.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent default click behavior
    isDragging = true; // Set dragging flag to true
    updateCurrentTime(e); // Update the current time immediately
});

// Function to handle mouse move event
window.addEventListener("mousemove", (e) => {
    if (isDragging) {
        updateCurrentTime(e); // Update the current time while dragging
    }
});

// Function to handle mouse up event
window.addEventListener("mouseup", () => {
    isDragging = false; // Reset dragging flag
});

// Function to update the current time based on mouse position
const updateCurrentTime = (e) => {
    /*const progressWidth = progressBar.clientWidth; // Get the width of the progress bar
    const offsetX = e.clientX - progressBar.getBoundingClientRect().left; // Get the mouse position relative to the progress bar
    const percentage = offsetX / progressWidth; // Calculate the percentage of the progress bar
    audio.currentTime = percentage * audio.duration;*/ // Update the audio's current time
    //audio.play(); // Optionally play the audio when seeking
    const rect = progressBar.getBoundingClientRect();
    const progressWidth = rect.width;
    const offsetX = e.clientX - rect.left;

    // Clamp between 0 and 1
    const percentage = Math.min(Math.max(offsetX / progressWidth, 0), 1);

    audio.currentTime = percentage * audio.duration;
};

// This part has been deprecated since the progress bar already handles the 'mousedown' event
// Existing progress bar click event
/*progressBar.addEventListener("click", (e) => {
    if (isDragging) return;
    updateCurrentTime(e);
    /*if (!isDragging) { // Only update if not dragging
        updateCurrentTime(e); // Update the current time on click
    }
    let progressWidth = progressBar.clientWidth;
    let OffsetX = e.offsetX;
    audio.currentTime = (OffsetX / progressWidth) * audio.duration;*/
    //audio.play();
//})

// Function to handle touch start event
progressBar.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default touch behavior
    isDragging = true; // Set dragging flag to true
    updateCurrentTime(e.touches[0]); // Update the current time immediately
});

// Function to handle touch move event
window.addEventListener("touchmove", (e) => {
    if (isDragging) {
        updateCurrentTime(e.touches[0]); // Update the current time while dragging
    }
});

// Function to handle touch end event
window.addEventListener("touchend", () => {
    isDragging = false; // Reset dragging flag
});

// Add keyboard shortcut for play/pause toggle (Ctrl + Alt + P)
window.addEventListener("keydown", (event) => {
    // Check for Ctrl + Alt + P (play/pause toggle) - remains global
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
        event.preventDefault(); // Prevent any default browser action

        if (!audio.src || !audioFileSelected) {
            alert("Please select an audio file first.");
            return;
        }

        if (audio.paused) {
            audio.play(); // Play if paused
        } else {
            audio.pause(); // Pause if playing
        }
    }

    // Check for Shift + Right Arrow (forward skip) - only if input not focused
    else if (event.shiftKey && event.key === 'ArrowRight' && document.activeElement !== fetchURLInput) {
        event.preventDefault(); // Prevent page scrolling

        if (!audioFileSelected) return; // Same guard as your forwardBtn
        audio.currentTime += 5; // Skip forward 5 seconds
    }

    // Check for Shift + Left Arrow (backward skip) - only if input not focused
    else if (event.shiftKey && event.key === 'ArrowLeft' && document.activeElement !== fetchURLInput) {
        event.preventDefault(); // Prevent page scrolling

        if (!audioFileSelected) return; // Same guard as your backwardBtn
        audio.currentTime -= 5; // Skip backward 5 seconds
    }

});

window.addEventListener("beforeinstallprompt", (e) => {
    console.log("App is ready for the installation process!");
    console.warn(`If changes aren't available the please try to clear this site's data and reload the page again!`);
})