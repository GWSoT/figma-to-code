/**
 * CLI Converter
 *
 * Core conversion engine for headless design-to-code conversion.
 * Orchestrates Figma API access, code generation, and file output.
 */

import * as fs from "fs";
import * as path from "path";
import type { CLIConfig, CLIResult, DesignSource, GeneratedFileInfo, ProgressEvent } from "./types";
import type { GeneratedFile, CodeGenerationConfig, DesignContext, FrameworkType, StylingType } from "../utils/code-generation-agent/types";
import { resolveFigmaToken, resolveOutputDirectory } from "./config";
import type { TerminalLogger } from "./logger";
import { formatBytes, formatDuration } from "./logger";

// ============================================================================
// Figma API Client (Headless Version)
// ============================================================================

const FIGMA_API_BASE = "https://api.figma.com/v1";

interface FigmaApiOptions {
  token: string;
}

interface FigmaFileResponse {
  document: FigmaNode;
  components: Record<string, { key: string; name: string; description: string }>;
  componentSets: Record<string, { key: string; name: string; description: string }>;
  name: string;
  lastModified: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: unknown[];
  strokes?: unknown[];
  effects?: unknown[];
  opacity?: number;
  visible?: boolean;
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  cornerRadius?: number;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: string;
  };
}

/**
 * Headless Figma API client
 */
class HeadlessFigmaClient {
  private token: string;

  constructor(options: FigmaApiOptions) {
    this.token = options.token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: {
        "X-Figma-Token": this.token,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    return this.request<FigmaFileResponse>(`/files/${fileKey}`);
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<{ nodes: Record<string, { document: FigmaNode }> }> {
    const ids = nodeIds.join(",");
    return this.request(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
  }
}

// ============================================================================
// Design Context Extraction
// ============================================================================

/**
 * Convert Figma node to DesignContext
 */
function extractDesignContext(node: FigmaNode, componentName?: string): DesignContext {
  const name = componentName || sanitizeComponentName(node.name);

  return {
    node: node as any, // Type compatibility with existing types
    componentName: name,
    semanticType: detectSemanticType(node),
    layout: extractLayoutContext(node),
    typography: extractTypographyContext(node),
    colors: extractColorContext(node),
    interactiveStates: [],
    children: node.children?.map((child) => extractDesignContext(child)) || [],
    accessibility: {
      isInteractive: isInteractiveElement(node),
      focusable: isInteractiveElement(node),
    },
    responsive: {
      breakpoints: [],
      stackOnMobile: false,
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  };
}

/**
 * Sanitize component name for code
 */
function sanitizeComponentName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^[0-9]/, "_$&")
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

/**
 * Detect semantic type of node
 */
function detectSemanticType(node: FigmaNode): any {
  const nameLower = node.name.toLowerCase();

  if (nameLower.includes("button")) return "button";
  if (nameLower.includes("input") || nameLower.includes("field")) return "input";
  if (nameLower.includes("card")) return "card";
  if (nameLower.includes("modal") || nameLower.includes("dialog")) return "modal";
  if (nameLower.includes("nav")) return "navigation";
  if (nameLower.includes("header")) return "header";
  if (nameLower.includes("footer")) return "footer";
  if (nameLower.includes("list")) return "list";
  if (nameLower.includes("icon")) return "icon";
  if (nameLower.includes("image") || nameLower.includes("img")) return "image";
  if (nameLower.includes("avatar")) return "avatar";
  if (nameLower.includes("badge")) return "badge";
  if (nameLower.includes("tab")) return "tabs";
  if (node.type === "TEXT") return "text";

  return "container";
}

/**
 * Extract layout context from node
 */
function extractLayoutContext(node: FigmaNode): any {
  return {
    direction: node.layoutMode === "VERTICAL" ? "column" : "row",
    alignment: {
      main: mapAlignment(node.primaryAxisAlignItems || "MIN"),
      cross: mapAlignment(node.counterAxisAlignItems || "MIN"),
    },
    gap: node.itemSpacing || 0,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    sizing: {
      width: "hug",
      height: "hug",
      fixedWidth: node.absoluteBoundingBox?.width,
      fixedHeight: node.absoluteBoundingBox?.height,
    },
    wrap: false,
  };
}

/**
 * Map Figma alignment to CSS alignment
 */
function mapAlignment(alignment: string): string {
  switch (alignment) {
    case "MIN":
      return "start";
    case "CENTER":
      return "center";
    case "MAX":
      return "end";
    case "SPACE_BETWEEN":
      return "space-between";
    default:
      return "start";
  }
}

/**
 * Extract typography context from node
 */
function extractTypographyContext(node: FigmaNode): any[] {
  if (node.type !== "TEXT" || !node.style) return [];

  return [
    {
      fontFamily: node.style.fontFamily || "system-ui",
      fontSize: node.style.fontSize || 16,
      fontWeight: node.style.fontWeight || 400,
      lineHeight: node.style.lineHeightPx || "auto",
      letterSpacing: node.style.letterSpacing || 0,
      textAlign: (node.style.textAlignHorizontal || "LEFT").toLowerCase(),
      textDecoration: "none",
      textTransform: "none",
    },
  ];
}

/**
 * Extract color context from node
 */
function extractColorContext(node: FigmaNode): any[] {
  const colors: any[] = [];

  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill: any) => {
      if (fill.type === "SOLID" && fill.visible !== false) {
        colors.push({
          type: "fill",
          value: rgbaToHex(fill.color),
          opacity: fill.opacity ?? 1,
        });
      }
    });
  }

  return colors;
}

/**
 * Convert RGBA color to hex
 */
function rgbaToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Check if node is interactive element
 */
function isInteractiveElement(node: FigmaNode): boolean {
  const nameLower = node.name.toLowerCase();
  return (
    nameLower.includes("button") ||
    nameLower.includes("input") ||
    nameLower.includes("link") ||
    nameLower.includes("checkbox") ||
    nameLower.includes("radio") ||
    nameLower.includes("select") ||
    nameLower.includes("toggle")
  );
}

// ============================================================================
// Code Generation (Headless)
// ============================================================================

/**
 * Generate code from design context
 *
 * This is a simplified headless version that generates basic component code.
 * For full AI-powered generation, use the web interface with LLM integration.
 */
function generateComponentCode(
  context: DesignContext,
  config: CodeGenerationConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  switch (config.framework) {
    case "react":
      files.push(...generateReactComponent(context, config));
      break;
    case "vue":
      files.push(...generateVueComponent(context, config));
      break;
    case "svelte":
      files.push(...generateSvelteComponent(context, config));
      break;
    case "html":
      files.push(...generateHtmlComponent(context, config));
      break;
  }

  return files;
}

/**
 * Generate React component
 */
function generateReactComponent(
  context: DesignContext,
  config: CodeGenerationConfig
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const isTS = config.language === "typescript";
  const ext = isTS ? "tsx" : "jsx";

  // Props interface for TypeScript
  let propsInterface = "";
  if (isTS && config.generatePropsInterface) {
    propsInterface = `export interface ${context.componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

`;
  }

  // Generate component
  const componentCode = `${propsInterface}export function ${context.componentName}(${isTS ? `props: ${context.componentName}Props` : "props"}) {
  const { className, children } = props;

  return (
    <div className={\`${context.componentName.toLowerCase()} \${className || ''}\`}>
      {children}
    </div>
  );
}

export default ${context.componentName};
`;

  files.push({
    path: `${context.componentName}.${ext}`,
    content: componentCode,
    type: "component",
    language: isTS ? "typescript" : "javascript",
  });

  // Generate styles based on styling option
  if (config.styling === "css-modules") {
    files.push({
      path: `${context.componentName}.module.css`,
      content: generateCssModule(context),
      type: "styles",
      language: "css",
    });
  } else if (config.styling === "scss") {
    files.push({
      path: `${context.componentName}.module.scss`,
      content: generateScss(context),
      type: "styles",
      language: "scss",
    });
  }

  // Generate index file
  files.push({
    path: "index.ts",
    content: `export { ${context.componentName}, default } from './${context.componentName}';\n${isTS ? `export type { ${context.componentName}Props } from './${context.componentName}';\n` : ""}`,
    type: "index",
    language: isTS ? "typescript" : "javascript",
  });

  return files;
}

/**
 * Generate Vue component
 */
function generateVueComponent(
  context: DesignContext,
  config: CodeGenerationConfig
): GeneratedFile[] {
  const isTS = config.language === "typescript";

  const componentCode = `<script setup${isTS ? ' lang="ts"' : ""}>
${isTS ? `interface Props {
  class?: string;
}

` : ""}defineProps<${isTS ? "Props" : "{ class?: string }"}>();
</script>

<template>
  <div :class="['${context.componentName.toLowerCase()}', $props.class]">
    <slot />
  </div>
</template>

<style scoped>
.${context.componentName.toLowerCase()} {
  /* Component styles */
}
</style>
`;

  return [
    {
      path: `${context.componentName}.vue`,
      content: componentCode,
      type: "component",
      language: "vue",
    },
  ];
}

/**
 * Generate Svelte component
 */
function generateSvelteComponent(
  context: DesignContext,
  config: CodeGenerationConfig
): GeneratedFile[] {
  const isTS = config.language === "typescript";

  const componentCode = `<script${isTS ? ' lang="ts"' : ""}>
  ${isTS ? `interface Props {
    class?: string;
  }

  ` : ""}let { class: className = '' }${isTS ? ": Props" : ""} = $props();
</script>

<div class="${context.componentName.toLowerCase()} {className}">
  <slot />
</div>

<style>
  .${context.componentName.toLowerCase()} {
    /* Component styles */
  }
</style>
`;

  return [
    {
      path: `${context.componentName}.svelte`,
      content: componentCode,
      type: "component",
      language: "svelte",
    },
  ];
}

/**
 * Generate HTML component
 */
function generateHtmlComponent(
  context: DesignContext,
  _config: CodeGenerationConfig
): GeneratedFile[] {
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${context.componentName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="${context.componentName.toLowerCase()}">
    <!-- Component content -->
  </div>
</body>
</html>
`;

  const cssCode = `.${context.componentName.toLowerCase()} {
  /* Component styles */
}
`;

  return [
    {
      path: "index.html",
      content: htmlCode,
      type: "component",
      language: "html",
    },
    {
      path: "styles.css",
      content: cssCode,
      type: "styles",
      language: "css",
    },
  ];
}

/**
 * Generate CSS Module
 */
function generateCssModule(context: DesignContext): string {
  const layout = context.layout;

  return `.container {
  display: flex;
  flex-direction: ${layout.direction};
  align-items: ${layout.alignment.cross};
  justify-content: ${layout.alignment.main};
  gap: ${layout.gap}px;
  padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
}
`;
}

/**
 * Generate SCSS
 */
function generateScss(context: DesignContext): string {
  const layout = context.layout;

  return `.container {
  display: flex;
  flex-direction: ${layout.direction};
  align-items: ${layout.alignment.cross};
  justify-content: ${layout.alignment.main};
  gap: ${layout.gap}px;
  padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
}
`;
}

// ============================================================================
// Main Converter
// ============================================================================

/**
 * Convert design sources to code
 */
export async function convert(
  config: CLIConfig,
  logger: TerminalLogger,
  onProgress?: (event: ProgressEvent) => void
): Promise<CLIResult> {
  const startTime = Date.now();
  const result: CLIResult = {
    exitCode: 0,
    success: true,
    files: [],
    warnings: [],
    errors: [],
    durationMs: 0,
    stats: {
      componentsProcessed: 0,
      filesGenerated: 0,
      totalSize: 0,
    },
  };

  try {
    // Resolve Figma token
    const token = resolveFigmaToken(config);
    const client = new HeadlessFigmaClient({ token });

    // Resolve output directory
    const outputDir = resolveOutputDirectory(config);

    // Create output directory
    if (config.output.clean && fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // Run pre-generate hook
    if (config.hooks?.preGenerate) {
      await runHook(config.hooks.preGenerate, "preGenerate", logger);
    }

    // Process each source
    const totalSources = config.sources.length;

    for (let i = 0; i < config.sources.length; i++) {
      const source = config.sources[i];
      const progress = Math.round(((i + 1) / totalSources) * 100);

      onProgress?.({
        type: "progress",
        message: `Processing ${source.name || source.nodeId || source.fileKey}`,
        timestamp: new Date(),
        data: {
          current: i + 1,
          total: totalSources,
          percentage: progress,
        },
      });

      try {
        const files = await processSource(source, config, client, outputDir, logger);
        result.files.push(...files);
        result.stats.componentsProcessed++;
        result.stats.filesGenerated += files.length;
        result.stats.totalSize += files.reduce((sum, f) => sum + f.size, 0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to process source ${source.fileKey}: ${errorMessage}`);
        result.success = false;
        result.exitCode = 1;
      }
    }

    // Run post-generate hook if successful
    if (result.success && config.hooks?.postGenerate) {
      await runHook(config.hooks.postGenerate, "postGenerate", logger);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);
    result.success = false;
    result.exitCode = 1;

    // Run error hook
    if (config.hooks?.onError) {
      try {
        await runHook(config.hooks.onError, "onError", logger);
      } catch {
        // Ignore hook errors
      }
    }
  }

  result.durationMs = Date.now() - startTime;
  return result;
}

/**
 * Process a single design source
 */
async function processSource(
  source: DesignSource,
  config: CLIConfig,
  client: HeadlessFigmaClient,
  outputDir: string,
  _logger: TerminalLogger
): Promise<GeneratedFileInfo[]> {
  const generatedFiles: GeneratedFileInfo[] = [];

  // Fetch Figma data
  let node: FigmaNode;

  if (source.type === "file") {
    const file = await client.getFile(source.fileKey);
    node = file.document;
  } else {
    const nodeId = source.nodeId!;
    const response = await client.getFileNodes(source.fileKey, [nodeId]);
    const nodeData = response.nodes[nodeId];

    if (!nodeData) {
      throw new Error(`Node ${nodeId} not found in file ${source.fileKey}`);
    }

    node = nodeData.document;
  }

  // Extract design context
  const context = extractDesignContext(node, source.name);

  // Generate code
  const codeGenConfig: CodeGenerationConfig = {
    framework: config.generation.framework,
    styling: config.generation.styling,
    language: config.generation.language,
    componentStyle: config.generation.componentStyle || "functional",
    generatePropsInterface: config.generation.generateTypes !== false,
    generateStories: config.generation.generateStories || false,
    generateTests: config.generation.generateTests || false,
    addDocumentation: true,
    namingConvention: "PascalCase",
    fileNaming: config.output.fileNaming || "PascalCase",
    importStyle: "named",
  };

  const files = generateComponentCode(context, codeGenConfig);

  // Determine component directory
  const componentDir =
    config.output.componentStructure === "flat"
      ? outputDir
      : path.join(outputDir, context.componentName);

  // Create component directory if needed
  if (config.output.componentStructure !== "flat") {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Write files
  for (const file of files) {
    const filePath = path.join(componentDir, file.path);
    fs.writeFileSync(filePath, file.content, "utf-8");

    generatedFiles.push({
      path: filePath,
      type: file.type as any,
      size: Buffer.byteLength(file.content, "utf-8"),
    });
  }

  return generatedFiles;
}

/**
 * Run a hook command
 */
async function runHook(command: string, hookName: string, logger: TerminalLogger): Promise<void> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  logger.debug(`Running ${hookName} hook: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: process.env,
    });

    if (stdout) {
      logger.debug(`${hookName} stdout: ${stdout}`);
    }
    if (stderr) {
      logger.warn(`${hookName} stderr: ${stderr}`);
    }
  } catch (error) {
    throw new Error(`Hook ${hookName} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Format CLI result for output
 */
export function formatResult(result: CLIResult): {
  summary: string;
  stats: Record<string, string | number>;
} {
  const summary = result.success
    ? `Successfully generated ${result.stats.filesGenerated} files`
    : `Generation failed with ${result.errors.length} error(s)`;

  const stats = {
    "Components": result.stats.componentsProcessed,
    "Files": result.stats.filesGenerated,
    "Total Size": formatBytes(result.stats.totalSize),
    "Duration": formatDuration(result.durationMs),
  };

  return { summary, stats };
}
