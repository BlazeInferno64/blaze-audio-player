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

//const radioURL = `http://127.0.0.1:3000/api/`;

const radioURL = `https://radio-station-v2.vercel.app/api/`;

// Build radio URL with optional genre query parameter
const buildRadioURL = () => {
    try {
        // const base = new URL(radioURL);
        const genreEl = audioGenre;
        /*if (genreEl && genreEl.value) {
            base.searchParams.set('genre', genreEl.value);
        }
        console.log(base.toString());
        return base.toString();*/
        const radioURL = `${radioURL}${genreEl && genreEl.value ? encodeURIComponent(genreEl.value) : 'house'}`;
        console.log(radioURL)
        return radioURL;

    } catch (e) {
        // fallback to plain string if URL constructor fails
        if (audioGenre && audioGenre.value) return `${radioURL}${encodeURIComponent(audioGenre.value)}`;
        return radioURL;
    }
}

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
            return readMediaData(audioBlob);
        }
        else {
            audioTrackName.innerText = 'Unknown Audio File';
            fetchResult.classList.remove("normal");
            fetchResult.classList.remove("err");
            fetchResult.classList.add("ok");
            fetchResult.innerText = 'Successfull!';
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

const streamAudioFile = async (url) => {
    try {
        const response = await fetch(url, {
            method: "POST"
        });
        const data = await response.json();
        const streamURL = data.url;
        const name = data.name;
        const audioBlob = await fetch(streamURL).then(res => res.blob());
        if (!audioBlob.type.startsWith('audio/')) {
            alert(`The response isn't a valid audio file!`);
            console.error(`Not a valid audio response!`);
            streamResult.classList.add("normal");
            streamResult.classList.remove("err");
            streamResult.classList.remove("ok");
            return streamResult.innerText = `Request was successfull! But didn't received a valid audio file as response!`
        }
        const audioURL = URL.createObjectURL(audioBlob);
        audio.src = audioURL;
        await audio.load();
        streaming = true;
        artistName.innerText = 'Unknown';
        streamResult.classList.remove("normal");
        streamResult.classList.remove("err");
        streamResult.classList.add("ok");
        streamResult.innerText = 'Successfully streaming now!';
        audioTrackName.innerText = name || trimLastPart(url) || 'Unknown Audio File';
        audioFileSelected = true;
    } catch (error) {
        streamResult.classList.remove("normal");
        streamResult.classList.add("err");
        streamResult.classList.remove("ok");
        welcomeStreamBtnText.innerText = '24/7 Radio Stream';
        streamResult.innerText = `Radio station is currently unavailable!`;
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
    try {
        const url = buildRadioURL();
        await streamAudioFile(url);
    } catch (error) {
        return console.error(error);
    }
})

streamNextAudioFile.addEventListener("click", async (e) => {
    streamResult.classList.remove("normal");
    streamResult.classList.remove("err");
    streamResult.classList.remove("ok");
    streamResult.innerText = `Changing to next track...`;
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
        if (streamResult) {
            streamResult.classList.remove('normal');
            streamResult.classList.remove('err');
            streamResult.classList.remove('ok');
            streamResult.innerText = 'Fetching next track...';
        }
        try {
            const url = buildRadioURL();
            await streamAudioFile(url);
        } catch (err) {
            console.error('Error fetching next track:', err);
            if (streamResult) {
                streamResult.classList.remove('normal');
                streamResult.classList.add('err');
                streamResult.classList.remove('ok');
                streamResult.innerText = 'Failed to fetch next track.';
            }
        }
    });
}

