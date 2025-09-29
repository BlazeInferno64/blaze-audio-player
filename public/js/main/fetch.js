const fetchURLInput = document.querySelector(".fetch-url");

const fetchBtn = document.querySelector(".fetch-btn");

const fetchResult = document.querySelector(".result");

const streamBtn = document.querySelector(".stream");

const streamNextAudioFile = document.querySelector(".next");

const streamResult = document.querySelector(".stream-result");

const radioURL = `https://radio-station-seven.vercel.app/api/house`;

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
        const response = await fetch(url);
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
        streamResult.innerText = `Radio station is currently unavailable!`;
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
        await streamAudioFile(radioURL);
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
        await streamAudioFile(radioURL);
    } catch (error) {
        return console.error(error);
    }
})

