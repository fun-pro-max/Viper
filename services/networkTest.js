export async function measureJioPulse(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800); 
    
    try {
        const start = performance.now();
        // Native IPv6 fetching - bypasses CLAT/PLAT translation layer
        await fetch(`${url}?probe=${Date.now()}`, { 
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