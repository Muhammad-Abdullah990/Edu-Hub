import { z } from "zod";

export const roleNameSchema = z.string().min(1);
