import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  });

export const attendanceStatusSchema = z.enum(["present", "absent"]);

export const attendanceMarkItemSchema = z.object({
  studentId: z.string().uuid(),
  date: dateString,
  status: attendanceStatusSchema,
});

export const attendanceMarkBulkSchema = z.object({
  class: z.string().trim().min(1).max(32),
  section: z.string().trim().min(1).max(32).optional(),
  date: dateString,
  items: z.array(attendanceMarkItemSchema).min(1),
});

export const attendanceQuerySchema = z.object({
  classId: z.string().trim().min(1).max(32),
  date: dateString.optional(),
  section: z.string().trim().max(32).optional(),
});

export type AttendanceMarkBulkRequest = z.infer<typeof attendanceMarkBulkSchema>;
export type AttendanceQueryParams = z.infer<typeof attendanceQuerySchema>;
