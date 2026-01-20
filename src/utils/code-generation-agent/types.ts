/**
 * AI Code Generation Agent - Type Definitions
 *
 * Defines types for the AI agent specialized in generating production-ready code
 * from design understanding. Supports multiple frameworks, iterative refinement,
 * and applies best practices for readability and maintainability.
 */

import type { FigmaNode } from "../figma-api";
import type { LLMMessage, LLMProviderType } from "~/types/llm";
import type { TaskContext, WorkflowEvent } from "../orchestrator/types";

// ============================================================================
// Framework and Styling Types
// ============================================================================

/**
 * Supported frontend frameworks
 */
export type FrameworkType = "react" | "vue" | "svelte" | "html";

/**
 * Supported styling approaches
 */
export type StylingType =
  | "tailwind"
  | "styled-components"
  | "css-modules"
  | "inline"
  | "scss";

/**
 * TypeScript/JavaScript preference
 */
export type LanguageType = "typescript" | "javascript";

/**
 * Component structure style
 */
export type ComponentStyle =
  | "functional" // React functional components
  | "class" // React class components (legacy)
  | "composition-api" // Vue 3 Composition API
  | "options-api" // Vue 2/3 Options API
  | "runes"; // Svelte 5 runes

// ============================================================================
// Design Context Types
// ============================================================================

/**
 * Design context extracted from Figma analysis
 */
export interface DesignContext {
  /** Original Figma node data */
  node: FigmaNode;
  /** Component name (derived from Figma layer name) */
  componentName: string;
  /** Detected semantic type (button, card, form, etc.) */
  semanticType: ComponentSemanticType;
  /** Layout information */
  layout: LayoutContext;
  /** Typography styles */
  typography: TypographyContext[];
  /** Colors and fills */
  colors: ColorContext[];
  /** Interactive states detected */
  interactiveStates: InteractiveState[];
  /** Child components detected */
  children: DesignContext[];
  /** Accessibility metadata */
  accessibility: AccessibilityContext;
  /** Responsive behavior hints */
  responsive: ResponsiveContext;
}

/**
 * Semantic type of the component
 */
export type ComponentSemanticType =
  | "button"
  | "input"
  | "select"
  | "checkbox"
  | "radio"
  | "toggle"
  | "card"
  | "modal"
  | "dialog"
  | "navigation"
  | "header"
  | "footer"
  | "sidebar"
  | "list"
  | "list-item"
  | "table"
  | "form"
  | "icon"
  | "image"
  | "avatar"
  | "badge"
  | "tooltip"
  | "dropdown"
  | "tabs"
  | "accordion"
  | "carousel"
  | "container"
  | "text"
  | "link"
  | "divider"
  | "unknown";

/**
 * Layout context from design analysis
 */
export interface LayoutContext {
  direction: "row" | "column" | "none";
  alignment: {
    main: "start" | "center" | "end" | "space-between" | "space-around";
    cross: "start" | "center" | "end" | "stretch" | "baseline";
  };
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  sizing: {
    width: "fixed" | "hug" | "fill";
    height: "fixed" | "hug" | "fill";
    fixedWidth?: number;
    fixedHeight?: number;
  };
  wrap: boolean;
}

/**
 * Typography context
 */
export interface TypographyContext {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | "auto";
  letterSpacing: number;
  textAlign: "left" | "center" | "right" | "justify";
  textDecoration: "none" | "underline" | "line-through";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
}

/**
 * Color context
 */
export interface ColorContext {
  type: "fill" | "stroke" | "text";
  value: string; // hex, rgba, or gradient
  opacity: number;
  variableName?: string; // Design token name if available
}

/**
 * Interactive state from design variants
 */
export interface InteractiveState {
  name: "default" | "hover" | "active" | "focus" | "disabled" | "loading";
  changes: Partial<{
    colors: ColorContext[];
    typography: TypographyContext;
    layout: Partial<LayoutContext>;
  }>;
}

/**
 * Accessibility context
 */
export interface AccessibilityContext {
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  tabIndex?: number;
  isInteractive: boolean;
  focusable: boolean;
}

/**
 * Responsive behavior context
 */
export interface ResponsiveContext {
  breakpoints: Array<{
    name: string;
    minWidth: number;
    changes: Partial<LayoutContext>;
  }>;
  stackOnMobile: boolean;
  hideOnMobile: boolean;
  hideOnDesktop: boolean;
}

// ============================================================================
// Generation Configuration
// ============================================================================

/**
 * Configuration for code generation
 */
export interface CodeGenerationConfig {
  /** Target framework */
  framework: FrameworkType;
  /** Styling approach */
  styling: StylingType;
  /** Language preference */
  language: LanguageType;
  /** Component structure style */
  componentStyle: ComponentStyle;
  /** Whether to generate props interface */
  generatePropsInterface: boolean;
  /** Whether to generate stories (Storybook) */
  generateStories: boolean;
  /** Whether to generate tests */
  generateTests: boolean;
  /** Whether to add JSDoc/TSDoc comments */
  addDocumentation: boolean;
  /** Custom component naming convention */
  namingConvention: "PascalCase" | "camelCase" | "kebab-case";
  /** File naming convention */
  fileNaming: "PascalCase" | "kebab-case" | "camelCase";
  /** Import style */
  importStyle: "named" | "default" | "mixed";
  /** Path alias for imports */
  pathAlias?: string;
  /** Custom design tokens mapping */
  designTokens?: Record<string, string>;
  /** Additional context/instructions */
  customInstructions?: string;
}

/**
 * Default generation configuration
 */
export const DEFAULT_CODE_GENERATION_CONFIG: CodeGenerationConfig = {
  framework: "react",
  styling: "tailwind",
  language: "typescript",
  componentStyle: "functional",
  generatePropsInterface: true,
  generateStories: false,
  generateTests: false,
  addDocumentation: true,
  namingConvention: "PascalCase",
  fileNaming: "PascalCase",
  importStyle: "named",
};

// ============================================================================
// Generation Output Types
// ============================================================================

/**
 * Generated file output
 */
export interface GeneratedFile {
  /** File path relative to component root */
  path: string;
  /** File content */
  content: string;
  /** File type */
  type: "component" | "styles" | "types" | "test" | "story" | "index";
  /** Language */
  language: "typescript" | "javascript" | "css" | "scss" | "html" | "vue" | "svelte";
}

/**
 * Complete generation result
 */
export interface CodeGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated files */
  files: GeneratedFile[];
  /** Component name */
  componentName: string;
  /** Props interface (if generated) */
  propsInterface?: string;
  /** Warnings during generation */
  warnings: string[];
  /** Errors during generation */
  errors: string[];
  /** Generation metadata */
  metadata: GenerationMetadata;
}

/**
 * Generation metadata for tracking and debugging
 */
export interface GenerationMetadata {
  /** Generation timestamp */
  generatedAt: Date;
  /** LLM model used */
  model: string;
  /** Provider used */
  provider: LLMProviderType;
  /** Configuration used */
  config: CodeGenerationConfig;
  /** Token usage */
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** Generation duration in ms */
  durationMs: number;
  /** Number of refinement iterations */
  refinementCount: number;
}

// ============================================================================
// Refinement and Feedback Types
// ============================================================================

/**
 * Feedback for iterative refinement
 */
export interface RefinementFeedback {
  /** Type of feedback */
  type: "correction" | "enhancement" | "style" | "accessibility" | "performance";
  /** Feedback description */
  description: string;
  /** Specific file to modify (optional) */
  targetFile?: string;
  /** Line range to focus on (optional) */
  lineRange?: { start: number; end: number };
  /** Priority of the feedback */
  priority: "critical" | "high" | "medium" | "low";
  /** Automatic or human provided */
  source: "human" | "lint" | "typecheck" | "test";
}

/**
 * Refinement session state
 */
export interface RefinementSession {
  /** Session ID */
  id: string;
  /** Original design context */
  designContext: DesignContext;
  /** Configuration */
  config: CodeGenerationConfig;
  /** Current result */
  currentResult: CodeGenerationResult;
  /** History of refinements */
  history: Array<{
    feedback: RefinementFeedback[];
    result: CodeGenerationResult;
    timestamp: Date;
  }>;
  /** Maximum refinements allowed */
  maxRefinements: number;
  /** Current refinement count */
  refinementCount: number;
}

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Agent state during generation
 */
export interface AgentState {
  /** Current phase */
  phase: AgentPhase;
  /** Design context being processed */
  designContext: DesignContext | null;
  /** Current generation config */
  config: CodeGenerationConfig;
  /** Accumulated messages for context */
  messages: LLMMessage[];
  /** Current result (if any) */
  result: CodeGenerationResult | null;
  /** Active refinement session (if any) */
  refinementSession: RefinementSession | null;
  /** Error state */
  error: string | null;
}

/**
 * Agent processing phases
 */
export type AgentPhase =
  | "idle"
  | "analyzing"
  | "planning"
  | "generating"
  | "validating"
  | "refining"
  | "complete"
  | "error";

/**
 * Agent event types for progress tracking
 */
export type AgentEvent =
  | { type: "phase_changed"; phase: AgentPhase; timestamp: Date }
  | { type: "analysis_complete"; designContext: DesignContext; timestamp: Date }
  | { type: "generation_started"; config: CodeGenerationConfig; timestamp: Date }
  | { type: "file_generated"; file: GeneratedFile; timestamp: Date }
  | { type: "validation_result"; warnings: string[]; errors: string[]; timestamp: Date }
  | { type: "refinement_started"; feedback: RefinementFeedback[]; timestamp: Date }
  | { type: "refinement_complete"; result: CodeGenerationResult; timestamp: Date }
  | { type: "generation_complete"; result: CodeGenerationResult; timestamp: Date }
  | { type: "error"; message: string; timestamp: Date };

/**
 * Agent event listener
 */
export type AgentEventListener = (event: AgentEvent) => void;

/**
 * Options for agent execution
 */
export interface AgentExecutionOptions {
  /** Event listener for progress updates */
  onEvent?: AgentEventListener;
  /** Maximum refinement iterations */
  maxRefinements?: number;
  /** Whether to auto-refine based on validation */
  autoRefine?: boolean;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** LLM model to use */
  model?: string;
  /** Temperature for generation */
  temperature?: number;
}

// ============================================================================
// Prompt Template Types
// ============================================================================

/**
 * Prompt template for different generation phases
 */
export interface PromptTemplate {
  /** Template name */
  name: string;
  /** System prompt */
  system: string;
  /** User prompt template (with placeholders) */
  user: string;
  /** Available placeholders */
  placeholders: string[];
}

/**
 * Prompt template registry
 */
export interface PromptTemplateRegistry {
  /** Analysis prompt */
  analyze: PromptTemplate;
  /** Component generation prompt */
  generate: PromptTemplate;
  /** Refinement prompt */
  refine: PromptTemplate;
  /** Validation prompt */
  validate: PromptTemplate;
  /** Framework-specific prompts */
  frameworks: Record<FrameworkType, Partial<PromptTemplate>>;
  /** Styling-specific prompts */
  styling: Record<StylingType, Partial<PromptTemplate>>;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result from code analysis
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationIssue[];
  /** Validation warnings */
  warnings: ValidationIssue[];
  /** Suggestions for improvement */
  suggestions: ValidationIssue[];
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  /** Issue type */
  type: "syntax" | "type" | "accessibility" | "performance" | "style" | "best-practice";
  /** Issue severity */
  severity: "error" | "warning" | "info";
  /** Issue message */
  message: string;
  /** File with issue */
  file?: string;
  /** Line number */
  line?: number;
  /** Column number */
  column?: number;
  /** Fix suggestion */
  fix?: string;
  /** Rule that triggered the issue */
  rule?: string;
}

// ============================================================================
// Best Practices Types
// ============================================================================

/**
 * Framework best practices configuration
 */
export interface FrameworkBestPractices {
  /** Framework name */
  framework: FrameworkType;
  /** Required imports */
  requiredImports: string[];
  /** Preferred patterns */
  patterns: {
    /** State management pattern */
    stateManagement: string;
    /** Props handling pattern */
    propsHandling: string;
    /** Event handling pattern */
    eventHandling: string;
    /** Lifecycle pattern */
    lifecycle: string;
  };
  /** Anti-patterns to avoid */
  antiPatterns: string[];
  /** Performance tips */
  performanceTips: string[];
  /** Accessibility requirements */
  accessibilityRequirements: string[];
}
