let bestProvider = null;
let bestLatency = 999;

export function getOptimalDNS(lastLatency = null) {
    const providers = [
        { name: "Cloudflare", ip: "1.1.1.1" },
        { name: "Google", ip: "8.8.8.8" }
    ];

    // If we have a provider that gave us a "Good" result (below 100ms), stick to it!
    if (lastLatency && lastLatency < 100) {
        return bestProvider || providers[0];
    }

    // If we don't have a best yet, pick at random to test
    const selected = providers[Math.floor(Math.random() * providers.length)];
    bestProvider = selected;
    return selected;
}