import { CONFIG } from '../utils/constants.js';

export async function measureLatency() {
    const target = 'https://www.google.com/generate_204';
    const start = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.PING_TIMEOUT);

        await fetch(target, { 
            mode: 'no-cors', 
            cache: 'no-cache',
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        return performance.now() - start;
    } catch (e) {
        console.error("Latency check timed out");
        return 999; 
    }
}