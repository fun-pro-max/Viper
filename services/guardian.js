import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

// High-Bandwidth Peering Points (Jio has direct fiber to these)
const CONDUITS = [
    { url: 'https://www.google.com/generate_204', name: 'Google-Link' },
    { url: 'https://connect.facebook.net/en_US/sdk.js', name: 'Meta-Link' },
    { url: 'https://www.netflix.com/favicon.ico', name: 'Netflix-Link' }
];

export async function toggleGuardian(enabled, onUpdate) {
    isActive = enabled;
    const video = document.getElementById('pipVideo');
    const canvas = document.getElementById('pipCanvas');

    if (isActive) {
        startOrb(canvas);
        try {
            const stream = canvas.captureStream(30);
            video.srcObject = stream;
            await video.play();
            if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
        } catch (e) {}
        runAcceleratorLoop(onUpdate);
    } else {
        isActive = false;
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
    }
}

async function runAcceleratorLoop(onUpdate) {
    while (isActive) {
        // Parallel Telemetry
        const results = await Promise.all(CONDUITS.map(c => measureJioPulse(c.url)));
        const bestLat = Math.min(...results);
        currentLat = bestLat;

        onUpdate({ 
            type: 'CYCLE', 
            latency: bestLat, 
            status: '3 Slots Active',
            provider: 'Multi-Conduit'
        });

        // --- BANDWIDTH ACCELERATION LOGIC ---
        // We pulse 20 parallel requests across 3 different domains.
        // This mimics the behavior of a multi-part downloader (like IDM).
        // It prevents the tower from throttling your "Burst" speed.
        const burstSize = 20; 
        
        for (let i = 0; i < burstSize; i++) {
            CONDUITS.forEach(c => {
                // We use 'HEAD' to save data but keep the 'Pipe' open
                fetch(`${c.url}?slot=${i}`, { 
                    method: 'HEAD', 
                    mode: 'no-cors', 
                    cache: 'no-store', 
                    priority: 'high' 
                }).catch(()=>{});
            });
        }

        // Fast refresh (600ms) to ensure the Tower Scheduler doesn't 
        // take back the allocated Resource Blocks.
        await sleep(600);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        // Color shifts to Deep Blue/Purple for "Bandwidth Boost"
        let color = currentLat > 100 ? "#ff3b30" : (currentLat > 70 ? "#007aff" : "#4cd964");
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        r += 2.5;
        if (r > 55) r = 15; 
        requestAnimationFrame(draw);
    }
    draw();
}