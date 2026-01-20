/**
 * LLM Client with Failover Support
 *
 * Main client for interacting with LLM providers.
 * Supports automatic failover between providers, rate limiting, and retries.
 */

import {
  LLMError,
  type FailoverConfig,
  type ILLMProvider,
  type LLMClientConfig,
  type LLMCompletionRequest,
  type LLMCompletionResponse,
  type LLMProviderConfig,
  type LLMProviderType,
  type LLMResult,
  type LLMStreamChunk,
  type LLMStreamResponse,
} from "~/types/llm";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { OllamaProvider } from "./providers/ollama";

/**
 * Create a provider instance from configuration
 */
function createProvider(config: LLMProviderConfig): ILLMProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config);
    case "anthropic":
      return new AnthropicProvider(config);
    case "ollama":
      return new OllamaProvider(config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * LLM Client with failover support
 */
export class LLMClient {
  private readonly primaryProvider: ILLMProvider;
  private readonly failoverProviders: ILLMProvider[];
  private readonly failoverConfig: FailoverConfig | undefined;

  constructor(config: LLMClientConfig) {
    this.primaryProvider = createProvider(config.primary);
    this.failoverConfig = config.failover;

    // Create failover providers
    this.failoverProviders = config.failover?.providers.map(createProvider) ?? [];
  }

  /**
   * Get the primary provider type
   */
  get provider(): LLMProviderType {
    return this.primaryProvider.provider;
  }

  /**
   * Execute a completion request with failover support
   */
  async complete(
    request: LLMCompletionRequest
  ): Promise<LLMResult<LLMCompletionResponse>> {
    const providers = [this.primaryProvider, ...this.failoverProviders];
    const maxFailovers = this.failoverConfig?.maxFailovers ?? providers.length;

    let lastError: LLMError | undefined;
    let failoverCount = 0;

    for (const provider of providers) {
      if (failoverCount >= maxFailovers) {
        break;
      }

      try {
        const response = await provider.complete(request);
        return {
          success: true,
          data: response,
          error: null,
          provider: provider.provider,
        };
      } catch (error) {
        if (error instanceof LLMError) {
          lastError = error;

          // Check if we should failover
          if (this.shouldFailover(error)) {
            failoverCount++;
            continue;
          }

          // Non-failover error, return immediately
          return {
            success: false,
            data: null,
            error: error.message,
            provider: provider.provider,
            retryable: error.retryable,
          };
        }

        // Unknown error
        return {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          provider: provider.provider,
          retryable: false,
        };
      }
    }

    // All providers failed
    return {
      success: false,
      data: null,
      error: lastError?.message ?? "All providers failed",
      provider: lastError?.provider,
      retryable: false,
    };
  }

  /**
   * Execute a streaming completion request with failover support
   */
  async *stream(request: LLMCompletionRequest): LLMStreamResponse {
    const providers = [this.primaryProvider, ...this.failoverProviders];
    const maxFailovers = this.failoverConfig?.maxFailovers ?? providers.length;

    let lastError: LLMError | undefined;
    let failoverCount = 0;

    for (const provider of providers) {
      if (failoverCount >= maxFailovers) {
        break;
      }

      try {
        // Try to get the first chunk to verify the stream is working
        const stream = provider.stream(request);

        for await (const chunk of stream) {
          yield chunk;

          if (chunk.isComplete) {
            return;
          }
        }

        // Stream completed successfully
        return;
      } catch (error) {
        if (error instanceof LLMError) {
          lastError = error;

          // Check if we should failover
          if (this.shouldFailover(error)) {
            failoverCount++;
            continue;
          }
        }

        // Non-failover error or unknown error, re-throw
        throw error;
      }
    }

    // All providers failed
    throw (
      lastError ?? new LLMError("All providers failed", "unknown", "openai")
    );
  }

  /**
   * Stream completion and collect full response
   * Useful when you want streaming UI but also need the final response
   */
  async streamWithCallback(
    request: LLMCompletionRequest,
    onChunk: (chunk: LLMStreamChunk, accumulated: string) => void
  ): Promise<LLMResult<string>> {
    try {
      let accumulated = "";

      for await (const chunk of this.stream(request)) {
        accumulated += chunk.content;
        onChunk(chunk, accumulated);

        if (chunk.isComplete) {
          break;
        }
      }

      return {
        success: true,
        data: accumulated,
        error: null,
        provider: this.provider,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Stream failed",
        provider: this.provider,
        retryable: error instanceof LLMError ? error.retryable : false,
      };
    }
  }

  /**
   * Check availability of all providers
   */
  async checkAvailability(): Promise<
    Array<{ provider: LLMProviderType; available: boolean }>
  > {
    const providers = [this.primaryProvider, ...this.failoverProviders];

    const results = await Promise.all(
      providers.map(async (provider) => ({
        provider: provider.provider,
        available: await provider.isAvailable(),
      }))
    );

    return results;
  }

  /**
   * List models from all available providers
   */
  async listAllModels(): Promise<
    Array<{ provider: LLMProviderType; models: string[] }>
  > {
    const providers = [this.primaryProvider, ...this.failoverProviders];

    const results = await Promise.all(
      providers.map(async (provider) => {
        try {
          const models = await provider.listModels();
          return { provider: provider.provider, models };
        } catch {
          return { provider: provider.provider, models: [] };
        }
      })
    );

    return results;
  }

  /**
   * Determine if we should failover based on the error
   */
  private shouldFailover(error: LLMError): boolean {
    if (!this.failoverConfig) {
      return false;
    }

    if (
      this.failoverConfig.failoverOnRateLimit &&
      error.type === "rate_limit"
    ) {
      return true;
    }

    if (
      this.failoverConfig.failoverOnError &&
      (error.type === "server_error" ||
        error.type === "network_error" ||
        error.type === "timeout")
    ) {
      return true;
    }

    return false;
  }
}

/**
 * Create an LLM client with the given configuration
 */
export function createLLMClient(config: LLMClientConfig): LLMClient {
  return new LLMClient(config);
}

/**
 * Create a simple LLM client with a single provider
 */
export function createSimpleLLMClient(
  provider: LLMProviderType,
  apiKey?: string,
  options?: {
    baseUrl?: string;
    defaultModel?: string;
  }
): LLMClient {
  const providerConfig: LLMProviderConfig = {
    provider,
    apiKey,
    baseUrl: options?.baseUrl,
    defaultModel:
      options?.defaultModel ?? getDefaultModel(provider),
  };

  return new LLMClient({
    primary: providerConfig,
  });
}

/**
 * Get default model for a provider
 */
function getDefaultModel(provider: LLMProviderType): string {
  switch (provider) {
    case "openai":
      return "gpt-4-turbo-preview";
    case "anthropic":
      return "claude-3-5-sonnet-20241022";
    case "ollama":
      return "llama3.1";
  }
}
