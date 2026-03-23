/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License.
 * Version: BPM-Synced + Accelerated Cap Gravity + Clamped Height.
 */
const canvas = document.querySelector(".banner");
const effectFluid = document.querySelector(".effect-fluid");

const hostPlayer = new Audio();
hostPlayer.crossOrigin = "anonymous";

let context, src, analyser;
let hostSource; // Declared at top scope so the guard below works
let smoothScale = 1;
let lastBeatTime = 0;
let bpm = 120;
let isPlaying = false;
let beatIntervals = [];
const MAX_INTERVALS = 8;
let animationId;

let beatGridStart = 0;
let beatInterval = 60000 / bpm;

let musicGainNode; // For ducking

let broadCastEnd = false;
let broadCastPlaying = false; // True only while the announcement is actively playing

const ANNOUNCEMENT_URL = "https://radio-station-v2.vercel.app/static/radio-host.mp3";

const triggerBroadcast = (audioCtx, url) => {
    return new Promise((resolve) => {
        broadCastPlaying = true; // Mark as active immediately to prevent double-triggering
        const now = audioCtx.currentTime;

        // 1. Duck music
        musicGainNode.gain.cancelScheduledValues(now);
        musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, now);
        musicGainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.8);

        //hostPlayer.src = url;
        if (!hostPlayer.src || hostPlayer.src !== url) {
            hostPlayer.src = url;
        }
        // DO NOT call hostPlayer.load() — same reason we don't call audio.load():
        // it resets Chrome's autoplay permission state, blocking the .play() below.
        // Setting .src is enough to trigger the internal load.

        const restoreMusic = () => {
            const t = audioCtx.currentTime;
            musicGainNode.gain.cancelScheduledValues(t);
            musicGainNode.gain.setValueAtTime(musicGainNode.gain.value, t);
            musicGainNode.gain.exponentialRampToValueAtTime(1.0, t + 1.5);
            resolve();
        };

        hostPlayer.onended = () => {
            broadCastPlaying = false;
            restoreMusic();
            broadCastEnd = true;
            console.log(navigator.mediaSession)
        };

        hostPlayer.onerror = () => {
            broadCastPlaying = false;
            restoreMusic();
            broadCastEnd = true;
        };

        // 800ms delay lets the music duck first before announcement starts
        setTimeout(() => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
            if (isPlaying) {
                hostPlayer.play().then(() => {
                    broadCastPlaying = true;  // Announcement is now actively playing
                    //broadCastEnd = true;      // Prevent re-trigger on track skip
                }).catch(err => {
                    console.warn("Autoplay blocked for announcement:", err);
                    broadCastPlaying = false;
                    restoreMusic();
                    broadCastEnd = true; // Keep this here as a fallback for failures
                });
            }
        }, 800);
    });
};

const visualize = () => {
    if (animationId) cancelAnimationFrame(animationId);

    // --- AudioContext setup: only runs ONCE ever ---
    if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        analyser = context.createAnalyser();
        analyser.fftSize = 256;

        musicGainNode = context.createGain();
        musicGainNode.gain.setValueAtTime(1.0, context.currentTime);

        // Main music source → gainNode → analyser → destination
        if (!src) {
            src = context.createMediaElementSource(audio);
        }
        src.connect(musicGainNode);
        musicGainNode.connect(analyser);
        analyser.connect(context.destination);

        // hostPlayer source — routed through its OWN separate gain node that connects
        // DIRECTLY to context.destination, bypassing the analyser chain entirely.
        // This is the Windows Chrome fix: when hostPlayer goes through the same
        // destination node as the main audio, Chrome on Windows re-assigns MediaSession
        // focus to hostPlayer and blanks the OS controls. A separate direct path
        // keeps hostPlayer's audio audible but invisible to the MediaSession detector.
        if (!hostSource) {
            try {
                const hostGain = context.createGain();
                hostGain.gain.setValueAtTime(1.0, context.currentTime);
                hostSource = context.createMediaElementSource(hostPlayer);
                hostSource.connect(hostGain);
                hostGain.connect(context.destination); // direct — NOT through analyser
            } catch (e) {
                console.warn("Host source already connected or unavailable:", e);
            }
        }
    }

    // --- Always resume context if suspended (important after tab switch / skip) ---
    if (context.state === 'suspended') {
        context.resume();
    }

    // --- Broadcast: runs every time visualize() is called while streaming ---
    // broadCastEnd is only false when streamBtn resets it (fresh connect)
    if (typeof streaming !== 'undefined' && streaming && !broadCastEnd && !broadCastPlaying) {
        triggerBroadcast(context, ANNOUNCEMENT_URL);
    }

    // --- Canvas setup ---
    const ctx = canvas.getContext('2d', { alpha: false });
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();

    const WIDTH = rect.width;
    const HEIGHT = rect.height;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    const barHeights = new Float32Array(bufferLength);
    const barCaps = new Float32Array(bufferLength);
    const capDropSpeeds = new Float32Array(bufferLength);
    const MAX_BAR_HEIGHT = HEIGHT * 0.92;

    // Pre-calculate colors
    const barColors = [];
    const colors = { start: [255, 27, 107], mid: [69, 202, 255], end: [255, 255, 255] };
    for (let i = 0; i < bufferLength; i++) {
        let factor = (i < bufferLength / 2) ? i / (bufferLength / 2) : (i - bufferLength / 2) / (bufferLength / 2);
        let c1 = (i < bufferLength / 2) ? colors.start : colors.mid;
        let c2 = (i < bufferLength / 2) ? colors.mid : colors.end;
        barColors.push(`rgb(${Math.floor(c1[0] + (c2[0] - c1[0]) * factor)},${Math.floor(c1[1] + (c2[1] - c1[1]) * factor)},${Math.floor(c1[2] + (c2[2] - c1[2]) * factor)})`);
    }

    function renderFrame() {
        animationId = requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);
        const now = performance.now();

        // BPM & Fluid Scaling Logic
        let bassAvg = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
        if (isPlaying) {
            if (dataArray[1] > (bassAvg * 0.8 + 15) && now - lastBeatTime > 175) {
                if (lastBeatTime !== 0) {
                    let detectedBPM = 60000 / (now - lastBeatTime);
                    while (detectedBPM < 85) detectedBPM *= 2;
                    while (detectedBPM > 190) detectedBPM /= 2;
                    beatIntervals.push(detectedBPM);
                    if (beatIntervals.length > MAX_INTERVALS) beatIntervals.shift();
                    bpm = beatIntervals.reduce((a, b) => a + b, 0) / beatIntervals.length;
                    beatInterval = 60000 / bpm;
                    beatGridStart = now;
                }
                lastBeatTime = now;
            }
            const gridPhase = ((now - beatGridStart) % beatInterval) / beatInterval;
            smoothScale += (1.0 + (Math.exp(-gridPhase * 5) * 0.45) + (bassAvg / 255 * 0.1) - smoothScale) * 0.2;
        } else {
            smoothScale += (1 - smoothScale) * 0.1;
        }

        if (effectFluid) effectFluid.style.transform = `scale(${smoothScale})`;

        // DRAWING
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const targetH = (dataArray[i] / 255) * MAX_BAR_HEIGHT;
            barHeights[i] += (targetH - barHeights[i]) * 0.15;

            if (barHeights[i] > barCaps[i]) {
                barCaps[i] = barHeights[i];
                capDropSpeeds[i] = 0;
            } else {
                capDropSpeeds[i] += 0.22;
                barCaps[i] -= capDropSpeeds[i];
            }

            if (barCaps[i] < 0) {
                barCaps[i] = 0;
                capDropSpeeds[i] = 0;
            }

            ctx.fillStyle = barColors[i];
            ctx.fillRect(x, HEIGHT - barHeights[i], barWidth, barHeights[i]);
            ctx.fillRect(x, HEIGHT - barCaps[i] - 4, barWidth, 4);

            x += barWidth + 1;
        }
    }
    renderFrame();
}

/**
 * Static initialization for idle state
 */
const drawCaps = () => {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const WIDTH = rect.width;
    const HEIGHT = rect.height;
    const bufferLength = 128;
    const barWidth = (WIDTH / bufferLength) * 2.5;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const colors = { start: [255, 27, 107], mid: [69, 202, 255], end: [255, 255, 255] };

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        let factor = (i < bufferLength / 2) ? i / (bufferLength / 2) : (i - bufferLength / 2) / (bufferLength / 2);
        let c1 = (i < bufferLength / 2) ? colors.start : colors.mid;
        let c2 = (i < bufferLength / 2) ? colors.mid : colors.end;

        let r = Math.floor(c1[0] + (c2[0] - c1[0]) * factor);
        let g = Math.floor(c1[1] + (c2[1] - c1[1]) * factor);
        let b = Math.floor(c1[2] + (c2[2] - c1[2]) * factor);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, HEIGHT - 4, barWidth, 4);
        x += barWidth + 1;
    }
}