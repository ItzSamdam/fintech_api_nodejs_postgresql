export interface NotificationResponse {
    id: string;
    title: string;
    message: string;
    type: string;           // e.g., "transaction", "alert", "promotion"
    isRead: boolean;
    createdAt: Date;
    metaData?: Record<string, any>; // Additional data related to the notification
}