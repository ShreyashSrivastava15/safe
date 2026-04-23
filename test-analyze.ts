const testCases = [
    {
        name: "Phishing + Malicious URL",
        data: {
            message: "URGENT: Your account is locked. Verify now at http://secure-bank.xyz",
            url: "http://secure-bank.xyz"
        }
    },
    {
        name: "Job Scam (Interview Fee)",
        data: {
            message: "CONGRATS! You are hired for the position of Senior Analyst. Please pay $100 interview processing fee at recruiter@gmail.com",
            url: "http://job-offer.xyz"
        }
    },
    {
        name: "Social Engineering (Lottery)",
        data: {
            message: "Congratulations! You have won $1,000,000 in the international lottery. Claim your prize now!"
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
            }
        }
    },
    {
        name: "Safe Transaction",
        data: {
            transaction: {
                amount: 100,
                velocity: 1,
                geo_shift: false,
                device_change: false
            }
        }
    }
];

async function runTests() {
    for (const test of testCases) {
        console.log(`\n--- Running Test: ${test.name} ---`);
        try {
            const response = await fetch('http://127.0.0.1:3000/api/v1/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.data)
            });

            const data = await response.json();
            console.log(`Risk Level: ${data.risk_level}`);
            console.log(`Final Score: ${data.final_score}`);
            console.log(`Signals: ${data.signals.join(', ')}`);
            console.log(`Explanation: ${data.explanation}`);
        } catch (err) {
            console.error(`Test '${test.name}' failed:`, err);
        }
    }
}

runTests();
