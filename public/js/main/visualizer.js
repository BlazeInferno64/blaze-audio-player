/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License.
 * Version: BPM-Synced + Accelerated Cap Gravity + Clamped Height.
 */
const canvas = document.querySelector(".banner");
const effectFluid = document.querySelector(".effect-fluid");

let context, src, analyser;
let smoothScale = 1;
let lastBeatTime = 0;
let bpm = 120;
let isPlaying = false;
let beatIntervals = [];
const MAX_INTERVALS = 8;
let animationId; 

let beatGridStart = 0;
let beatInterval = 60000 / bpm;

const visualize = () => {
    if (animationId) cancelAnimationFrame(animationId);
    
    if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        src = context.createMediaElementSource(audio); 
        analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
    }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr); 

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = rect.width;
    const HEIGHT = rect.height;

    // --- Configuration ---
    const barWidth = (WIDTH / bufferLength) * 2.5; 
    const barHeights = new Array(bufferLength).fill(0);
    const barCaps = new Array(bufferLength).fill(0);
    const capDropSpeeds = new Array(bufferLength).fill(0);
    
    // NEW: Height limit (85% of canvas height)
    const MAX_BAR_HEIGHT = HEIGHT * 0.92; 

    const barColors = [];
    const colors = { start: [255, 27, 107], mid: [69, 202, 255], end: [255, 255, 255] };

    for (let i = 0; i < bufferLength; i++) {
        let r, g, b;
        let factor = (i < bufferLength / 2) ? i / (bufferLength / 2) : (i - bufferLength / 2) / (bufferLength / 2);
        let c1 = (i < bufferLength / 2) ? colors.start : colors.mid;
        let c2 = (i < bufferLength / 2) ? colors.mid : colors.end;
        
        r = Math.floor(c1[0] + (c2[0] - c1[0]) * factor);
        g = Math.floor(c1[1] + (c2[1] - c1[1]) * factor);
        b = Math.floor(c1[2] + (c2[2] - c1[2]) * factor);
        barColors.push(`rgb(${r},${g},${b})`);
    }

    function renderFrame() {
        animationId = requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);
        
        const now = performance.now();

        // ---- 1. BPM Detection ----
        let kickEnergy = 0;
        for (let i = 0; i < 6; i++) kickEnergy += dataArray[i];
        kickEnergy /= 6;

        let bassSum = 0;
        for (let i = 0; i < 10; i++) bassSum += dataArray[i];
        let bassAvg = bassSum / 10;

        if (isPlaying) {
            if (kickEnergy > (bassAvg * 0.8 + 15) && now - lastBeatTime > 170) {
                if (lastBeatTime !== 0) {
                    const interval = now - lastBeatTime;
                    let detectedBPM = 60000 / interval;
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

            // ---- 2. Perfect BPM Fluid Scaling ----
            const timeSinceGrid = now - beatGridStart;
            const gridPhase = (timeSinceGrid % beatInterval) / beatInterval;
            const beatPulse = Math.exp(-gridPhase * 5); 
            const targetScale = 1.0 + (beatPulse * 0.45) + (bassAvg / 255 * 0.1);

            const lerpSpeed = (targetScale > smoothScale) ? 0.45 : 0.12;
            smoothScale += (targetScale - smoothScale) * lerpSpeed;
        } else {
            smoothScale += (1 - smoothScale) * 0.1;
        }

        if (effectFluid) {
            effectFluid.style.transform = `scale(${smoothScale})`;
        }

        // ---- 3. Drawing & Gravity Fix ----
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            // UPDATED: Scale based on MAX_BAR_HEIGHT instead of full HEIGHT
            const targetH = (dataArray[i] / 255) * MAX_BAR_HEIGHT; 
            barHeights[i] += (targetH - barHeights[i]) * 0.15; 

            ctx.fillStyle = barColors[i];
            ctx.fillRect(x, HEIGHT - barHeights[i], barWidth, barHeights[i]);

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
    const dpr = window.devicePixelRatio || 1;
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