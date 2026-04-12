/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */
const audio = document.querySelector(".audio-el");
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

const playlistWindow = document.querySelector(".playlist");
const playlistUlElement = document.querySelector("#playlist-ul");

const downloadAppBtn = document.querySelector(".down-set");
const lastUpdate = document.querySelector(".last-update");

const isPWA = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

const appName = `Blaze Audio Player`;

playerIcon.addEventListener("contextmenu", (e) => {
    return e.preventDefault();
})

let previousURL = null;
let audioFileSelected = false;
let fileName = null;

let audioLoadPhase = "idle";
// "idle" | "loading" | "ready"

let uiIntent = "none";
// "none" | "userOpenedWelcome" | "userOpenedStream"

let trackQueue = [];
let currentTrackIndex = 0;

let firstTimeShown = false;

function adjustMarqueeSpeed() {
    const trackName = document.querySelector('.track-name');
    const container = document.querySelector('.audio-details');

    // Kill any pending pause-resume timeout from a previous iteration/track
    if (trackName._marqueeTimeout) {
        clearTimeout(trackName._marqueeTimeout);
        trackName._marqueeTimeout = null;
    }

    // Hard-reset the animation so it restarts cleanly from scratch
    trackName.style.animation = 'none';
    void trackName.offsetWidth; // Force reflow to flush the removal
    trackName.style.animation = '';

    const textWidth = trackName.scrollWidth;
    const containerWidth = container.offsetWidth;


    // If text fits, no marquee needed
    /*if (textWidth <= containerWidth) {
        trackName.style.animationPlayState = 'paused';
        trackName.style.setProperty('--mq-start', '0px');
        trackName.style.setProperty('--mq-end', '0px');
        return;
    }*/

    trackName.style.setProperty('--mq-start', `${containerWidth}px`);
    trackName.style.setProperty('--mq-end', `-${textWidth}px`);

    const pixelsPerSecond = 60;
    const distance = textWidth + containerWidth;
    const duration = Math.max(distance / pixelsPerSecond, 5);

    trackName.style.animationDuration = `${duration}s`;
    trackName.style.animationPlayState = 'running';

    // Attach pause-between-loops listener only once ever
    if (!trackName._marqueeListenerAttached) {
        trackName._marqueeListenerAttached = true;
        trackName.addEventListener('animationiteration', () => {
            trackName.style.animationPlayState = 'paused';
            trackName._marqueeTimeout = setTimeout(() => {
                trackName._marqueeTimeout = null;
                trackName.style.animationPlayState = 'running';
            }, 1500);
        });
    }
}

/*
// Trigger adjustMarqueeSpeed ONLY when the track name text actually changes.
// Avoids calling it on progress/timeupdate which fires constantly during streams.
(function watchTrackName() {
    const trackName = document.querySelector('.track-name');
    if (!trackName) return;
    new MutationObserver(() => {
        requestAnimationFrame(() => adjustMarqueeSpeed());
    }).observe(trackName, { childList: true, characterData: true, subtree: true });
})();*/

const trimLastPart = (value) => {
    const trimmedValue = value.substring(value.lastIndexOf("/") + 1);
    return trimmedValue;
}

const updateTiming = () => {
    if (!isFinite(audio.duration) || isNaN(audio.duration)) return; // GUARD
    var min = Math.floor(audio.duration / 60);
    var sec = Math.floor(audio.duration % 60);
    if (sec < 10) sec = '0' + String(sec);
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

const updateUI = () => {
    showCurrentTiming(); // Existing function

    // --- Add Lyric Sync Logic Here ---
    const current = audio.currentTime;
    let activeIdx = -1;

    // Find the current active line based on audio time
    for (let i = 0; i < lyricsArray.length; i++) {
        if (current >= lyricsArray[i].time) {
            activeIdx = i;
        } else {
            break;
        }
    }

    if (activeIdx !== -1) {
        const activeEl = lyricsArray[activeIdx].element;
        if (!activeEl.classList.contains('active')) {
            // Remove active class from other lines
            document.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active'));

            // Highlight and center the current line
            activeEl.classList.add('active');
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    // ---------------------------------

    if (isUpdating) {
        requestAnimationFrame(updateUI);
    }
};

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

const formatDate = (date) => {
    const d = new Date(date);

    const day = d.getDate();
    const year = d.getFullYear();

    const month = d.toLocaleString('en-US', { month: 'long' });

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const getOrdinal = (n) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${getOrdinal(day)} ${month}, ${year} at ${hours}:${minutes}`;
};

const lastUpdated = (date) => {
    const lastModifiedDate = new Date(date);
    const now = new Date();
    const timeDiff = Math.floor((now - lastModifiedDate) / 1000);

    let timeAgo;

    if (timeDiff < 60) {
        timeAgo = "just now";
    } else if (timeDiff < 3600) {
        const minutes = Math.floor(timeDiff / 60);
        timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (timeDiff < 86400) {
        const hours = Math.floor(timeDiff / 3600);
        timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (timeDiff < 604800) { // Less than 7 days
        const days = Math.floor(timeDiff / 86400);
        timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (timeDiff < 2592000) { // Less than 30 days (but more than or equal to 7 days)
        const weeks = Math.floor(timeDiff / 604800); // 604800 seconds in a week
        timeAgo = `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (timeDiff >= 2592000 && timeDiff < 5184000) { // Less than 2 months (but more than or equal to 30 days)
        timeAgo = '1 month ago'; //For anything 30 days or more but less than 2 months
    } else if (timeDiff < 31556952) { // Less than a year
        const months = Math.floor(timeDiff / 2592000); // 2592000 seconds in a month
        timeAgo = `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(timeDiff / 31556952); // 31556952 seconds in a year
        timeAgo = `${years} year${years !== 1 ? 's' : ''} ago`;
    }

    return timeAgo;
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

/*
const setupMediaSessionActions = () => {
    if ('mediaSession' in navigator) {
        // Play Action
        navigator.mediaSession.setActionHandler('play', async () => {
            await audio.play();
            navigator.mediaSession.playbackState = 'playing';
            playPauseCheckBox.checked = false; // Sync UI
        });

        // Pause Action
        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
            navigator.mediaSession.playbackState = 'paused';
            playPauseCheckBox.checked = true; // Sync UI
        });

        // Next Track (Triggers your existing logic)
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (playNextBtn) playNextBtn.click();
        });

        // Previous Track (Restarts song)
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            audio.currentTime = 0;
        });

        // Seek Actions
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            if (!streaming) {
                audio.currentTime = Math.max(audio.currentTime - 5, 0);
            }
            return streamNextAudioFile.click();
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            if (!streaming) {
                audio.currentTime = Math.min(audio.currentTime + 5, audio.duration)
            }
            return streamNextAudioFile.click();
        });
    }
};

const resetMediaSessionHandlers = () => {
    if ('mediaSession' in navigator) {
        try {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
        } catch (error) {
            console.log('Error resetting media session handlers:', error);
        }
    }
};*/

const resetMediaSessionHandlers = () => {
    if ('mediaSession' in navigator) {
        const actions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'stop'];
        actions.forEach(action => {
            try { navigator.mediaSession.setActionHandler(action, null); } catch (e) { }
        });
    }
};

const displayMetaData = (tag, file) => {
    // 1. Reset any old OS handlers
    //
    resetMediaSessionHandlers();

    const { title, artist, album, picture } = tag.tags;
    let imgURL = "./public/img/icon.png"; // Default fallback
    let mimeType = 'image/png';

    // 2. Process the Image if it exists
    if (picture) {
        const base64String = picture.data.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
        imgURL = `data:${picture.format};base64,${window.btoa(base64String)}`;
        mimeType = picture.format;

        getDynamicColors(imgURL).then(colors => {
            currentPalette = colors;
            // If visualize is already running, the bars will pick up the new colors next frame
        });

        appHead.style.backgroundImage = `url("${imgURL}")`;
        appBannerBg.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${imgURL}")`;
        appBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${imgURL}")`;
        if (!isPlaying) drawCaps(imgURL);
    } else {
        const myPathIMG = `./public/img/bg2.jpg`;
        getDynamicColors(myPathIMG).then(colors => {
            currentPalette = colors;
        })
        resetBackgroundToInitial();
        if (!isPlaying) drawCaps();
    }

    // 3. Set Player UI Text
    const finalTitle = title || trimFileName(file.name);
    const finalArtist = artist || "Unknown Artist";

    audioTrackName.innerText = title && artist ? `${artist} - ${title}` : finalTitle;
    artistName.innerText = finalArtist;

    if (!broadCastEnd) {
        if (hostPlayer.src) {
            hostPlayer.pause();
            hostPlayer.currentTime = 0;
        }
    }

    // 4. Send to MediaSession API
    // We pass the processed imgURL and the actual mimeType
    setMediaSessionApi(
        audio,
        title || trimFileName(file.name),
        artist || "Unknown Artist",
        album || "Unknown Album",
        imgURL,
        mimeType,
        true // Set to true to hide the Next/Prev buttons
    );
};

const readMediaData = (file) => {
    jsmediatags.read(file, {
        onSuccess: (tag) => {
            const title = tag.tags.title;
            const artist = tag.tags.artist;

            // Determine search query
            let query;
            if (title && artist) {
                query = `${artist} - ${title}`;
            } else if (title) {
                query = title;
            } else {
                // Fallback to filename logic from demo.html
                query = file.name
                    .replace(/\.[^/.]+$/, "")             // Remove extension
                    .replace(/^\d+[\s.-]+/, "")           // Remove track numbers
                    .replace(/[\[\(\{].*?[\]\)\}]/g, "")  // Remove brackets
                    .replace(/[_-]/g, " ")                // Normalize spaces
                    .trim();
            }

            // Fetch lyrics and display metadata
            fetchLyrics(query);
            return displayMetaData(tag, file);
        },
        onError: (error) => {
            console.error(error);
            const fallbackQuery = file.name;
            fetchLyrics(fallbackQuery);
            /*resetPopupMsg();
            changePopupMsg(`There was an error while playing the audio!<br><br>Details: <b>${details}</b><br><br>Message: ${error ? `'<b>${error.message}</b>'` : "'<b>No error message available</b>'"}<br><br>Check your browser console for more info!<br><br>If you were streaming from the radio, please skip to another station or try again later.<br>If you believe this is an bug/issue please report it <a target="_blank" href="https://github.com/blazeinferno64/blaze-audio-player/issues/">here</a>!`, true);
            openPopup();*/
            loaderBg.classList.add("hide");
            const details = "Metadata Read Failure"; // Context for the user

            resetPopupMsg();
            changePopupMsg(
                `There was an error while playing the audio!<br><br>` +
                `Details: <b>${details}</b><br><br>` +
                `Message: ${error.message ? `'<b>${error.message}</b>'` : "'<b>No error message available</b>'"}<br><br>` +
                `Check your browser console for more info!<br><br>` +
                `If you believe this is a bug/issue please report it ` +
                `<a target="_blank" href="https://github.com/blazeinferno64/blaze-audio-player/issues/">here</a>!`,
                true
            );
            openPopup();
            //alert(`There was an error while reading metadata of the selected audio file!\nIt might be due to the file being corrupted/damaged\nPlease try again with a fresh uncorrupted copy of the audio file\nIf you believe this is an bug/issue please report it!`);
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


audio.addEventListener("error", () => {
    playPauseCheckBox.checked = true;

    const error = audio.error;
    let details = "Unknown Error";

    if (error) {
        switch (error.code) {
            case 1: details = "The fetching process for the media resource was aborted by the user."; break;
            case 2: details = "A network error caused the media download to fail."; break;
            case 3: details = "An error occurred while decoding the media resource."; break;
            case 4: details = "The media resource is not supported."; break;
        }
    }

    //streaming ? alert(`There was an error while playing the audio!\nDetails: ${details}\n\nMessage: ${error ? `'${error.message}'` : "'No error message available'"}\n\nCheck your browser console for more info!\n\nIf you were streaming from the radio, please skip to another station or try again later.\nIf you believe this is an bug/issue please report it!`) : alert(`There was an error while playing the audio!\nDetails: ${details}\n\nMessage: ${error ? `'${error.message}'` : "'No error message available'"}\n\nCheck your browser console for more info!\nIf you believe this is an bug/issue please report it!`);

    if (streaming) {
        resetPopupMsg();
        changePopupMsg(`There was an error while playing the audio!<br><br>Details: <b>${details}</b><br><br>Message: ${error ? `'<b>${error.message}</b>'` : "'<b>No error message available</b>'"}<br><br>Check your browser console for more info!<br><br>If you were streaming from the radio, please skip to another station or try again later.<br>If you believe this is a bug/issue please report it <a target="_blank" href="https://github.com/blazeinferno64/blaze-audio-player/issues/">here</a>!`, true);
        openPopup();
        welcomeStreamBtnText.innerText = `Error loading audio!`;
        streamResult.classList.remove('normal');
        streamResult.classList.remove('ok');
        streamResult.classList.add('err');
        streamResult.innerText = 'Error loading audio!';
    }
    console.error("Audio Error Details:", {
        code: error ? error.code : "N/A",
        message: error ? error.message : "N/A",
        src: audio.src
    });
});



// You can also call this function when the audio is loaded
audio.addEventListener("canplaythrough", (e) => {
    // Ignore if this is not a real new load
    if (!audio.src) return;

    audioLoadPhase = "ready";

    // Stop any previous updateUI rAF loop before starting fresh
    isUpdating = false;

    // Only auto-close if user didn't open anything
    if (uiIntent === "none") {
        closeSetCard();
        closeWelcomeCard();
        closeStreamCard();
        closeFetchCard();
    }

    if (isLoaderShown) {
        loadingText.innerText = `Finishing up...`;
        setTimeout(() => {
            loaderBg.classList.add("hide");
        }, 500);
        isLoaderShown = false;
    }

    // audio.play() was already called synchronously in the click handler to hold the
    // gesture token. By the time canplaythrough fires, the src is ready and this
    // will simply resume / confirm playback without needing a new gesture.
    audio.play().catch(err => console.warn("canplaythrough play() failed:", err));

    //updateTiming();
    //updateBufferedBar();

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

audio.addEventListener("timeupdate", (e) => {
    showCurrentTiming();
    // If we are currently clicking a lyric, don't let the auto-scroll interfere
    if (isSeeking) return;

    const currentTime = audio.currentTime;
    let activeIndex = -1;

    for (let i = 0; i < lyricsArray.length; i++) {
        if (currentTime >= lyricsArray[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }

    if (activeIndex !== -1) {
        lyricsArray.forEach((item, index) => {
            if (index === activeIndex) {
                if (!item.element.classList.contains('active')) {
                    item.element.classList.add('active');
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                item.element.classList.remove('active');
            }
        });
    }
});

audio.addEventListener("progress", (e) => {
    updateBufferedBar();
});
audio.addEventListener("loadedmetadata", (e) => {
    closeWelcomeCard();
    updateBufferedBar();
    updateTiming();
    requestAnimationFrame(() => {
        adjustMarqueeSpeed();
    })
});
audio.addEventListener("playing", (e) => {
    updateBufferedBar();
});

audio.addEventListener("play", (e) => {
    isPlaying = true;

    // SYNC: If we are streaming and a broadcast is active, resume the hostPlayer
    if (streaming && broadCastPlaying && hostPlayer.src) {
        hostPlayer.play().catch(err => console.warn(err));
    }
    if (!firstTimeShown && !streaming) {
        openPopup();
        firstTimeShown = true;
    }

    welcomeStreamBtnText.innerText = streaming ? `Streaming Live Radio` : `24/7 Radio Station`;

    const defaultTitle = titleName.innerText.split("|")[1]?.trim() ?? appName;
    titleName.innerText = `${audioTrackName.innerText} | Now playing in ${appName} | ${defaultTitle}`;
    visualize();
    console.log('Audio is playing!');
    playPauseCheckBox.checked = false;
    isUpdating = true;
    updateUI();
});

audio.addEventListener("pause", (e) => {
    isPlaying = false;
    if (hostPlayer.src && streaming) {
        hostPlayer.pause();
    }
    console.log('Audio is pasued!');
    playPauseCheckBox.checked = true;
    lastBeatTime = 0;
})

// Ensure to stop the update loop when the audio ends
audio.addEventListener("ended", (e) => {
    isUpdating = false; // Stop updating when audio ends
    if (streaming) return;
    //return audio.pause();
    if (currentTrackIndex < trackQueue.length - 1) {
        currentTrackIndex++;
        console.log(`Advancing to track ${currentTrackIndex + 1}`);
        return loadTrackFromQueue(currentTrackIndex);
    } else {
        console.log("End of playlist reached.");
        return audio.pause();
        alert("Playlist finished!");
    }
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
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});


/*
pauseBtn.addEventListener("click", (e) => {
    return audio.pause();
})*/

function highlightCurrentTrack(index) {
    const allItems = document.querySelectorAll(".playlist-item");

    allItems.forEach(item => {
        if (parseInt(item.getAttribute("data-index")) === index) {
            item.classList.add("current");
            // Optional: Scroll the element into view if the list is long
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove("current");
        }
    });
}

function updatePlaylist(files) {
    if (!files || files.length === 0) return;

    playlistUlElement.innerHTML = '';

    Array.from(files).forEach((item, index) => {
        const liElement = document.createElement("li");

        // Add a class for styling and a data attribute to track the index
        liElement.classList.add("playlist-item");
        liElement.setAttribute("data-index", index);

        const displayName = item.name ? trimFileName(item.name) : `Track ${index + 1}`;
        liElement.textContent = `${index + 1}. ${displayName}`;

        liElement.onclick = () => {
            currentTrackIndex = index;
            loadTrackFromQueue(index);
        };

        playlistUlElement.appendChild(liElement);
    });

    // Highlight the first track immediately if it's starting
    highlightCurrentTrack(currentTrackIndex);
}

fileInput.onchange = async (e) => {
    //const file = e.target.files[0];
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    //if (!file) return;
    //const isAudio = files.type.startsWith('audio/');
    const audioFiles = files.filter(file =>
        file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
    if (audioFiles.length === 0) {
        alert(`Please select proper media files!`);
        fileInput.value = ''; // Clear the file input
        return;
    } else {
        console.log(`${audioFiles.length} tracks have been selected!`);
        // Reset and Load Queue
        trackQueue = audioFiles;
        currentTrackIndex = 0;

        isLoaderShown = false;
        streaming = false;  // <-- Disconnect streaming when dropping a local file
        audioFileSelected = true;
        //const blobURL = URL.createObjectURL(file); // Create a new blob URL
        streamResult.classList.remove('normal');
        streamResult.classList.remove('err');
        streamResult.classList.remove('ok');
        streamResult.innerText = 'Not streaming currently';


        // Revoke the previous URL if it exists
        if (previousURL) {
            console.log(`Cleared previous object url!`);
            URL.revokeObjectURL(previousURL);
        }

        // Set the previousURL to the new blob URL
        //previousURL = blobURL;

        if (!isLoaderShown) {
            loaderBg.classList.remove("hide");
            loaderBg.style.opacity = '.85'
            loadingText.innerText = 'Loading stream...';
            isLoaderShown = true;
        }

        updatePlaylist(files);
        await loadTrackFromQueue(currentTrackIndex);
        //await getAudioFile(file, blobURL); // Load the new audio file
    }
}

async function loadTrackFromQueue(index) {
    isUpdating = false;
    if (index >= trackQueue.length) return;

    highlightCurrentTrack(index);

    const file = trackQueue[index];
    const blobURL = URL.createObjectURL(file);

    if (previousURL) {
        console.log(`Cleared previous object url!`);
        URL.revokeObjectURL(previousURL);
    }
    previousURL = blobURL;

    loaderBg.classList.remove("hide");
    loaderBg.style.opacity = '.85';
    loadingText.innerText = `Loading Track ${index + 1}...`;
    isLoaderShown = true;

    await getAudioFile(file, blobURL); // Load the new audio file
}

changeTrackBtn.addEventListener("click", async (e) => {
    return await fileInput.click();
})

changeTrackSettingsBtn.addEventListener("click", async (e) => {
    return await fileInput.click();
})

forwardBtn.addEventListener("click", async (e) => {
    if (!audioFileSelected) return;
    if (streaming) return streamNextAudioFile.click(); //<--- This causes bugs & issues!
    //audio.currentTime += 5;
    if (trackQueue.length > 1 && currentTrackIndex < trackQueue.length - 1) {
        currentTrackIndex++;
        await loadTrackFromQueue(currentTrackIndex);
    } else {
        // Fallback to your original 5-second skip
        audio.currentTime += 5;
    }
})

backwardBtn.addEventListener("click", async (e) => {
    if (!audioFileSelected) return;
    if (streaming) return streamNextAudioFile.click(); //<--- This causes bugs & issues!
    //audio.currentTime -= 5;
    if (audio.currentTime > 3) {
        audio.currentTime -= 5;
    } else if (trackQueue.length > 1 && currentTrackIndex > 0) {
        currentTrackIndex--;
        await loadTrackFromQueue(currentTrackIndex);
    } else {
        // Fallback: If it's the first song and at the start, just subtract -5
        audio.currentTime -= 5;
    }
})

volumeSlider.addEventListener("input", (e) => {
    volumeSliderText.innerText = `${volumeSlider.value}%`
    audio.volume = e.currentTarget.value / 100;
})

selectBtn.addEventListener("click", async (e) => {
    return await fileInput.click();
})

window.addEventListener("DOMContentLoaded", async (e) => {
    const repo = await client.getSpecificRepo("blazeinferno64", "blaze-audio-player");
    lastUpdate.innerHTML = `<span class="material-symbols-outlined">calendar_clock</span> Last Updated: ${lastUpdated(repo.updated_at)}`;
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

lastUpdate.addEventListener("click", (e) => {
    alert(`Processing your request...`);
    setTimeout(() => {
        window.location.href = 'https://github.com/BlazeInferno64/blaze-audio-player/commits/main/';
    }, 1000);
});

window.addEventListener("load", (e) => {
    // Load everything completely
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
})

const audioCurrentName = audioTrackName.innerText;

window.addEventListener("dragover", (e) => {
    audioTrackName.innerText = "Release your audio files here to start playing!";
    if (appReady) return e.preventDefault();
})

window.addEventListener("dragleave", (e) => {
    audioTrackName.innerText = audioTrackName.dataset.original || "Nothing is playing";
    if (appReady) return e.preventDefault();
})

window.addEventListener("drop", (e) => {
    if (appReady) return handleDrop(e);
})

const handleDrop = async (event) => {
    try {
        isLoaderShown = false;
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        if (files.length === 0) return;

        const audioFiles = files.filter(file =>
            file.type.startsWith('audio/') || file.type.startsWith('video/')
        );;

        if (audioFiles.length === 0) {
            alert("Please drop valid media files!");
            return;
        }

        /*if (!droppedFile.type.startsWith("audio/")) {
            return alert(`That file isn’t a valid audio format! Please drop an MP3, WAV, or similar file!`);
        }*/
        if (audioFiles) {
            trackQueue = audioFiles;
            currentTrackIndex = 0;
            streaming = false;  // <-- Disconnect streaming when dropping a local file
            //const blobURL = URL.createObjectURL(droppedFile); // Use droppedFile here
            audioFileSelected = true;
            if (!isLoaderShown) {
                loaderBg.classList.remove("hide");
                loaderBg.style.opacity = '.85'
                loadingText.innerText = 'Loading audio...';
                isLoaderShown = true;
            }
            console.log(`Dropped ${audioFiles.length} tracks into the queue.`);
            await loadTrackFromQueue(currentTrackIndex);
            /*await getAudioFile(droppedFile, blobURL); // Pass droppedFile instead of file
            if (previousURL) {
                console.log(`Cleared previous object url!`);
                return URL.revokeObjectURL(previousURL);
            }*/
            //previousURL = blobURL; // Store the current blob URL for future revocation
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
        if (streaming) return streamNextAudioFile.click();
        audio.currentTime += 5; // Skip forward 5 seconds
    }

    // Check for Shift + Left Arrow (backward skip) - only if input not focused
    else if (event.shiftKey && event.key === 'ArrowLeft' && document.activeElement !== fetchURLInput) {
        event.preventDefault(); // Prevent page scrolling

        if (!audioFileSelected) return; // Same guard as your backwardBtn
        if (streaming) return streamNextAudioFile.click();
        audio.currentTime -= 5; // Skip backward 5 seconds
    }

});

let deferredPrompt = null;
let isAppInstalled = false;
let beforeInstallPromptHandled = false;

// Check if app was uninstalled
function checkIfAppUninstalled() {
    // If beforeinstallprompt fires and we think app is installed, it means it was uninstalled
    if (isAppInstalled && beforeInstallPromptHandled) {
        console.warn('✗ App appears to have been uninstalled!');
        isAppInstalled = false;
        beforeInstallPromptHandled = false;
        localStorage.removeItem("isAppInstalled"); // Clear localStorage
        downloadAppBtn.style.display = 'block'; // Show download button again
        console.log('[App] Cleared isAppInstalled from localStorage');
    }
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();

    // Check for uninstall
    checkIfAppUninstalled();

    deferredPrompt = e;

    if (!beforeInstallPromptHandled) {
        beforeInstallPromptHandled = true;
        downloadAppBtn.style.display = 'block'; // Show download button
        console.log("✓ App is ready for the installation process!");
        console.warn(`If changes aren't available then please try to clear this site's data and reload the page again!`);
    }
});

downloadAppBtn.addEventListener("click", async (e) => {
    if (isAppInstalled) {
        console.log("App is already installed! Checking for updates...");

        // Check for updates
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });

            // Show a checking message
            const originalText = downloadAppBtn.innerHTML;
            downloadAppBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking for updates...';

            // Reset button text after 3 seconds
            setTimeout(() => {
                downloadAppBtn.innerHTML = originalText;
                resetPopupMsg();
                changePopupMsg(`No updates found!\nYou're already on the latest version of Blaze Audio Player!`);
                openPopup();
                //return alert(`No updates found!\nYou're already on the latest version of Blaze Audio Player!`);
            }, 3000);
        } else {
            console.warn("Service Worker not available for update check");
            alert("Unable to check for updates. Please refresh the page!");
        }
        return;
    }

    if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            isAppInstalled = true;
            //downloadAppBtn.style.display = 'none';
            localStorage.setItem("isAppInstalled", "true");
        } else {
            console.log('User dismissed the install prompt');
            isAppInstalled = false;
            deferredPrompt = null;
            localStorage.setItem("isAppInstalled", "false");
        }
    }
});

window.addEventListener("appinstalled", (e) => {
    isAppInstalled = true;
    downloadAppBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Check for Updates';
    //downloadAppBtn.style.display = 'none'; // Hide download button after installation
    localStorage.setItem("isAppInstalled", "true"); // Persist to localStorage
    console.info("✓ Blaze Audio Player has been installed successfully on your device as a standalone app!\nLaunch it from your operating system's app menu!");
    //alert(`Thank you for installing Blaze Audio Player!\nYou can now launch it from your device's app menu.\nEnjoy your music experience for free!`);
    resetPopupMsg();
    changePopupMsg(`Thank you for installing Blaze Audio Player!<br>You can now launch it from your device's app menu.<br>Enjoy your premium music experience for free!<br>Please consider giving a ⭐ on <a target="_blank" href="https://github.com/blazeinferno64/blaze-audio-player">Github</a> if you like the app experience :D`, true);
    openPopup();
    deferredPrompt = null;
})

// Periodic check for uninstall (every 5 seconds when app reports as installed)
setInterval(() => {
    const storedInstallState = localStorage.getItem("isAppInstalled");

    if (storedInstallState === "true") {
        // App was installed according to localStorage
        // Check if we're still in standalone mode
        const isStandalone = window.navigator.standalone === true ||
            window.matchMedia('(display-mode: standalone)').matches;

        // If NOT in standalone mode and app is NOT running in PWA, check via beforeinstallprompt
        // If beforeinstallprompt can fire, app must be uninstalled
        if (!isStandalone && !beforeInstallPromptHandled) {
            console.warn('✗ App may have been uninstalled - no longer in standalone mode');
            isAppInstalled = false;
            localStorage.removeItem("isAppInstalled");
            //downloadAppBtn.style.display = 'block';
        }
    }
}, 5000);

// Service Worker Update Management
let updateRefreshScheduled = false;

// Check for updates when app loads
window.addEventListener('load', () => {
    // Register service worker if not already registered
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('[App] Service Worker registered successfully');

                // Check for updates immediately when app loads
                if (registration.controller) {
                    registration.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
                }

                // Optional: Check for updates every 30 seconds
                setInterval(() => {
                    if (registration.controller) {
                        registration.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
                    }
                }, 30000);
            })
            .catch(error => {
                console.error('[App] Service Worker registration failed:', error);
            });
    }

    // Listen for update notifications from the service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                console.log('[App] Update available:', event.data.message);

                // Show update notification to user
                showUpdateNotification();
            }

            // Handle installation complete message
            if (event.data && event.data.type === 'INSTALLATION_COMPLETE') {
                console.log('[App] Installation complete:', event.data.message);

                // Show installation complete alert to user
                showInstallationCompleteAlert(event.data.version);
            }
        });
    }
});

// Add this event listener to your script.js
window.addEventListener('swUpdateAvailable', () => {
    showUpdateNotification();
});

// Function to show update notification
function showUpdateNotification() {
    if (updateRefreshScheduled) return;
    updateRefreshScheduled = true;

    const userConfirmed = confirm(
        'A new version of Blaze Audio Player is available!\n' +
        'Click OK to update and apply the changes now!'
    );

    if (userConfirmed) {
        // Find the waiting worker and tell it to take over
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                // Fallback if no worker is waiting
                loaderBg.style.opacity = '1';
                loaderBg.classList.remove("hide");
                loadingText.innerText = `Applying updates...`;
                setTimeout(() => {
                    loadingText.innerText = `Almost done...`;
                }, 1000);
                setTimeout(() => {
                    return window.location.reload();
                }, 2000);
                //window.location.reload();
            }
        });
    } else {
        updateRefreshScheduled = false;
    }
}

let shown = false;

// Function to show installation complete notification
function showInstallationCompleteAlert(version) {
    // Show alert that installation is complete
    if (!shown) {
        alert(
            `Blaze Audio Player ${version} is ready!\n` +
            'The app has been updated successfully!\n' +
            'Applying changes...'
        );
        shown = true;
        // Reset flag after 2 seconds
        setTimeout(() => {
            shown = false;
        }, 2000);
    }
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
            showUpdateNotification();
        }

        if (event.data.type === 'NO_UPDATE_FOUND') {
            // Reset button text
            if (isPWA) {
                downloadAppBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Check for Updates';
                downloadAppBtn.onclick = async (e) => {
                    const originalText = downloadAppBtn.innerHTML;
                    downloadAppBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking for updates...';
                    setTimeout(() => {
                        downloadAppBtn.innerHTML = originalText;
                        resetPopupMsg();
                        changePopupMsg(`No updates found!<br>You're already on the latest version of Blaze Audio Player!`, true);
                        openPopup();
                        //return alert(`No updates found!\nYou're already on the latest version of Blaze Audio Player!`);
                    }, 3000);
                }
                console.log('[App] No update found - app is on the latest version');
            }
        }

        if (event.data.type === 'INSTALLATION_COMPLETE') {
            showInstallationCompleteAlert(event.data.version);
        }
    });

    // Listen for controller change (when service worker updates)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service worker controller changed - new version is now active');
        window.location.reload();
    });
}

//console.log(isPWA);