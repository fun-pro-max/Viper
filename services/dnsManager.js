export function getOptimalDNS() {
    const providers = [
        { name: "Cloudflare", ip: "1.1.1.1" },
        { name: "Google", ip: "8.8.8.8" }
    ];
    return providers[Math.floor(Math.random() * providers.length)];
}