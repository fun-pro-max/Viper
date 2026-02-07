export async function measureLatency() {
    const endpoints = [
        'https://www.google.com/generate_204',
        'https://1.1.1.1/cdn-cgi/trace',
        'https://www.cloudflare.com/cdn-cgi/trace'
    ];

    let totalLatency = 0;
    let successfulChecks = 0;

    for (const url of endpoints) {
        const start = performance.now();
        try {
            // Using no-cors to bypass CORS issues for simple latency check
            await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
            const end = performance.now();
            totalLatency += (end - start);
            successfulChecks++;
        } catch (e) {
            console.warn(`Ping failed for ${url}`);
        }
    }

    return successfulChecks > 0 ? totalLatency / successfulChecks : 0;
}