/**
 * CLI Type Definitions
 *
 * Types for the command-line interface for design-to-code conversion.
 */

import type { FrameworkType, StylingType, LanguageType, ComponentStyle } from "../utils/code-generation-agent/types";

// ============================================================================
// CLI Configuration Types
// ============================================================================

/**
 * CLI configuration file structure (figma-to-code.config.json)
 */
export interface CLIConfig {
  /** Version of the config file format */
  version: "1.0";

  /** Figma authentication */
  figma: FigmaAuthConfig;

  /** Output configuration */
  output: OutputConfig;

  /** Code generation settings */
  generation: GenerationConfig;

  /** Design sources to convert */
  sources: DesignSource[];

  /** Optional hooks for CI/CD integration */
  hooks?: HooksConfig;
}

/**
 * Figma authentication configuration
 */
export interface FigmaAuthConfig {
  /** Personal access token (can use env var: $FIGMA_TOKEN) */
  token?: string;
  /** Environment variable name for token */
  tokenEnvVar?: string;
}

/**
 * Output configuration
 */
export interface OutputConfig {
  /** Output directory for generated code */
  directory: string;
  /** Whether to clean output directory before generation */
  clean?: boolean;
  /** File naming convention */
  fileNaming?: "PascalCase" | "kebab-case" | "camelCase";
  /** Component structure */
  componentStructure?: "flat" | "folder" | "feature-based";
}

/**
 * Code generation configuration
 */
export interface GenerationConfig {
  /** Target framework */
  framework: FrameworkType;
  /** Styling approach */
  styling: StylingType;
  /** Language preference */
  language: LanguageType;
  /** Component structure style */
  componentStyle?: ComponentStyle;
  /** Whether to generate TypeScript interfaces */
  generateTypes?: boolean;
  /** Whether to generate tests */
  generateTests?: boolean;
  /** Whether to generate Storybook stories */
  generateStories?: boolean;
  /** Include design tokens */
  includeDesignTokens?: boolean;
  /** Include README */
  includeReadme?: boolean;
  /** Custom instructions for code generation */
  customInstructions?: string;
}

/**
 * Design source specification
 */
export interface DesignSource {
  /** Source type */
  type: "file" | "component" | "frame";
  /** Figma file key */
  fileKey: string;
  /** Node ID (for component or frame) */
  nodeId?: string;
  /** Component name override */
  name?: string;
  /** Include children nodes */
  includeChildren?: boolean;
}

/**
 * CI/CD hooks configuration
 */
export interface HooksConfig {
  /** Command to run before generation */
  preGenerate?: string;
  /** Command to run after successful generation */
  postGenerate?: string;
  /** Command to run on error */
  onError?: string;
}

// ============================================================================
// CLI Command Types
// ============================================================================

/**
 * CLI command options
 */
export interface CLIOptions {
  /** Path to config file */
  config?: string;
  /** Output directory (overrides config) */
  output?: string;
  /** Figma token (overrides config) */
  token?: string;
  /** Verbose output */
  verbose?: boolean;
  /** Quiet mode (minimal output) */
  quiet?: boolean;
  /** Dry run (don't write files) */
  dryRun?: boolean;
  /** Watch mode for design changes */
  watch?: boolean;
  /** JSON output for CI/CD */
  json?: boolean;
  /** Framework override */
  framework?: FrameworkType;
  /** Styling override */
  styling?: StylingType;
}

/**
 * CLI command definition
 */
export interface CLICommand {
  name: string;
  description: string;
  options?: CLICommandOption[];
  action: (args: string[], options: CLIOptions) => Promise<number>;
}

/**
 * CLI command option definition
 */
export interface CLICommandOption {
  short?: string;
  long: string;
  description: string;
  required?: boolean;
  default?: string | boolean;
  type?: "string" | "boolean" | "number";
}

// ============================================================================
// CLI Output Types
// ============================================================================

/**
 * Progress event for terminal output
 */
export interface ProgressEvent {
  type: "start" | "progress" | "complete" | "error" | "warning" | "info";
  message: string;
  timestamp: Date;
  data?: {
    current?: number;
    total?: number;
    percentage?: number;
    file?: string;
    component?: string;
  };
}

/**
 * CLI execution result
 */
export interface CLIResult {
  /** Exit code (0 = success, non-zero = error) */
  exitCode: number;
  /** Success status */
  success: boolean;
  /** Generated files */
  files: GeneratedFileInfo[];
  /** Warnings */
  warnings: string[];
  /** Errors */
  errors: string[];
  /** Execution duration in ms */
  durationMs: number;
  /** Summary statistics */
  stats: CLIStats;
}

/**
 * Generated file information
 */
export interface GeneratedFileInfo {
  path: string;
  type: "component" | "styles" | "types" | "test" | "story" | "config" | "tokens";
  size: number;
}

/**
 * CLI statistics
 */
export interface CLIStats {
  componentsProcessed: number;
  filesGenerated: number;
  totalSize: number;
  tokensUsed?: number;
}

// ============================================================================
// Logger Types
// ============================================================================

/**
 * Log level
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/**
 * Logger interface
 */
export interface CLILogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  progress(event: ProgressEvent): void;
  setLevel(level: LogLevel): void;
  setJsonMode(enabled: boolean): void;
}
