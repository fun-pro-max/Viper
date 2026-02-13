import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

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
        const results = await Promise.all(CONDUITS.map(c => measureJioPulse(c.url)));
        const bestLat = Math.min(...results);
        currentLat = bestLat;

        onUpdate({ 
            latency: bestLat, 
            status: bestLat < 110 ? 'Ultra Priority' : 'Socket Saturation'
        });

        // V15 PEAK OPTIMIZATION: Staggered Multi-threading
        // We push 25 parallel slots but stagger them by 4ms to prevent browser thread locking
        const burstSize = 25; 
        for (let i = 0; i < burstSize; i++) {
            setTimeout(() => {
                if (!isActive) return;
                CONDUITS.forEach(c => {
                    fetch(`${c.url}?v15_pulse=${i}_${Date.now()}`, { 
                        method: 'HEAD', 
                        mode: 'no-cors', 
                        cache: 'no-store', 
                        priority: 'high' 
                    }).catch(()=>{});
                });
            }, i * 4);
        }

        // Fast re-check interval
        await sleep(650);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        
        // Orbital Pulse speed changes based on Latency (Visible Difference)
        const speed = currentLat > 100 ? 1.5 : 3.0;
        
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        let color = currentLat > 120 ? "#ff3b30" : (currentLat > 70 ? "#007aff" : "#4cd964");
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        
        r += speed;
        if (r > 55) r = 15; 
        requestAnimationFrame(draw);
    }
    draw();
}