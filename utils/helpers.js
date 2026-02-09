export const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export function formatMs(ms) { 
    if (ms >= 900) return "Filtering...";
    return `${Math.round(ms)} ms`; 
}