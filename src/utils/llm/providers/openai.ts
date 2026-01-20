/**
 * OpenAI LLM Provider
 *
 * Implements the LLM provider interface for OpenAI's API.
 * Supports GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, and other OpenAI models.
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

// OpenAI API types
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: "stop" | "length" | "content_filter" | null;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

interface OpenAIStreamDelta {
  role?: string;
  content?: string;
}

interface OpenAIStreamChoice {
  index: number;
  delta: OpenAIStreamDelta;
  finish_reason: "stop" | "length" | "content_filter" | null;
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIStreamChoice[];
}

interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}

// Default OpenAI configuration
const OPENAI_API_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4-turbo-preview";

/**
 * OpenAI LLM Provider implementation
 */
export class OpenAIProvider extends BaseLLMProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(config: LLMProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new LLMError(
        "OpenAI API key is required",
        "authentication",
        "openai"
      );
    }

    this.apiKey = config.apiKey;
    this.apiUrl = config.baseUrl ?? OPENAI_API_URL;
  }

  get provider(): LLMProviderType {
    return "openai";
  }

  /**
   * Execute a non-streaming completion request
   */
  protected async executeCompletion(
    request: LLMCompletionRequest
  ): Promise<LLMCompletionResponse> {
    const openaiRequest = this.buildRequest(request);

    const response = await this.fetchWithTimeout(
      `${this.apiUrl}/chat/completions`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(openaiRequest),
      }
    );

    const data = (await response.json()) as OpenAIChatResponse;

    return this.parseResponse(data);
  }

  /**
   * Execute a streaming completion request
   */
  async *stream(request: LLMCompletionRequest): LLMStreamResponse {
    const openaiRequest = this.buildRequest({ ...request, stream: true });

    const response = await this.fetchWithTimeout(
      `${this.apiUrl}/chat/completions`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(openaiRequest),
      }
    );

    if (!response.body) {
      throw new LLMError(
        "No response body for streaming",
        "server_error",
        "openai"
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
   * List available OpenAI models
   */
  async listModels(): Promise<string[]> {
    const response = await this.fetchWithTimeout(`${this.apiUrl}/models`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as OpenAIModelsResponse;

    // Filter to only chat-compatible models
    return data.data
      .filter((model) => model.id.startsWith("gpt-"))
      .map((model) => model.id)
      .sort();
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Build OpenAI API request from generic request
   */
  private buildRequest(request: LLMCompletionRequest): OpenAIChatRequest {
    const params = this.getMergedParams(request);

    return {
      model: this.getModel(request) || DEFAULT_MODEL,
      messages: this.formatMessages(request.messages),
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
      stop: params.stop,
      stream: request.stream ?? false,
    };
  }

  /**
   * Format messages to OpenAI format
   */
  private formatMessages(messages: LLMMessage[]): OpenAIMessage[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Parse OpenAI response to standard format
   */
  private parseResponse(response: OpenAIChatResponse): LLMCompletionResponse {
    const choice = response.choices[0];

    if (!choice) {
      throw new LLMError(
        "No completion choice in response",
        "server_error",
        "openai"
      );
    }

    const usage: LLMTokenUsage = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };

    return {
      content: choice.message.content,
      model: response.model,
      usage,
      finishReason: this.mapFinishReason(choice.finish_reason),
    };
  }

  /**
   * Parse a single SSE line from the stream
   */
  private parseStreamLine(line: string): LLMStreamChunk | null {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(":")) {
      return null;
    }

    // Handle data prefix
    if (!trimmed.startsWith("data: ")) {
      return null;
    }

    const data = trimmed.slice(6); // Remove "data: " prefix

    // Handle stream end
    if (data === "[DONE]") {
      return {
        content: "",
        isComplete: true,
        finishReason: "stop",
      };
    }

    try {
      const chunk = JSON.parse(data) as OpenAIStreamChunk;
      const choice = chunk.choices[0];

      if (!choice) {
        return null;
      }

      const content = choice.delta.content ?? "";
      const finishReason = choice.finish_reason;

      return {
        content,
        isComplete: finishReason !== null,
        finishReason: finishReason
          ? this.mapFinishReason(finishReason)
          : undefined,
      };
    } catch {
      // Invalid JSON, skip this chunk
      return null;
    }
  }

  /**
   * Map OpenAI finish reason to standard format
   */
  private mapFinishReason(
    reason: "stop" | "length" | "content_filter" | null
  ): "stop" | "length" | "content_filter" | "error" {
    if (!reason) return "stop";
    return reason;
  }
}

/**
 * Create an OpenAI provider with the given API key
 */
export function createOpenAIProvider(
  apiKey: string,
  options?: {
    baseUrl?: string;
    defaultModel?: string;
    defaultParams?: LLMModelParams;
    timeout?: number;
  }
): OpenAIProvider {
  return new OpenAIProvider({
    provider: "openai",
    apiKey,
    baseUrl: options?.baseUrl,
    defaultModel: options?.defaultModel ?? DEFAULT_MODEL,
    defaultParams: options?.defaultParams,
    timeout: options?.timeout,
  });
}
