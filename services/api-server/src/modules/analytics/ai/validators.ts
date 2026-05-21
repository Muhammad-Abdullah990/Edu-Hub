import { z } from "zod";

export const aiSummaryOutputSchema = z
  .object({
    title: z.string().min(1).max(200),
    bullets: z.array(z.string().min(1).max(500)).max(20),
  })
  .strict();

export type AISummaryOutput = z.infer<typeof aiSummaryOutputSchema>;

