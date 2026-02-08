export async function measureJioPulse(targetUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const buster = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;

    try {
        const start = performance.now();
        const res = await fetch(buster, { 
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