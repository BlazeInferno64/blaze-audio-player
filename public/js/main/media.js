/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License.
 */

let myMedia;

const imgArray = [
    { src: 'https://picsum.photos/96',  sizes: '96x96',   type: 'image/jpeg' },
    { src: 'https://picsum.photos/128', sizes: '128x128', type: 'image/jpeg' },
    { src: 'https://picsum.photos/192', sizes: '192x192', type: 'image/jpeg' },
    { src: 'https://picsum.photos/256', sizes: '256x256', type: 'image/jpeg' },
    { src: 'https://picsum.photos/512', sizes: '512x512', type: 'image/jpeg' }
];

const updatePositionState = (audioElement) => {
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
};

// Named handler references — stored at module scope so we can
// removeEventListener before re-adding, preventing duplicate stacking.
let _msEl = null;
let _msPlay = null;
let _msPause = null;
let _msTime = null;

function setMediaSessionApi(audioElement, mediaTitle, mediaArtist, mediaAlbum, mediaImage, mediaMimeType, local = true) {
    console.log("Media API Initialized");
    if (!('mediaSession' in navigator)) return;
    try {
        // Set metadata directly — do NOT null it first.
        // The null flash causes Windows Chrome to blank the OS controls.
        navigator.mediaSession.metadata = new MediaMetadata({
            title:   String(mediaTitle  || "Unknown Title"),
            artist:  String(mediaArtist || "Unknown Artist"),
            album:   String(mediaAlbum  || "Unknown Album"),
            artwork: !local
                ? (mediaImage ? mediaImage : imgArray)
                : (mediaImage ? [{ src: mediaImage, type: mediaMimeType || 'image/png', sizes: '512x512' }] : imgArray)
        });

        // Action handlers
        const handlers = [
            ['play',         () => audioElement.play()],
            ['pause',        () => audioElement.pause()],
            ['seekbackward', (d) => { audioElement.currentTime = Math.max(audioElement.currentTime - (d.seekOffset || 10), 0); }],
            ['seekforward',  (d) => { audioElement.currentTime = Math.min(audioElement.currentTime + (d.seekOffset || 10), audioElement.duration); }],
            ['seekto',       (d) => { audioElement.currentTime = d.seekTime; }],
            ['stop',         () => { audioElement.pause(); audioElement.currentTime = 0; }]
        ];
        handlers.forEach(([action, handler]) => {
            try { navigator.mediaSession.setActionHandler(action, handler); }
            catch (e) { console.warn(`Action ${action} not supported.`); }
        });

        if (local) {
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
        } else {
            const skipLogic = () => {
                if (typeof streamNextAudioFile !== 'undefined') streamNextAudioFile.click();
            };
            navigator.mediaSession.setActionHandler('previoustrack', skipLogic);
            navigator.mediaSession.setActionHandler('nexttrack', skipLogic);
        }

        // Remove old listeners from previous element before attaching new ones
        if (_msEl) {
            if (_msPlay)  _msEl.removeEventListener('play',       _msPlay);
            if (_msPause) _msEl.removeEventListener('pause',      _msPause);
            if (_msTime)  _msEl.removeEventListener('timeupdate', _msTime);
        }
        _msEl = audioElement;

        _msPlay = () => {
            navigator.mediaSession.playbackState = "playing";
            updatePositionState(audioElement);
        };
        _msPause = () => {
            navigator.mediaSession.playbackState = "paused";
        };
        _msTime = () => {
            if (Math.floor(audioElement.currentTime) % 2 === 0) {
                updatePositionState(audioElement);
            }
        };

        audioElement.addEventListener('play',       _msPlay);
        audioElement.addEventListener('pause',      _msPause);
        audioElement.addEventListener('timeupdate', _msTime);

        navigator.mediaSession.playbackState = audioElement.paused ? "paused" : "playing";

    } catch (error) {
        console.error(`Media Session Error: ${error}`);
    }
}