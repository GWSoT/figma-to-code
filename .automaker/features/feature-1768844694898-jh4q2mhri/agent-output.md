I'll start by using the brainstorming skill since this is a creative feature implementation task that requires designing an LLM provider abstraction system.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll follow the brainstorming skill to design this LLM provider abstraction system. Let me first understand the current project context.

🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore the codebase to understand:\n1. The overall project structure and architecture\n2. Any existing LLM/AI-related code or integrations\n3. How external services are currently integrated (patterns for API clients, error handling, retries)\n4. Configuration and environment variable patterns\n5. TypeScript patterns used throughout the project\n\nFocus on finding relevant patterns for integrating external API providers. Look in src/utils, src/fn, and any service-related directories.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.ts\" -o -name \"*.tsx\" | head -30",
  "description": "List TypeScript files in the project"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/",
  "description": "List source directory contents"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -maxdepth 2 -type d",
  "description": "Show src directory structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type f -name \"*.ts\" -o -name \"*.tsx\"",
  "description": "List utility files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/fn -type f -name \"*.ts\" -o -name \"*.tsx\"",
  "description": "List function files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/config -type f -name \"*.ts\" -o -name \"*.tsx\"",
  "description": "List config files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/config/privateEnv.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/config/publicEnv.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/storage/r2.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/storage/storage.interface.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/error.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/subscriptions.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/encryption.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/lib -type f -name \"*.ts\" -o -name \"*.tsx\"",
  "description": "List files in lib directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/lib/",
  "description": "Show lib directory contents"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/lib/stripe.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/lib/plans.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/subscription.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/middleware.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/data-access -type f -name \"*.ts\"",
  "description": "List data-access files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/db -type f -name \"*.ts\"",
  "description": "List database files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/index.ts"
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "description": "Show start of database schema"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-accounts.ts"
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/package.json",
  "description": "Show package.json dependencies"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/auth.ts"
}

🔧 Tool: Bash
Input: {
  "command": "head -50 /home/rainman/figma-to-code/figma-to-code/src/fn/figma-accounts.ts",
  "description": "Show figma accounts functions"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/routes -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20",
  "description": "Show route files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/.env.example"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/api/figma/callback.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/api/stripe/webhook.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tsconfig.json"
}
Excellent! Now I have a comprehensive understanding of the codebase. Let me check if there's any existing LLM-related code or feature planning documentation.

🔧 Tool: Glob
Input: {
  "pattern": "**/*llm*"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*ai*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/.automaker/features/feature-1768844694898-jh4q2mhri/feature.json"
}
Good, no existing LLM code exists. Let me check if there's a dependency on an AI prompt engineering system mentioned.

🔧 Tool: Glob
Input: {
  "pattern": "**/*prompt*"
}
No existing prompt system. Now I understand the context. Let me ask the user a key question to refine the design.

Based on my exploration, this is a Figma-to-code project. The LLM integration would likely be used for:
1. Converting Figma designs to code
2. Refining generated code
3. Providing intelligent suggestions

Let me ask the first clarifying question:

**What is the primary use case for the LLM integration in this Figma-to-code application?**

a) **Code generation** - Converting Figma design data into React/TypeScript code
b) **Code refinement** - Improving or fixing already-generated code
c) **Both generation and refinement** - Full pipeline from design to polished code
d) **Something else**

This helps me understand the expected input/output patterns and streaming requirements.

🔧 Tool: AskUserQuestion
Input: {
  "questions": [
    {
      "question": "What is the primary use case for the LLM integration in this Figma-to-code application?",
      "header": "Use case",
      "options": [
        {
          "label": "Code generation (Recommended)",
          "description": "Converting Figma design data into React/TypeScript code - fits the project purpose"
        },
        {
          "label": "Code refinement",
          "description": "Improving or fixing already-generated code"
        },
        {
          "label": "Both generation and refinement",
          "description": "Full pipeline from design to polished code"
        },
        {
          "label": "Design analysis",
          "description": "Analyzing Figma designs for structure, accessibility, etc."
        }
      ],
      "multiSelect": false
    }
  ]
}
The user hasn't responded yet. Given the context of the feature request and the project being a "figma-to-code" application, I'll proceed with a well-reasoned design that covers the most likely use case: **code generation from Figma designs**, with the flexibility to support other use cases.

Let me design this LLM integration layer based on the patterns I've discovered in the codebase and the feature requirements.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design the LLM provider abstraction architecture",
      "status": "in_progress",
      "activeForm": "Designing the LLM provider abstraction architecture"
    },
    {
      "content": "Create type definitions for LLM providers and responses",
      "status": "pending",
      "activeForm": "Creating type definitions for LLM providers"
    },
    {
      "content": "Implement base LLM provider interface and abstract class",
      "status": "pending",
      "activeForm": "Implementing base LLM provider interface"
    },
    {
      "content": "Implement OpenAI provider with streaming support",
      "status": "pending",
      "activeForm": "Implementing OpenAI provider"
    },
    {
      "content": "Implement Anthropic provider with streaming support",
      "status": "pending",
      "activeForm": "Implementing Anthropic provider"
    },
    {
      "content": "Implement local model provider (Ollama) support",
      "status": "pending",
      "activeForm": "Implementing local model provider"
    },
    {
      "content": "Create rate limiting and retry logic",
      "status": "pending",
      "activeForm": "Creating rate limiting and retry logic"
    },
    {
      "content": "Implement failover mechanism between providers",
      "status": "pending",
      "activeForm": "Implementing failover mechanism"
    },
    {
      "content": "Create LLM client factory with configuration",
      "status": "pending",
      "activeForm": "Creating LLM client factory"
    },
    {
      "content": "Add environment configuration for API keys",
      "status": "pending",
      "activeForm": "Adding environment configuration"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}
Now let me design and implement the LLM provider abstraction. Based on the codebase patterns (class-based API clients, interface-based abstractions, TypeScript strictness), I'll create a robust LLM integration layer.

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/types/llm.ts",
  "content": "/**\n * LLM Provider Types\n *\n * Type definitions for the abstract LLM provider integration layer.\n * Supports OpenAI, Anthropic, and local models with streaming responses.\n */\n\n// Supported LLM providers\nexport type LLMProviderType = \"openai\" | \"anthropic\" | \"ollama\";\n\n// Message roles following OpenAI/Anthropic conventions\nexport type MessageRole = \"system\" | \"user\" | \"assistant\";\n\n// Chat message format\nexport interface LLMMessage {\n  role: MessageRole;\n  content: string;\n}\n\n// Common model parameters\nexport interface LLMModelParams {\n  temperature?: number; // 0-2, default varies by provider\n  maxTokens?: number; // Maximum tokens to generate\n  topP?: number; // Nucleus sampling\n  frequencyPenalty?: number; // Reduce repetition\n  presencePenalty?: number; // Encourage new topics\n  stop?: string[]; // Stop sequences\n}\n\n// Request options for completion\nexport interface LLMCompletionRequest {\n  messages: LLMMessage[];\n  model?: string; // Specific model override\n  params?: LLMModelParams;\n  stream?: boolean; // Enable streaming\n}\n\n// Token usage statistics\nexport interface LLMTokenUsage {\n  promptTokens: number;\n  completionTokens: number;\n  totalTokens: number;\n}\n\n// Non-streaming completion response\nexport interface LLMCompletionResponse {\n  content: string;\n  model: string;\n  usage: LLMTokenUsage;\n  finishReason: \"stop\" | \"length\" | \"content_filter\" | \"error\";\n}\n\n// Streaming chunk for real-time feedback\nexport interface LLMStreamChunk {\n  content: string;\n  isComplete: boolean;\n  finishReason?: \"stop\" | \"length\" | \"content_filter\" | \"error\";\n}\n\n// Streaming response iterator\nexport type LLMStreamResponse = AsyncGenerator<LLMStreamChunk, void, unknown>;\n\n// Provider configuration\nexport interface LLMProviderConfig {\n  provider: LLMProviderType;\n  apiKey?: string; // Not required for local models\n  baseUrl?: string; // Custom endpoint (e.g., Azure OpenAI, local Ollama)\n  defaultModel: string;\n  defaultParams?: LLMModelParams;\n  timeout?: number; // Request timeout in ms\n}\n\n// Rate limiting configuration\nexport interface RateLimitConfig {\n  requestsPerMinute: number;\n  tokensPerMinute?: number;\n  retryAfterMs?: number; // Base retry delay\n  maxRetries?: number;\n}\n\n// Retry configuration with exponential backoff\nexport interface RetryConfig {\n  maxRetries: number;\n  baseDelayMs: number;\n  maxDelayMs: number;\n  backoffMultiplier: number;\n  retryableErrors: string[]; // Error types to retry\n}\n\n// Failover configuration\nexport interface FailoverConfig {\n  providers: LLMProviderConfig[]; // Ordered list of fallback providers\n  failoverOnRateLimit: boolean;\n  failoverOnError: boolean;\n  maxFailovers: number;\n}\n\n// Combined LLM client configuration\nexport interface LLMClientConfig {\n  primary: LLMProviderConfig;\n  failover?: FailoverConfig;\n  rateLimit?: RateLimitConfig;\n  retry?: RetryConfig;\n}\n\n// Error types for handling\nexport type LLMErrorType =\n  | \"rate_limit\"\n  | \"authentication\"\n  | \"invalid_request\"\n  | \"model_not_found\"\n  | \"context_length\"\n  | \"content_filter\"\n  | \"server_error\"\n  | \"network_error\"\n  | \"timeout\"\n  | \"unknown\";\n\n// Custom error class for LLM operations\nexport class LLMError extends Error {\n  constructor(\n    message: string,\n    public readonly type: LLMErrorType,\n    public readonly provider: LLMProviderType,\n    public readonly statusCode?: number,\n    public readonly retryable: boolean = false,\n    public readonly retryAfterMs?: number\n  ) {\n    super(message);\n    this.name = \"LLMError\";\n  }\n}\n\n// Provider interface that all providers must implement\nexport interface ILLMProvider {\n  readonly provider: LLMProviderType;\n  readonly config: LLMProviderConfig;\n\n  // Non-streaming completion\n  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;\n\n  // Streaming completion\n  stream(request: LLMCompletionRequest): LLMStreamResponse;\n\n  // Health check for failover\n  isAvailable(): Promise<boolean>;\n\n  // Get available models\n  listModels(): Promise<string[]>;\n}\n\n// Response wrapper following codebase patterns\nexport interface LLMResult<T> {\n  success: boolean;\n  data: T | null;\n  error: string | null;\n  provider?: LLMProviderType;\n  retryable?: boolean;\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design the LLM provider abstraction architecture",
      "status": "completed",
      "activeForm": "Designing the LLM provider abstraction architecture"
    },
    {
      "content": "Create type definitions for LLM providers and responses",
      "status": "completed",
      "activeForm": "Creating type definitions for LLM providers"
    },
    {
      "content": "Implement base LLM provider interface and abstract class",
      "status": "in_progress",
      "activeForm": "Implementing base LLM provider interface"
    },
    {
      "content": "Implement OpenAI provider with streaming support",
      "status": "pending",
      "activeForm": "Implementing OpenAI provider"
    },
    {
      "content": "Implement Anthropic provider with streaming support",
      "status": "pending",
      "activeForm": "Implementing Anthropic provider"
    },
    {
      "content": "Implement local model provider (Ollama) support",
      "status": "pending",
      "activeForm": "Implementing local model provider"
    },
    {
      "content": "Create rate limiting and retry logic",
      "status": "pending",
      "activeForm": "Creating rate limiting and retry logic"
    },
    {
      "content": "Implement failover mechanism between providers",
      "status": "pending",
      "activeForm": "Implementing failover mechanism"
    },
    {
      "content": "Create LLM client factory with configuration",
      "status": "pending",
      "activeForm": "Creating LLM client factory"
    },
    {
      "content": "Add environment configuration for API keys",
      "status": "pending",
      "activeForm": "Adding environment configuration"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}
Now let me create the base provider abstract class and the retry/rate-limiting utilities: