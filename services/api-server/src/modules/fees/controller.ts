import type { Request, Response } from "express";
import { createFeesService } from "./service";
import type {
  FeeRecordCreateRequest,
  FeeRecordUpdateRequest,
  FeeReminderCreateRequest,
} from "./types";

const feesService = createFeesService();

export const feesController = {
  async listFeeRecords(request: Request, response: Response) {
    const studentId = request.query.studentId as string | undefined;
    const status = request.query.status as string | undefined;

    const auth = request.auth!;
    const feeRecords = await feesService.listFeeRecords(
      auth,
      studentId,
      status,
    );

    response.json({
      success: true,
      message: "Fee records retrieved successfully",
      data: feeRecords,
    });
  },

  async getFeeRecordById(request: Request, response: Response) {
    const auth = request.auth!;
    const feeRecordId = String(request.params.id);
    const feeRecord = await feesService.getFeeRecordById(auth, feeRecordId);

    response.json({
      success: true,
      message: "Fee record retrieved successfully",
      data: feeRecord,
    });
  },

  async createFeeRecord(request: Request, response: Response) {
    const auth = request.auth!;
    const input = request.body as FeeRecordCreateRequest;
    const feeRecord = await feesService.createFeeRecord(auth, input);

    response.status(201).json({
      success: true,
      message: "Fee record created successfully",
      data: feeRecord,
    });
  },

  async updateFeeRecordById(request: Request, response: Response) {
    const input = request.body as FeeRecordUpdateRequest;
    const auth = request.auth!;
    const feeRecordId = String(request.params.id);
    const feeRecord = await feesService.updateFeeRecord(
      auth,
      feeRecordId,
      input,
    );

    response.json({
      success: true,
      message: "Fee record updated successfully",
      data: feeRecord,
    });
  },

  async createFeeReminder(request: Request, response: Response) {
    const auth = request.auth!;
    const feeRecordId = String(request.params.id);
    const input = request.body as FeeReminderCreateRequest;
    const reminder = await feesService.createFeeReminder(
      auth,
      feeRecordId,
      input,
    );

    response.status(201).json({
      success: true,
      message: "Fee reminder queued successfully",
      data: reminder,
    });
  },
};
