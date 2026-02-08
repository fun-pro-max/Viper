export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function formatMs(val) {
    if (!val || val > 998) return "Timed Out";
    return `${Math.round(val)} ms`;
}

export function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour12: false });
}