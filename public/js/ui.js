const userBg = document.querySelector(".user-bg");
const userMenu = document.querySelector(".user-menu");
const openUserMenuBtn = document.querySelector(".hamburger");
const closeUserMenuBtn = document.querySelector(".close-menu");

// Designing the settings card animation
const openSetBtn = document.querySelector("#open-set");
const setBg = document.querySelector(".set-bg");
const setCard = document.querySelector(".set-card");
const closeSetBtn = document.querySelector(".close-set");

//Designing the volume card animation
const openVolCardBtn = document.querySelector("#open-vol");
const closeVolCardBtn = document.querySelector(".close-vol");
const volBg = document.querySelector(".vol-bg");
const volCard = document.querySelector(".vol-card");
const applyChangesBtn = document.querySelector(".done");

const setBtn = document.querySelector(".set");
const volBtn = document.querySelector(".vol");

const openFetchBtn = document.querySelector("#ftch-btn");
const fetchBg = document.querySelector(".fetch-bg");
const fetchCard = document.querySelector(".fetch-card");
const closeFetchBtn = document.querySelector(".close-fetch");

const welBg = document.querySelector(".wel-bg");
const welCard = document.querySelector(".wel-card");
const closeCardBtn = document.querySelector(".close-wel");

const popup = document.querySelector(".popup");
const closePopupBtn = document.querySelector(".close-popup");

const loadBg = document.querySelector(".load-bg");
const loader = document.querySelector(".loader");
const Body = document.querySelector("body");


const loadBody = () => {
    loadBg.classList.remove("hide");
}

const stopLoading = () => {
    loadBg.classList.add("hide");
}
 
const displayPopup = () => {
    popup.classList.remove("bottom");
}

const closePopup = () => {
    popup.classList.add("bottom");
}

const closeUserMenu = () => {
    userMenu.classList.add("go-down");
    setTimeout(() => {
        userBg.classList.add("hide");
    }, 500);
}

const openUserMenu = () => {
    userBg.classList.remove("hide");
    setTimeout(() => {
        userMenu.classList.remove("go-down");
    }, 500);
}

const openSettingsCard = () => {
    setBg.classList.remove("hide");
    setCard.classList.add("ani");
    setCard.classList.remove("hide");

    setTimeout(() => {
        setCard.classList.remove("down");
    }, 500);
}

const closeSettingsCard = () => {
    setCard.classList.add("up");
    setCard.classList.add("anti");
    setTimeout(() => {
        setCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        setBg.classList.add("hide");
        setCard.classList.remove("anti");
        setCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        setCard.classList.add("down");
        setCard.classList.remove("up");
        setCard.classList.remove("ani");
    }, 1200);
}

const openVolumeCard = () => {
    volBg.classList.remove("hide");
    volCard.classList.add("ani");
    volCard.classList.remove("hide");

    setTimeout(() => {
        volCard.classList.remove("down");
    }, 500);
}

const closeVolumeCard = () => {
    volCard.classList.add("up");
    volCard.classList.add("anti");
    setTimeout(() => {
        volCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        volBg.classList.add("hide");
        volCard.classList.remove("anti");
        volCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        volCard.classList.add("down");
        volCard.classList.remove("up");
        volCard.classList.remove("ani");
    }, 1200);
}

const openFetchCard = () => {
    fetchBg.classList.remove("hide");
    fetchCard.classList.add("ani");
    fetchCard.classList.remove("hide");

    setTimeout(() => {
        fetchCard.classList.remove("down");
    }, 500);
}

const closeFetchCard = () => {
    fetchCard.classList.add("up");
    fetchCard.classList.add("anti");
    setTimeout(() => {
        fetchCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        fetchBg.classList.add("hide");
        fetchCard.classList.remove("anti");
        fetchCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        fetchCard.classList.add("down");
        fetchCard.classList.remove("up");
        fetchCard.classList.remove("ani");
    }, 1200);
}

const openWelcomeCard = () => {
    welBg.classList.remove("hide");
    welCard.classList.add("ani");
    welCard.classList.remove("hide");

    setTimeout(() => {
        welCard.classList.remove("down");
    }, 500);
}

const closeWelcomeCard = () => {
    welCard.classList.add("up");
    welCard.classList.add("anti");
    setTimeout(() => {
        welCard.classList.add("hide");
    }, 700);
    setTimeout(() => {
        welBg.classList.add("hide");
        welCard.classList.remove("anti");
        welCard.classList.add("hide");
    }, 1000);

    setTimeout(() => {
        welCard.classList.add("down");
        welCard.classList.remove("up");
        welCard.classList.remove("ani");
    }, 1200);
}

closeUserMenuBtn.addEventListener("click",(e) => {
    closeUserMenu();
})

openUserMenuBtn.addEventListener("click",(e) => {
    openUserMenu();
})

closeSetBtn.addEventListener("click",(e) => {
    closeSettingsCard();
})

openSetBtn.addEventListener("click",(e) =>{
    openSettingsCard();
})

closeVolCardBtn.addEventListener("click",(e) => {
    closeVolumeCard();
})

openVolCardBtn.addEventListener("click",(e) => {
    openVolumeCard();
})

applyChangesBtn.addEventListener("click",(e) => {
    closeVolumeCard();
})

setBtn.addEventListener("click",(e) => {
    openSettingsCard();
})

volBtn.addEventListener("click",(e) => {
    openVolumeCard();
})

closeFetchBtn.addEventListener("click",(e) => {
    closeFetchCard();
})

openFetchBtn.addEventListener("click",(e) => {
    openFetchCard();
})

closeCardBtn.addEventListener("click",(e) => {
    closeWelcomeCard();
    setTimeout(() => {
        displayPopup();
    }, 1000);
})


closePopupBtn.addEventListener("click",(e) => {
    closePopup();
})

Body.onload = (e) => {
    setTimeout(() => {
        stopLoading();
        openWelcomeCard();
    }, 2000);
}