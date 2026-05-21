import { and, desc, eq } from "drizzle-orm";
import {
  communicationQueueTable,
  db,
  notificationHistoryTable,
} from "@toppers/db";
import type {
  CommunicationQueueCreateRequest,
  CommunicationQueueItem,
  NotificationHistoryItem,
} from "./types";

export const communicationsRepository = {
  async listQueueItems(filter: {
    studentId?: string;
    status?: string;
    reviewStatus?: string;
  }) {
    const conditions: Array<ReturnType<typeof eq>> = [];

    if (filter.studentId) {
      conditions.push(eq(communicationQueueTable.studentId, filter.studentId));
    }

    if (filter.status) {
      conditions.push(eq(communicationQueueTable.status, filter.status));
    }

    if (filter.reviewStatus) {
      conditions.push(eq(communicationQueueTable.reviewStatus, filter.reviewStatus));
    }

    return db.query.communicationQueueTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(communicationQueueTable.createdAt)],
    });
  },

  async findQueueItemById(id: string) {
    return db.query.communicationQueueTable.findFirst({
      where: eq(communicationQueueTable.id, id),
    });
  },

  async createQueueItem(input: CommunicationQueueCreateRequest & { createdBy?: string }) {
    const [item] = await db
      .insert(communicationQueueTable)
      .values({
        studentId: input.studentId,
        subject: input.subject,
        message: input.message,
        channel: input.channel ?? "email",
        status: "pending",
        reviewStatus: "pending",
        createdBy: input.createdBy,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        metadata: input.metadata ?? {},
      })
      .returning({
        id: communicationQueueTable.id,
        studentId: communicationQueueTable.studentId,
        subject: communicationQueueTable.subject,
        message: communicationQueueTable.message,
        channel: communicationQueueTable.channel,
        status: communicationQueueTable.status,
        reviewStatus: communicationQueueTable.reviewStatus,
        reviewedBy: communicationQueueTable.reviewedBy,
        reviewedAt: communicationQueueTable.reviewedAt,
        createdBy: communicationQueueTable.createdBy,
        scheduledAt: communicationQueueTable.scheduledAt,
        metadata: communicationQueueTable.metadata,
        createdAt: communicationQueueTable.createdAt,
        updatedAt: communicationQueueTable.updatedAt,
      });

    return item;
  },

  async updateQueueItemStatus(
    queueItemId: string,
    updates: {
      reviewStatus: string;
      status: string;
      reviewedBy: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await db
      .update(communicationQueueTable)
      .set({
        reviewStatus: updates.reviewStatus,
        status: updates.status,
        reviewedBy: updates.reviewedBy,
        reviewedAt: new Date(),
        ...(updates.metadata ? { metadata: updates.metadata } : {}),
        updatedAt: new Date(),
      })
      .where(eq(communicationQueueTable.id, queueItemId));

    return this.findQueueItemById(queueItemId);
  },

  async listNotificationHistory(filter: {
    studentId?: string;
    queueItemId?: string;
  }) {
    const conditions: Array<ReturnType<typeof eq>> = [];

    if (filter.studentId) {
      conditions.push(eq(notificationHistoryTable.studentId, filter.studentId));
    }

    if (filter.queueItemId) {
      conditions.push(eq(notificationHistoryTable.queueItemId, filter.queueItemId));
    }

    return db.query.notificationHistoryTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(notificationHistoryTable.createdAt)],
    });
  },

  async createNotificationHistory(input: {
    queueItemId: string;
    studentId: string;
    channel: string;
    recipient: string;
    status: string;
    response?: string;
  }): Promise<NotificationHistoryItem> {
    const [history] = await db
      .insert(notificationHistoryTable)
      .values({
        queueItemId: input.queueItemId,
        studentId: input.studentId,
        channel: input.channel,
        recipient: input.recipient,
        status: input.status,
        sentAt: new Date(),
        response: input.response,
      })
      .returning({
        id: notificationHistoryTable.id,
        queueItemId: notificationHistoryTable.queueItemId,
        studentId: notificationHistoryTable.studentId,
        channel: notificationHistoryTable.channel,
        recipient: notificationHistoryTable.recipient,
        status: notificationHistoryTable.status,
        sentAt: notificationHistoryTable.sentAt,
        response: notificationHistoryTable.response,
        createdAt: notificationHistoryTable.createdAt,
      });

    return history;
  },
};
