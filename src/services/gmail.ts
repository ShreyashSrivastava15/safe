export interface GmailMessage {
    id: string;
    body: string;
    subject: string;
    sender: string;
    risk_level?: string;
    verdict?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const checkConnectionStatus = async (userId: string): Promise<boolean> => {
    const token = localStorage.getItem('safe_auth_token');
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/auth/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.connected;
    } catch (error) {
        console.error("Failed to check connection status", error);
        return false;
    }
};

export const fetchRecentEmails = async (): Promise<GmailMessage[]> => {
    const token = localStorage.getItem('safe_auth_token');
    if (!token) throw new Error('You must be signed in to fetch emails.');

    try {
        const response = await fetch(`${API_BASE_URL}/gmail/fetch`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch emails');
        }

        const data = await response.json();
        // Map backend results to frontend format
        return data.results.map((item: any) => ({
            id: item.id,
            subject: item.subject,
            sender: item.sender,
            body: item.snippet, 
            risk_level: item.risk_level,
            verdict: item.verdict
        }));
    } catch (error: any) {
        console.error("Gmail fetch error:", error);
        throw error;
    }
};
