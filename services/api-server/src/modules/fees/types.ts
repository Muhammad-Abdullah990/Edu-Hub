export type FeeRecordCreateRequest = {
  studentId: string;
  description: string;
  amountDue: number;
  amountPaid?: number;
  currency?: string;
  dueDate: string;
  notes?: string;
};

export type FeeRecordUpdateRequest = {
  description?: string;
  amountDue?: number;
  amountPaid?: number;
  currency?: string;
  dueDate?: string;
  status?: "pending" | "overdue" | "paid" | "partial";
  notes?: string;
};

export type FeeReminderCreateRequest = {
  reminderDate?: string;
  channel?: "email" | "sms" | "whatsapp" | "in_app";
  message: string;
};

export type FeeRecord = {
  id: string;
  studentId: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FeeReminder = {
  id: string;
  feeRecordId: string;
  studentId: string;
  reminderDate: Date;
  channel: string;
  status: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};
