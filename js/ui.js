const hamburgerMenu = document.querySelector(".menu");
const navList = document.querySelector(".list");
const closeBtn = document.querySelector(".close");

const link = document.querySelector(".foot-bottom");
const allLinks = document.querySelectorAll(".a-link");
const underlineEffect = document.querySelector(".effect");
const underlineEffect2 = document.querySelector(".effect1");

const typeAudioLinkBtn = document.querySelector("#type");
const inputAudioLinkBackground = document.querySelector(".input-link");

const closeBgBtn = document.querySelector(".close-bg");

const bar1 = document.querySelector(".bar1");
const bar2 = document.querySelector(".bar2");
const bar3 = document.querySelector(".bar3");

const informer = document.querySelector(".informer");

const formsInput = document.querySelector(".field");
const subBtn = document.querySelector(".submit");
const crossOriginForms = document.querySelector("#form");

formsInput.addEventListener("input",(e) => {
    if(formsInput.value.length <= 5){
        subBtn.style.opacity = '.55';
        subBtn.style.pointerEvents = 'none';
    }
    else{
        subBtn.style.pointerEvents = 'auto';
        subBtn.style.opacity = '1';
    }
})


hamburgerMenu.addEventListener("mouseover",(e) => {
    bar1.style.color = 'hsl(0, 0%, 80%)';
    bar2.style.color = 'hsl(0, 0%, 80%)';
    bar3.style.color = 'hsl(0, 0%, 80%)';
    informer.classList.remove("hidden");
})

hamburgerMenu.addEventListener("mouseout",(e) => {
    bar1.style.color = 'hsl(0, 0%, 100%)';
    bar2.style.color = 'hsl(0, 0%, 100%)';
    bar3.style.color = 'hsl(0, 0%, 100%)';
    informer.classList.add("hidden");
})

closeBgBtn.addEventListener("click",(e) => {
    inputAudioLinkBackground.classList.add("hidden");
})

typeAudioLinkBtn.addEventListener("click",(e) => {
    e.preventDefault();
    navList.style.right = '-100%';
    inputAudioLinkBackground.classList.remove("hidden");
})


allLinks.forEach(a => {
    a.addEventListener("mouseover",(e) => {
        underlineEffect2.style.width = '100%';
    });
    a.addEventListener("mouseout",(e) => {
        underlineEffect2.style.width = '0';
    })
})


link.addEventListener("mouseover",(e) => {
    underlineEffect.style.width = '100%';
})

link.addEventListener("mouseout",(e) => {
    underlineEffect.style.width = '0';
})

hamburgerMenu.addEventListener("click",(e) => {
    navList.style.right = '0';
})

closeBtn.addEventListener("click",(e) => {
    navList.style.right = '-100%';
})