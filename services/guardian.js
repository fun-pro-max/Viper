import { measureJioPulse } from './networkTest.js';
import { getJioNodes } from './dnsManager.js';
import { sleep } from '../utils/helpers.js';

let isActive = false;
let wakeLock = null;
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

        if ('wakeLock' in navigator) {
            try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
        }
        runDeepGuard(onUpdate);
    } else {
        isActive = false;
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
        if (wakeLock) { await wakeLock.release(); wakeLock = null; }
    }
}

async function runDeepGuard(onUpdate) {
    const nodes = getJioNodes();
    
    while (isActive) {
        // Parallel Telemetry: Check all nodes at once
        const results = await Promise.all(nodes.map(async (n) => {
            const lat = await measureJioPulse(n.url);
            return { ...n, lat };
        }));

        // Filter out any 999s and find the fastest "Anchor"
        const activeResults = results.filter(r => r.lat < 999);
        const best = activeResults.sort((a, b) => a.lat - b.lat)[0] || { lat: 999, name: 'Searching...' };
        
        currentLat = best.lat;

        onUpdate({ 
            type: 'CYCLE', 
            latency: best.lat, 
            status: best.lat > 100 ? 'Deep Bursting' : 'Anchor Locked',
            provider: best.name 
        });

        // SMART STABILIZATION:
        // We pulse the Anchor to stay fast, and pulse the slow nodes to "wake them up"
        const burstIntensity = best.lat > 90 ? 12 : 6;
        
        results.forEach(node => {
            const intensity = node.lat > 120 ? burstIntensity + 4 : burstIntensity;
            for (let i = 0; i < intensity; i++) {
                fetch(node.url, { mode: 'no-cors', cache: 'no-store', priority: 'high' }).catch(()=>{});
            }
        });

        // If even the best route is > 100ms, pulse every 800ms to fight for priority
        await sleep(best.lat > 100 ? 800 : 2000);
    }
}

function startOrb(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 20; let grow = true;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "#000000"; ctx.fillRect(0,0,120,120);
        const g = ctx.createRadialGradient(60,60,2,60,60,r);
        let color = currentLat > 130 ? "#ff3b30" : (currentLat > 85 ? "#ffcc00" : "#4cd964");
        g.addColorStop(0, color); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(60,60,r,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
        if (grow) r += 2; else r -= 2;
        if (r > 50 || r < 10) grow = !grow;
        requestAnimationFrame(draw);
    }
    draw();
}