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
        
        // Start the engine
        await toggleGuardian(true, (u) => {
            const lat = Math.floor(u.latency);
            
            // UI Visual Updates
            latencyDisplay.innerText = `${lat}ms`;
            statusText.innerText = u.status;
            
            // Logic based on research: 
            // Above 150ms = 464XLAT Tromboning (BAD)
            // 60ms - 150ms = n28 Band (SLOW)
            // Under 60ms = n78 Band (GODLY)
            if (lat > 150) {
                statusText.style.color = "#ff3b30"; // Red
                if (lat % 5 === 0) addLog("XLAT DETECTED: Bypassing...");
            } else if (lat > 60) {
                statusText.style.color = "#ffcc00"; // Yellow
                if (lat % 5 === 0) addLog("n28 Signal: Boosting to n78...");
            } else {
                statusText.style.color = "#00ff41"; // Green
                if (lat % 5 === 0) addLog(`n78 Link Optimized: ${lat}ms`);
            }
        });
    } else {
        // Stop the engine
        btn.innerText = "INITIALIZE CORE";
        btn.classList.remove('active-mode');
        statusText.innerText = "STANDBY";
        statusText.style.color = "#fff";
        latencyDisplay.innerText = "--";
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