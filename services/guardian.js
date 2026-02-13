import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;
let lastLat = 0;
let jitter = 0;

const CONDUITS = [
    { url: 'https://www.google.com/generate_204', name: 'Google-Edge' },
    { url: 'https://1.1.1.1/generate_204', name: 'Cloudflare-Edge' },
    { url: 'https://www.facebook.com/favicon.ico', name: 'Meta-Edge' }
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
        const start = performance.now();
        const results = await Promise.all(CONDUITS.map(c => measureJioPulse(c.url)));
        const bestLat = Math.min(...results);
        
        // Calculate Jitter (Stability Factor)
        jitter = Math.abs(bestLat - lastLat);
        lastLat = bestLat;
        currentLat = bestLat;

        // Visual Data Update
        onUpdate({ 
            latency: bestLat, 
            jitter: jitter,
            status: jitter > 20 ? 'Stabilizing...' : 'Link Optimized',
            pressure: jitter > 20 ? 'High' : 'Normal'
        });

        // ADAPTIVE BURST: Increase pressure if jitter is high
        // This forces the tower to keep the "Resource Blocks" allocated to your device
        const intensity = jitter > 20 ? 35 : 15; 
        
        for (let i = 0; i < intensity; i++) {
            // Using a rotating conduit selection to prevent IP flagging
            const target = CONDUITS[i % CONDUITS.length].url;
            fetch(`${target}?v14_burst=${i}_${Date.now()}`, { 
                method: 'HEAD', 
                mode: 'no-cors', 
                priority: 'high' 
            }).catch(()=>{});
        }

        // Dynamic Interval: Faster pulses during instability
        const nextTick = jitter > 20 ? 400 : 800;
        await sleep(nextTick);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.clearRect(0, 0, 120, 120);
        
        // Pulsing glow based on Jitter
        const glowSize = 30 + (jitter / 2);
        const color = currentLat > 120 ? "#ff3b30" : (jitter > 20 ? "#ffcc00" : "#4cd964");
        
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = color;
        
        const g = ctx.createRadialGradient(60,60,5,60,60,50);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(60, 60, 25, 0, Math.PI * 2);
        ctx.fill();
        
        requestAnimationFrame(draw);
    }
    draw();
}