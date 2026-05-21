import { and, desc, eq, lt, sql } from "drizzle-orm";
import {
  db,
  feeRecordsTable,
  feeRemindersTable,
  feeStatusTable,
} from "@toppers/db";
import type {
  FeeRecordCreateRequest,
  FeeRecordUpdateRequest,
  FeeReminderCreateRequest,
  FeeRecord,
  FeeReminder,
} from "./types";

function normalizeFeeRecordStatus(record: {
  amountDue: number;
  amountPaid: number;
  dueDate: string;
}) {
  if (record.amountPaid >= record.amountDue) {
    return "paid";
  }

  const dueDate = new Date(record.dueDate);
  if (!Number.isNaN(dueDate.getTime()) && dueDate < new Date()) {
    return "overdue";
  }

  return "pending";
}

export const feesRepository = {
  async findFeeRecordById(id: string) {
    return db.query.feeRecordsTable.findFirst({
      where: eq(feeRecordsTable.id, id),
    });
  },

  async listFeeRecords(filter: {
    studentId?: string;
    status?: string;
  }) {
    const conditions: Array<ReturnType<typeof eq>> = [];

    if (filter.studentId) {
      conditions.push(eq(feeRecordsTable.studentId, filter.studentId));
    }

    if (filter.status) {
      conditions.push(eq(feeRecordsTable.status, filter.status));
    }

    return db.query.feeRecordsTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(feeRecordsTable.dueDate), desc(feeRecordsTable.createdAt)],
    });
  },

  async createFeeRecord(input: FeeRecordCreateRequest) {
    const status = normalizeFeeRecordStatus({
      amountDue: input.amountDue,
      amountPaid: input.amountPaid ?? 0,
      dueDate: input.dueDate,
    });

    const [record] = await db
      .insert(feeRecordsTable)
      .values({
        studentId: input.studentId,
        description: input.description,
        amountDue: input.amountDue,
        amountPaid: input.amountPaid ?? 0,
        currency: input.currency ?? "INR",
        dueDate: input.dueDate,
        status,
        notes: input.notes,
      })
      .returning({
        id: feeRecordsTable.id,
        studentId: feeRecordsTable.studentId,
        description: feeRecordsTable.description,
        amountDue: feeRecordsTable.amountDue,
        amountPaid: feeRecordsTable.amountPaid,
        currency: feeRecordsTable.currency,
        dueDate: feeRecordsTable.dueDate,
        status: feeRecordsTable.status,
        notes: feeRecordsTable.notes,
        createdAt: feeRecordsTable.createdAt,
        updatedAt: feeRecordsTable.updatedAt,
      });

    return record;
  },

  async updateFeeRecord(id: string, updates: FeeRecordUpdateRequest) {
    const existing = await this.findFeeRecordById(id);
    if (!existing) {
      return null;
    }

    const merged = {
      amountDue: updates.amountDue ?? existing.amountDue,
      amountPaid: updates.amountPaid ?? existing.amountPaid,
      dueDate: updates.dueDate ?? existing.dueDate,
    };

    const status = updates.status ?? normalizeFeeRecordStatus(merged as {
      amountDue: number;
      amountPaid: number;
      dueDate: string;
    });

    await db
      .update(feeRecordsTable)
      .set({
        ...(updates.description ? { description: updates.description } : {}),
        ...(updates.amountDue !== undefined ? { amountDue: updates.amountDue } : {}),
        ...(updates.amountPaid !== undefined ? { amountPaid: updates.amountPaid } : {}),
        ...(updates.currency ? { currency: updates.currency } : {}),
        ...(updates.dueDate ? { dueDate: updates.dueDate } : {}),
        ...(updates.status ? { status: updates.status } : { status }),
        ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(feeRecordsTable.id, id));

    return this.findFeeRecordById(id);
  },

  async createFeeReminder(input: FeeReminderCreateRequest & { feeRecordId: string; studentId: string }) {
    const [reminder] = await db
      .insert(feeRemindersTable)
      .values({
        feeRecordId: input.feeRecordId,
        studentId: input.studentId,
        reminderDate: input.reminderDate ? new Date(input.reminderDate) : new Date(),
        channel: input.channel ?? "email",
        status: "pending",
        message: input.message,
      })
      .returning({
        id: feeRemindersTable.id,
        feeRecordId: feeRemindersTable.feeRecordId,
        studentId: feeRemindersTable.studentId,
        reminderDate: feeRemindersTable.reminderDate,
        channel: feeRemindersTable.channel,
        status: feeRemindersTable.status,
        message: feeRemindersTable.message,
        createdAt: feeRemindersTable.createdAt,
        updatedAt: feeRemindersTable.updatedAt,
      });

    return reminder;
  },

  async listFeeRemindersForRecord(feeRecordId: string) {
    return db.query.feeRemindersTable.findMany({
      where: eq(feeRemindersTable.feeRecordId, feeRecordId),
      orderBy: [desc(feeRemindersTable.reminderDate)],
    });
  },

  async recalculateFeeStatus(studentId: string) {
    const [summary] = await db
      .select({
        outstandingAmount: sql<number>`COALESCE(SUM(${feeRecordsTable.amountDue} - ${feeRecordsTable.amountPaid}), 0)`,
        nextDueDate: sql<string>`MIN(CASE WHEN ${feeRecordsTable.amountPaid} < ${feeRecordsTable.amountDue} THEN ${feeRecordsTable.dueDate} ELSE NULL END)`,
      })
      .from(feeRecordsTable)
      .where(eq(feeRecordsTable.studentId, studentId));

    const outstandingAmount = Number(summary?.outstandingAmount ?? 0);
    const dueDate = summary?.nextDueDate ?? null;
    const status = outstandingAmount <= 0
      ? "paid"
      : dueDate && new Date(dueDate) < new Date()
      ? "overdue"
      : "pending";

    const existing = await db.query.feeStatusTable.findFirst({
      where: eq(feeStatusTable.studentId, studentId),
    });

    if (existing) {
      await db
        .update(feeStatusTable)
        .set({
          status,
          outstandingAmount,
          dueDate,
          updatedAt: new Date(),
        })
        .where(eq(feeStatusTable.studentId, studentId));
    } else {
      await db.insert(feeStatusTable).values({
        studentId,
        status,
        outstandingAmount,
        dueDate,
      });
    }

    return {
      status,
      outstandingAmount,
      dueDate,
    };
  },
};
