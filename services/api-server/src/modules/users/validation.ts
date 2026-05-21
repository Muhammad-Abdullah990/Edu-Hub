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
    ROLE_NAMES.TEACHER,
    ROLE_NAMES.STUDENT,
    ROLE_NAMES.PARENT,
  ]),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(128).optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional(),
    password: z.string().min(8).max(128).optional(),
    roleName: z
      .enum([
        ROLE_NAMES.SUPER_ADMIN,
        ROLE_NAMES.TEACHER,
        ROLE_NAMES.STUDENT,
        ROLE_NAMES.PARENT,
      ])
      .optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });
