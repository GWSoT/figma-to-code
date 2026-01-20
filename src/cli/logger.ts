/**
 * CLI Logger
 *
 * Terminal output utilities for progress and error reporting.
 * Supports both human-readable and JSON output modes for CI/CD integration.
 */

import type { CLILogger, LogLevel, ProgressEvent } from "./types";

// ============================================================================
// ANSI Color Codes
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// ============================================================================
// Spinner Characters
// ============================================================================

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ============================================================================
// Logger Implementation
// ============================================================================

/**
 * Terminal Logger
 *
 * Provides formatted output for CLI operations with support for:
 * - Colored output for human readability
 * - JSON output for CI/CD pipelines
 * - Progress indicators and spinners
 * - Log level filtering
 */
export class TerminalLogger implements CLILogger {
  private level: LogLevel = "info";
  private jsonMode = false;
  private spinnerInterval: ReturnType<typeof setInterval> | null = null;
  private spinnerFrame = 0;
  private currentSpinnerMessage = "";
  private isTTY: boolean;

  constructor() {
    this.isTTY = process.stdout.isTTY ?? false;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set JSON output mode
   */
  setJsonMode(enabled: boolean): void {
    this.jsonMode = enabled;
    if (enabled) {
      this.stopSpinner();
    }
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "silent"];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  /**
   * Output a log message
   */
  private output(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(level)) return;

    if (this.jsonMode) {
      this.outputJson({ level, message, data, timestamp: new Date().toISOString() });
      return;
    }

    const prefix = this.getPrefix(level);
    const formattedMessage = `${prefix} ${message}`;

    if (level === "error") {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    if (data && this.level === "debug") {
      console.log(colors.gray + JSON.stringify(data, null, 2) + colors.reset);
    }
  }

  /**
   * Get prefix for log level
   */
  private getPrefix(level: LogLevel): string {
    switch (level) {
      case "debug":
        return colors.gray + "[DEBUG]" + colors.reset;
      case "info":
        return colors.blue + "ℹ" + colors.reset;
      case "warn":
        return colors.yellow + "⚠" + colors.reset;
      case "error":
        return colors.red + "✖" + colors.reset;
      default:
        return "";
    }
  }

  /**
   * Output JSON format
   */
  private outputJson(data: Record<string, unknown>): void {
    console.log(JSON.stringify(data));
  }

  /**
   * Debug log
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.output("debug", message, data);
  }

  /**
   * Info log
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.output("info", message, data);
  }

  /**
   * Warning log
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.output("warn", message, data);
  }

  /**
   * Error log
   */
  error(message: string, data?: Record<string, unknown>): void {
    this.output("error", message, data);
  }

  /**
   * Progress event handling
   */
  progress(event: ProgressEvent): void {
    if (this.jsonMode) {
      this.outputJson({
        type: "progress",
        event: event.type,
        message: event.message,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
      });
      return;
    }

    switch (event.type) {
      case "start":
        this.startSpinner(event.message);
        break;
      case "progress":
        this.updateSpinner(event.message, event.data?.percentage);
        break;
      case "complete":
        this.stopSpinner();
        console.log(
          colors.green + "✓" + colors.reset + " " + event.message
        );
        break;
      case "error":
        this.stopSpinner();
        console.error(
          colors.red + "✖" + colors.reset + " " + event.message
        );
        break;
      case "warning":
        console.log(
          colors.yellow + "⚠" + colors.reset + " " + event.message
        );
        break;
      case "info":
        console.log(
          colors.blue + "ℹ" + colors.reset + " " + event.message
        );
        break;
    }
  }

  /**
   * Start spinner animation
   */
  private startSpinner(message: string): void {
    if (!this.isTTY || this.jsonMode) {
      this.info(message);
      return;
    }

    this.stopSpinner();
    this.currentSpinnerMessage = message;
    this.spinnerFrame = 0;

    this.spinnerInterval = setInterval(() => {
      const frame = spinnerFrames[this.spinnerFrame % spinnerFrames.length];
      process.stdout.write(
        `\r${colors.cyan}${frame}${colors.reset} ${this.currentSpinnerMessage}`
      );
      this.spinnerFrame++;
    }, 80);
  }

  /**
   * Update spinner message
   */
  private updateSpinner(message: string, percentage?: number): void {
    if (!this.isTTY || this.jsonMode) {
      if (percentage !== undefined) {
        this.info(`${message} (${percentage}%)`);
      }
      return;
    }

    if (percentage !== undefined) {
      this.currentSpinnerMessage = `${message} (${percentage}%)`;
    } else {
      this.currentSpinnerMessage = message;
    }
  }

  /**
   * Stop spinner animation
   */
  stopSpinner(): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
      if (this.isTTY && !this.jsonMode) {
        process.stdout.write("\r" + " ".repeat(80) + "\r");
      }
    }
  }

  /**
   * Print a horizontal line separator
   */
  separator(): void {
    if (this.jsonMode) return;
    console.log(colors.gray + "─".repeat(60) + colors.reset);
  }

  /**
   * Print a header
   */
  header(text: string): void {
    if (this.jsonMode) return;
    console.log("");
    console.log(colors.bold + colors.cyan + text + colors.reset);
    this.separator();
  }

  /**
   * Print a success message with summary
   */
  success(message: string, stats?: Record<string, number | string>): void {
    if (this.jsonMode) {
      this.outputJson({ type: "success", message, stats });
      return;
    }

    console.log("");
    console.log(colors.green + colors.bold + "✓ " + message + colors.reset);

    if (stats) {
      Object.entries(stats).forEach(([key, value]) => {
        console.log(
          colors.gray + "  " + key + ": " + colors.reset + String(value)
        );
      });
    }
  }

  /**
   * Print a failure message with details
   */
  failure(message: string, errors?: string[]): void {
    if (this.jsonMode) {
      this.outputJson({ type: "failure", message, errors });
      return;
    }

    console.log("");
    console.log(colors.red + colors.bold + "✖ " + message + colors.reset);

    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        console.log(colors.red + "  • " + error + colors.reset);
      });
    }
  }

  /**
   * Print a table
   */
  table(headers: string[], rows: string[][]): void {
    if (this.jsonMode) {
      this.outputJson({
        type: "table",
        headers,
        rows,
      });
      return;
    }

    // Calculate column widths
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
    );

    // Print header
    const headerRow = headers
      .map((h, i) => h.padEnd(widths[i]))
      .join("  ");
    console.log(colors.bold + headerRow + colors.reset);
    console.log(colors.gray + widths.map((w) => "─".repeat(w)).join("──") + colors.reset);

    // Print rows
    rows.forEach((row) => {
      const formattedRow = row
        .map((cell, i) => (cell || "").padEnd(widths[i]))
        .join("  ");
      console.log(formattedRow);
    });
  }
}

/**
 * Create a logger instance
 */
export function createLogger(): TerminalLogger {
  return new TerminalLogger();
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
