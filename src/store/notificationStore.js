class NotificationStore {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return {
            notifications: this.notifications,
            unreadCount: this.unreadCount
        };
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            isRead: false,
            time: 'Just now',
            ...notification
        };
        this.notifications = [newNotification, ...this.notifications];
        this.unreadCount++;
        this.notify();
    }

    markAllAsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
        this.unreadCount = 0;
        this.notify();
    }

    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.notify();
    }
}

const notificationStore = new NotificationStore();
export default notificationStore;
