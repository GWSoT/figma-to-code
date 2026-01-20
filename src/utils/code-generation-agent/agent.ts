/**
 * AI Code Generation Agent
 *
 * An intelligent agent specialized in generating production-ready code
 * from design understanding. Supports multiple frameworks, iterative
 * refinement, and applies best practices for readability and maintainability.
 */

import type { LLMClient } from "../llm/client";
import type { LLMCompletionRequest, LLMMessage, LLMResult } from "~/types/llm";
import {
  DEFAULT_CODE_GENERATION_CONFIG,
  type AgentEvent,
  type AgentEventListener,
  type AgentExecutionOptions,
  type AgentPhase,
  type AgentState,
  type CodeGenerationConfig,
  type CodeGenerationResult,
  type DesignContext,
  type GeneratedFile,
  type GenerationMetadata,
  type RefinementFeedback,
  type RefinementSession,
  type ValidationResult,
  type ValidationIssue,
} from "./types";
import {
  buildGenerationPrompt,
  buildRefinementPrompt,
  buildValidationPrompt,
  FRAMEWORK_BEST_PRACTICES,
} from "./prompts";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_REFINEMENTS = 3;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

// ============================================================================
// Agent Implementation
// ============================================================================

/**
 * AI Code Generation Agent
 *
 * Generates production-ready code from design context with support for:
 * - Multiple frameworks (React, Vue, Svelte, HTML)
 * - Multiple styling approaches (Tailwind, styled-components, CSS Modules)
 * - Iterative refinement based on feedback
 * - Validation and best practices enforcement
 */
export class CodeGenerationAgent {
  private state: AgentState;
  private readonly llmClient: LLMClient;
  private eventListeners: AgentEventListener[] = [];

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
    this.state = this.createInitialState();
  }

  /**
   * Create initial agent state
   */
  private createInitialState(): AgentState {
    return {
      phase: "idle",
      designContext: null,
      config: { ...DEFAULT_CODE_GENERATION_CONFIG } as CodeGenerationConfig,
      messages: [],
      result: null,
      refinementSession: null,
      error: null,
    };
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.state = this.createInitialState();
    this.eventListeners = [];
  }

  /**
   * Add event listener
   */
  addEventListener(listener: AgentEventListener): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: AgentEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("Event listener error:", e);
      }
    }
  }

  /**
   * Set agent phase and emit event
   */
  private setPhase(phase: AgentPhase): void {
    this.state.phase = phase;
    this.emit({ type: "phase_changed", phase, timestamp: new Date() });
  }

  /**
   * Get current agent state
   */
  getState(): Readonly<AgentState> {
    return this.state;
  }

  /**
   * Generate code from design context
   *
   * Main entry point for code generation. Handles the full workflow:
   * 1. Analyze design context
   * 2. Generate initial code
   * 3. Validate generated code
   * 4. Auto-refine if needed (optional)
   */
  async generate(
    designContext: DesignContext,
    config: Partial<CodeGenerationConfig> = {},
    options: AgentExecutionOptions = {}
  ): Promise<CodeGenerationResult> {
    const startTime = Date.now();

    try {
      // Merge config with defaults
      this.state.config = { ...DEFAULT_CODE_GENERATION_CONFIG, ...config } as CodeGenerationConfig;
      this.state.designContext = designContext;
      this.state.error = null;

      // Register event listener if provided
      if (options.onEvent) {
        this.addEventListener(options.onEvent);
      }

      // Check for cancellation
      if (options.signal?.aborted) {
        throw new Error("Operation cancelled");
      }

      // Phase 1: Generate code
      this.setPhase("generating");
      this.emit({
        type: "generation_started",
        config: this.state.config,
        timestamp: new Date(),
      });

      const generateResult = await this.generateCode(designContext, options);

      if (!generateResult.success) {
        throw new Error(generateResult.error ?? "Generation failed");
      }

      let result = this.parseGeneratedCode(
        generateResult.data!,
        designContext.componentName
      );

      // Emit file generated events
      for (const file of result.files) {
        this.emit({ type: "file_generated", file, timestamp: new Date() });
      }

      // Phase 2: Validate
      this.setPhase("validating");
      const validationResult = await this.validateCode(
        result.files,
        designContext,
        options
      );

      result.warnings.push(
        ...validationResult.warnings.map((w) => w.message)
      );
      result.errors.push(...validationResult.errors.map((e) => e.message));

      this.emit({
        type: "validation_result",
        warnings: result.warnings,
        errors: result.errors,
        timestamp: new Date(),
      });

      // Phase 3: Auto-refine if needed
      if (
        options.autoRefine &&
        (validationResult.errors.length > 0 || validationResult.suggestions.length > 0)
      ) {
        const feedback = this.convertValidationToFeedback(validationResult);
        result = await this.refine(result, feedback, options);
      }

      // Complete
      this.setPhase("complete");

      const metadata = this.createMetadata(startTime, options, 0);
      result.metadata = metadata;
      this.state.result = result;

      this.emit({
        type: "generation_complete",
        result,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      this.setPhase("error");
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.state.error = errorMessage;
      this.emit({ type: "error", message: errorMessage, timestamp: new Date() });

      return {
        success: false,
        files: [],
        componentName: designContext.componentName,
        warnings: [],
        errors: [errorMessage],
        metadata: this.createMetadata(startTime, options, 0),
      };
    }
  }

  /**
   * Refine generated code based on feedback
   *
   * Supports iterative refinement with:
   * - Human feedback
   * - Lint/typecheck errors
   * - Test failures
   * - Accessibility issues
   */
  async refine(
    currentResult: CodeGenerationResult,
    feedback: RefinementFeedback[],
    options: AgentExecutionOptions = {}
  ): Promise<CodeGenerationResult> {
    const startTime = Date.now();
    const maxRefinements = options.maxRefinements ?? DEFAULT_MAX_REFINEMENTS;

    // Initialize or update refinement session
    if (!this.state.refinementSession) {
      this.state.refinementSession = {
        id: `refine-${Date.now()}`,
        designContext: this.state.designContext!,
        config: this.state.config,
        currentResult,
        history: [],
        maxRefinements,
        refinementCount: 0,
      };
    }

    const session = this.state.refinementSession;

    // Check refinement limit
    if (session.refinementCount >= session.maxRefinements) {
      console.warn("Maximum refinements reached");
      return currentResult;
    }

    try {
      this.setPhase("refining");
      this.emit({
        type: "refinement_started",
        feedback,
        timestamp: new Date(),
      });

      // Sort feedback by priority
      const sortedFeedback = [...feedback].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Build refinement prompt
      const filesForPrompt = currentResult.files.map((f) => ({
        path: f.path,
        content: f.content,
        language: f.language,
      }));

      const { system, user } = buildRefinementPrompt(filesForPrompt, sortedFeedback);

      // Call LLM for refinement
      const request: LLMCompletionRequest = {
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        model: options.model ?? DEFAULT_MODEL,
        params: {
          temperature: options.temperature ?? DEFAULT_TEMPERATURE,
          maxTokens: 4096,
        },
      };

      const response = await this.llmClient.complete(request);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Refinement failed");
      }

      // Parse refined code
      const refinedResult = this.parseGeneratedCode(
        response.data.content,
        currentResult.componentName
      );

      // Update session
      session.history.push({
        feedback: sortedFeedback,
        result: refinedResult,
        timestamp: new Date(),
      });
      session.refinementCount++;
      session.currentResult = refinedResult;

      // Update metadata
      refinedResult.metadata = this.createMetadata(
        startTime,
        options,
        session.refinementCount
      );

      this.state.result = refinedResult;

      this.emit({
        type: "refinement_complete",
        result: refinedResult,
        timestamp: new Date(),
      });

      return refinedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Refinement failed";
      this.emit({ type: "error", message: errorMessage, timestamp: new Date() });
      return currentResult;
    }
  }

  /**
   * Generate code using LLM
   */
  private async generateCode(
    designContext: DesignContext,
    options: AgentExecutionOptions
  ): Promise<LLMResult<string>> {
    const { system, user } = buildGenerationPrompt(designContext, this.state.config);

    const request: LLMCompletionRequest = {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      model: options.model ?? DEFAULT_MODEL,
      params: {
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        maxTokens: 4096,
      },
    };

    // Store messages for context
    this.state.messages = request.messages;

    const response = await this.llmClient.complete(request);

    if (!response.success || !response.data) {
      return {
        success: false,
        data: null,
        error: response.error ?? "LLM completion failed",
      };
    }

    return {
      success: true,
      data: response.data.content,
      error: null,
    };
  }

  /**
   * Validate generated code using LLM
   */
  private async validateCode(
    files: GeneratedFile[],
    designContext: DesignContext,
    options: AgentExecutionOptions
  ): Promise<ValidationResult> {
    const filesForPrompt = files.map((f) => ({
      path: f.path,
      content: f.content,
      language: f.language,
    }));

    const { system, user } = buildValidationPrompt(
      filesForPrompt,
      designContext,
      this.state.config.framework,
      this.state.config.styling
    );

    const request: LLMCompletionRequest = {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      model: options.model ?? DEFAULT_MODEL,
      params: {
        temperature: 0.3, // Lower temperature for validation
        maxTokens: 2048,
      },
    };

    const response = await this.llmClient.complete(request);

    if (!response.success || !response.data) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      };
    }

    return this.parseValidationResult(response.data.content);
  }

  /**
   * Parse LLM response into generated files
   */
  private parseGeneratedCode(
    content: string,
    componentName: string
  ): CodeGenerationResult {
    const files: GeneratedFile[] = [];
    const warnings: string[] = [];

    // Match code blocks with file names: ```language:filename.ext
    const codeBlockRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, language, path, code] = match;
      const fileType = this.inferFileType(path);

      files.push({
        path: path.trim(),
        content: code.trim(),
        type: fileType,
        language: this.normalizeLanguage(language),
      });
    }

    // If no structured code blocks found, try to extract any code blocks
    if (files.length === 0) {
      const simpleBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
      let index = 0;

      while ((match = simpleBlockRegex.exec(content)) !== null) {
        const [, language, code] = match;
        const ext = this.getExtensionForLanguage(language);
        const fileName = index === 0 ? `${componentName}.${ext}` : `${componentName}-${index}.${ext}`;

        files.push({
          path: fileName,
          content: code.trim(),
          type: "component",
          language: this.normalizeLanguage(language),
        });
        index++;
      }

      if (files.length > 0) {
        warnings.push(
          "Code blocks were not properly labeled with file names. Used auto-generated names."
        );
      }
    }

    return {
      success: files.length > 0,
      files,
      componentName,
      warnings,
      errors: files.length === 0 ? ["No code blocks found in response"] : [],
      metadata: {} as GenerationMetadata, // Will be set by caller
    };
  }

  /**
   * Parse validation result from LLM response
   */
  private parseValidationResult(content: string): ValidationResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          valid: !parsed.errors || parsed.errors.length === 0,
          errors: (parsed.errors ?? []).map((e: any) => this.normalizeIssue(e, "error")),
          warnings: (parsed.warnings ?? []).map((w: any) => this.normalizeIssue(w, "warning")),
          suggestions: (parsed.suggestions ?? []).map((s: any) => this.normalizeIssue(s, "info")),
        };
      }
    } catch {
      // If JSON parsing fails, return empty result
    }

    return {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };
  }

  /**
   * Normalize validation issue
   */
  private normalizeIssue(
    issue: any,
    defaultSeverity: "error" | "warning" | "info"
  ): ValidationIssue {
    if (typeof issue === "string") {
      return {
        type: "style",
        severity: defaultSeverity,
        message: issue,
      };
    }

    return {
      type: issue.type ?? "style",
      severity: issue.severity ?? defaultSeverity,
      message: issue.message ?? String(issue),
      file: issue.file,
      line: issue.line,
      column: issue.column,
      fix: issue.fix,
      rule: issue.rule,
    };
  }

  /**
   * Convert validation result to refinement feedback
   */
  private convertValidationToFeedback(
    validation: ValidationResult
  ): RefinementFeedback[] {
    const feedback: RefinementFeedback[] = [];

    for (const error of validation.errors) {
      feedback.push({
        type: this.mapIssueTypeToFeedbackType(error.type),
        description: error.message,
        targetFile: error.file,
        lineRange: error.line ? { start: error.line, end: error.line } : undefined,
        priority: "critical",
        source: "typecheck",
      });
    }

    for (const warning of validation.warnings) {
      feedback.push({
        type: this.mapIssueTypeToFeedbackType(warning.type),
        description: warning.message,
        targetFile: warning.file,
        lineRange: warning.line ? { start: warning.line, end: warning.line } : undefined,
        priority: "medium",
        source: "lint",
      });
    }

    for (const suggestion of validation.suggestions) {
      feedback.push({
        type: this.mapIssueTypeToFeedbackType(suggestion.type),
        description: suggestion.message,
        targetFile: suggestion.file,
        priority: "low",
        source: "lint",
      });
    }

    return feedback;
  }

  /**
   * Map validation issue type to feedback type
   */
  private mapIssueTypeToFeedbackType(
    issueType: string
  ): RefinementFeedback["type"] {
    switch (issueType) {
      case "syntax":
      case "type":
        return "correction";
      case "accessibility":
        return "accessibility";
      case "performance":
        return "performance";
      case "style":
      case "best-practice":
        return "style";
      default:
        return "enhancement";
    }
  }

  /**
   * Infer file type from path
   */
  private inferFileType(path: string): GeneratedFile["type"] {
    const lowerPath = path.toLowerCase();

    if (lowerPath.includes("test") || lowerPath.includes("spec")) {
      return "test";
    }
    if (lowerPath.includes("story") || lowerPath.includes("stories")) {
      return "story";
    }
    if (lowerPath.includes("types") || lowerPath.endsWith(".d.ts")) {
      return "types";
    }
    if (lowerPath.includes("index")) {
      return "index";
    }
    if (
      lowerPath.endsWith(".css") ||
      lowerPath.endsWith(".scss") ||
      lowerPath.endsWith(".module.css")
    ) {
      return "styles";
    }

    return "component";
  }

  /**
   * Normalize language name
   */
  private normalizeLanguage(
    language: string
  ): GeneratedFile["language"] {
    const lower = language.toLowerCase();
    switch (lower) {
      case "typescript":
      case "tsx":
      case "ts":
        return "typescript";
      case "javascript":
      case "jsx":
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "scss":
      case "sass":
        return "scss";
      case "html":
        return "html";
      case "vue":
        return "vue";
      case "svelte":
        return "svelte";
      default:
        return "typescript";
    }
  }

  /**
   * Get file extension for language
   */
  private getExtensionForLanguage(language: string): string {
    switch (this.normalizeLanguage(language)) {
      case "typescript":
        return this.state.config.framework === "react" ? "tsx" : "ts";
      case "javascript":
        return this.state.config.framework === "react" ? "jsx" : "js";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "html":
        return "html";
      case "vue":
        return "vue";
      case "svelte":
        return "svelte";
      default:
        return "tsx";
    }
  }

  /**
   * Create generation metadata
   */
  private createMetadata(
    startTime: number,
    options: AgentExecutionOptions,
    refinementCount: number
  ): GenerationMetadata {
    return {
      generatedAt: new Date(),
      model: options.model ?? DEFAULT_MODEL,
      provider: this.llmClient.provider,
      config: this.state.config,
      durationMs: Date.now() - startTime,
      refinementCount,
    };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new code generation agent
 */
export function createCodeGenerationAgent(
  llmClient: LLMClient
): CodeGenerationAgent {
  return new CodeGenerationAgent(llmClient);
}
