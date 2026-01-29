/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */

const activeUsersCount = document.querySelector("#active-count");
const activeLogo = document.querySelector(".active-logo");
const activeTab = document.querySelector(".active");
const streamAbout = document.querySelector(".stream-abt");

const HTTPUrl = 'https://presence-server.blazinginfernodragon123.workers.dev/ws';

const wsUrl = 'wss://presence-server.blazinginfernodragon123.workers.dev/ws';

let socket = null;

function checkAndReconnect() {
    // Reconnect only if socket is null, closed, or closing
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        console.log("[Presence] Tab became active. Attempting to reconnect...");
        streamAbout.textContent = "Reconnecting Presence...";
        initPresenceSocket();
    }
}

function initPresenceSocket() {
    
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
    }

    if (socket) {
        socket.close();
        socket = null;
    }

    socket = new WebSocket(wsUrl);

    socket.addEventListener("open", (event) => {
        console.log(`Connection handshake successfull!`);
        activeLogo.classList.remove("error", "afk", "warn");

        // Show connected state (green)
        activeLogo.classList.add("success");
        streamAbout.textContent = `Establishing connection...`;
        activeTab.title = `Establishing handshake...`;
        //activeUsersCount.textContent = `Offline`;
    })

    socket.addEventListener("message", (event) => {
        let data;

        try {
            data = JSON.parse(event.data);
        } catch (error) {
            return;
        }

        // Update only the active users count
        if (data.active !== undefined) {
            const count = data.active;
            const label = count === 1 ? "user" : "users";
            activeTab.title = `${count} ${label} listening with you!`;
            streamAbout.title = `${count} ${label} listening with you!`;
            streamAbout.textContent = `${count} ${label} listening with you!`;
            activeLogo.classList.add("success");
            activeUsersCount.textContent = `${count} ${label}`;
        }
    })

    socket.addEventListener("error", (err) => {
        activeTab.title = `Connection unsuccessfull!Check console for more info!`;
        streamAbout.title = `Connection unsuccessfull!Check console for more info!`;
        streamAbout.textContent = `Connection unsuccessfull!`;
        console.error(`WebSocket error: ${err}`);
        activeLogo.classList.remove("success", "afk", "warn");
        activeLogo.classList.add("error");
        activeUsersCount.textContent = `Offline`;
    })

    socket.addEventListener("close", (event) => {
        activeTab.title = `Disconnected!`;
        streamAbout.title = `Disconnected!`;
        /*if (navigator.onLine === false) {
            streamAbout.textContent = `Network is off`;
        } else {
            streamAbout.textContent = `Disconnected!`;
        }*/
        streamAbout.textContent = `Disconnected!`;
        console.warn(`Disconnected from Presence server`);
        activeLogo.classList.remove("success", "error", "warn");
        activeLogo.classList.add("afk");
        activeUsersCount.textContent = `Offline`;
    })
}

window.addEventListener("offline", () => {
    streamAbout.textContent = "No Internet Connection!";
    activeLogo.classList.remove("success", "warn");
    activeLogo.classList.add("error");
    if (socket) {
        socket.close();
    }
});

window.addEventListener("online", () => {
    streamAbout.textContent = "Reconnecting...";
    activeLogo.classList.remove("error");
    activeLogo.classList.add("warn");
    return initPresenceSocket();
});

/*window.addEventListener("blur", (e) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("[Presence] Tab became inactive. Closing connection...");
        socket.close();
    }
})*/

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log("[Presence] Tab visible. Checking connection...");
        checkAndReconnect();
    } else {
        // Only close if the tab is actually hidden (switched tabs or minimized)
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("[Presence] Tab hidden. Closing connection...");
            //socket.close();
        }
    }
});

/*window.addEventListener("focus", () => {
    checkAndReconnect();

});*/
