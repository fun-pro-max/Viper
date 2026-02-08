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
        logWindow.innerHTML = "";
        addLog("Activating Guardian...");
        await toggleGuardian(true, (u) => {
            if (u.type === 'STATUS') statusText.innerText = u.msg;
            else if (u.type === 'CYCLE') {
                latencyDisplay.innerText = formatMs(u.latency);
                addLog(`Path: ${u.provider} | ${Math.round(u.latency)}ms`);
            }
        });
    } else {
        btn.innerText = "START STABILIZATION";
        btn.classList.remove('active-mode');
        statusText.innerText = "Idle";
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`;
    logWindow.prepend(entry);
}