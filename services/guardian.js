import { measureLatency } from './networkTest.js';
import { optimizeConnection } from './optimizer.js';
import { sleep } from '../utils/helpers.js';
import { CONFIG } from '../utils/constants.js';

let isActive = false;
let wakeLock = null;

export async function toggleGuardian(enabled, onUpdate) {
    isActive = enabled;

    if (isActive) {
        // Attempt to keep the CPU awake
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.warn("WakeLock unavailable");
            }
        }
        startLoop(onUpdate);
    } else {
        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
        }
    }
}

async function startLoop(onUpdate) {
    while (isActive) {
        onUpdate({ type: 'STATUS', msg: 'Warming Paths...' });
        
        // Execute socket warming and path optimization
        const optimization = await optimizeConnection();
        const latency = await measureLatency();

        onUpdate({ 
            type: 'CYCLE', 
            latency: latency, 
            provider: optimization.provider 
        });

        onUpdate({ type: 'STATUS', msg: 'Protection Active' });
        
        // Wait for next interval defined in constants
        await sleep(CONFIG.WARMUP_INTERVAL);
    }
}