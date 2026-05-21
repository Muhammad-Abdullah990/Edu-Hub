import { z } from "zod";

export const parentRelationshipSchema = z.enum(["father", "mother", "guardian"]);

export const createParentSchema = z.object({
  name: z.string().trim().min(1).max(128),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().max(320).optional(),
  relationship: parentRelationshipSchema,
  address: z.string().trim().min(1).max(256),
  userId: z.string().uuid().optional(),
});

export const studentIdParamSchema = z.object({
  id: z.string().uuid(),
});
