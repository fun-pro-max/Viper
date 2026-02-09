import { measureJioPulse } from './networkTest.js';
import { getJioNodes } from './dnsManager.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let currentLat = 0;

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
        runRedlineLoop(onUpdate);
    } else {
        isActive = false;
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
    }
}

async function runRedlineLoop(onUpdate) {
    const nodes = getJioNodes();
    while (isActive) {
        const results = await Promise.all(nodes.map(async (n) => {
            const lat = await measureJioPulse(n.url);
            return { ...n, lat };
        }));

        const best = results.filter(r => r.lat < 900).sort((a,b) => a.lat - b.lat)[0] || { lat: 999, name: 'Searching' };
        currentLat = best.lat;

        onUpdate({ 
            type: 'CYCLE', 
            latency: best.lat, 
            status: best.lat > 100 ? 'REDLINE BURSTING' : 'ULTRA-STABLE',
            provider: best.name 
        });

        // REDLINE SATURATION LOGIC
        // 25 pulses every 500ms when spikes occur
        const pulseCount = best.lat > 100 ? 25 : 8;
        results.forEach(node => {
            for (let i = 0; i < pulseCount; i++) {
                // Warming the raw gateway and hitting the SSL host simultaneously
                fetch(node.gateway, { mode: 'no-cors', cache: 'no-store', priority: 'high' }).catch(()=>{});
                fetch(node.url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', keepalive: true }).catch(()=>{});
            }
        });

        await sleep(best.lat > 100 ? 500 : 1500);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20; let grow = true;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        let color = currentLat >= 100 ? "#ff3b30" : (currentLat > 70 ? "#ffcc00" : "#4cd964");
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        r += grow ? 3 : -3;
        if (r > 50 || r < 12) grow = !grow;
        requestAnimationFrame(draw);
    }
    draw();
}