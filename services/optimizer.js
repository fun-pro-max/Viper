import { getOptimalDNS } from './dnsManager.js';

export async function optimizeConnection(lastLat) {
    const dns = getOptimalDNS(lastLat); // Now uses the latency-aware selector
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3500);

    try {
        // Force-warming the selected path
        await fetch(`https://${dns.name === 'Cloudflare' ? '1.1.1.1' : '8.8.8.8'}`, { 
            mode: 'no-cors', 
            cache: 'no-cache', 
            signal: ctrl.signal 
        });
    } catch (e) {} finally { clearTimeout(tid); }

    return { success: true, provider: dns.name };
}