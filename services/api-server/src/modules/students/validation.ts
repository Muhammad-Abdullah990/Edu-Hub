import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  });

export const studentStatusSchema = z.enum(["active", "archived"]);

export const createStudentSchema = z.object({
  studentCode: z.string().trim().min(1).max(64),
  fullName: z.string().trim().min(1).max(256),
  class: z.string().trim().min(1).max(32),
  section: z.string().trim().min(1).max(32),
  dateOfBirth: dateString,
  admissionDate: dateString,
  photoUrl: z.string().trim().url().max(1024),
  status: studentStatusSchema.optional(),
});

export const updateStudentSchema = z.object({
  studentCode: z.string().trim().min(1).max(64).optional(),
  fullName: z.string().trim().min(1).max(256).optional(),
  class: z.string().trim().min(1).max(32).optional(),
  section: z.string().trim().min(1).max(32).optional(),
  dateOfBirth: dateString.optional(),
  admissionDate: dateString.optional(),
  photoUrl: z.string().trim().url().max(1024).optional(),
  status: studentStatusSchema.optional(),
});

export const studentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const studentListQuerySchema = z.object({
  q: z.string().trim().max(128).optional(),
  class: z.string().trim().max(32).optional(),
  status: studentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z
    .enum(["fullName", "admissionDate", "class", "studentCode"])
    .default("fullName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
