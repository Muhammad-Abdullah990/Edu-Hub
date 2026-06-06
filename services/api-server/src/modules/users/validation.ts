import { ROLE_NAMES, USER_STATUS } from "@toppers/auth";
import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(128),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  roleName: z.enum([
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.TEACHER,
    ROLE_NAMES.STUDENT,
    ROLE_NAMES.PARENT,
  ]),
  // Student-specific fields (only used when roleName === "STUDENT")
  studentCode: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  monthlyFeeAmount: z.number().optional(),
  feeCycleStartDate: z.string().optional(),
  parentWhatsappNumbers: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (data.roleName === ROLE_NAMES.STUDENT) {
      return !!data.class;
    }
    return true;
  },
  { message: "Class is required when creating a student user", path: ["class"] },
);

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(128).optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional(),
    password: z.string().min(8).max(128).optional(),
    roleName: z
      .enum([
        ROLE_NAMES.SUPER_ADMIN,
        ROLE_NAMES.ADMIN,
        ROLE_NAMES.TEACHER,
        ROLE_NAMES.STUDENT,
        ROLE_NAMES.PARENT,
      ])
      .optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });
