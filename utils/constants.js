export const DNS_PROVIDERS = {
    CLOUDFLARE: { name: "Cloudflare", ip: "1.1.1.1" },
    GOOGLE: { name: "Google DNS", ip: "8.8.8.8" },
    DEFAULT: { name: "Local Gateway", ip: "Auto" }
};

export const STATUS = {
    IDLE: "Idle",
    TESTING: "Testing...",
    STABILIZING: "Stabilizing...",
    COMPLETED: "Completed"
};

export const THRESHOLDS = {
    GOOD: 50,
    CONGESTED: 150
};