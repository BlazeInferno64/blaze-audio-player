/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */
const volumeBg = document.querySelector(".vol-bg");
const volumeCard = document.querySelector(".vol-card");
const volumeBtn = document.querySelector("#vol-btn");
const openVolCardBtn = document.querySelector(".set-vol");
const doneBtn = document.querySelector(".done");
const closeVolumeCardBtn = document.querySelector(".vol-close");

const setBg = document.querySelector(".set-bg");
const setCard = document.querySelector(".set-card");
const setCardCloseBtn = document.querySelector(".set-close");
const openSetCardBtn = document.querySelector("#settings-btn");

const linkBg = document.querySelector(".link-bg");
const fetchCard = document.querySelector(".fetch-card");;
const openLinkBgBtn = document.querySelector("#link-btn");

const openLinkSettingsBtn = document.querySelector(".link-set");
const closeLinkBgBtn = document.querySelector(".close-fetch");
const closeLinkCardBtn = document.querySelector(".close-link");

const welcomeBg = document.querySelector(".wel-bg");
const welcomeCard = document.querySelector(".wel-card");
const closeWelcomeCardBtn = document.querySelector(".wel-close")

const openStreamCardBtn = document.querySelector(".ch-stream");
const streamBg = document.querySelector(".stream-bg");
const streamCard = document.querySelector(".stream-card");
const closeStreamCardBtn = document.querySelector(".stream-close")

const popupBg = document.querySelector(".popup-bg");
const popup = document.querySelector(".popup")
const closePopupBtn = document.querySelector(".popup-close");

const openVolumeCard = () => {
    volumeBg.classList.remove("hide");
    volumeCard.classList.add("ani");
    volumeCard.classList.remove("hide");

    setTimeout(() => {
        volumeCard.classList.remove("down");
    }, 500);
}

const openWelcomeCard = () => {
    welcomeBg.classList.remove("hide");
    welcomeCard.classList.add("ani");
    welcomeCard.classList.remove("hide");

    setTimeout(() => {
        welcomeCard.classList.remove("down");
    }, 500);
}

const openFetchCard = () => {
    fetchCard.classList.remove("none");
    linkBg.classList.remove("hide");
    fetchCard.classList.add("ani");
    fetchCard.classList.remove("hide");

    setTimeout(() => {
        fetchCard.classList.remove("down");
    }, 500);
}

const openStreamCard = () => {
    streamCard.classList.remove("none");
    streamBg.classList.remove("hide");
    streamCard.classList.add("ani");
    streamCard.classList.remove("hide");

    setTimeout(() => {
        streamCard.classList.remove("down");
    }, 500);
}

const openSetCard = () => {
    setBg.classList.remove("hide");
    setTimeout(() => {
        setCard.classList.remove("hide");
        setCard.classList.remove("bottom");
    }, 300);
}

const openWelcomePopup = () => {
    popupBg.classList.remove("hide");
    setTimeout(() => {
        popup.classList.remove("go-down");
    }, 500);
    setTimeout(() => {
        popup.classList.remove("hide");
    }, 600);
}

const closePopup = () => {
    popup.classList.add("go-down");
    setTimeout(() => {
        popup.classList.add("hide");
    }, 100);
    setTimeout(() => {
        popupBg.classList.add("hide");
    }, 500);
}

const closeSetCard = () => {
    setCard.classList.add("bottom");
    setTimeout(() => {
        setCard.classList.add("hide");
    }, 500);
    setTimeout(() => {
        setBg.classList.add("hide");
    }, 700);
}

const closeVolumeCard = () => {
    volumeCard.classList.add("up");
    volumeCard.classList.add("anti");
    setTimeout(() => {
        volumeCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        volumeBg.classList.add("hide");
        volumeCard.classList.remove("anti");
        volumeCard.classList.add("hide");
    }, 1000);
    setTimeout(() => {
        volumeCard.classList.add("down");
        volumeCard.classList.remove("up");
        volumeCard.classList.remove("ani");
    }, 1200);
}

const closeWelcomeCard = () => {
    welcomeCard.classList.add("up");
    welcomeCard.classList.add("anti");
    setTimeout(() => {
        welcomeCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        welcomeBg.classList.add("hide");
        welcomeCard.classList.remove("anti");
        welcomeCard.classList.add("hide");
    }, 1000);
    setTimeout(() => {
        welcomeCard.classList.add("down");
        welcomeCard.classList.remove("up");
        welcomeCard.classList.remove("ani");
    }, 1200);
}

const closeFetchCard = () => {
    fetchCard.classList.add("up");
    fetchCard.classList.add("anti");
    setTimeout(() => {
        fetchCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        linkBg.classList.add("hide");
        fetchCard.classList.remove("anti");
        fetchCard.classList.add("hide");
    }, 1000);
    setTimeout(() => {
        fetchCard.classList.add("down");
        fetchCard.classList.remove("up");
        fetchCard.classList.remove("ani");
        fetchCard.classList.add("none");
    }, 1200);
}

const closeStreamCard = () => {
    streamCard.classList.add("up");
    streamCard.classList.add("anti");
    setTimeout(() => {
        streamCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        streamBg.classList.add("hide");
        streamCard.classList.remove("anti");
        streamCard.classList.add("hide");
    }, 1000);
    setTimeout(() => {
        streamCard.classList.add("down");
        streamCard.classList.remove("up");
        streamCard.classList.remove("ani");
        streamCard.classList.add("none");
    }, 1200);
}


volumeBtn.addEventListener("click", (e) => {
    return openVolumeCard();
})
openVolCardBtn.addEventListener("click", (e) => {
    return openVolumeCard();
})
doneBtn.addEventListener("click", (e) => {
    return closeVolumeCard();
})
closeVolumeCardBtn.addEventListener("click", (e) => {
    return closeVolumeCard();
})

openSetCardBtn.addEventListener("click", (e) => {
    return openSetCard();
})

setCardCloseBtn.addEventListener("click",(e) => {
    return closeSetCard();
})

closeLinkBgBtn.addEventListener("click", (e) => {
    return closeFetchCard();
})
openLinkBgBtn.addEventListener("click", (e) => {
    return openStreamCard();
})
openLinkSettingsBtn.addEventListener("click", (e) => {
    return openFetchCard();
})
openStreamCardBtn.addEventListener("click", (e) => {
    return openStreamCard();
})
closeStreamCardBtn.addEventListener("click", (e) => {
    return closeStreamCard();
})

closeWelcomeCardBtn.addEventListener("click", (e) => {
    closeWelcomeCard();
    return openWelcomePopup();
})

closePopupBtn.addEventListener("click", (e) => {
    return closePopup();
})