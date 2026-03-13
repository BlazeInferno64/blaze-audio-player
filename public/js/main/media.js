/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */

let myMedia;

const imgArray = [
    { src: 'https://picsum.photos/96', sizes: '96x96', type: 'image/jpeg' },
    { src: 'https://picsum.photos/128', sizes: '128x128', type: 'image/jpeg' },
    { src: 'https://picsum.photos/192', sizes: '192x192', type: 'image/jpeg' },
    { src: 'https://picsum.photos/256', sizes: '256x256', type: 'image/jpeg' },
    { src: 'https://picsum.photos/512', sizes: '512x512', type: 'image/jpeg' }
];

const updatePositionState = (audioElement) => {
    // Chrome Fix: Ensure values are finite numbers. NaN or Infinity will break the API.
    if ('setPositionState' in navigator.mediaSession &&
        isFinite(audioElement.duration) &&
        isFinite(audioElement.currentTime) &&
        isFinite(audioElement.playbackRate)) {

        navigator.mediaSession.setPositionState({
            duration: audioElement.duration || 0,
            playbackRate: audioElement.playbackRate || 1,
            position: audioElement.currentTime || 0
        });
    }
}

function setMediaSessionApi(audioElement, mediaTitle, mediaArtist, mediaAlbum, mediaImage, mediaMimeType, local = true) {
    console.log("Media API Initialized");
    if ('mediaSession' in navigator) {
        try {
            navigator.mediaSession.metadata = null;
            // Fix 1: Ensure strings are never null/undefined (Constructor is strict)
            const metadataConfig = {
                title: String(mediaTitle || "Unknown Title"),
                artist: String(mediaArtist || "Unknown Artist"),
                album: String(mediaAlbum || "Unknown Album"),
                // Fix 2: Chrome requires the artwork array to be well-formed
                artwork: !local ? mediaImage ? mediaImage : imgArray : mediaImage
                    ? [{ src: mediaImage, type: mediaMimeType || 'image/png', sizes: '512x512' }]
                    : imgArray
            };

            navigator.mediaSession.metadata = new MediaMetadata(metadataConfig);

            // Fix 3: Set playback state immediately
            //navigator.mediaSession.playbackState = audioElement.paused ? "paused" : "playing";

            const handlers = [
                ['play', () => audioElement.play()],
                ['pause', () => audioElement.pause()],
                ['seekbackward', (details) => {
                    console.log(`Seeked backwards`);
                    audioElement.currentTime = Math.max(audioElement.currentTime - (details.seekOffset || 10), 0);
                }],
                ['seekforward', (details) => {
                    console.log(`Seeked forwards`);
                    audioElement.currentTime = Math.min(audioElement.currentTime + (details.seekOffset || 10), audioElement.duration);
                }],
                ['seekto', (details) => {
                    console.log(`Seekeded to`);
                    audioElement.currentTime = details.seekTime;
                }],
                ['stop', () => {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                }]
            ];

            // Apply standard handlers
            handlers.forEach(([action, handler]) => {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.warn(`Action ${action} not supported.`);
                }
            });

            // DISABLE Next/Prev for local files
            if (local) {
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            } else {
                const skipLogic = () => {
                    // This triggers the physical click on your UI button
                    if (typeof streamNextAudioFile !== 'undefined') streamNextAudioFile.click();
                };
                navigator.mediaSession.setActionHandler('previoustrack', skipLogic);
                navigator.mediaSession.setActionHandler('nexttrack', skipLogic);
            }

            // Fix 4: Remove duplicated listeners if function is called multiple times
            // Note: In a real app, use named functions to removeEventListener first.
            audioElement.onplay = () => {
                navigator.mediaSession.playbackState = "playing";
                updatePositionState(audioElement);
            };
            audioElement.onpause = () => {
                navigator.mediaSession.playbackState = "paused";
            };

            audioElement.ontimeupdate = () => {
                // Throttled update to avoid performance lag
                if (Math.floor(audioElement.currentTime) % 2 === 0) {
                    updatePositionState(audioElement);
                }
            }

            navigator.mediaSession.playbackState = audioElement.paused ? "paused" : "playing";

        } catch (error) {
            console.error(`Media Session Error: ${error}`);
        }
    }
}