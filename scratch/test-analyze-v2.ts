
const testCases = [
    {
        name: "Phishing + Malicious URL",
        data: {
            message: "URGENT: Your account is locked. Verify now at http://secure-bank.xyz",
            url: "http://secure-bank.xyz",
            fraud_type: "ecommerce"
        }
    },
    {
        name: "Job Scam (Interview Fee)",
        data: {
            message: "CONGRATS! You are hired for the position of Senior Analyst. Please pay $100 interview processing fee at recruiter@gmail.com",
            url: "http://job-offer.xyz",
            fraud_type: "email"
        }
    },
    {
        name: "Transaction Anomaly",
        data: {
            transaction: {
                amount: 50000,
                velocity: 10,
                geo_shift: true,
                device_change: true
            },
            fraud_type: "transaction"
        }
    }
];

async function runTests() {
    for (const test of testCases) {
        console.log(`\n--- Running Test: ${test.name} ---`);
        try {
            const response = await fetch('http://127.0.0.1:3000/api/v1/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock_token'
                },
                body: JSON.stringify(test.data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error ${response.status}:`, errorData);
                continue;
            }

            const data = await response.json();
            console.log(`Risk Level: ${data.risk_level}`);
            console.log(`Final Score: ${data.final_score}`);
            console.log(`Signals: ${data.signals.join(', ')}`);
            console.log(`Explanation: ${data.explanation}`);
        } catch (err: any) {
            console.error(`Test '${test.name}' failed:`, err.message);
        }
    }
}

runTests();
