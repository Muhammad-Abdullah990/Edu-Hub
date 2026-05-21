import type { Request, Response } from "express";
import { createCommunicationsService } from "./service";
import type {
  CommunicationQueueCreateRequest,
  CommunicationQueueReviewRequest,
} from "./types";

const communicationsService = createCommunicationsService();

export const communicationsController = {
  async listQueueItems(request: Request, response: Response) {
    const studentId = request.query.studentId as string | undefined;
    const status = request.query.status as string | undefined;
    const reviewStatus = request.query.reviewStatus as string | undefined;

    const auth = request.auth!;
    const items = await communicationsService.listQueueItems(auth, {
      studentId,
      status,
      reviewStatus,
    });

    response.json({
      success: true,
      message: "Communication queue items retrieved successfully",
      data: items,
    });
  },

  async getQueueItemById(request: Request, response: Response) {
    const auth = request.auth!;
    const queueItemId = String(request.params.id);
    const item = await communicationsService.getQueueItemById(
      auth,
      queueItemId,
    );

    response.json({
      success: true,
      message: "Communication queue item retrieved successfully",
      data: item,
    });
  },

  async createQueueItem(request: Request, response: Response) {
    const auth = request.auth!;
    const input = request.body as CommunicationQueueCreateRequest;
    const item = await communicationsService.createQueueItem(auth, input);

    response.status(201).json({
      success: true,
      message: "Communication queue item created successfully",
      data: item,
    });
  },

  async reviewQueueItem(request: Request, response: Response) {
    const auth = request.auth!;
    const queueItemId = String(request.params.id);
    const input = request.body as CommunicationQueueReviewRequest;
    const item = await communicationsService.reviewQueueItem(
      auth,
      queueItemId,
      input,
    );

    response.json({
      success: true,
      message: "Communication queue item reviewed successfully",
      data: item,
    });
  },

  async listNotificationHistory(request: Request, response: Response) {
    const studentId = request.query.studentId as string | undefined;
    const queueItemId = request.query.queueItemId as string | undefined;

    const auth = request.auth!;
    const history = await communicationsService.listNotificationHistory(
      auth,
      {
        studentId,
        queueItemId,
      },
    );

    response.json({
      success: true,
      message: "Notification history retrieved successfully",
      data: history,
    });
  },
};
