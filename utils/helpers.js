export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function formatMs(value) {
    if (!value || value === 0) return "--";
    return `${Math.round(value)} ms`;
}

export function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}