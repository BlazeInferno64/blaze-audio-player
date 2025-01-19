const canvas = document.querySelector(".banner");

let context;
let src;
let analyser;

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
        ctx.beginPath();
        ctx.moveTo(x + radius, y); // Move to the starting point
        ctx.lineTo(x + width - radius, y); // Top edge
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius); // Top-right corner
        ctx.lineTo(x + width, y + height); // Right edge
        ctx.lineTo(x, y + height); // Bottom edge
        ctx.lineTo(x, y + radius); // Bottom-left corner
        ctx.quadraticCurveTo(x, y, x + radius, y); // Top-left corner
        ctx.closePath(); // Close the path
        ctx.fill();
    }

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        x = 0;
    
        analyser.getByteFrequencyData(dataArray);
    
        // Clear the canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
    
            // Smoothly transition bar heights
            barHeights[i] += (barHeight - barHeights[i]) * 0.1; // Adjust the factor for speed of animation
    
            // Calculate gradient color from #ff1b6b to #45caff to white
            let r, g, b;
    
            // Define color stops
            const startColor = { r: 255, g: 27, b: 107 }; // #ff1b6b
            const middleColor = { r: 69, g: 202, b: 255 }; // #45caff
            const white = { r: 255, g: 255, b: 255 }; // White
    
            if (i < bufferLength / 2) {
                // Transition from startColor to middleColor
                const factor = i / (bufferLength / 2);
                r = Math.floor(startColor.r + (middleColor.r - startColor.r) * factor);
                g = Math.floor(startColor.g + (middleColor.g - startColor.g) * factor);
                b = Math.floor(startColor.b + (middleColor.b - startColor.b) * factor);
            } else {
                // Transition from middleColor to white
                const factor = (i - (bufferLength / 2)) / (bufferLength / 2);
                r = Math.floor(middleColor.r + (white.r - middleColor.r) * factor);
                g = Math.floor(middleColor.g + (white.g - middleColor.g) * factor);
                b = Math.floor(middleColor.b + (white.b - middleColor.b) * factor);
            }
    
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            drawRoundedRect(ctx, x, HEIGHT - barHeights[i], barWidth, barHeights[i], 3); // Use the drawRoundedRect function
            x += barWidth + 1;
        }
    }

    // Reset bar heights when the audio ends
    audio.onended = () => {
        for (let i = 0; i < barHeights.length; i++) {
            barHeights[i] = 0; // Reset to original height
        }
    };

    renderFrame();
}
