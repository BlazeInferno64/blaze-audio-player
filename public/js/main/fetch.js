const fetchURLInput = document.querySelector(".fetch-url");

const fetchBtn = document.querySelector(".fetch-btn");

const fetchResult = document.querySelector(".result");

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
        if (!audioBlob.type.startsWith('audio/')){
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
        if (lastExtension) return audioTrackName.innerText = lastExtension;
        audioTrackName.innerText = 'Unknown Audio File';
        fetchResult.classList.remove("normal");
        fetchResult.classList.remove("err");
        fetchResult.classList.add("ok");
        fetchResult.innerText = 'Successfull';
        return readMediaData(audioBlob);
    } catch (error) {
        fetchResult.classList.remove("normal");
        fetchResult.classList.add("err");
        fetchResult.classList.remove("ok");
        fetchResult.innerText = error;
        return console.error(error);
    }
}

fetchBtn.addEventListener("click", async(e) => {
    fetchResult.classList.remove("normal");
    fetchResult.classList.remove("err");
    fetchResult.classList.remove("ok");
    fetchResult.innerText = `Sending...`;
    try {
        if(!validateURL(fetchURLInput.value)) {
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



