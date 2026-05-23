import { z } from "zod";

export const attendanceMarkBulkSchema = z.object({
  class: z.string().min(1, "Class is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  items: z
    .array(
      z.object({
        studentId: z.string().uuid("Invalid student ID"),
        status: z.enum(["present", "absent", "leave"], {
          errorMap: () => ({ message: "Status must be present, absent, or leave" }),
        }),
      }),
    )
    .min(1, "At least one attendance record is required"),
});

export const attendanceQuerySchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format")
    .optional(),
  section: z.string().optional(),
});

export type AttendanceMarkBulkInput = z.infer<typeof attendanceMarkBulkSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;