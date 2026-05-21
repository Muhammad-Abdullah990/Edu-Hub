import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  });

export const studentAnalyticsParamsSchema = z.object({
  studentId: z.string().uuid(),
});

export const classAnalyticsParamsSchema = z.object({
  classId: z.string().trim().min(1).max(32),
  date: dateString.optional(),
  section: z.string().trim().max(32).optional(),
});

export type StudentAnalyticsParams = z.infer<typeof studentAnalyticsParamsSchema>;
export type ClassAnalyticsParams = z.infer<typeof classAnalyticsParamsSchema>;
