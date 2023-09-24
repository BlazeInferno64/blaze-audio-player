const menuDot = document.querySelector(".menu-btn");
const parentSettings = document.querySelector("#parent-bg")
const settings = document.querySelector("#settings");
const closeBtn = document.querySelector(".close");
const listOpenerBtn = document.querySelector(".sel");
const volumeBg = document.querySelector(".volume-control");
const volumeBtn = document.querySelector(".volume");
const volumeCard = document.querySelector(".volume-card");
const doneBtn = document.querySelector(".custom-btn");

const backDefault = document.querySelector("#back");
const closeLinkerBtn = document.querySelector("#close-linker");
const sendGetRequestBtn = document.querySelector("#fetch");
const audioLinker = document.querySelector("#aud");
const audioLinkerBg = document.querySelector("#aud-bg");
const audioLinkerOpenerBtn = document.querySelector(".link");
const defaultLinker = document.querySelector(".default");
const opt = document.querySelector(".opt");
const fetchTab = document.querySelector(".fetch");
const statusBox = document.querySelector(".status");

audioLinkerOpenerBtn.addEventListener("click",(e) => {
    audioLinkerBg.classList.remove("hide");
    settings.classList.add("bottom");
    setTimeout(() => {
        parentSettings.classList.add("hide");
        audioLinker.classList.remove("top");
        audioLinker.classList.remove("hide");
    }, 500);
})

closeLinkerBtn.addEventListener("click",(e) => {
    audioLinker.classList.add("top");
    audioLinker.classList.add("hide");
    setTimeout(() => {
        audioLinkerBg.classList.add("hide");
    }, 500);
})

sendGetRequestBtn.addEventListener("click",(e) => {
    defaultLinker.classList.add("left");
    opt.classList.add("left");
    closeLinkerBtn.style.display = 'none';
    backDefault.style.display = 'block';
    defaultLinker.classList.add("absolute");
    sendGetRequestBtn.classList.add("left");
    sendGetRequestBtn.classList.add("absolute");

    fetchTab.classList.remove("left");
    fetchTab.classList.remove("absolute");
    statusBox.classList.remove("left");
    statusBox.classList.remove("absolute");
    setTimeout(() => {
        defaultLinker.classList.add("hide");
        opt.classList.add("hide");
        sendGetRequestBtn.classList.add("hide");
        opt.classList.add("absolute");
        fetchTab.classList.remove("hide");
        statusBox.classList.remove("hide");
    }, 10);
})

backDefault.addEventListener("click",(e) => {
    defaultLinker.classList.remove("hide");
    opt.classList.remove("hide");
    sendGetRequestBtn.classList.remove("hide");
    closeLinkerBtn.style.display = 'block';
    backDefault.style.display = 'none';

    
    fetchTab.classList.add("hide");
    statusBox.classList.add("hide");
    setTimeout(() => {
        defaultLinker.classList.remove("left");
        opt.classList.remove("left");
        sendGetRequestBtn.classList.remove("left");
        sendGetRequestBtn.classList.remove("absolute");
        opt.classList.remove("absolute");
        defaultLinker.classList.remove("absolute");

        fetchTab.classList.add("left");
        fetchTab.classList.add("absolute");
        statusBox.classList.add("left");
        statusBox.classList.add("absolute");
    }, 10);
})

volumeBtn.addEventListener("click",(e) => {
    volumeBg.classList.remove("hide");
    setTimeout(() => {
        volumeCard.classList.remove("hide");
        volumeCard.classList.remove("top");
    }, 500);
})

doneBtn.addEventListener("click",(e) => {
    volumeCard.classList.add("top");
    volumeCard.classList.add("hide");
    setTimeout(() => {
        volumeBg.classList.add("hide");
    }, 500);
})

menuDot.addEventListener("click",(e) => {
    parentSettings.classList.remove("hide");
    setTimeout(() => {
        settings.classList.remove("bottom");
    }, 500);
})

listOpenerBtn.addEventListener("click",(e) => {
    parentSettings.classList.remove("hide");
    setTimeout(() => {
        settings.classList.remove("bottom");
    }, 500);
})

closeBtn.addEventListener("click",(e) => {
    settings.classList.add("bottom");
    setTimeout(() => {
        parentSettings.classList.add("hide");
    }, 500);
})