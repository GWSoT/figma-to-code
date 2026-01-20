/**
 * AI Code Generation Agent
 *
 * A specialized agent for generating production-ready code from design understanding.
 * Features:
 * - Multi-framework support (React, Vue, Svelte, HTML)
 * - Multiple styling approaches (Tailwind, styled-components, CSS Modules)
 * - Iterative refinement based on feedback
 * - Validation and best practices enforcement
 * - Workflow orchestration with human-in-the-loop checkpoints
 *
 * @example
 * ```typescript
 * import { createCodeGenerationAgent, generateCode } from '~/utils/code-generation-agent';
 * import { getLLMClient } from '~/utils/llm';
 *
 * // Simple usage
 * const result = await generateCode(designContext, { framework: 'react' }, llmClient);
 *
 * // With agent for refinement
 * const agent = createCodeGenerationAgent(llmClient);
 * const result = await agent.generate(designContext, config);
 * const refined = await agent.refine(result, feedback);
 * ```
 */

// Types
export type {
  // Framework and styling types
  FrameworkType,
  StylingType,
  LanguageType,
  ComponentStyle,
  // Design context types
  DesignContext,
  ComponentSemanticType,
  LayoutContext,
  TypographyContext,
  ColorContext,
  InteractiveState,
  AccessibilityContext,
  ResponsiveContext,
  // Generation types
  CodeGenerationConfig,
  GeneratedFile,
  CodeGenerationResult,
  GenerationMetadata,
  // Refinement types
  RefinementFeedback,
  RefinementSession,
  // Agent types
  AgentState,
  AgentPhase,
  AgentEvent,
  AgentEventListener,
  AgentExecutionOptions,
  // Validation types
  ValidationResult,
  ValidationIssue,
  // Prompt types
  PromptTemplate,
  PromptTemplateRegistry,
  // Best practices
  FrameworkBestPractices,
} from "./types";

// Constants
export { DEFAULT_CODE_GENERATION_CONFIG } from "./types";

// Agent
export { CodeGenerationAgent, createCodeGenerationAgent } from "./agent";

// Prompts
export {
  promptRegistry,
  compilePrompt,
  buildGenerationPrompt,
  buildRefinementPrompt,
  buildValidationPrompt,
  FRAMEWORK_BEST_PRACTICES,
  REACT_BEST_PRACTICES,
  VUE_BEST_PRACTICES,
  SVELTE_BEST_PRACTICES,
} from "./prompts";

// Workflow
export type {
  CodeGenerationWorkflowInput,
  CodeGenerationWorkflowOutput,
} from "./workflow";

export {
  createCodeGenerationWorkflow,
  executeCodeGenerationWorkflow,
  generateCode,
  refineCode,
} from "./workflow";
