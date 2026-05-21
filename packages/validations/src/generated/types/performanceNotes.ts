import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  });

export const performanceNoteCreateSchema = z.object({
  studentId: z.string().uuid(),
  strengths: z.string().trim().min(1).max(1024),
  weaknesses: z.string().trim().min(1).max(1024),
  recommendations: z.string().trim().min(1).max(1024),
  behavioralNotes: z.string().trim().min(1).max(1024),
  note: z.string().trim().min(1).max(2048),
});

export const performanceNotesQuerySchema = z.object({
  studentId: z.string().uuid(),
});

export type PerformanceNoteCreateRequest = z.infer<
  typeof performanceNoteCreateSchema
>;
export type PerformanceNotesQueryParams = z.infer<
  typeof performanceNotesQuerySchema
>;
