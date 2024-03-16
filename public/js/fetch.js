const fetchAudioBtn = document.querySelector(".send");
const linkInput = document.querySelector(".link");
const statusOfRequest = document.querySelector(".st");


const fetchFile = (url) => {
    fetch(url)
    .then(res => {
        if(!res.ok){
            throw new Error(`An HTTP error occured with statuscode:${res.status}`);
        }
        return res.blob()
    })
    .then(data => {
        const bloblObjectURL = URL.createObjectURL(data);
        previousURL = bloblObjectURL;
        trimLastPart(linkInput.value);
        audio.load();
        audio.play();
        statusOfRequest.classList.remove("not-ok");
        statusOfRequest.classList.add("ok");
        statusOfRequest.innerText = `Request was successfull!`;
        alert(`File has been fetched successfully!`);
    })
    .catch((err) => {
        console.error(`An error occured:${err}`);
        statusOfRequest.classList.remove("ok");
        statusOfRequest.classList.add("not-ok");
        statusOfRequest.innerText = err;
        alert(`Error occured while fetching! Please check browser console for more information...`);
    })
}

fetchAudioBtn.addEventListener("click",(e) => {
    statusOfRequest.innerText = `Sending request to ${linkInput.value}`
    statusOfRequest.classList.remove("ok");
    statusOfRequest.classList.remove("not-ok");
    fetchFile(linkInput.value);
})