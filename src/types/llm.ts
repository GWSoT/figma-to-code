/**
 * LLM Provider Types
 *
 * Type definitions for the abstract LLM provider integration layer.
 * Supports OpenAI, Anthropic, and local models with streaming responses.
 */

// Supported LLM providers
export type LLMProviderType = "openai" | "anthropic" | "ollama";

// Message roles following OpenAI/Anthropic conventions
export type MessageRole = "system" | "user" | "assistant";

// Chat message format
export interface LLMMessage {
  role: MessageRole;
  content: string;
}

// Common model parameters
export interface LLMModelParams {
  temperature?: number; // 0-2, default varies by provider
  maxTokens?: number; // Maximum tokens to generate
  topP?: number; // Nucleus sampling
  frequencyPenalty?: number; // Reduce repetition
  presencePenalty?: number; // Encourage new topics
  stop?: string[]; // Stop sequences
}

// Request options for completion
export interface LLMCompletionRequest {
  messages: LLMMessage[];
  model?: string; // Specific model override
  params?: LLMModelParams;
  stream?: boolean; // Enable streaming
}

// Token usage statistics
export interface LLMTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Non-streaming completion response
export interface LLMCompletionResponse {
  content: string;
  model: string;
  usage: LLMTokenUsage;
  finishReason: "stop" | "length" | "content_filter" | "error";
}

// Streaming chunk for real-time feedback
export interface LLMStreamChunk {
  content: string;
  isComplete: boolean;
  finishReason?: "stop" | "length" | "content_filter" | "error";
}

// Streaming response iterator
export type LLMStreamResponse = AsyncGenerator<LLMStreamChunk, void, unknown>;

// Provider configuration
export interface LLMProviderConfig {
  provider: LLMProviderType;
  apiKey?: string; // Not required for local models
  baseUrl?: string; // Custom endpoint (e.g., Azure OpenAI, local Ollama)
  defaultModel: string;
  defaultParams?: LLMModelParams;
  timeout?: number; // Request timeout in ms
}

// Rate limiting configuration
export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute?: number;
  retryAfterMs?: number; // Base retry delay
  maxRetries?: number;
}

// Retry configuration with exponential backoff
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[]; // Error types to retry
}

// Failover configuration
export interface FailoverConfig {
  providers: LLMProviderConfig[]; // Ordered list of fallback providers
  failoverOnRateLimit: boolean;
  failoverOnError: boolean;
  maxFailovers: number;
}

// Combined LLM client configuration
export interface LLMClientConfig {
  primary: LLMProviderConfig;
  failover?: FailoverConfig;
  rateLimit?: RateLimitConfig;
  retry?: RetryConfig;
}

// Error types for handling
export type LLMErrorType =
  | "rate_limit"
  | "authentication"
  | "invalid_request"
  | "model_not_found"
  | "context_length"
  | "content_filter"
  | "server_error"
  | "network_error"
  | "timeout"
  | "unknown";

// Custom error class for LLM operations
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly type: LLMErrorType,
    public readonly provider: LLMProviderType,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = "LLMError";
  }
}

// Provider interface that all providers must implement
export interface ILLMProvider {
  readonly provider: LLMProviderType;
  readonly config: LLMProviderConfig;

  // Non-streaming completion
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;

  // Streaming completion
  stream(request: LLMCompletionRequest): LLMStreamResponse;

  // Health check for failover
  isAvailable(): Promise<boolean>;

  // Get available models
  listModels(): Promise<string[]>;
}

// Response wrapper following codebase patterns
export interface LLMResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  provider?: LLMProviderType;
  retryable?: boolean;
}
