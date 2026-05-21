import { z } from "zod";

export const auditMetadataSchema = z.record(z.string(), z.unknown()).default({});
