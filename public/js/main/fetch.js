/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */
const fetchURLInput = document.querySelector(".fetch-url");

const fetchBtn = document.querySelector(".fetch-btn");

const fetchResult = document.querySelector(".result");

const streamBtn = document.querySelector(".stream");

const streamNextAudioFile = document.querySelector(".next");

const streamResult = document.querySelector(".stream-result");

const audioGenre = document.querySelector(".genre");

const playNextBtn = document.querySelector(".nxt-trck");

let playNext = true;

let streaming = false;

let isLoaderShown = false;

let isNormalStream = true;

let imgLink = null;

let myURL = null;

const mySongObject = {
    artist: 'Unknown Artist',
    img: null,
    title: 'Unknown Title',
    album: 'Unknown Album',
}

function resetPlaylist () {
    try {
        const divElement = document.createElement("div");
        divElement.innerText = `Streaming from radio!`;
        divElement.className = `nothing`;

        playlistUlElement.innerHTML = '';
        playlistUlElement.appendChild(divElement);
    } catch (error) {
        console.error(error);
    }
} 

/*
const imgArray = [
    {
        src: 'https://picsum.photos/96',
        sizes: '96x96',
        type: 'image/jpeg'
    },
    {
        src: 'https://picsum.photos/128',
        sizes: '128x128',
        type: 'image/jpeg'
    },
    {
        src: 'https://picsum.photos/192',
        sizes: '192x192',
        type: 'image/jpeg'
    },
    {
        src: 'https://picsum.photos/256',
        sizes: '256x256',
        type: 'image/jpeg'
    },
    {
        src: 'https://picsum.photos/512',
        sizes: '512x512',
        type: 'image/jpeg'
    }
]*/

//const radioURL = `http://127.0.0.1:3000/api/`;

const radioURL = `https://radio-station-v2.vercel.app/api/`;

let artistGiven = null;

// Build radio URL with optional genre query parameter
const buildRadioURL = () => {
    try {
        const genre = audioGenre && audioGenre.value
            ? encodeURIComponent(audioGenre.value)
            : 'house';

        const finalURL = `${radioURL}${genre}`;
        console.log(finalURL);
        return finalURL;

    } catch (e) {
        if (audioGenre && audioGenre.value) {
            return `${radioURL}${encodeURIComponent(audioGenre.value)}`;
        }
        return radioURL;
    }
};


const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

const fetchAudioFile = async (url) => {
    try {
        const response = await fetch(url);
        const audioBlob = await response.blob();
        if (!audioBlob.type.startsWith('audio/')) {
            alert(`The response isn't a valid audio file!`);
            console.error(`Not a valid audio response!`);
            fetchResult.classList.add("normal");
            fetchResult.classList.remove("err");
            fetchResult.classList.remove("ok");
            return fetchResult.innerText = `Request was successfull! But didn't received a valid audio file as response!`
        }
        const audioURL = URL.createObjectURL(audioBlob);
        audio.src = audioURL;
        await audio.load();
        audioFileSelected = true;
        artistName.innerText = 'Unknown';
        const lastExtension = trimLastPart(url);
        if (lastExtension) {
            audioTrackName.innerText = trimFileName(lastExtension);
            //audioTrackName.innerText = 'Unknown Audio File';
            fetchResult.classList.remove("normal");
            fetchResult.classList.remove("err");
            fetchResult.classList.add("ok");
            fetchResult.innerText = 'Successfull!';
            resetBackgroundToInitial();
            return readMediaData(audioBlob);
        }
        else {
            audioTrackName.innerText = 'Unknown Audio File';
            fetchResult.classList.remove("normal");
            fetchResult.classList.remove("err");
            fetchResult.classList.add("ok");
            fetchResult.innerText = 'Successfull!';
            resetBackgroundToInitial();
            return readMediaData(audioBlob);
        }
    } catch (error) {
        fetchResult.classList.remove("normal");
        fetchResult.classList.add("err");
        fetchResult.classList.remove("ok");
        fetchResult.innerText = error;
        return console.error(error);
    }
}

const isValidAudioStream = async (url) => {
    try {
        const res = await fetch(url, {
            headers: { Range: "bytes=0-1023" }
        });

        if (!res.ok) return false;

        const contentType = res.headers.get("content-type");
        return contentType && contentType.startsWith("audio/");
    } catch {
        return false;
    }
}

/*
const updateStreamMediaSession = (title, artist) => {
    if (!('mediaSession' in navigator)) return;
    try {
        const artwork = myURL ? [
            { src: myURL, sizes: '96x96', type: 'image/jpeg' },
            { src: myURL, sizes: '128x128', type: 'image/jpeg' },
            { src: myURL, sizes: '192x192', type: 'image/jpeg' },
            { src: myURL, sizes: '256x256', type: 'image/jpeg' },
            { src: myURL, sizes: '384x384', type: 'image/jpeg' },
            { src: myURL, sizes: '512x512', type: 'image/jpeg' }
        ] : imgArray;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown',
            artist: artist || 'Blaze Radio',
            album: 'Blaze Audio Player',
            artwork
        });

        try {
            navigator.mediaSession.setActionHandler('play', async () => {
                await audio.play();
                navigator.mediaSession.playbackState = 'playing';
                playPauseCheckBox.checked = false;
            });
        } catch (error) { console.log('play handler not supported'); }

        try {
            navigator.mediaSession.setActionHandler('pause', () => {
                audio.pause();
                navigator.mediaSession.playbackState = 'paused';
                playPauseCheckBox.checked = true;
            });
        } catch (error) { console.log('pause handler not supported'); }

        try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch (_) { }
        try { navigator.mediaSession.setActionHandler('seekforward', null); } catch (_) { }

        try {
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                streamNextAudioFile.click();
            });
        } catch (error) { console.log('previoustrack handler not supported'); }

        try {
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                streamNextAudioFile.click();
            });
        } catch (error) { console.log('nexttrack handler not supported'); }

        navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';

    } catch (error) {
        console.log('MediaMetadata not supported on this device:', error);
    }
};*/

let myURi = null;

const streamAudioFile = async (url) => {
    try {
        imgLink = null;
        myURL = null;
        myURi = null; // Reset this at the start
        if (!isLoaderShown) {
            loaderBg.classList.remove("hide");
            loaderBg.style.opacity = '.85'
            loadingText.innerText = isNormalStream === true ? 'Loading stream...' : 'Loading next track...';
        }
        const response = await fetch(url, {
            method: "GET"
        });
        const data = await response.json();
        const streamURL = data.url;
        const name = data.name;
        artistGiven = data.artist || "Unknown";
        if (!data.artist) {
            try {
                const srch = await itunes.search(name);
                if (srch.results[0].artistName) {
                    artistGiven = srch.results[0].artistName;
                } else {
                    artistGiven = `Unknown Artist`;
                }
            } catch (error) {
                console.error(error);
                artistGiven = `Unknown Artist`;
            }
        }

        //const audioBlob = await fetch(streamURL).then(res => res.blob());
        /*if (!audioBlob.type.startsWith('audio/')) {
            alert(`The response isn't a valid audio file!`);
            console.error(`Not a valid audio response!`);
            streamResult.classList.add("normal");
            streamResult.classList.remove("err");
            streamResult.classList.remove("ok");
            return streamResult.innerText = `Request was successfull! But didn't received a valid audio file as response!`
        }*/
        if (!isValidAudioStream(streamURL)) {
            alert(`The response isn't a valid audio file!`);
            console.error(`Not a valid audio response!`);
            streamResult.classList.add("normal");
            streamResult.classList.remove("err");
            streamResult.classList.remove("ok");
            return streamResult.innerText = `Request was successfull! But didn't received a valid audio file as response!`
        }
        //const audioURL = URL.createObjectURL(audioBlob);
        if (data.img) {
            myURL = data.img;
            imgLink = [
                {
                    src: data.img,
                    sizes: '512x512', // You can specify a large size as a catch-all
                    type: 'image/jpeg'
                }
            ];
        }
        if (!data.img) {
            try {
                const srch = await itunes.search(name);
                if (srch.results[0].artworkUrl100) {
                    myURi = srch.results[0].artworkUrl100 || imgArray[4].src;
                    imgLink = [
                        {
                            src: myURi,
                            sizes: '512x512', // You can specify a large size as a catch-all
                            type: 'image/jpeg'
                        }
                    ];
                } else {
                    myURi = myURL || imgArray[4].src;
                }
            } catch (error) {
                console.error(error);
                myURi = myURL || imgArray[4].src;
            }
        }
        appHead.style.backgroundImage = `url("${myURi || myURL || imgArray[4].src}")`;
        appBannerBg.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${myURi || myURL || imgArray[4].src}")`;
        appBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.2)), url("${myURi || myURL || imgArray[4].src}")`;

        // Set MediaSession metadata and OS handlers BEFORE audio.play().
        // Chrome only registers the OS media controls (thumbnail toolbar, lock screen)
        // when it sees metadata + handlers already in place at the moment the play
        // event fires. If we set them after play(), Chrome misses that signal entirely.
        if (data && data.url) {
            setMediaSessionApi(
                audio,
                data.name || "Streaming Track",
                artistGiven || "Unknown Artist",
                "Blaze Audio Player's 24/7 Radio Station",
                imgLink,
                'image/jpeg',
                false // local = false enables Next/Prev buttons
            );
        }

        audio.src = streamURL;
        audio.load();
        // DO NOT call audio.load() — it resets Chrome's autoplay permission state,
        // killing the gesture token from the click handler. Setting .src already
        // triggers the internal load. Call .play() directly to honour the gesture.
        audio.play()
        streaming = true;
        artistName.innerText = 'Connected to Radio Stream!';
        streamResult.classList.remove("normal");
        streamResult.classList.remove("err");
        streamResult.classList.add("ok");
        streamResult.innerText = 'Connected to Radio Stream!';
        audioTrackName.innerText = name || trimLastPart(url) || 'Unknown Audio File';
        // Construct query: "Artist - Title"
        audioFileSelected = true;
        if (!isLoaderShown) {
            loadingText.innerText = `Buffering audio...`;
            setTimeout(() => {
                loaderBg.classList.add("hide");
                isLoaderShown = false;
            }, 300);
        }
        isLoaderShown = false;
        const cleanName = name
            .replace(/\.[^/.]+$/, "")
            .replace(/^\d+[\s.-]+/, "")
            .replace(/[\[\(\{].*?[\]\)\}]/g, "")
            .trim();

        const myText = (artistGiven && artistGiven !== "Unknown")
            ? `${artistGiven} - ${cleanName}`
            : cleanName;
        //await getLyrics(name);
        if (typeof fetchLyrics === "function") {
            //fetchLyrics(lyricsQuery);
            fetchLyrics(myText);
        }
        resetPlaylist();
        //playlistUlElement.innerHTML = '';
    } catch (error) {
        streamResult.classList.remove("normal");
        streamResult.classList.add("err");
        streamResult.classList.remove("ok");
        welcomeStreamBtnText.innerText = '24/7 Radio Stream';
        artistName.innerText = `Failed to connect to the radio stream!`;
        streamResult.innerText = `Radio station is currently unavailable!`;
        artistName.innerText = `Radio Station is down!`;
        alert(`Failed to connect to the radio stream!`);
        return console.error(error);
    }
}

fetchBtn.addEventListener("click", async (e) => {
    fetchResult.classList.remove("normal");
    fetchResult.classList.remove("err");
    fetchResult.classList.remove("ok");
    fetchResult.innerText = `Sending...`;
    try {
        if (!validateURL(fetchURLInput.value)) {
            fetchResult.classList.remove("normal");
            fetchResult.classList.add("err");
            fetchResult.classList.remove("ok");
            return fetchResult.innerText = `Error: Invalid URL!`;
        };
        await fetchAudioFile(fetchURLInput.value);
    } catch (error) {
        return console.error(error);
    }
})


streamBtn.addEventListener("click", async (e) => {
    streamResult.classList.remove("normal");
    streamResult.classList.remove("err");
    streamResult.classList.remove("ok");
    streamResult.innerText = `Connecting to stream...`;
    isNormalStream = true;

    // Reset broadcast so announcement plays on each fresh connect
    broadCastEnd = false;
    broadCastTriggered = false;

    // Unlock AudioContext + gesture token before any awaits
    if (typeof context !== 'undefined' && context && context.state === 'suspended') {
        context.resume();
    }
    audio.play().catch(() => {});

    try {
        const url = buildRadioURL();
        await streamAudioFile(url);
    } catch (error) {
        artistName.innerText = `Failed to connect to the radio stream!`;
        return console.error(error);
    }
})

streamNextAudioFile.addEventListener("click", async (e) => {
    streamResult.classList.remove("normal");
    streamResult.classList.remove("err");
    streamResult.classList.remove("ok");
    streamResult.innerText = `Changing to next track...`;
    artistName.innerText = `Switching to next track...`;
    isNormalStream = false;

    // Unlock AudioContext + gesture token before any awaits
    if (typeof context !== 'undefined' && context && context.state === 'suspended') {
        context.resume();
    }
    audio.play().catch(() => {});

    try {
        const url = buildRadioURL();
        await streamAudioFile(url);
    } catch (error) {
        return console.error(error);
    }
})

// Toggle playNext when the user clicks the .nxt-trck checkbox
if (streamNextAudioFile) {
    streamNextAudioFile.addEventListener('change', (e) => {
        // If it's a checkbox input, update playNext accordingly. Otherwise ignore.
        const target = e.currentTarget;
        if (target.type === 'checkbox') {
            playNext = target.checked;
        }
    });
}

// Override forward/backward buttons to skip to next stream track when streaming
if (typeof forwardBtn !== 'undefined' && forwardBtn) {
    forwardBtn.addEventListener('click', () => {
        if (streaming) streamNextAudioFile.click();
    });
}

if (typeof backwardBtn !== 'undefined' && backwardBtn) {
    backwardBtn.addEventListener('click', () => {
        if (streaming) streamNextAudioFile.click();
    });
}

// Listen for audio end to auto-fetch next when enabled
if (typeof audio !== 'undefined' && audio) {
    audio.addEventListener('ended', async () => {
        if (!playNext || !streaming) return;  // <-- Add !streaming check: Only auto-fetch if streaming and playNext is true
        // Update UI while fetching next
        if (streamResult && artistName) {
            streamResult.classList.remove('normal');
            streamResult.classList.remove('err');
            streamResult.classList.remove('ok');
            streamResult.innerText = 'Fetching next track...';
            artistName.innerText = `Switching to next track...`;
            isNormalStream = false;
        }
        try {
            const url = buildRadioURL();
            await streamAudioFile(url);
            // return artistName.innerText = `Connected to Radio Stream!`;
        } catch (err) {
            console.error('Error fetching next track:', err);
            if (streamResult) {
                streamResult.classList.remove('normal');
                streamResult.classList.add('err');
                streamResult.classList.remove('ok');
                streamResult.innerText = 'Failed to fetch next track.';
                artistName.innerText = `Failed to fetch next track!`;
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (audioGenre) {
            const genres = [
                { value: "house", label: "House" },
                { value: "trap", label: "Trap" },
                { value: "dnb", label: "Drum & Bass" },
                { value: "dubstep", label: "Dubstep" },
                { value: "fhouse", label: "Future House" },
                { value: "dhouse", label: "Deep House" },
                { value: "uhouse", label: "Underground House" },
                { value: "techno", label: "Techno" },
                { value: "chill", label: "Chill Station" },
                { value: "global", label: "Global Station" }
            ];

            genres.sort((a, b) => a.label.localeCompare(b.label));

            audioGenre.innerHTML = ''; // Clear existing
            genres.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.value;
                opt.textContent = g.label;
                audioGenre.appendChild(opt);
            });

            audioGenre.value = "house";
        }
    });

    if (audioGenre) {
        audioGenre.addEventListener("change", () => {
            if (streaming) {
                console.log("Genre changed, switching stream...");
                streamNextAudioFile.click();
            }
        });
    }
}