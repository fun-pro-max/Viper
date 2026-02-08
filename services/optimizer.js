import { getOptimalDNS } from './dnsManager.js';

export async function optimizeConnection(lastLat) {
    const dns = getOptimalDNS(lastLat);
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);

    // If latency is high (Bufferbloat detected), we send a "Burst"
    const intensity = (lastLat > 150) ? 4 : 1; 
    const requests = [];

    try {
        const target = dns.name === 'Cloudflare' ? 'https://1.1.1.1' : 'https://8.8.8.8';
        
        // Send multiple parallel handshakes to stay ahead of the YouTube data queue
        for(let i = 0; i < intensity; i++) {
            requests.push(fetch(target, { 
                mode: 'no-cors', 
                cache: 'no-cache', 
                signal: ctrl.signal 
            }));
        }
        
        await Promise.allSettled(requests);
    } catch (e) {
        console.warn("Burst cycle partial fail");
    } finally {
        clearTimeout(tid);
    }

    return { success: true, provider: dns.name };
}