import { ROLE_NAMES, type AuthenticatedPrincipal } from "@toppers/auth";
import type {
  FeeRecordCreateRequest,
  FeeRecordUpdateRequest,
  FeeReminderCreateRequest,
  FeeRecord,
  FeeReminder,
} from "./types";
import { auditService } from "../audit/service";
import { parentsRepository } from "../parents/repository";
import { studentsRepository } from "../students/repository";
import { feesRepository } from "./repository";
import { HttpError } from "../../lib/http-error";

function verifyStudentAccess(
  auth: AuthenticatedPrincipal,
  studentId: string,
) {
  if (auth.roles.includes(ROLE_NAMES.PARENT)) {
    return parentsRepository.isParentLinkedToStudent(auth.userId, studentId);
  }

  return Promise.resolve(
    auth.roles.some(
      (role) =>
        role === ROLE_NAMES.SUPER_ADMIN ||
        role === ROLE_NAMES.ADMIN ||
        role === ROLE_NAMES.TEACHER,
    ),
  );
}

export function createFeesService() {
  return {
    async listFeeRecords(
      auth: AuthenticatedPrincipal,
      studentId?: string,
      status?: string,
    ): Promise<FeeRecord[]> {
      if (auth.roles.includes(ROLE_NAMES.PARENT)) {
        if (!studentId) {
          throw new HttpError(
            403,
            "FEE_ACCESS_RESTRICTED",
            "Parents must specify a student to view fee information.",
          );
        }

        const allowed = await verifyStudentAccess(auth, studentId);
        if (!allowed) {
          throw new HttpError(
            403,
            "FEE_FORBIDDEN",
            "Parent does not have access to this student's fee records.",
          );
        }
      }

      return feesRepository.listFeeRecords({ studentId, status });
    },

    async getFeeRecordById(
      auth: AuthenticatedPrincipal,
      feeRecordId: string,
    ): Promise<FeeRecord> {
      const record = await feesRepository.findFeeRecordById(feeRecordId);
      if (!record) {
        throw new HttpError(404, "FEE_RECORD_NOT_FOUND", "Fee record not found");
      }

      const allowed = await verifyStudentAccess(auth, record.studentId);
      if (!allowed) {
        throw new HttpError(
          403,
          "FEE_FORBIDDEN",
          "User does not have permission to view this fee record.",
        );
      }

      return record;
    },

    async createFeeRecord(
      auth: AuthenticatedPrincipal,
      input: FeeRecordCreateRequest,
    ): Promise<FeeRecord> {
      const student = await studentsRepository.findStudentById(input.studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      const feeRecord = await feesRepository.createFeeRecord(input);
      await feesRepository.recalculateFeeStatus(input.studentId);

      await auditService.log({
        userId: auth.userId,
        action: "fee.record.create",
        entityType: "fee_record",
        entityId: feeRecord.id,
        metadata: {
          studentId: input.studentId,
          amountDue: input.amountDue,
        },
      });

      return feeRecord;
    },

    async updateFeeRecord(
      auth: AuthenticatedPrincipal,
      feeRecordId: string,
      updates: FeeRecordUpdateRequest,
    ): Promise<FeeRecord> {
      const existing = await feesRepository.findFeeRecordById(feeRecordId);
      if (!existing) {
        throw new HttpError(404, "FEE_RECORD_NOT_FOUND", "Fee record not found");
      }

      const allowed = await verifyStudentAccess(auth, existing.studentId);
      if (!allowed) {
        throw new HttpError(
          403,
          "FEE_FORBIDDEN",
          "User does not have permission to update this fee record.",
        );
      }

      const updated = await feesRepository.updateFeeRecord(feeRecordId, updates);
      if (!updated) {
        throw new HttpError(
          500,
          "FEE_RECORD_UPDATE_FAILED",
          "Unable to update fee record.",
        );
      }

      await feesRepository.recalculateFeeStatus(existing.studentId);

      await auditService.log({
        userId: auth.userId,
        action: "fee.record.update",
        entityType: "fee_record",
        entityId: feeRecordId,
        metadata: {
          updates,
        },
      });

      return updated;
    },

    async createFeeReminder(
      auth: AuthenticatedPrincipal,
      feeRecordId: string,
      input: FeeReminderCreateRequest,
    ): Promise<FeeReminder> {
      const existing = await feesRepository.findFeeRecordById(feeRecordId);
      if (!existing) {
        throw new HttpError(404, "FEE_RECORD_NOT_FOUND", "Fee record not found");
      }

      const allowed = await verifyStudentAccess(auth, existing.studentId);
      if (!allowed) {
        throw new HttpError(
          403,
          "FEE_REMINDER_FORBIDDEN",
          "User does not have permission to create a reminder for this fee record.",
        );
      }

      const reminder = await feesRepository.createFeeReminder({
        feeRecordId,
        studentId: existing.studentId,
        reminderDate: input.reminderDate,
        channel: input.channel,
        message: input.message,
      });

      await auditService.log({
        userId: auth.userId,
        action: "fee.reminder.create",
        entityType: "fee_reminder",
        entityId: reminder.id,
        metadata: {
          feeRecordId,
          studentId: existing.studentId,
          channel: input.channel,
        },
      });

      return reminder;
    },
  };
}
