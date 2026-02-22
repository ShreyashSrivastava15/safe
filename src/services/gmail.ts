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
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        throw new Error("You are not authenticated.");
    }

    const response = await fetch(`${API_BASE_URL}/gmail/fetch`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        const errData = await response.json();
        if (response.status === 401) {
            throw new Error("Google access token not found. Please connect your Google account.");
        }
        throw new Error(errData.error || "Failed to fetch messages from Gmail.");
    }

    return response.json();
};
