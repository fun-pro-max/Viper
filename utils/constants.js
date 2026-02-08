export const DNS_PROVIDERS = {
    CLOUDFLARE: { name: "Cloudflare", ip: "1.1.1.1" },
    GOOGLE: { name: "Google DNS", ip: "8.8.8.8" }
};

export const STATUS = {
    IDLE: "System Idle",
    ACTIVE: "Active Protection",
    TESTING: "Diagnostic Run..."
};

export const CONFIG = {
    WARMUP_INTERVAL: 25000, // 25 seconds for loop
    PING_TIMEOUT: 5000      // 5 seconds max for latency
};