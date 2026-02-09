export async function measureJioPulse(targetUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    // Cache buster for accurate telemetry
    const buster = `${targetUrl}?z=${Math.random()}`;
    try {
        const start = performance.now();
        await fetch(buster, { 
            mode: 'no-cors', 
            cache: 'no-store', 
            signal: controller.signal, 
            priority: 'high' 
        });
        clearTimeout(timeout);
        return performance.now() - start;
    } catch (e) { return 999; }
}