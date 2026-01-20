#!/usr/bin/env node
/**
 * Figma to Code CLI
 *
 * Command-line interface for design-to-code conversion.
 * Supports headless conversion with configuration files and CI/CD integration.
 *
 * Usage:
 *   figma-to-code generate [options]
 *   figma-to-code init
 *   figma-to-code validate
 *
 * Examples:
 *   # Generate code using config file
 *   figma-to-code generate
 *
 *   # Generate with overrides
 *   figma-to-code generate --output ./components --framework vue
 *
 *   # Initialize new config
 *   figma-to-code init
 *
 *   # Validate config file
 *   figma-to-code validate
 *
 *   # CI/CD mode with JSON output
 *   figma-to-code generate --json
 */

import * as fs from "fs";
import * as path from "path";
import type { CLIOptions, CLIConfig, ProgressEvent } from "./types";
import type { FrameworkType, StylingType } from "../utils/code-generation-agent/types";
import {
  findConfigFile,
  loadConfigFile,
  applyOptionsOverrides,
  generateExampleConfig,
  parseDesignSourceFromUrl,
} from "./config";
import { createLogger, formatBytes, formatDuration, TerminalLogger } from "./logger";
import { convert, formatResult } from "./converter";

// ============================================================================
// Version
// ============================================================================

const VERSION = "1.0.0";

// ============================================================================
// Help Text
// ============================================================================

const HELP_TEXT = `
Figma to Code CLI v${VERSION}

USAGE:
  figma-to-code <command> [options]

COMMANDS:
  generate    Convert Figma designs to code
  init        Create a configuration file
  validate    Validate configuration file
  convert     Convert a single Figma URL to code
  help        Show this help message
  version     Show version number

GENERATE OPTIONS:
  -c, --config <path>     Path to configuration file
  -o, --output <dir>      Output directory (overrides config)
  -t, --token <token>     Figma access token (overrides config)
  -f, --framework <name>  Target framework (react, vue, svelte, html)
  -s, --styling <name>    Styling approach (tailwind, styled-components, css-modules, scss, inline)
  --dry-run               Show what would be generated without writing files
  --json                  Output results as JSON (for CI/CD)
  -v, --verbose           Show detailed output
  -q, --quiet             Minimal output

CONVERT OPTIONS:
  --url <figma-url>       Figma file or frame URL
  -o, --output <dir>      Output directory
  -t, --token <token>     Figma access token
  -f, --framework <name>  Target framework
  -s, --styling <name>    Styling approach

EXAMPLES:
  # Generate using config file
  figma-to-code generate

  # Generate with custom output directory
  figma-to-code generate -o ./src/components

  # Convert a specific Figma frame
  figma-to-code convert --url "https://www.figma.com/file/xxx/Design?node-id=1-2"

  # CI/CD mode
  FIGMA_TOKEN=xxx figma-to-code generate --json

  # Initialize config
  figma-to-code init

CONFIGURATION:
  The CLI looks for configuration files in this order:
  - figma-to-code.config.json
  - figma-to-code.json
  - .figma-to-coderc
  - .figma-to-coderc.json

ENVIRONMENT VARIABLES:
  FIGMA_TOKEN    Figma personal access token

For more information, visit: https://github.com/your-org/figma-to-code
`;

// ============================================================================
// Argument Parsing
// ============================================================================

interface ParsedArgs {
  command: string;
  positionalArgs: string[];
  options: CLIOptions;
}

function parseArgs(args: string[]): ParsedArgs {
  const options: CLIOptions = {};
  const positionalArgs: string[] = [];
  let command = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("-")) {
      const isLong = arg.startsWith("--");
      const key = isLong ? arg.slice(2) : arg.slice(1);

      switch (key) {
        case "c":
        case "config":
          options.config = args[++i];
          break;
        case "o":
        case "output":
          options.output = args[++i];
          break;
        case "t":
        case "token":
          options.token = args[++i];
          break;
        case "f":
        case "framework":
          options.framework = args[++i] as FrameworkType;
          break;
        case "s":
        case "styling":
          options.styling = args[++i] as StylingType;
          break;
        case "v":
        case "verbose":
          options.verbose = true;
          break;
        case "q":
        case "quiet":
          options.quiet = true;
          break;
        case "dry-run":
          options.dryRun = true;
          break;
        case "json":
          options.json = true;
          break;
        case "watch":
          options.watch = true;
          break;
        case "url":
          positionalArgs.push(args[++i]);
          break;
        case "h":
        case "help":
          console.log(HELP_TEXT);
          process.exit(0);
          break;
        case "version":
          console.log(VERSION);
          process.exit(0);
          break;
        default:
          // Unknown option, ignore
          break;
      }
    } else if (!command) {
      command = arg;
    } else {
      positionalArgs.push(arg);
    }
  }

  return { command, positionalArgs, options };
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Generate command - main conversion workflow
 */
async function commandGenerate(
  args: string[],
  options: CLIOptions,
  logger: TerminalLogger
): Promise<number> {
  // Setup logger
  if (options.verbose) {
    logger.setLevel("debug");
  } else if (options.quiet) {
    logger.setLevel("warn");
  }
  if (options.json) {
    logger.setJsonMode(true);
  }

  // Load configuration
  let config: CLIConfig;
  try {
    const configPath = options.config || findConfigFile();

    if (!configPath) {
      logger.error(
        "Configuration file not found. Run 'figma-to-code init' to create one."
      );
      return 1;
    }

    logger.info(`Loading configuration from ${configPath}`);
    config = loadConfigFile(configPath);
    config = applyOptionsOverrides(config, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  // Validate sources
  if (config.sources.length === 0) {
    logger.error("No design sources configured. Add sources to your config file.");
    return 1;
  }

  // Dry run mode
  if (options.dryRun) {
    logger.info("Dry run mode - no files will be written");
    logger.info(`Would process ${config.sources.length} source(s)`);
    config.sources.forEach((source, i) => {
      logger.info(`  ${i + 1}. ${source.type}: ${source.fileKey}${source.nodeId ? `#${source.nodeId}` : ""}`);
    });
    return 0;
  }

  // Run conversion
  logger.header("Figma to Code");
  logger.progress({
    type: "start",
    message: "Starting code generation...",
    timestamp: new Date(),
  });

  const result = await convert(config, logger, (event) => {
    logger.progress(event);
  });

  // Output result
  const { summary, stats } = formatResult(result);

  if (result.success) {
    logger.progress({
      type: "complete",
      message: "Code generation complete",
      timestamp: new Date(),
    });
    logger.success(summary, stats);
  } else {
    logger.progress({
      type: "error",
      message: "Code generation failed",
      timestamp: new Date(),
    });
    logger.failure(summary, result.errors);
  }

  // Show warnings
  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      logger.warn(warning);
    });
  }

  return result.exitCode;
}

/**
 * Convert command - convert a single URL
 */
async function commandConvert(
  args: string[],
  options: CLIOptions,
  logger: TerminalLogger
): Promise<number> {
  const url = args[0];

  if (!url) {
    logger.error("Missing Figma URL. Usage: figma-to-code convert --url <url>");
    return 1;
  }

  // Parse URL to design source
  let source;
  try {
    source = parseDesignSourceFromUrl(url);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  // Build config from options
  const config: CLIConfig = {
    version: "1.0",
    figma: {
      token: options.token,
      tokenEnvVar: "FIGMA_TOKEN",
    },
    output: {
      directory: options.output || "./generated",
      clean: false,
      fileNaming: "PascalCase",
      componentStructure: "folder",
    },
    generation: {
      framework: options.framework || "react",
      styling: options.styling || "tailwind",
      language: "typescript",
    },
    sources: [source],
  };

  // Setup logger
  if (options.verbose) {
    logger.setLevel("debug");
  } else if (options.quiet) {
    logger.setLevel("warn");
  }
  if (options.json) {
    logger.setJsonMode(true);
  }

  // Dry run mode
  if (options.dryRun) {
    logger.info("Dry run mode - no files will be written");
    logger.info(`Would convert: ${source.fileKey}${source.nodeId ? `#${source.nodeId}` : ""}`);
    logger.info(`Output directory: ${config.output.directory}`);
    logger.info(`Framework: ${config.generation.framework}`);
    logger.info(`Styling: ${config.generation.styling}`);
    return 0;
  }

  // Run conversion
  logger.header("Figma to Code");
  logger.progress({
    type: "start",
    message: "Starting code generation...",
    timestamp: new Date(),
  });

  const result = await convert(config, logger, (event) => {
    logger.progress(event);
  });

  // Output result
  const { summary, stats } = formatResult(result);

  if (result.success) {
    logger.progress({
      type: "complete",
      message: "Code generation complete",
      timestamp: new Date(),
    });
    logger.success(summary, stats);
  } else {
    logger.progress({
      type: "error",
      message: "Code generation failed",
      timestamp: new Date(),
    });
    logger.failure(summary, result.errors);
  }

  // Show warnings
  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      logger.warn(warning);
    });
  }

  return result.exitCode;
}

/**
 * Init command - create configuration file
 */
async function commandInit(
  args: string[],
  options: CLIOptions,
  logger: TerminalLogger
): Promise<number> {
  const configPath = path.join(process.cwd(), "figma-to-code.config.json");

  if (fs.existsSync(configPath)) {
    logger.warn(`Configuration file already exists: ${configPath}`);
    return 1;
  }

  const exampleConfig = generateExampleConfig();
  fs.writeFileSync(configPath, exampleConfig, "utf-8");

  logger.success(`Created configuration file: ${configPath}`);
  logger.info("Edit the configuration file to add your Figma sources.");
  logger.info("Set the FIGMA_TOKEN environment variable with your Figma access token.");

  return 0;
}

/**
 * Validate command - validate configuration
 */
async function commandValidate(
  args: string[],
  options: CLIOptions,
  logger: TerminalLogger
): Promise<number> {
  const configPath = options.config || findConfigFile();

  if (!configPath) {
    logger.error("Configuration file not found.");
    return 1;
  }

  try {
    loadConfigFile(configPath);
    logger.success(`Configuration is valid: ${configPath}`);
    return 0;
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const logger = createLogger();

  try {
    const { command, positionalArgs, options } = parseArgs(process.argv.slice(2));

    let exitCode = 0;

    switch (command) {
      case "generate":
      case "gen":
      case "g":
        exitCode = await commandGenerate(positionalArgs, options, logger);
        break;

      case "convert":
      case "conv":
        exitCode = await commandConvert(positionalArgs, options, logger);
        break;

      case "init":
        exitCode = await commandInit(positionalArgs, options, logger);
        break;

      case "validate":
      case "check":
        exitCode = await commandValidate(positionalArgs, options, logger);
        break;

      case "help":
      case "-h":
      case "--help":
        console.log(HELP_TEXT);
        exitCode = 0;
        break;

      case "version":
      case "-v":
      case "--version":
        console.log(VERSION);
        exitCode = 0;
        break;

      case "":
        console.log(HELP_TEXT);
        exitCode = 0;
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        console.log(HELP_TEXT);
        exitCode = 1;
    }

    process.exit(exitCode);
  } catch (error) {
    logger.stopSpinner();
    logger.error(error instanceof Error ? error.message : String(error));

    if (process.env.DEBUG) {
      console.error(error);
    }

    process.exit(1);
  }
}

// Run CLI
main();
