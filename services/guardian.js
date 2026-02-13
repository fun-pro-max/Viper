import { measureJioPulse } from './networkTest.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

// RE-OPTIMIZED CONDUITS: Prioritizing local peering to bypass 464XLAT
const CONDUITS = [
    { url: 'https://hkg07s50-in-x01.1e100.net/generate_204', name: 'Jio-G-Edge' }, // Direct Google Edge IP
    { url: 'https://graph.facebook.com/ping', name: 'Meta-Direct' },
    { url: 'https://8.8.8.8/generate_204', name: 'Google-DNS-SA' }
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
        // Use Promise.race for faster telemetry response
        const results = await Promise.all(CONDUITS.map(c => measureJioPulse(c.url)));
        const bestLat = Math.min(...results);
        currentLat = bestLat;

        // If Ping > 150ms, you are trapped in 464XLAT translation
        const state = bestLat > 150 ? '464XLAT DETECTED' : (bestLat > 60 ? 'n28 (SLOW)' : 'n78 (PEAK)');
        
        onUpdate({ 
            latency: bestLat, 
            status: state
        });

        // AGGRESSIVE BYPASS LOGIC
        // If ping is high, we increase pulse intensity to "force" the Tower Scheduler to react
        const intensity = bestLat > 150 ? 45 : 20; 
        
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => {
                if (!isActive) return;
                CONDUITS.forEach(c => {
                    fetch(`${c.url}?v16_1=${i}`, { 
                        method: 'HEAD', 
                        mode: 'no-cors', 
                        keepalive: true, // Crucial for 5G SA to keep the socket open
                        priority: 'high' 
                    }).catch(()=>{});
                });
            }, i * 2); // Faster staggering
        }

        // Pulse faster if latency is bad to break the "Evening Slump"
        const delay = bestLat > 150 ? 300 : 500;
        await sleep(delay);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        const speed = currentLat > 150 ? 0.8 : (currentLat > 60 ? 2 : 5);
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