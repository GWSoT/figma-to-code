/**
 * Retry and Rate Limiting Utilities for LLM Providers
 *
 * Implements exponential backoff, rate limiting, and retry logic
 * for resilient LLM API interactions.
 */

import {
  LLMError,
  type LLMErrorType,
  type LLMProviderType,
  type RateLimitConfig,
  type RetryConfig,
} from "~/types/llm";

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    "rate_limit",
    "server_error",
    "network_error",
    "timeout",
  ],
};

// Default rate limit configuration
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerMinute: 60,
  tokensPerMinute: 90000,
  retryAfterMs: 1000,
  maxRetries: 3,
};

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly refillRate: number;

  constructor(private readonly config: RateLimitConfig) {
    this.tokens = config.requestsPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = config.requestsPerMinute / 60000; // tokens per ms
  }

  /**
   * Attempt to acquire a token for making a request
   * Returns the wait time in ms if rate limited, 0 if allowed
   */
  acquire(): number {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return 0;
    }

    // Calculate wait time until next token available
    const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);
    return waitTime;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(
      this.config.requestsPerMinute,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }

  /**
   * Get current available tokens
   */
  getAvailableTokens(): number {
    this.refillTokens();
    return Math.floor(this.tokens);
  }
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error type is retryable
 */
export function isRetryableError(
  errorType: LLMErrorType,
  config: RetryConfig
): boolean {
  return config.retryableErrors.includes(errorType);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  provider: LLMProviderType
): Promise<T> {
  let lastError: LLMError | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof LLMError) {
        lastError = error;

        // Don't retry non-retryable errors
        if (!isRetryableError(error.type, config)) {
          throw error;
        }

        // Check if we've exhausted retries
        if (attempt >= config.maxRetries) {
          throw new LLMError(
            `Max retries exceeded: ${error.message}`,
            error.type,
            provider,
            error.statusCode,
            false
          );
        }

        // Calculate delay, using server-provided retry-after if available
        const delay = error.retryAfterMs
          ? error.retryAfterMs
          : calculateBackoffDelay(attempt, config);

        await sleep(delay);
      } else {
        // Unknown error type - wrap and throw
        throw new LLMError(
          error instanceof Error ? error.message : "Unknown error",
          "unknown",
          provider,
          undefined,
          false
        );
      }
    }
  }

  // Should not reach here, but TypeScript needs this
  throw lastError ?? new LLMError("Retry failed", "unknown", provider);
}

/**
 * Execute a function with rate limiting
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  rateLimiter: RateLimiter
): Promise<T> {
  const waitTime = rateLimiter.acquire();

  if (waitTime > 0) {
    await sleep(waitTime);
  }

  return fn();
}

/**
 * Combined retry and rate limiting wrapper
 */
export async function withRetryAndRateLimit<T>(
  fn: () => Promise<T>,
  rateLimiter: RateLimiter,
  retryConfig: RetryConfig,
  provider: LLMProviderType
): Promise<T> {
  return withRetry(
    () => withRateLimit(fn, rateLimiter),
    retryConfig,
    provider
  );
}

/**
 * Parse error response from LLM provider APIs
 */
export function parseProviderError(
  error: unknown,
  provider: LLMProviderType
): LLMError {
  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new LLMError(
      "Network error: Unable to reach API",
      "network_error",
      provider,
      undefined,
      true
    );
  }

  // Handle timeout errors
  if (error instanceof Error && error.name === "AbortError") {
    return new LLMError(
      "Request timed out",
      "timeout",
      provider,
      undefined,
      true
    );
  }

  // Handle HTTP response errors
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    const status = error.status;
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : "API error";

    return mapStatusToError(status, message, provider);
  }

  // Handle error objects with status code
  if (error instanceof Error) {
    // Check for status code in error message or properties
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return mapStatusToError(status, error.message, provider);
    }

    return new LLMError(
      error.message,
      "unknown",
      provider,
      undefined,
      false
    );
  }

  return new LLMError(
    "Unknown error occurred",
    "unknown",
    provider,
    undefined,
    false
  );
}

/**
 * Map HTTP status code to LLM error type
 */
function mapStatusToError(
  status: number,
  message: string,
  provider: LLMProviderType
): LLMError {
  const errorMap: Record<number, { type: LLMErrorType; retryable: boolean }> = {
    400: { type: "invalid_request", retryable: false },
    401: { type: "authentication", retryable: false },
    403: { type: "authentication", retryable: false },
    404: { type: "model_not_found", retryable: false },
    429: { type: "rate_limit", retryable: true },
    500: { type: "server_error", retryable: true },
    502: { type: "server_error", retryable: true },
    503: { type: "server_error", retryable: true },
    504: { type: "timeout", retryable: true },
  };

  const errorInfo = errorMap[status] ?? { type: "unknown" as const, retryable: false };

  // Parse retry-after header value from message if present
  const retryAfterMatch = message.match(/retry.after[:\s]+(\d+)/i);
  const retryAfterMs = retryAfterMatch
    ? parseInt(retryAfterMatch[1], 10) * 1000
    : undefined;

  return new LLMError(
    message,
    errorInfo.type,
    provider,
    status,
    errorInfo.retryable,
    retryAfterMs
  );
}
