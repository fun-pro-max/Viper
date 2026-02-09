import { toggleGuardian } from './services/guardian.js';

const btn = document.getElementById('stabilizeBtn');
const latencyDisplay = document.getElementById('latencyDisplay');
const statusText = document.getElementById('statusText');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;
    if (isRunning) {
        btn.innerText = "TERMINATE REDLINE";
        btn.classList.add('active-mode');
        logWindow.innerHTML = "";
        addLog("Jio Redline Engine Engaged...");
        
        await toggleGuardian(true, (u) => {
            latencyDisplay.innerText = u.latency >= 900 ? "Jio Lag" : `${Math.round(u.latency)}ms`;
            statusText.innerText = u.status;
            statusText.style.color = u.latency > 100 ? "#ff3b30" : "#4cd964";
            addLog(`${u.provider}: ${Math.round(u.latency)}ms`);
        });
    } else {
        btn.innerText = "ENGAGE REDLINE";
        btn.classList.remove('active-mode');
        statusText.innerText = "Standby";
        statusText.style.color = "#777";
        addLog("Jio Guard Stopped.");
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`;
    logWindow.prepend(entry);
    if(logWindow.childNodes.length > 25) logWindow.lastChild.remove();
}