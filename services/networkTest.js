export async function measureJioPulse(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000); 
    
    try {
        const start = performance.now();
        await fetch(`${url}?v15=${Date.now()}`, { 
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