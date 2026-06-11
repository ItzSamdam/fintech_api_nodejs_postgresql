export interface SupportTicketResponse {
    id: string;                        // UUID
    userId: string;                    // UUID
    transactionId?: string;            // UUID
    category: string;
    priority: string;
    subject: string;
    description: string;
    status: string;
    assignedTo?: string;               // UUID
    assignedToName?: string;
    messages: TicketMessageResponse[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

export interface TicketMessageResponse {
    id: string;                        // UUID
    senderType: string;
    senderId: string;                  // UUID
    senderName: string;
    message: string;
    attachmentUrl?: string;
    createdAt: Date;
}

export interface CreateTicketResponse {
    ticketId: string;                  // UUID
    reference: string;
    status: string;
    createdAt: Date;
}
