import { measureLatency } from './services/networkTest.js';
import { optimizeConnection } from './services/optimizer.js';
import { STATUS } from './utils/constants.js';
import { updateElementText, formatMs } from './utils/helpers.js';

const stabilizeBtn = document.getElementById('stabilizeBtn');
const statusText = document.getElementById('statusText');
const latencyBefore = document.getElementById('latencyBefore');
const latencyAfter = document.getElementById('latencyAfter');
const optimizationDetail = document.getElementById('optimizationDetail');

stabilizeBtn.addEventListener('click', async () => {
    try {
        // Initialization
        stabilizeBtn.disabled = true;
        updateElementText('statusText', STATUS.TESTING);
        optimizationDetail.innerText = "";
        latencyAfter.innerText = "--";

        // Step 1: Baseline Measurement
        const baseline = await measureLatency();
        latencyBefore.innerText = formatMs(baseline);

        // Step 2: Optimization Process
        updateElementText('statusText', STATUS.STABILIZING);
        const result = await optimizeConnection();
        
        // Step 3: Final Measurement
        updateElementText('statusText', STATUS.COMPLETED);
        const improved = await measureLatency();
        latencyAfter.innerText = formatMs(improved);

        // UI Feedback
        optimizationDetail.innerText = `Optimized via ${result.provider}. Paths stabilized.`;
        
    } catch (error) {
        console.error("Optimization failed:", error);
        updateElementText('statusText', "Error Occurred");
    } finally {
        stabilizeBtn.disabled = false;
    }
});