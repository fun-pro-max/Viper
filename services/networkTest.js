export async function measureLatency() {
    const start = performance.now();
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);

    try {
        await fetch('https://www.google.com/generate_204', { 
            mode: 'no-cors', cache: 'no-cache', signal: ctrl.signal 
        });
        clearTimeout(tid);
        return performance.now() - start;
    } catch (e) { return 999; }
}