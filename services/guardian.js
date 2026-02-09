import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

// High-Priority Global & Jio Backbones
const NUCLEAR_TARGETS = [
    'https://dns.google/generate_204',
    'https://1.1.1.1/cdn-cgi/trace',
    'https://www.jio.com/favicon.ico'
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
        runNuclearLoop(onUpdate);
    } else {
        isActive = false;
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
    }
}

async function runNuclearLoop(onUpdate) {
    while (isActive) {
        // Parallel Strike: Hit all backbones at once
        const results = await Promise.all(NUCLEAR_TARGETS.map(t => measureJioPulse(t)));
        
        // Pick the absolute lowest latency from the bunch
        const bestLat = Math.min(...results);
        currentLat = bestLat;

        onUpdate({ 
            type: 'CYCLE', 
            latency: bestLat, 
            status: bestLat > 100 ? 'NUCLEAR BURST' : 'LOCKED',
            provider: 'Jio Multi-Path'
        });

        // The "Hammer": Send 15 parallel packets to force the tower's scheduler
        const intensity = bestLat > 100 ? 15 : 5;
        for (let i = 0; i < intensity; i++) {
            NUCLEAR_TARGETS.forEach(t => {
                fetch(`${t}?p=${i}`, { mode: 'no-cors', cache: 'no-store', priority: 'high' }).catch(()=>{});
            });
        }

        // ULTRA-FAST REFRESH: 350ms to prevent radio power-down
        await sleep(bestLat > 100 ? 350 : 1200);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        let color = currentLat > 110 ? "#ff3b30" : (currentLat > 80 ? "#ffcc00" : "#4cd964");
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        r += (currentLat > 110 ? 4 : 1.5);
        if (r > 55 || r < 10) r = 20; 
        requestAnimationFrame(draw);
    }
    draw();
}