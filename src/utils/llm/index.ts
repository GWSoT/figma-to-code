/**
 * LLM Provider Integration Module
 *
 * Abstract LLM integration layer supporting multiple providers:
 * - OpenAI (GPT-4, GPT-3.5, etc.)
 * - Anthropic (Claude 3 Opus, Sonnet, Haiku)
 * - Ollama (Local models: Llama, Mistral, CodeLlama, etc.)
 *
 * Features:
 * - Unified interface across all providers
 * - Streaming support for real-time feedback
 * - Rate limiting with token bucket algorithm
 * - Automatic retries with exponential backoff
 * - Provider failover for high availability
 *
 * @example
 * ```typescript
 * import { createLLMClient, getLLMClient } from "~/utils/llm";
 *
 * // Use the default configured client
 * const client = getLLMClient();
 * const result = await client.complete({
 *   messages: [
 *     { role: "system", content: "You are a helpful assistant." },
 *     { role: "user", content: "Hello!" }
 *   ]
 * });
 *
 * // Streaming example
 * for await (const chunk of client.stream(request)) {
 *   process.stdout.write(chunk.content);
 * }
 * ```
 */

// Re-export types
export type {
  ILLMProvider,
  LLMClientConfig,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMMessage,
  LLMModelParams,
  LLMProviderConfig,
  LLMProviderType,
  LLMResult,
  LLMStreamChunk,
  LLMStreamResponse,
  LLMTokenUsage,
  FailoverConfig,
  RateLimitConfig,
  RetryConfig,
  LLMErrorType,
} from "~/types/llm";

export { LLMError } from "~/types/llm";

// Re-export providers
export { OpenAIProvider, createOpenAIProvider } from "./providers/openai";
export {
  AnthropicProvider,
  createAnthropicProvider,
} from "./providers/anthropic";
export { OllamaProvider, createOllamaProvider } from "./providers/ollama";

// Re-export client
export { LLMClient, createLLMClient, createSimpleLLMClient } from "./client";

// Re-export utilities
export {
  RateLimiter,
  withRetry,
  withRateLimit,
  withRetryAndRateLimit,
  calculateBackoffDelay,
  sleep,
  isRetryableError,
  parseProviderError,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_RATE_LIMIT_CONFIG,
} from "./retry";

// Re-export base provider for custom implementations
export { BaseLLMProvider } from "./base-provider";

// Import for factory function
import { privateEnv } from "~/config/privateEnv";
import { LLMClient } from "./client";
import type { LLMClientConfig, LLMProviderConfig } from "~/types/llm";

// Cached client instance
let defaultClient: LLMClient | null = null;

/**
 * Get the default LLM client configured from environment variables
 *
 * Priority order:
 * 1. OpenAI (if OPENAI_API_KEY is set)
 * 2. Anthropic (if ANTHROPIC_API_KEY is set)
 * 3. Ollama (fallback for local development)
 *
 * Failover is automatically configured if multiple providers are available.
 */
export function getLLMClient(): LLMClient {
  if (defaultClient) {
    return defaultClient;
  }

  const config = buildClientConfig();
  defaultClient = new LLMClient(config);
  return defaultClient;
}

/**
 * Reset the default client (useful for testing or reconfiguration)
 */
export function resetLLMClient(): void {
  defaultClient = null;
}

/**
 * Build client configuration from environment variables
 */
function buildClientConfig(): LLMClientConfig {
  const providers: LLMProviderConfig[] = [];

  // Add OpenAI if configured
  if (privateEnv.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: privateEnv.OPENAI_API_KEY,
      baseUrl: privateEnv.OPENAI_BASE_URL,
      defaultModel: "gpt-4-turbo-preview",
    });
  }

  // Add Anthropic if configured
  if (privateEnv.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: privateEnv.ANTHROPIC_API_KEY,
      baseUrl: privateEnv.ANTHROPIC_BASE_URL,
      defaultModel: "claude-3-5-sonnet-20241022",
    });
  }

  // Add Ollama as fallback (no API key required)
  providers.push({
    provider: "ollama",
    baseUrl: privateEnv.OLLAMA_BASE_URL ?? "http://localhost:11434",
    defaultModel: "llama3.1",
  });

  // Use first available provider as primary
  const primary = providers[0];

  if (!primary) {
    throw new Error(
      "No LLM provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY."
    );
  }

  // Configure failover if multiple providers available
  const failoverProviders = providers.slice(1);

  return {
    primary,
    failover:
      failoverProviders.length > 0
        ? {
            providers: failoverProviders,
            failoverOnRateLimit: true,
            failoverOnError: true,
            maxFailovers: failoverProviders.length,
          }
        : undefined,
  };
}

/**
 * Quick helper to make a completion request with the default client
 */
export async function complete(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const client = getLLMClient();
  return client.complete({
    messages,
    model: options?.model,
    params: {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    },
  });
}

/**
 * Quick helper to stream a completion with the default client
 */
export function streamCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const client = getLLMClient();
  return client.stream({
    messages,
    model: options?.model,
    params: {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    },
  });
}
