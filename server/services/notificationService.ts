import { EventEmitter } from 'events';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'FRAUD' | 'SUSPICIOUS' | 'SYSTEM';
    timestamp: Date;
    link?: string;
}

class NotificationService extends EventEmitter {
    private notifications: Notification[] = [];

    constructor() {
        super();
    }

    public sendNotification(userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'userId'>) {
        const fullNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId,
            timestamp: new Date()
        };

        this.notifications.push(fullNotification);
        
        // Keep only last 50 notifications in memory
        if (this.notifications.length > 500) {
            this.notifications = this.notifications.slice(-500);
        }

        // Emit event for real-time listeners (SSE/WS)
        this.emit('new_notification', fullNotification);
        
        console.log(`[Notification] Sent to User ${userId}: ${notification.title}`);
        return fullNotification;
    }

    public getUserNotifications(userId: string) {
        return this.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}

export const notificationService = new NotificationService();
