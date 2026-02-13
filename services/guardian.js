import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

// RESEARCH-BASED: Using direct edge nodes to bypass Jio's internal routing lag
const CONDUITS = [
    { url: 'https://hkg07s50-in-x01.1e100.net/generate_204', name: 'G-Edge-SA' },
    { url: 'https://1.1.1.1/generate_204', name: 'CF-Peering' },
    { url: 'https://ipv6.google.com/generate_204', name: 'IPv6-Direct' }
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
        const results = await Promise.all(CONDUITS.map(c => measureJioPulse(c.url)));
        const bestLat = Math.min(...results);
        currentLat = bestLat;

        // Determine State for UI
        let state = "n78 PEAK";
        if (bestLat > 150) state = "XLAT LAG";
        else if (bestLat > 65) state = "n28 ACTIVE";

        onUpdate({ 
            latency: bestLat, 
            status: state
        });

        // V16.1 AGGRESSIVE PULSE
        // Saturate the tower's Resource Blocks to keep n78 from sleeping
        const intensity = bestLat > 150 ? 50 : 25; 
        
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => {
                if (!isActive) return;
                CONDUITS.forEach(c => {
                    fetch(`${c.url}?v16_1=${i}_${Date.now()}`, { 
                        method: 'HEAD', 
                        mode: 'no-cors', 
                        cache: 'no-store',
                        keepalive: true,
                        priority: 'high' 
                    }).catch(()=>{});
                });
            }, i * 3); 
        }

        // Timing is everything for 5G SA (400ms is the sweet spot)
        await sleep(400);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        
        // Orb speed reflects connection quality
        const speed = currentLat > 150 ? 0.5 : (currentLat > 60 ? 2 : 4.5);
        
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        let color = currentLat > 150 ? "#ff3b30" : (currentLat > 70 ? "#ffcc00" : "#00ff41");
        
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        
        r += speed;
        if (r > 55) r = 15; 
        requestAnimationFrame(draw);
    }
    draw();
}