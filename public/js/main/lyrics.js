/**
 * Copyright (c) BlazeInferno64.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * Author: BlazeInferno64 (https://blazeinferno64.github.io/)
 */

const itunes = new ITunesClient();

//const apiURL = `https://radio-station-v2.vercel.app/api`;

let lyricsArray = []; // Stores time-stamped lyric objects

// Add this variable at the top of lyrics.js
let isSeeking = false;


function parseLRC(lrc) {
    const lyricsWindow = document.getElementById('lyrics-window');
    lyricsArray = [];
    lyricsWindow.innerHTML = "";

    const lines = lrc.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach((line) => {
        const match = timeRegex.exec(line);
        if (match) {
            const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100);
            const text = line.replace(timeRegex, '').trim();

            if (text) {
                const div = document.createElement('div');
                div.className = 'lyric-line';
                div.innerText = text;
                div.style.cursor = "pointer";

                div.addEventListener('click', () => {
                    if (audio) {
                        // 1. Set seeking flag to stop timeupdate from fighting us
                        isSeeking = true;

                        // 2. Remove 'active' class from all lines immediately for instant feedback
                        document.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active'));
                        div.classList.add('active');

                        // 3. Update audio position
                        audio.currentTime = time;

                        // 4. If it was paused, play it
                        if (audio.paused) audio.play();

                        // 5. Release the lock after a short delay to allow the browser to finish seeking
                        setTimeout(() => { isSeeking = false; }, 500);
                    }
                });

                lyricsWindow.appendChild(div);
                lyricsArray.push({ time, element: div });
            }
        }
    });
}



async function fetchLyrics(songName) {
    const lyricsWindow = document.getElementById('lyrics-window');
    const audioTrackName = document.getElementById('audioTrackName');
    if (!lyricsWindow) return;

    if (!isLoaderShown) {
        loaderBg.classList.remove("hide");
        loaderBg.style.opacity = '.85';
        loadingText.innerText = isNormalStream === true ? 'Loading stream...' : 'Loading next track...';
    }

    lyricsArray = [];
    lyricsWindow.innerHTML = "";

    const statusDiv = document.createElement('div');
    statusDiv.className = 'lyric-line active';
    statusDiv.innerText = "Searching for lyrics...";
    lyricsWindow.appendChild(statusDiv);
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        let artist = "";
        let cleanTitle = songName.split(/[\(\[]/)[0].trim(); // Pre-clean the input
        let album = "";
        let duration = 0;

        // 1. Get high-quality metadata from iTunes
        const itunesData = await itunes.search(songName);
        if (itunesData?.results?.length) {
            const track = itunesData.results[0];
            // Only use iTunes title if it doesn't look like a generic remix name
            cleanTitle = track.trackName.split(/[\(\[]/)[0].trim();
            artist = track.artistName;
            album = track.collectionName;
            duration = Math.round(track.trackTimeMillis / 1000);
        }

        let data = null;

        // 2. The "Precise Get" Strategy
        if (artist && cleanTitle) {
            const getParams = new URLSearchParams();
            getParams.append("artist_name", artist);
            getParams.append("track_name", cleanTitle);

            // LRCLib /get is very picky about duration. 
            // If the duration is off by even 2 seconds, it might fail.
            // We'll only include it if it's within a valid range.
            if (duration > 0 && duration <= 3600) getParams.append("duration", duration);

            const getResponse = await fetch(`https://lrclib.net/api/get?${getParams.toString()}`);
            if (getResponse.ok) {
                data = await getResponse.json();
            }
        }

        // 3. The "Broad Search" Fallback (Runs if /get fails or metadata was missing)
        if (!data) {
            console.log("Precise match failed. Trying search fallback...");

            // Try searching with "Artist - Title" or just the raw songName
            const searchQuery = (artist && cleanTitle)
                ? `${artist} ${cleanTitle}`
                : (songName || audioTrackName?.innerText);

            const searchResponse = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);

            if (searchResponse.ok) {
                const searchResults = await searchResponse.json();

                // Find the best candidate: one that has synced lyrics, or at least plain ones
                data = searchResults.find(s => s.syncedLyrics) || searchResults[0];
            }
        }

        lyricsWindow.style.display = 'block';

        if (data && (data.syncedLyrics || data.plainLyrics)) {
            if (data.syncedLyrics) {
                parseLRC(data.syncedLyrics);
            } else {
                lyricsWindow.innerHTML = `<div class='lyric-line active' style='white-space: pre-wrap;'>${data.plainLyrics}</div>`;
            }
        } else {
            lyricsWindow.innerHTML = "<div class='lyric-line active'>No lyrics available</div>";
        }

    } catch (err) {
        console.error("Lyrics Engine Error:", err);
        changePopupMsg(`[Lyrics Engine Error]\n${err}`);
        openPopup();
        lyricsWindow.innerHTML = "<div class='lyric-line active'>Error loading lyrics</div>";
    }
}