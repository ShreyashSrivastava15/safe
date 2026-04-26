
async function testFetch() {
    try {
        const response = await fetch('http://127.0.0.1:8000/health');
        const data = await response.json();
        console.log('Success:', data);
    } catch (err: any) {
        console.error('Fetch failed:', err.message);
    }
}
testFetch();
