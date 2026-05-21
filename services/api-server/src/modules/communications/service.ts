import { ROLE_NAMES, type AuthenticatedPrincipal } from "@toppers/auth";
import type {
  CommunicationQueueCreateRequest,
  CommunicationQueueReviewRequest,
  CommunicationQueueItem,
  NotificationHistoryItem,
} from "./types";
import { auditService } from "../audit/service";
import { communicationsRepository } from "./repository";
import { HttpError } from "../../lib/http-error";

export function createCommunicationsService() {
  return {
    async listQueueItems(
      auth: AuthenticatedPrincipal,
      filter: {
        studentId?: string;
        status?: string;
        reviewStatus?: string;
      },
    ): Promise<CommunicationQueueItem[]> {
      if (auth.roles.includes(ROLE_NAMES.PARENT)) {
        throw new HttpError(
          403,
          "COMMUNICATIONS_FORBIDDEN",
          "Insufficient permissions to view communication queue items.",
        );
      }

      return communicationsRepository.listQueueItems(filter);
    },

    async getQueueItemById(
      auth: AuthenticatedPrincipal,
      queueItemId: string,
    ): Promise<CommunicationQueueItem> {
      const item = await communicationsRepository.findQueueItemById(queueItemId);
      if (!item) {
        throw new HttpError(
          404,
          "COMMUNICATION_QUEUE_ITEM_NOT_FOUND",
          "Communication queue item not found.",
        );
      }

      return item;
    },

    async createQueueItem(
      auth: AuthenticatedPrincipal,
      input: CommunicationQueueCreateRequest,
    ): Promise<CommunicationQueueItem> {
      const item = await communicationsRepository.createQueueItem({
        ...input,
        createdBy: auth.userId,
      });

      await communicationsRepository.createNotificationHistory({
        queueItemId: item.id,
        studentId: item.studentId,
        channel: item.channel,
        recipient: "system",
        status: "pending",
        response: "Queued for human review",
      });

      await auditService.log({
        userId: auth.userId,
        action: "communication.queue.create",
        entityType: "communication_queue",
        entityId: item.id,
        metadata: {
          studentId: input.studentId,
          channel: item.channel,
        },
      });

      return item;
    },

    async reviewQueueItem(
      auth: AuthenticatedPrincipal,
      queueItemId: string,
      input: CommunicationQueueReviewRequest,
    ): Promise<CommunicationQueueItem> {
      const item = await communicationsRepository.findQueueItemById(queueItemId);
      if (!item) {
        throw new HttpError(
          404,
          "COMMUNICATION_QUEUE_ITEM_NOT_FOUND",
          "Communication queue item not found.",
        );
      }

      const updated = await communicationsRepository.updateQueueItemStatus(
        queueItemId,
        {
          reviewStatus: input.reviewStatus,
          status: input.reviewStatus === "approved" ? "approved" : "rejected",
          reviewedBy: input.reviewedBy ?? auth.userId,
          metadata: {
            ...(item.metadata ?? {}),
            reviewNotes: input.notes,
          },
        },
      );

      if (!updated) {
        throw new HttpError(
          404,
          "COMMUNICATION_QUEUE_ITEM_NOT_FOUND",
          "Communication queue item not found during review update.",
        );
      }

      await communicationsRepository.createNotificationHistory({
        queueItemId,
        studentId: item.studentId,
        channel: item.channel,
        recipient: "system",
        status: updated.status,
        response: input.notes ?? `${updated.status} by reviewer`,
      });

      await auditService.log({
        userId: auth.userId,
        action: "communication.queue.review",
        entityType: "communication_queue",
        entityId: queueItemId,
        metadata: {
          reviewStatus: input.reviewStatus,
          notes: input.notes,
        },
      });

      return updated;
    },

    async listNotificationHistory(
      auth: AuthenticatedPrincipal,
      filter: { studentId?: string; queueItemId?: string },
    ): Promise<NotificationHistoryItem[]> {
      if (auth.roles.includes(ROLE_NAMES.PARENT)) {
        throw new HttpError(
          403,
          "NOTIFICATION_HISTORY_FORBIDDEN",
          "Insufficient permissions to view notification history.",
        );
      }

      return communicationsRepository.listNotificationHistory(filter);
    },
  };
}
