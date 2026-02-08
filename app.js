import { toggleGuardian } from './services/guardian.js';
import { formatMs } from './utils/helpers.js';
import { STATUS } from './utils/constants.js';

const btn = document.getElementById('stabilizeBtn');
const statusText = document.getElementById('statusText');
const latencyDisplay = document.getElementById('latencyDisplay');
const healthDisplay = document.getElementById('healthDisplay');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;

    if (isRunning) {
        // Start State
        btn.innerText = "STOP STABILIZATION";
        btn.classList.add('active-mode');
        addLog("Initializing Active Guardian...");
        
        await toggleGuardian(true, (update) => {
            if (update.type === 'STATUS') {
                statusText.innerText = update.msg;
            } else if (update.type === 'CYCLE') {
                latencyDisplay.innerText = formatMs(update.latency);
                healthDisplay.innerText = update.latency < 100 ? "Stable" : "Congested";
                addLog(`Path warmed via ${update.provider} (${Math.round(update.latency)}ms)`);
            }
        });
    } else {
        // Stop State
        btn.innerText = "START STABILIZATION";
        btn.classList.remove('active-mode');
        statusText.innerText = STATUS.IDLE;
        addLog("Stabilization suspended.");
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logWindow.prepend(entry);
}