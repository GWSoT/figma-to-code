/**
 * Base LLM Provider
 *
 * Abstract base class that all LLM providers extend.
 * Provides common functionality for error handling, retries, and rate limiting.
 */

import {
  LLMError,
  type ILLMProvider,
  type LLMCompletionRequest,
  type LLMCompletionResponse,
  type LLMProviderConfig,
  type LLMProviderType,
  type LLMStreamResponse,
  type RetryConfig,
} from "~/types/llm";
import {
  DEFAULT_RETRY_CONFIG,
  RateLimiter,
  DEFAULT_RATE_LIMIT_CONFIG,
  withRetryAndRateLimit,
} from "./retry";

/**
 * Abstract base class for LLM providers
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  protected readonly rateLimiter: RateLimiter;
  protected readonly retryConfig: RetryConfig;

  constructor(
    public readonly config: LLMProviderConfig,
    retryConfig?: Partial<RetryConfig>
  ) {
    this.rateLimiter = new RateLimiter(DEFAULT_RATE_LIMIT_CONFIG);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  abstract get provider(): LLMProviderType;

  /**
   * Execute a completion request (non-streaming)
   */
  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    // Ensure we're not streaming for this method
    const nonStreamingRequest = { ...request, stream: false };

    return withRetryAndRateLimit(
      () => this.executeCompletion(nonStreamingRequest),
      this.rateLimiter,
      this.retryConfig,
      this.provider
    );
  }

  /**
   * Execute a streaming completion request
   * Note: Streaming has its own retry logic per-chunk
   */
  abstract stream(request: LLMCompletionRequest): LLMStreamResponse;

  /**
   * Check if the provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * List available models from the provider
   */
  abstract listModels(): Promise<string[]>;

  /**
   * Internal method to execute the completion (provider-specific)
   */
  protected abstract executeCompletion(
    request: LLMCompletionRequest
  ): Promise<LLMCompletionResponse>;

  /**
   * Get the model to use for a request
   */
  protected getModel(request: LLMCompletionRequest): string {
    return request.model ?? this.config.defaultModel;
  }

  /**
   * Merge request params with defaults
   */
  protected getMergedParams(request: LLMCompletionRequest) {
    return {
      ...this.config.defaultParams,
      ...request.params,
    };
  }

  /**
   * Create an abort controller with timeout
   */
  protected createAbortController(): AbortController {
    const controller = new AbortController();
    const timeout = this.config.timeout ?? 60000;

    setTimeout(() => controller.abort(), timeout);

    return controller;
  }

  /**
   * Make an HTTP request to the provider API
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = this.createAbortController();

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new LLMError(
        `API error: ${response.status} ${response.statusText} - ${errorBody}`,
        this.mapStatusToErrorType(response.status),
        this.provider,
        response.status,
        this.isRetryableStatus(response.status)
      );
    }

    return response;
  }

  /**
   * Map HTTP status to error type
   */
  private mapStatusToErrorType(
    status: number
  ): "rate_limit" | "authentication" | "invalid_request" | "server_error" | "unknown" {
    if (status === 429) return "rate_limit";
    if (status === 401 || status === 403) return "authentication";
    if (status >= 400 && status < 500) return "invalid_request";
    if (status >= 500) return "server_error";
    return "unknown";
  }

  /**
   * Check if a status code is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500;
  }
}
