import { supabase } from "@/integrations/supabase/client";

export interface GmailMessage {
    id: string;
    snippet: string;
    body: string;
    subject: string;
    sender: string;
}

export const fetchRecentEmails = async (): Promise<GmailMessage[]> => {
    // 1. Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        throw new Error("You are not authenticated.");
    }

    // 2. Extract the Google Provider Token
    // Supabase stores the OAuth access token (for Google) here when users log in via OAuth.
    const providerToken = session.provider_token;

    if (!providerToken) {
        throw new Error("Google access token not found. Please log out and sign in with Google again to grant inbox access.");
    }

    // 3. Fetch the list of recent unread message IDs from Gmail API
    const listResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${providerToken}`,
                Accept: 'application/json',
            },
        }
    );

    if (!listResponse.ok) {
        throw new Error("Failed to fetch messages from Gmail. Make sure you granted email access during login.");
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
        return [];
    }

    // 4. Fetch the full details for each message ID
    const detailedMessages: GmailMessage[] = [];

    for (const msg of messages) {
        const msgResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${providerToken}`,
                    Accept: 'application/json',
                },
            }
        );

        if (msgResponse.ok) {
            const msgData = await msgResponse.json();

            // Extract headers for Subject and Sender
            const headers = msgData.payload?.headers || [];
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
            const sender = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';

            // Decode the email body (Gmail returns it base64url encoded)
            let body = "No body content found.";

            // Look for plaintext body part
            const getBodyData = (parts: any[]): string | null => {
                if (!parts) return null;
                for (const part of parts) {
                    if (part.mimeType === 'text/plain' && part.body?.data) {
                        return part.body.data;
                    }
                    if (part.parts) {
                        const nested = getBodyData(part.parts);
                        if (nested) return nested;
                    }
                }
                return null;
            };

            let encodedBody = null;

            if (msgData.payload?.body?.data) {
                encodedBody = msgData.payload.body.data;
            } else if (msgData.payload?.parts) {
                encodedBody = getBodyData(msgData.payload.parts);
            }

            if (encodedBody) {
                // Decode Base64URL
                const base64 = encodedBody.replace(/-/g, '+').replace(/_/g, '/');
                body = decodeURIComponent(escape(window.atob(base64)));
            } else {
                body = msgData.snippet; // Fallback to snippet if body decoding fails
            }

            detailedMessages.push({
                id: msgData.id,
                snippet: msgData.snippet,
                body: body,
                subject: subject,
                sender: sender
            });
        }
    }

    return detailedMessages;
};
