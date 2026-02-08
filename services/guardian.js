import { measureLatency } from './networkTest.js';
import { optimizeConnection } from './optimizer.js';
import { sleep } from '../utils/helpers.js';
import { getOptimalDNS } from './dnsManager.js';

let isActive = false;
let wakeLock = null;
let lastKnownLatency = null;

export async function toggleGuardian(enabled, onUpdate) {
    isActive = enabled;
    const video = document.getElementById('pipVideo');
    const canvas = document.getElementById('pipCanvas');

    if (isActive) {
        startOrbAnimation(canvas);
        try {
            const stream = canvas.captureStream(30);
            video.srcObject = stream;
            await video.play();
            if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
        } catch (e) { console.log("Background Mode active via WakeLock"); }

        if ('wakeLock' in navigator) {
            try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
        }
        runLoop(onUpdate);
    } else {
        isActive = false;
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(()=>{});
        if (wakeLock) { await wakeLock.release(); wakeLock = null; }
    }
}

function startOrbAnimation(canvas) {
    const ctx = canvas.getContext('2d');
    let r = 50; let grow = true;
    function draw() {
        if (!isActive) return;
        ctx.fillStyle = "black"; ctx.fillRect(0,0,200,200);
        const g = ctx.createRadialGradient(100,100,10,100,100,r);
        g.addColorStop(0, "#4cd964"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(100,100,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        if (grow) r += 1.5; else r -= 1.5;
        if (r > 85 || r < 35) grow = !grow;
        requestAnimationFrame(draw);
    }
    draw();
}

async function runLoop(onUpdate) {
    while (isActive) {
        onUpdate({ type: 'STATUS', msg: 'Analyzing Path...' });
        
        // Pass the last latency to see if we should stick to the same path
        const opt = await optimizeConnection(lastKnownLatency);
        const lat = await measureLatency();
        lastKnownLatency = lat;

        onUpdate({ type: 'CYCLE', latency: lat, provider: opt.provider });

        // ADAPTIVE LOGIC:
        // If latency is bad (> 200ms), wait only 5 seconds before trying again (Burst Mode)
        // If latency is good (< 100ms), wait 20 seconds (Maintenance Mode)
        let waitTime = 15000;
        if (lat > 200) {
            onUpdate({ type: 'STATUS', msg: 'Congestion Detected: Bursting...' });
            waitTime = 5000; 
        } else {
            onUpdate({ type: 'STATUS', msg: 'Active Guard' });
            waitTime = 20000;
        }

        await sleep(waitTime); 
    }
}