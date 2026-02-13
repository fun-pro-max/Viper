import { toggleGuardian } from './services/guardian.js';

const btn = document.getElementById('stabilizeBtn');
const latencyDisplay = document.getElementById('latencyDisplay');
const statusText = document.getElementById('statusText');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;
    if (isRunning) {
        btn.innerText = "TERMINATE SA-CORE";
        btn.classList.add('active-mode');
        logWindow.innerHTML = "";
        addLog("N78 Frequency Lock Initializing...");
        
        await toggleGuardian(true, (u) => {
            const lat = Math.floor(u.latency);
            latencyDisplay.innerText = lat >= 900 ? "Re-Routing..." : `${lat}ms`;
            statusText.innerText = u.status;
            statusText.style.color = lat > 60 ? "#ff3b30" : "#00ff41";
            
            if (lat < 900 && lat % 2 === 0) addLog(`SA-Cell Optimized: ${lat}ms`);
        });
    } else {
        btn.innerText = "INITIALIZE CORE";
        btn.classList.remove('active-mode');
        statusText.innerText = "STANDBY";
        addLog("Radio Standby.");
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `>> ${msg}`;
    logWindow.prepend(entry);
    if(logWindow.childNodes.length > 15) logWindow.lastChild.remove();
}