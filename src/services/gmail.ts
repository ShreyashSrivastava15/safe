import { supabase } from "@/integrations/supabase/client";

export interface GmailMessage {
    id: string;
    snippet: string;
    body: string;
    subject: string;
    sender: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const checkConnectionStatus = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/auth/status/${userId}`);
        const data = await response.json();
        return data.connected;
    } catch (error) {
        console.error("Failed to check connection status", error);
        return false;
    }
};

export const fetchRecentEmails = async (): Promise<GmailMessage[]> => {
    // Instant Mock Gmail fetch for presentation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    snippet: 'Your account security alert: urgent action required...',
                    body: 'We noticed a login from an unknown device. If this was not you, please click here: http://secure-safe-verify.com',
                    subject: 'Security Alert: Login from Unknown Device',
                    sender: 'security@banking-support.ms'
                },
                {
                    id: '2',
                    snippet: 'Invoice #8849 is ready for payment...',
                    body: 'Your monthly statement is ready. Download it here: http://bit.ly/invoice-downdload',
                    subject: 'Invoice Ready',
                    sender: 'billing@utility-service.org'
                }
            ]);
        }, 1500);
    });
};
