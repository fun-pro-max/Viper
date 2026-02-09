import { toggleGuardian } from './services/guardian.js';

const btn = document.getElementById('stabilizeBtn');
const latencyDisplay = document.getElementById('latencyDisplay');
const statusText = document.getElementById('statusText');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;
    if (isRunning) {
        btn.innerText = "STOP GUARD";
        btn.classList.add('active-mode');
        logWindow.innerHTML = "";
        addLog("v12 Socket-Lock Engaged...");
        
        await toggleGuardian(true, (u) => {
            latencyDisplay.innerText = u.latency >= 900 ? "Filtering..." : `${Math.round(u.latency)}ms`;
            statusText.innerText = u.status;
            statusText.style.color = u.latency > 120 ? "#ff3b30" : "#4cd964";
            if (u.latency < 900) addLog(`Pulse: ${Math.round(u.latency)}ms`);
        });
    } else {
        btn.innerText = "ENGAGE SOCKET-LOCK";
        btn.classList.remove('active-mode');
        statusText.innerText = "Standby";
        addLog("Guard Standby.");
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`;
    logWindow.prepend(entry);
    if(logWindow.childNodes.length > 20) logWindow.lastChild.remove();
}