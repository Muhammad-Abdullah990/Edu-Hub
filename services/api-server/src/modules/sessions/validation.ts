import { z } from "zod";

export const refreshTokenSchema = z.string().min(32);
