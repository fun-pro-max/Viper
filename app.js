import { toggleGuardian } from './services/guardian.js';

const btn = document.getElementById('stabilizeBtn');
const latencyDisplay = document.getElementById('latencyDisplay');
const statusText = document.getElementById('statusText');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;
    if (isRunning) {
        btn.innerText = "TERMINATE GUARD";
        btn.classList.add('active-mode');
        addLog("Initializing Neural-Link...");
        
        await toggleGuardian(true, (data) => {
            // Smooth Latency Update
            animateValue(latencyDisplay, parseInt(latencyDisplay.innerText) || 0, Math.round(data.latency), "ms");
            
            statusText.innerText = data.status;
            statusText.style.color = data.jitter > 20 ? "#ffcc00" : "#4cd964";
            
            if (data.jitter > 30) {
                addLog(`Jitter Spike: ${Math.round(data.jitter)}ms - Boosting...`);
            }
        });
    } else {
        btn.innerText = "ENGAGE ACCELERATOR";
        btn.classList.remove('active-mode');
        statusText.innerText = "Standby";
        statusText.style.color = "white";
        addLog("Accelerator Disengaged.");
        toggleGuardian(false);
    }
});

function animateValue(obj, start, end, suffix) {
    if (isNaN(start)) start = 0;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(200 / range)) || 10;
    
    const timer = setInterval(() => {
        current += increment;
        obj.innerText = current + suffix;
        if (current == end) clearInterval(timer);
    }, stepTime);
}

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span style="color:#555">></span> ${msg}`;
    logWindow.prepend(entry);
    if(logWindow.childNodes.length > 15) logWindow.lastChild.remove();
}