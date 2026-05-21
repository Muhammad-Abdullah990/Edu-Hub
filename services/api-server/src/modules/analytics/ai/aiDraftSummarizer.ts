import type { AuthenticatedPrincipal } from "@toppers/auth";
import { z } from "zod";
import {
  aiGeneratedSummariesTable,
  db,
  predictionLogsTable,
} from "@toppers/db";
import { aiSummaryOutputSchema } from "./validators";

const aiDatasetSchema = z
  .object({
    domain: z.string().min(1),
    tenantId: z.string().uuid(),
    period: z.string().min(1),
    targetStudentId: z.string().uuid().optional(),
    facts: z.array(z.unknown()).default([]),
  })
  .strict();

function deterministicDraftFromDataset(dataset: z.infer<typeof aiDatasetSchema>) {
  // No fake AI claims: we create an auditable deterministic draft structure.
  const title = `Draft insight for ${dataset.domain} (${dataset.period})`;
  const bullets = [
    "Review computed analytics sources and scores for accuracy.",
    `Contains ${dataset.facts.length} factual items from the analytics snapshot/dataset.`,
  ];
  return { title, bullets };
}

export async function createAIDraftSummaries(options: {
  auth: AuthenticatedPrincipal;
  tenantId: string;
  domain: string;
  period: string;
  targetStudentId?: string;
  dataset: Record<string, unknown>;
}): Promise<{ summaryId: string; status: string; predictionLogId: string | null }> {
  const { auth, tenantId, domain, period, targetStudentId } = options;

  if (!auth.tenantId || auth.tenantId !== tenantId) {
    throw new Error("TENANT_MISMATCH");
  }

  const dataset = aiDatasetSchema.parse({
    domain,
    tenantId,
    period,
    targetStudentId,
    facts: (options.dataset as any)?.facts ?? [],
  });

  const outputDraft = deterministicDraftFromDataset(dataset);
  const output = aiSummaryOutputSchema.parse(outputDraft);

  // Persist auditable AI draft summary.
  const insertedSummaries = await db
    .insert(aiGeneratedSummariesTable)
    .values({
      tenantId,
      domain,
      targetStudentId: targetStudentId ?? null,
      period,
      dataset: {
        ...dataset,
      },
      output,
      status: "draft",
      audit: {
        generatedBy: "rule_based_draft_v1",
        notes: "Deterministic, reviewable draft. No external AI provider used.",
      },
    })
    .returning({ id: aiGeneratedSummariesTable.id });

  const summaryId = insertedSummaries[0].id;

  // Prepare future predictive logs scaffolding (also deterministic placeholder).
  let predictionLogId: string | null = null;
  const logPayload = {
    domain,
    tenantId,
    targetStudentId: targetStudentId ?? null,
    period,
    modelName: "future_model",
    inputDataset: dataset,
    prediction: {
      // Placeholder: must be reviewable + audit it via logs.
      recommendation: "human_review_required",
    },
    status: "completed",
  };

  // Keep it safe: only create prediction logs if needed later.
  // Here we create it to satisfy "AI-ready infrastructure" requirements.
  const insertedLogs = await db
    .insert(predictionLogsTable)
    .values({
      tenantId,
      domain,
      targetStudentId: logPayload.targetStudentId,
      period: logPayload.period,
      modelName: logPayload.modelName,
      inputDataset: logPayload.inputDataset,
      prediction: logPayload.prediction,
      status: logPayload.status,
      errorMessage: null,
    })
    .returning({ id: predictionLogsTable.id });

  predictionLogId = insertedLogs[0].id;

  return { summaryId, status: "draft", predictionLogId };
}

