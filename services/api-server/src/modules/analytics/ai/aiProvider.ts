export type AIModelProvider = "provider_agnostic";

export type AIRenderedSummary = {
  title: string;
  bullets: string[];
};

export interface AIProvider {
  readonly provider: AIModelProvider;

  generateSummary(input: {
    domain: string;
    tenantId: string;
    period: string;
    dataset: Record<string, unknown>;
  }): Promise<AIRenderedSummary>;
}

