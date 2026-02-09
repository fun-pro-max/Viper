export async function measureJioPulse(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000); // 1s cutoff
    
    try {
        const start = performance.now();
        // Requesting a small slice to keep it "Real" for the tower
        await fetch(`${url}?v14=${Date.now()}`, { 
            mode: 'no-cors', 
            cache: 'no-store', 
            signal: controller.signal,
            priority: 'high'
        });
        clearTimeout(timeout);
        return performance.now() - start;
    } catch (e) {
        return 999;
    }
}