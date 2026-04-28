import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'FRAUD' | 'SUSPICIOUS' | 'SYSTEM';
    timestamp: string;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('safe_auth_token');
        if (!token) return;

        // Fetch history first
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchHistory();

        // Connect to SSE
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/notifications/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            const newNotif: Notification = JSON.parse(event.data);
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Trigger Toast
            toast(newNotif.title, {
                description: newNotif.message,
                action: newNotif.link ? {
                    label: 'View',
                    onClick: () => window.location.href = newNotif.link!
                } : undefined,
                duration: 5000,
            });
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection failed", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const markAsRead = () => setUnreadCount(0);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
