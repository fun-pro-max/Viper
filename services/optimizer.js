import { getOptimalDNS } from './dnsManager.js';

export async function optimizeConnection() {
    const dns = getOptimalDNS();

    // SOCKET WARMING: 
    // Keeps the cellular radio in a high-power, low-latency state
    const endpoints = [
        'https://1.1.1.1/cdn-cgi/trace',
        'https://8.8.8.8'
    ];

    await Promise.allSettled(
        endpoints.map(url => fetch(url, { mode: 'no-cors', cache: 'no-cache' }))
    );

    return { success: true, provider: dns.name };
}