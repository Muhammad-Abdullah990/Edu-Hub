/**
 * AI Abstraction Layer
 * Provider-agnostic AI infrastructure for future extensibility
 * No vendor lock-in to OpenAI or any single provider
 */

/**
 * Supported AI Providers
 */
export enum AIProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  COHERE = "cohere",
  LOCAL = "local",
}

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * AI Request
 */
export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  context?: Record<string, any>;
  config?: Partial<AIModelConfig>;
}

/**
 * AI Response
 */
export interface AIResponse {
  provider: AIProvider;
  model: string;
  content: string;
  tokens?: {
    input: number;
    output: number;
  };
  metadata?: Record<string, any>;
}

/**
 * AI Provider Adapter Interface
 */
export interface IAIProvider {
  name: AIProvider;
  isAvailable(): Promise<boolean>;
  generateText(request: AIRequest): Promise<AIResponse>;
  generateSummary(text: string, maxLength?: number): Promise<string>;
  generateScores(data: Record<string, any>): Promise<Record<string, number>>;
}

/**
 * AI Adapter Registry
 */
export class AIAdapterRegistry {
  private adapters: Map<AIProvider, IAIProvider> = new Map();
  private defaultProvider: AIProvider = AIProvider.LOCAL;

  /**
   * Register adapter
   */
  registerAdapter(adapter: IAIProvider): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Get adapter
   */
  getAdapter(provider: AIProvider): IAIProvider | undefined {
    return this.adapters.get(provider);
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider: AIProvider): void {
    this.defaultProvider = provider;
  }

  /**
   * Get default provider
   */
  getDefaultProvider(): IAIProvider | undefined {
    return this.adapters.get(this.defaultProvider);
  }

  /**
   * List available providers
   */
  async getAvailableProviders(): Promise<AIProvider[]> {
    const available: AIProvider[] = [];

    for (const [provider, adapter] of this.adapters) {
      if (await adapter.isAvailable()) {
        available.push(provider);
      }
    }

    return available;
  }
}

/**
 * Local AI Provider (Placeholder for local inference)
 */
export class LocalAIProvider implements IAIProvider {
  name = AIProvider.LOCAL;

  async isAvailable(): Promise<boolean> {
    return true; // Always available as fallback
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    // TODO: Implement with TensorFlow.js or similar
    return {
      provider: AIProvider.LOCAL,
      model: "local-model",
      content: `[Local inference placeholder] Response to: ${request.prompt.substring(0, 50)}...`,
    };
  }

  async generateSummary(text: string, maxLength: number = 200): Promise<string> {
    // Simple fallback summarization
    return text.substring(0, maxLength);
  }

  async generateScores(data: Record<string, any>): Promise<Record<string, number>> {
    // Simple scoring based on data
    const scores: Record<string, number> = {};
    for (const [key] of Object.entries(data)) {
      scores[key] = Math.random();
    }
    return scores;
  }
}

/**
 * AI Service Factory
 */
export class AIService {
  private registry: AIAdapterRegistry;

  constructor() {
    this.registry = new AIAdapterRegistry();
    // Register default local provider
    this.registry.registerAdapter(new LocalAIProvider());
  }

  /**
   * Generate text from prompt
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    const provider = request.config?.provider || this.registry.getDefaultProvider()?.name;
    if (!provider) {
      throw new Error("No AI provider available");
    }

    const adapter = this.registry.getAdapter(provider);
    if (!adapter) {
      throw new Error(`Provider not found: ${provider}`);
    }

    return adapter.generateText(request);
  }

  /**
   * Generate summary
   */
  async summarize(text: string, maxLength?: number): Promise<string> {
    const provider = this.registry.getDefaultProvider();
    if (!provider) {
      throw new Error("No AI provider available");
    }

    return provider.generateSummary(text, maxLength);
  }

  /**
   * Generate risk scores
   */
  async generateScores(data: Record<string, any>): Promise<Record<string, number>> {
    const provider = this.registry.getDefaultProvider();
    if (!provider) {
      throw new Error("No AI provider available");
    }

    return provider.generateScores(data);
  }

  /**
   * Get registry for advanced use
   */
  getRegistry(): AIAdapterRegistry {
    return this.registry;
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}
