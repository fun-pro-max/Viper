export const sleep = (ms) => new Promise(res => setTimeout(res, ms));
export function formatMs(ms) { return ms >= 900 ? "Jio Lag" : `${Math.round(ms)} ms`; }