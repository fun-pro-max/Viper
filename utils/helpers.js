export const sleep = (ms) => new Promise(res => setTimeout(res, ms));
export function formatMs(ms) { return ms >= 999 ? "Timeout" : `${Math.round(ms)} ms`; }