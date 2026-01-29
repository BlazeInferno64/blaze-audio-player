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

const resetMediaSession = () => {
    if ('mediaSession' in navigator) {
        try {
            // Clear all handlers
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
            navigator.mediaSession.metadata = null;
        } catch (error) {
            console.log('Error resetting media session:', error);
        }
    }
};

const updateStreamMediaSession = () => {
    resetMediaSession();
    if ('mediaSession' in navigator) {
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: audioTrackName.innerText || 'Unknown',
                artist: 'Unknown',
                album: artistGiven,
                artwork: [
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
                ]
            });

            // Set action handlers with error handling
            try {
                navigator.mediaSession.setActionHandler('play', () => audio.play());
            } catch (error) {
                console.log('play handler not supported');
            }

            try {
                navigator.mediaSession.setActionHandler('pause', () => audio.pause());
            } catch (error) {
                console.log('pause handler not supported');
            }

            try {
                navigator.mediaSession.setActionHandler('seekbackward', () => audio.currentTime -= 5);
            } catch (error) {
                console.log('seekbackward handler not supported');
            }

            try {
                navigator.mediaSession.setActionHandler('seekforward', () => audio.currentTime += 5);
            } catch (error) {
                console.log('seekforward handler not supported');
            }

            try {
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    if (streaming) streamNextAudioFile.click();
                });
            } catch (error) {
                console.log('previoustrack handler not supported');
            }

            try {
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    if (streaming) streamNextAudioFile.click();
                });
            } catch (error) {
                console.log('nexttrack handler not supported');
            }
        } catch (error) {
            console.log('MediaMetadata not supported on this device:', error);
        }
    }
};

const streamAudioFile = async (url) => {
    try {
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
        audio.src = streamURL;
        await audio.load();
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
        resetBackgroundToInitial();
        updateStreamMediaSession();
        const lyricsQuery = name
            .replace(/\.[^/.]+$/, "")             // Remove extension
            .replace(/^\d+[\s.-]+/, "")           // Remove track numbers
            .replace(/[\[\(\{].*?[\]\)\}]/g, "")  // Remove brackets
            .replace(/[_-]/g, " ")                // Normalize spaces
            .trim();
        if (typeof fetchLyrics === "function") {
            fetchLyrics(lyricsQuery);
        }
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
}

