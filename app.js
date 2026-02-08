import { toggleGuardian } from './services/guardian.js';
import { formatMs } from './utils/helpers.js';

const btn = document.getElementById('stabilizeBtn');
const statusText = document.getElementById('statusText');
const latencyDisplay = document.getElementById('latencyDisplay');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;

    if (isRunning) {
        btn.innerText = "STOP PROTECTION";
        btn.classList.add('active-mode');
        
        // Clear log on start
        logWindow.innerHTML = ""; 
        addLog("Activating Floating Guard...");
        
        await toggleGuardian(true, (update) => {
            if (update.type === 'STATUS') {
                statusText.innerText = update.msg;
            } else if (update.type === 'CYCLE') {
                latencyDisplay.innerText = formatMs(update.latency);
                addLog(`Path warmed via ${update.provider}: ${Math.round(update.latency)}ms`);
            }
        });
    } else {
        btn.innerText = "START STABILIZATION";
        btn.classList.remove('active-mode');
        statusText.innerText = "System Idle";
        addLog("Protection deactivated.");
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`;
    logWindow.prepend(entry);
}