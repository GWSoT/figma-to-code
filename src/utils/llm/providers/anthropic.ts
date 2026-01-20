/**
 * Anthropic LLM Provider
 *
 * Implements the LLM provider interface for Anthropic's Claude API.
 * Supports Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku, and other models.
 * Includes streaming support for real-time feedback.
 */

import {
  LLMError,
  type LLMCompletionRequest,
  type LLMCompletionResponse,
  type LLMMessage,
  type LLMModelParams,
  type LLMProviderConfig,
  type LLMProviderType,
  type LLMStreamChunk,
  type LLMStreamResponse,
  type LLMTokenUsage,
} from "~/types/llm";
import { BaseLLMProvider } from "../base-provider";

// Anthropic API types
interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

interface AnthropicContentBlock {
  type: "text";
  text: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | null;
  stop_sequence: string | null;
  usage: AnthropicUsage;
}

// Streaming event types
type AnthropicStreamEventType =
  | "message_start"
  | "content_block_start"
  | "content_block_delta"
  | "content_block_stop"
  | "message_delta"
  | "message_stop"
  | "ping"
  | "error";

interface AnthropicStreamEvent {
  type: AnthropicStreamEventType;
  message?: Partial<AnthropicResponse>;
  index?: number;
  content_block?: AnthropicContentBlock;
  delta?: {
    type: "text_delta";
    text: string;
  };
  usage?: {
    output_tokens: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

// Default Anthropic configuration
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1";
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";
const DEFAULT_MAX_TOKENS = 4096;
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Anthropic LLM Provider implementation
 */
export class AnthropicProvider extends BaseLLMProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(config: LLMProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new LLMError(
        "Anthropic API key is required",
        "authentication",
        "anthropic"
      );
    }

    this.apiKey = config.apiKey;
    this.apiUrl = config.baseUrl ?? ANTHROPIC_API_URL;
  }

  get provider(): LLMProviderType {
    return "anthropic";
  }

  /**
   * Execute a non-streaming completion request
   */
  protected async executeCompletion(
    request: LLMCompletionRequest
  ): Promise<LLMCompletionResponse> {
    const anthropicRequest = this.buildRequest(request);

    const response = await this.fetchWithTimeout(`${this.apiUrl}/messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(anthropicRequest),
    });

    const data = (await response.json()) as AnthropicResponse;

    return this.parseResponse(data);
  }

  /**
   * Execute a streaming completion request
   */
  async *stream(request: LLMCompletionRequest): LLMStreamResponse {
    const anthropicRequest = this.buildRequest({ ...request, stream: true });

    const response = await this.fetchWithTimeout(`${this.apiUrl}/messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(anthropicRequest),
    });

    if (!response.body) {
      throw new LLMError(
        "No response body for streaming",
        "server_error",
        "anthropic"
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const chunk = this.parseStreamLine(line);
          if (chunk) {
            yield chunk;

            if (chunk.isComplete) {
              return;
            }
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        const chunk = this.parseStreamLine(buffer);
        if (chunk) {
          yield chunk;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * List available Anthropic models
   * Note: Anthropic doesn't have a models API, so we return known models
   */
  async listModels(): Promise<string[]> {
    // Anthropic doesn't have a public models API
    // Return known Claude models
    return [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  }

  /**
   * Check availability by making a minimal request
   */
  override async isAvailable(): Promise<boolean> {
    try {
      // Make a minimal request to check API availability
      await this.executeCompletion({
        messages: [{ role: "user", content: "Hi" }],
        params: { maxTokens: 1 },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    };
  }

  /**
   * Build Anthropic API request from generic request
   */
  private buildRequest(request: LLMCompletionRequest): AnthropicRequest {
    const params = this.getMergedParams(request);
    const { systemMessage, messages } = this.extractSystemMessage(
      request.messages
    );

    const anthropicRequest: AnthropicRequest = {
      model: this.getModel(request) || DEFAULT_MODEL,
      messages: this.formatMessages(messages),
      max_tokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: params.temperature,
      top_p: params.topP,
      stop_sequences: params.stop,
      stream: request.stream ?? false,
    };

    if (systemMessage) {
      anthropicRequest.system = systemMessage;
    }

    return anthropicRequest;
  }

  /**
   * Extract system message from messages array
   * Anthropic uses a separate system parameter
   */
  private extractSystemMessage(messages: LLMMessage[]): {
    systemMessage: string | undefined;
    messages: LLMMessage[];
  } {
    const systemMessages = messages.filter((m) => m.role === "system");
    const otherMessages = messages.filter((m) => m.role !== "system");

    const systemMessage =
      systemMessages.length > 0
        ? systemMessages.map((m) => m.content).join("\n\n")
        : undefined;

    return { systemMessage, messages: otherMessages };
  }

  /**
   * Format messages to Anthropic format
   */
  private formatMessages(messages: LLMMessage[]): AnthropicMessage[] {
    return messages
      .filter((msg) => msg.role !== "system") // System handled separately
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
  }

  /**
   * Parse Anthropic response to standard format
   */
  private parseResponse(response: AnthropicResponse): LLMCompletionResponse {
    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    const usage: LLMTokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens:
        response.usage.input_tokens + response.usage.output_tokens,
    };

    return {
      content,
      model: response.model,
      usage,
      finishReason: this.mapStopReason(response.stop_reason),
    };
  }

  /**
   * Parse a single SSE line from the stream
   */
  private parseStreamLine(line: string): LLMStreamChunk | null {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      return null;
    }

    // Handle event type line (we primarily care about the data)
    if (trimmed.startsWith("event: ")) {
      return null;
    }

    // Handle data line
    if (!trimmed.startsWith("data: ")) {
      return null;
    }

    const data = trimmed.slice(6); // Remove "data: " prefix

    try {
      const event = JSON.parse(data) as AnthropicStreamEvent;

      switch (event.type) {
        case "content_block_delta":
          if (event.delta?.type === "text_delta") {
            return {
              content: event.delta.text,
              isComplete: false,
            };
          }
          return null;

        case "message_delta":
          // This contains the stop_reason
          return {
            content: "",
            isComplete: true,
            finishReason: "stop",
          };

        case "message_stop":
          return {
            content: "",
            isComplete: true,
            finishReason: "stop",
          };

        case "error":
          throw new LLMError(
            event.error?.message ?? "Stream error",
            "server_error",
            "anthropic"
          );

        default:
          // Ignore other event types
          return null;
      }
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      // Invalid JSON, skip this chunk
      return null;
    }
  }

  /**
   * Map Anthropic stop reason to standard format
   */
  private mapStopReason(
    reason: "end_turn" | "max_tokens" | "stop_sequence" | null
  ): "stop" | "length" | "content_filter" | "error" {
    switch (reason) {
      case "end_turn":
      case "stop_sequence":
        return "stop";
      case "max_tokens":
        return "length";
      default:
        return "stop";
    }
  }
}

/**
 * Create an Anthropic provider with the given API key
 */
export function createAnthropicProvider(
  apiKey: string,
  options?: {
    baseUrl?: string;
    defaultModel?: string;
    defaultParams?: LLMModelParams;
    timeout?: number;
  }
): AnthropicProvider {
  return new AnthropicProvider({
    provider: "anthropic",
    apiKey,
    baseUrl: options?.baseUrl,
    defaultModel: options?.defaultModel ?? DEFAULT_MODEL,
    defaultParams: options?.defaultParams,
    timeout: options?.timeout,
  });
}
