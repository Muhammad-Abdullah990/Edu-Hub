export type CommunicationQueueCreateRequest = {
  studentId: string;
  subject: string;
  message: string;
  channel?: "email" | "sms" | "whatsapp" | "in_app";
  scheduledAt?: string;
  metadata?: Record<string, unknown>;
};

export type CommunicationQueueReviewRequest = {
  reviewStatus: "approved" | "rejected";
  reviewedBy?: string;
  notes?: string;
};

export type CommunicationQueueItem = {
  id: string;
  studentId: string;
  subject: string;
  message: string;
  channel: string;
  status: string;
  reviewStatus: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdBy: string | null;
  scheduledAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationHistoryItem = {
  id: string;
  queueItemId: string;
  studentId: string;
  channel: string;
  recipient: string;
  status: string;
  sentAt: Date | null;
  response: string | null;
  createdAt: Date;
};
