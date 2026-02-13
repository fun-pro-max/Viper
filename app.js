// Change the update logic in app.js
await toggleGuardian(true, (u) => {
    const lat = Math.floor(u.latency);
    latencyDisplay.innerText = `${lat}ms`;
    statusText.innerText = u.status;
    
    // Change UI color based on SA quality
    if (lat > 150) {
        statusText.style.color = "#ff3b30"; // Red: Translation Error
        addLog("Critical: High Latency. Bypassing XLAT...");
    } else if (lat > 60) {
        statusText.style.color = "#ffcc00"; // Yellow: Low Band (n28)
        addLog("Optimizing n28 -> n78...");
    } else {
        statusText.style.color = "#00ff41"; // Green: Ultra (n78)
        addLog(`Link Locked: ${lat}ms`);
    }
});