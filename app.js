import { toggleGuardian } from './services/guardian.js';

const btn = document.getElementById('stabilizeBtn');
const latencyDisplay = document.getElementById('latencyDisplay');
const stabilityDisplay = document.getElementById('jitterDisplay');
const logWindow = document.getElementById('activityLog');

let isRunning = false;

btn.addEventListener('click', async () => {
    isRunning = !isRunning;
    if (isRunning) {
        btn.innerText = "TERMINATE STRIKE";
        btn.classList.add('active-mode');
        logWindow.innerHTML = "";
        await toggleGuardian(true, (u) => {
            latencyDisplay.innerText = u.latency === 999 ? "Retry..." : `${Math.round(u.latency)}ms`;
            stabilityDisplay.innerText = u.status;
            addLog(`${u.provider}: ${Math.round(u.latency)}ms`);
        });
    } else {
        btn.innerText = "ENGAGE JIO-STRIKE";
        btn.classList.remove('active-mode');
        toggleGuardian(false);
    }
});

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`;
    logWindow.prepend(entry);
    if(logWindow.childNodes.length > 30) logWindow.lastChild.remove();
}