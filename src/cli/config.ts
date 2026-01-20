/**
 * CLI Configuration
 *
 * Handles loading and validating configuration files for headless operation.
 * Supports both JSON and YAML config formats.
 */

import * as fs from "fs";
import * as path from "path";
import type { CLIConfig, CLIOptions, DesignSource } from "./types";
import type { FrameworkType, StylingType, LanguageType, ComponentStyle } from "../utils/code-generation-agent/types";

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: CLIConfig = {
  version: "1.0",
  figma: {
    tokenEnvVar: "FIGMA_TOKEN",
  },
  output: {
    directory: "./generated",
    clean: false,
    fileNaming: "PascalCase",
    componentStructure: "folder",
  },
  generation: {
    framework: "react",
    styling: "tailwind",
    language: "typescript",
    componentStyle: "functional",
    generateTypes: true,
    generateTests: false,
    generateStories: false,
    includeDesignTokens: true,
    includeReadme: true,
  },
  sources: [],
};

// ============================================================================
// Configuration File Names
// ============================================================================

const CONFIG_FILE_NAMES = [
  "figma-to-code.config.json",
  "figma-to-code.json",
  ".figma-to-coderc",
  ".figma-to-coderc.json",
];

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Find configuration file in directory
 */
export function findConfigFile(directory: string = process.cwd()): string | null {
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.join(directory, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

/**
 * Load configuration from file
 */
export function loadConfigFile(configPath: string): CLIConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, "utf-8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Invalid JSON in configuration file: ${configPath}`);
  }

  return validateConfig(parsed as Record<string, unknown>, configPath);
}

/**
 * Validate configuration object
 */
export function validateConfig(
  config: Record<string, unknown>,
  source: string
): CLIConfig {
  const errors: string[] = [];

  // Check version
  if (!config.version) {
    errors.push("Missing 'version' field");
  } else if (config.version !== "1.0") {
    errors.push(`Unsupported config version: ${config.version}`);
  }

  // Validate figma config
  if (!config.figma || typeof config.figma !== "object") {
    errors.push("Missing 'figma' configuration");
  }

  // Validate output config
  if (!config.output || typeof config.output !== "object") {
    errors.push("Missing 'output' configuration");
  } else {
    const output = config.output as Record<string, unknown>;
    if (!output.directory || typeof output.directory !== "string") {
      errors.push("Missing 'output.directory'");
    }
  }

  // Validate generation config
  if (!config.generation || typeof config.generation !== "object") {
    errors.push("Missing 'generation' configuration");
  } else {
    const gen = config.generation as Record<string, unknown>;
    const validFrameworks: FrameworkType[] = ["react", "vue", "svelte", "html"];
    const validStyling: StylingType[] = ["tailwind", "styled-components", "css-modules", "inline", "scss"];
    const validLanguages: LanguageType[] = ["typescript", "javascript"];

    if (gen.framework && !validFrameworks.includes(gen.framework as FrameworkType)) {
      errors.push(`Invalid framework: ${gen.framework}. Valid options: ${validFrameworks.join(", ")}`);
    }

    if (gen.styling && !validStyling.includes(gen.styling as StylingType)) {
      errors.push(`Invalid styling: ${gen.styling}. Valid options: ${validStyling.join(", ")}`);
    }

    if (gen.language && !validLanguages.includes(gen.language as LanguageType)) {
      errors.push(`Invalid language: ${gen.language}. Valid options: ${validLanguages.join(", ")}`);
    }
  }

  // Validate sources
  if (!config.sources || !Array.isArray(config.sources)) {
    errors.push("Missing 'sources' array");
  } else {
    (config.sources as unknown[]).forEach((source, index) => {
      const s = source as Record<string, unknown>;
      if (!s.type || !["file", "component", "frame"].includes(s.type as string)) {
        errors.push(`Invalid source type at index ${index}`);
      }
      if (!s.fileKey || typeof s.fileKey !== "string") {
        errors.push(`Missing fileKey at source index ${index}`);
      }
      if ((s.type === "component" || s.type === "frame") && !s.nodeId) {
        errors.push(`Missing nodeId for ${s.type} at source index ${index}`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Invalid configuration (${source}):\n  - ${errors.join("\n  - ")}`);
  }

  return mergeWithDefaults(config as Partial<CLIConfig>);
}

/**
 * Merge configuration with defaults
 */
function mergeWithDefaults(config: Partial<CLIConfig>): CLIConfig {
  return {
    version: config.version || DEFAULT_CONFIG.version,
    figma: {
      ...DEFAULT_CONFIG.figma,
      ...config.figma,
    },
    output: {
      ...DEFAULT_CONFIG.output,
      ...config.output,
    },
    generation: {
      ...DEFAULT_CONFIG.generation,
      ...config.generation,
    },
    sources: config.sources || [],
    hooks: config.hooks,
  };
}

/**
 * Apply CLI options overrides to config
 */
export function applyOptionsOverrides(
  config: CLIConfig,
  options: CLIOptions
): CLIConfig {
  const result = { ...config };

  if (options.token) {
    result.figma = { ...result.figma, token: options.token };
  }

  if (options.output) {
    result.output = { ...result.output, directory: options.output };
  }

  if (options.framework) {
    result.generation = { ...result.generation, framework: options.framework };
  }

  if (options.styling) {
    result.generation = { ...result.generation, styling: options.styling };
  }

  return result;
}

/**
 * Resolve Figma token from config
 */
export function resolveFigmaToken(config: CLIConfig): string {
  // Direct token in config
  if (config.figma.token) {
    // Check if it's an environment variable reference
    if (config.figma.token.startsWith("$")) {
      const envVar = config.figma.token.slice(1);
      const value = process.env[envVar];
      if (!value) {
        throw new Error(`Environment variable ${envVar} not set`);
      }
      return value;
    }
    return config.figma.token;
  }

  // Environment variable reference
  if (config.figma.tokenEnvVar) {
    const value = process.env[config.figma.tokenEnvVar];
    if (!value) {
      throw new Error(
        `Figma token not found. Set the ${config.figma.tokenEnvVar} environment variable.`
      );
    }
    return value;
  }

  throw new Error(
    "Figma token not configured. Provide a token in config or set FIGMA_TOKEN environment variable."
  );
}

/**
 * Generate example configuration file
 */
export function generateExampleConfig(): string {
  const example: CLIConfig = {
    version: "1.0",
    figma: {
      tokenEnvVar: "FIGMA_TOKEN",
    },
    output: {
      directory: "./src/components/generated",
      clean: true,
      fileNaming: "PascalCase",
      componentStructure: "folder",
    },
    generation: {
      framework: "react",
      styling: "tailwind",
      language: "typescript",
      componentStyle: "functional",
      generateTypes: true,
      generateTests: false,
      generateStories: true,
      includeDesignTokens: true,
      includeReadme: true,
    },
    sources: [
      {
        type: "frame",
        fileKey: "YOUR_FIGMA_FILE_KEY",
        nodeId: "123:456",
        name: "MyComponent",
      },
      {
        type: "component",
        fileKey: "YOUR_FIGMA_FILE_KEY",
        nodeId: "789:012",
      },
    ],
    hooks: {
      preGenerate: "echo 'Starting generation...'",
      postGenerate: "npm run lint:fix",
      onError: "echo 'Generation failed!'",
    },
  };

  return JSON.stringify(example, null, 2);
}

/**
 * Parse design source from URL
 */
export function parseDesignSourceFromUrl(url: string): DesignSource {
  // Parse Figma URL formats:
  // https://www.figma.com/file/FILEKEY/FileName?node-id=123-456
  // https://www.figma.com/design/FILEKEY/FileName?node-id=123-456

  const patterns = [
    /figma\.com\/(?:file|design)\/([^/]+)\/[^?]*\?.*node-id=(\d+[-:]\d+)/,
    /figma\.com\/(?:file|design)\/([^/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const fileKey = match[1];
      const nodeId = match[2]?.replace("-", ":");

      return {
        type: nodeId ? "frame" : "file",
        fileKey,
        nodeId,
      };
    }
  }

  throw new Error(`Invalid Figma URL: ${url}`);
}

/**
 * Resolve output directory
 */
export function resolveOutputDirectory(config: CLIConfig): string {
  const dir = config.output.directory;

  // Handle relative paths
  if (!path.isAbsolute(dir)) {
    return path.resolve(process.cwd(), dir);
  }

  return dir;
}
