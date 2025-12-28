/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */
const canvas = document.querySelector(".banner");
const effectFluid = document.querySelector(".effect-fluid");

let context;
let src;
let analyser;
let smoothScale = 1;
let lastBeatTime = 0;
let bpm = 120; // fallback BPM
let isPlaying = false;
let beatIntervals = [];
const MAX_INTERVALS = 8;

// 🔒 Beat grid
let beatGridStart = 0;
let beatInterval = 60000 / bpm;

//let isRendering = false;
//let animationId;
// Removed since it conflicts

const visualize = () => {
    if (src) return;
    context = new AudioContext();
    src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();

    const ctx = canvas.getContext('2d');

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    console.log(`Buffer length of the current audio file: ${bufferLength}`);

    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    // Create an array to store the bar heights
    const barHeights = new Array(bufferLength).fill(0);

    // Function to draw a rounded rectangle
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        radius = Math.min(radius, width / 2, height / 2); // ensure radius doesn't exceed dimensions
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }


    function renderFrame() {
        requestAnimationFrame(renderFrame);
        x = 0;

        analyser.getByteFrequencyData(dataArray);

        // ---- Bass energy (lower frequencies feel better) ----
        let bassSum = 0;
        const bassRange = Math.floor(bufferLength * 0.15); // lowest 15%

        for (let i = 0; i < bassRange; i++) {
            bassSum += dataArray[i];
        }

        const bassAvg = bassSum / bassRange; // 0 → 255
        //console.log(bassAvg);

        // ---- Audio-reactive fluid scale + BPM detection ----
        if (effectFluid) {
            if (isPlaying) {
                const now = performance.now();

                /* ---- Kick energy (lowest bins) ---- */
                let kickEnergy = 0;
                const kickBins = 6;
                for (let i = 1; i <= kickBins; i++) {
                    kickEnergy += dataArray[i];
                }
                kickEnergy /= kickBins;

                const beatThreshold = bassAvg * 0.9;

                /* ---- Beat detection + BPM smoothing ---- */
                if (
                    kickEnergy > beatThreshold &&
                    now - lastBeatTime > 300
                ) {
                    if (lastBeatTime !== 0) {
                        const interval = now - lastBeatTime;
                        let detectedBPM = 60000 / interval;

                        while (detectedBPM < 80) detectedBPM *= 2;
                        while (detectedBPM > 180) detectedBPM /= 2;

                        beatIntervals.push(detectedBPM);
                        if (beatIntervals.length > MAX_INTERVALS) {
                            beatIntervals.shift();
                        }

                        bpm =
                            beatIntervals.reduce((a, b) => a + b, 0) /
                            beatIntervals.length;

                        // LOCK BEAT GRID
                        beatInterval = 60000 / bpm;
                        beatGridStart = now;
                    }

                    lastBeatTime = now;
                }

                /* ---- GRID-SNAPPED BPM PULSE ---- */
                const timeSinceGrid = now - beatGridStart;
                const gridPhase =
                    (timeSinceGrid % beatInterval) / beatInterval;

                // Choose ONE pulse type:

                // Smooth club pulse
                // const bpmPulse = Math.sin(gridPhase * Math.PI * 2) * 0.15;

                // Punchy kick-style pulse (recommended)
                const bpmPulse = Math.exp(-gridPhase * 6) * 0.25;

                const targetScale =
                    1 +
                    (bassAvg / 255) * 0.35 +
                    bpmPulse;

                /* ---- Premium attack / decay ---- */
                const attackSpeed = 0.45;
                const decaySpeed = 0.08;

                if (targetScale > smoothScale) {
                    smoothScale +=
                        (targetScale - smoothScale) * attackSpeed;
                } else {
                    smoothScale +=
                        (targetScale - smoothScale) * decaySpeed;
                }
            } else {
                // Pause → smoothly settle
                smoothScale += (1 - smoothScale) * 0.15;
            }

            smoothScale = Math.max(1, smoothScale);
            effectFluid.style.transform = `scale(${smoothScale})`;
        }


        // Clear the canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // ---- Initialize barCaps array (for peak indicators) ----
        if (!window.barCaps) {
            window.barCaps = new Array(bufferLength).fill(0);
        }
        const barCaps = window.barCaps;

        // ---- Precompute gradient colors outside the loop ----
        const startColor = { r: 255, g: 27, b: 107 }; // #ff1b6b
        const middleColor = { r: 69, g: 202, b: 255 }; // #45caff
        const white = { r: 255, g: 255, b: 255 }; // white

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;

            // Smoothly transition bar heights
            barHeights[i] += (barHeight - barHeights[i]) * 0.1;

            // ---- Gradient colors ----
            let r, g, b;
            if (i < bufferLength / 2) {
                const factor = i / (bufferLength / 2);
                r = Math.floor(startColor.r + (middleColor.r - startColor.r) * factor);
                g = Math.floor(startColor.g + (middleColor.g - startColor.g) * factor);
                b = Math.floor(startColor.b + (middleColor.b - startColor.b) * factor);
            } else {
                const factor = (i - bufferLength / 2) / (bufferLength / 2);
                r = Math.floor(middleColor.r + (white.r - middleColor.r) * factor);
                g = Math.floor(middleColor.g + (white.g - middleColor.g) * factor);
                b = Math.floor(middleColor.b + (white.b - middleColor.b) * factor);
            }

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, HEIGHT - barHeights[i], barWidth, barHeights[i]);
            //drawRoundedRect(ctx, x, HEIGHT - barHeights[i], barWidth, barHeights[i], 3);

            // ---- Bar caps / peak indicators ----
            const capFallSpeed = 2; // how fast the peak falls
            if (barHeights[i] > barCaps[i]) {
                barCaps[i] = barHeights[i]; // new peak
            } else {
                barCaps[i] -= capFallSpeed;
                if (barCaps[i] < 0) barCaps[i] = 0;
            }

            // Draw the cap
            ctx.fillStyle = `rgb(${r},${g},${b})`; // Match cap color with bar
            ctx.fillRect(x, HEIGHT - barCaps[i] - 2, barWidth, 2); // 2px high cap

            x += barWidth + 1;
        }
    }

    // Reset bar heights when the audio ends
    audio.onended = () => {
        isPlaying = false;
        lastBeatTime = 0;
        beatIntervals.length = 0;
        for (let i = 0; i < barHeights.length; i++) {
            barHeights[i] = 0; // Reset to original height
        }
    };

    renderFrame();
}

const drawCaps = () => {
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const bufferLength = 128; // match your analyser.fftSize / 2
    const barWidth = (WIDTH / bufferLength) * 2.5;

    // Precompute gradient colors
    const startColor = { r: 255, g: 27, b: 107 };
    const middleColor = { r: 69, g: 202, b: 255 };
    const white = { r: 255, g: 255, b: 255 };

    // Initialize barCaps array
    window.barCaps = new Array(bufferLength);

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const capHeight = 2; // caps are 2px high
        window.barCaps[i] = capHeight;

        // Compute gradient color
        let r, g, b;
        if (i < bufferLength / 2) {
            const factor = i / (bufferLength / 2);
            r = Math.floor(startColor.r + (middleColor.r - startColor.r) * factor);
            g = Math.floor(startColor.g + (middleColor.g - startColor.g) * factor);
            b = Math.floor(startColor.b + (middleColor.b - startColor.b) * factor);
        } else {
            const factor = (i - bufferLength / 2) / (bufferLength / 2);
            r = Math.floor(middleColor.r + (white.r - middleColor.r) * factor);
            g = Math.floor(middleColor.g + (white.g - middleColor.g) * factor);
            b = Math.floor(middleColor.b + (white.b - middleColor.b) * factor);
        }

        // Draw the cap at the very bottom
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, HEIGHT - capHeight, barWidth, capHeight);

        x += barWidth + 1;
    }
}

