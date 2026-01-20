/**
 * Ollama LLM Provider
 *
 * Implements the LLM provider interface for Ollama (local models).
 * Supports any Ollama-compatible model like Llama, Mistral, CodeLlama, etc.
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

// Ollama API types
interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number; // max tokens
    stop?: string[];
    repeat_penalty?: number;
  };
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

// Default Ollama configuration
const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.1";

/**
 * Ollama LLM Provider implementation
 */
export class OllamaProvider extends BaseLLMProvider {
  private readonly apiUrl: string;

  constructor(config: LLMProviderConfig) {
    super(config);
    this.apiUrl = config.baseUrl ?? DEFAULT_OLLAMA_URL;
  }

  get provider(): LLMProviderType {
    return "ollama";
  }

  /**
   * Execute a non-streaming completion request
   */
  protected async executeCompletion(
    request: LLMCompletionRequest
  ): Promise<LLMCompletionResponse> {
    const ollamaRequest = this.buildRequest({ ...request, stream: false });

    const response = await this.fetchWithTimeout(`${this.apiUrl}/api/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(ollamaRequest),
    });

    const data = (await response.json()) as OllamaChatResponse;

    return this.parseResponse(data);
  }

  /**
   * Execute a streaming completion request
   */
  async *stream(request: LLMCompletionRequest): LLMStreamResponse {
    const ollamaRequest = this.buildRequest({ ...request, stream: true });

    const response = await this.fetchWithTimeout(`${this.apiUrl}/api/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(ollamaRequest),
    });

    if (!response.body) {
      throw new LLMError(
        "No response body for streaming",
        "server_error",
        "ollama"
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
   * List available Ollama models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.apiUrl}/api/tags`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const data = (await response.json()) as OllamaModelsResponse;

      return data.models.map((model) => model.name).sort();
    } catch {
      // Ollama might not be running
      return [];
    }
  }

  /**
   * Check if Ollama is available
   */
  override async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/tags`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      return response.ok;
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
    };
  }

  /**
   * Build Ollama API request from generic request
   */
  private buildRequest(request: LLMCompletionRequest): OllamaChatRequest {
    const params = this.getMergedParams(request);

    return {
      model: this.getModel(request) || DEFAULT_MODEL,
      messages: this.formatMessages(request.messages),
      stream: request.stream ?? false,
      options: {
        temperature: params.temperature,
        top_p: params.topP,
        num_predict: params.maxTokens,
        stop: params.stop,
        repeat_penalty: params.frequencyPenalty
          ? 1 + params.frequencyPenalty
          : undefined,
      },
    };
  }

  /**
   * Format messages to Ollama format
   */
  private formatMessages(messages: LLMMessage[]): OllamaMessage[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Parse Ollama response to standard format
   */
  private parseResponse(response: OllamaChatResponse): LLMCompletionResponse {
    // Ollama provides token counts in the response
    const promptTokens = response.prompt_eval_count ?? 0;
    const completionTokens = response.eval_count ?? 0;

    const usage: LLMTokenUsage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };

    return {
      content: response.message.content,
      model: response.model,
      usage,
      finishReason: response.done ? "stop" : "length",
    };
  }

  /**
   * Parse a single line from the stream
   * Ollama uses newline-delimited JSON
   */
  private parseStreamLine(line: string): LLMStreamChunk | null {
    const trimmed = line.trim();

    if (!trimmed) {
      return null;
    }

    try {
      const data = JSON.parse(trimmed) as OllamaChatResponse;

      return {
        content: data.message.content,
        isComplete: data.done,
        finishReason: data.done ? "stop" : undefined,
      };
    } catch {
      // Invalid JSON, skip this chunk
      return null;
    }
  }
}

/**
 * Create an Ollama provider with optional custom URL
 */
export function createOllamaProvider(options?: {
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: LLMModelParams;
  timeout?: number;
}): OllamaProvider {
  return new OllamaProvider({
    provider: "ollama",
    baseUrl: options?.baseUrl ?? DEFAULT_OLLAMA_URL,
    defaultModel: options?.defaultModel ?? DEFAULT_MODEL,
    defaultParams: options?.defaultParams,
    timeout: options?.timeout,
  });
}
