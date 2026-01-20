/**
 * Figma Layout Intent - Integration layer between Figma API and Layout Analyzer
 *
 * Provides high-level functions to analyze Figma frames and extract
 * semantic layout intent for code generation.
 */

import type { FigmaNode, FigmaPage, CategorizedFrame } from "./figma-api";
import {
  analyzeNodeLayout,
  analyzeFrameLayout,
  quickAnalyze,
  flattenAnalysis,
  getCSSForPattern,
  getTailwindForPattern,
  type NodeLayoutAnalysis,
  type FrameLayoutAnalysis,
  type SemanticRole,
  type LayoutPattern,
  type BoundingBox,
  type SectionAnalysis,
} from "./layout-analyzer";
import {
  analyzeFormLayout,
  isLikelyForm,
  type FormAnalysisResult,
  type DetectedFormElement,
  type FormFieldGroup,
  type FieldsetGroup,
  type LabelInputAssociation,
} from "./form-analyzer";
import {
  detectListPattern,
  detectListPatternFromAnalysis,
  type ListPatternResult,
  type ListPatternType,
  type ListSemanticType,
  type ListStructure,
  type ListItemInfo,
} from "./list-pattern-detector";
import {
  generateListMarkup,
  type GeneratedListCode,
  type CodeGenerationOptions,
} from "./semantic-list-generator";
import {
  analyzeNavigationPatterns,
  type NavigationPatternAnalysis,
  type NavigationPatternType,
  type NavigationItem,
  type SemanticNavMarkup,
} from "./navigation-pattern-detector";
import {
  generateSvelteListComponent,
  generateSvelteFormComponent,
  generateSvelteNavComponent,
  type GeneratedSvelteCode,
  type SvelteGenerationOptions,
} from "./svelte-component-generator";

// ============================================================================
// Types
// ============================================================================

/** Enhanced frame with layout analysis */
export interface AnalyzedFrame extends CategorizedFrame {
  layoutAnalysis: FrameLayoutAnalysis;
  semanticStructure: SemanticStructureNode[];
  suggestedCode: CodeSuggestion;
  /** Form analysis if this frame contains a form */
  formAnalysis?: FormAnalysisResult;
  /** Navigation patterns detected in this frame */
  navigationPatterns?: NavigationPatternAnalysis[];
  /** List pattern analysis if repeating patterns detected */
  listPatternAnalysis?: ListPatternResult;
  /** Generated list markup if list pattern detected */
  listMarkup?: GeneratedListCode;
  /** Generated Svelte component code if Svelte target is selected */
  svelteCode?: GeneratedSvelteCode;
}

/** Semantic structure tree node */
export interface SemanticStructureNode {
  role: SemanticRole;
  element: string;
  tailwindClasses: string[];
  children?: SemanticStructureNode[];
  sourceNodeId?: string;
  sourceNodeName?: string;
}

/** Code suggestion for a frame */
export interface CodeSuggestion {
  jsx: string;
  css: string;
  tailwind: string;
}

/** Layout analysis summary for UI display */
export interface LayoutAnalysisSummary {
  frameId: string;
  frameName: string;
  detectedSections: Array<{
    role: SemanticRole;
    confidence: number;
    description: string;
  }>;
  overallPattern: LayoutPattern;
  suggestedStructure: string;
  tailwindClasses: string[];
}

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a Figma frame and return comprehensive layout intent information
 */
export function analyzeFrameIntent(frame: FigmaNode): AnalyzedFrame {
  const bounds = frame.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };

  // Run layout analysis
  const layoutAnalysis = analyzeFrameLayout(frame);

  // Check if this frame contains a form and analyze it
  let formAnalysis: FormAnalysisResult | undefined;
  if (isLikelyForm(frame) || layoutAnalysis.sections.some((s) => s.role === "form")) {
    formAnalysis = analyzeFormLayout(frame);
  }

  // Analyze navigation patterns
  const navigationResult = analyzeNavigationPatterns(frame);
  const navigationPatterns = navigationResult.patterns.length > 0
    ? navigationResult.patterns
    : undefined;

  // Analyze list patterns (card grids, lists, etc.)
  let listPatternAnalysis: ListPatternResult | undefined;
  let listMarkup: GeneratedListCode | undefined;
  if (frame.children && frame.children.length >= 2) {
    const listResult = detectListPattern(
      frame.children,
      { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      frame.name
    );
    if (listResult.isListPattern) {
      listPatternAnalysis = listResult;
      listMarkup = generateListMarkup(listResult, {
        useTypeScript: true,
        useTailwind: true,
        responsive: true,
      });
    }
  }

  // Build semantic structure tree (include form and navigation analysis)
  const semanticStructure = buildSemanticStructure(layoutAnalysis, formAnalysis, navigationPatterns);

  // Generate code suggestions (use form-specific code if it's a form, or list-specific if list)
  let suggestedCode: CodeSuggestion;
  if (formAnalysis?.isForm) {
    suggestedCode = {
      jsx: formAnalysis.suggestedCode.jsx,
      css: generateCSS(layoutAnalysis),
      tailwind: formAnalysis.suggestedCode.tailwindClasses.join(" "),
    };
  } else if (listPatternAnalysis?.isListPattern && listMarkup) {
    suggestedCode = {
      jsx: listMarkup.jsx,
      css: listMarkup.css,
      tailwind: listMarkup.tailwindSummary,
    };
  } else {
    suggestedCode = generateCodeSuggestion(layoutAnalysis, semanticStructure);
  }

  // Build categorized frame info
  const category = categorizeFrameBySize(bounds.width, bounds.height);

  return {
    id: frame.id,
    name: frame.name,
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    category,
    isTopLevel: true,
    layoutAnalysis,
    semanticStructure,
    suggestedCode,
    formAnalysis,
    navigationPatterns,
    listPatternAnalysis,
    listMarkup,
  };
}

/**
 * Analyze multiple frames from a page
 */
export function analyzePageFrames(page: FigmaPage): AnalyzedFrame[] {
  const frames: AnalyzedFrame[] = [];

  if (!page.children) return frames;

  for (const node of page.children) {
    if (node.type !== "FRAME" && node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
      continue;
    }

    if (!node.absoluteBoundingBox) continue;

    frames.push(analyzeFrameIntent(node));
  }

  return frames;
}

/**
 * Get a quick summary of layout analysis for UI display
 */
export function getLayoutSummary(frame: FigmaNode): LayoutAnalysisSummary {
  const layoutAnalysis = analyzeFrameLayout(frame);

  const detectedSections = layoutAnalysis.sections.map((section) => ({
    role: section.role,
    confidence: section.confidence,
    description: getSectionDescription(section),
  }));

  const tailwindClasses = getTailwindForPattern(layoutAnalysis.overallPattern);

  return {
    frameId: frame.id,
    frameName: frame.name,
    detectedSections,
    overallPattern: layoutAnalysis.overallPattern,
    suggestedStructure: describeStructure(layoutAnalysis),
    tailwindClasses,
  };
}

// ============================================================================
// Batch Analysis Functions
// ============================================================================

/**
 * Analyze all frames in a Figma file document
 */
export function analyzeDocumentFrames(pages: FigmaPage[]): Map<string, AnalyzedFrame[]> {
  const result = new Map<string, AnalyzedFrame[]>();

  for (const page of pages) {
    const frames = analyzePageFrames(page);
    if (frames.length > 0) {
      result.set(page.id, frames);
    }
  }

  return result;
}

/**
 * Find frames matching a specific layout pattern
 */
export function findFramesByPattern(
  frames: AnalyzedFrame[],
  pattern: LayoutPattern
): AnalyzedFrame[] {
  return frames.filter((frame) => frame.layoutAnalysis.overallPattern === pattern);
}

/**
 * Find frames containing a specific semantic role
 */
export function findFramesByRole(
  frames: AnalyzedFrame[],
  role: SemanticRole
): AnalyzedFrame[] {
  return frames.filter((frame) =>
    frame.layoutAnalysis.sections.some((section) => section.role === role)
  );
}

/**
 * Group frames by their detected patterns
 */
export function groupFramesByPattern(
  frames: AnalyzedFrame[]
): Map<LayoutPattern, AnalyzedFrame[]> {
  const groups = new Map<LayoutPattern, AnalyzedFrame[]>();

  for (const frame of frames) {
    const pattern = frame.layoutAnalysis.overallPattern;
    const existing = groups.get(pattern) || [];
    existing.push(frame);
    groups.set(pattern, existing);
  }

  return groups;
}

// ============================================================================
// Svelte Code Generation
// ============================================================================

/**
 * Generate Svelte component code for an analyzed frame
 *
 * @param frame - The analyzed frame to generate code for
 * @param options - Svelte generation options
 * @returns Generated Svelte code including component, types, stores, and actions
 */
export function generateSvelteCodeForFrame(
  frame: AnalyzedFrame,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  // If frame has list pattern analysis, use list component generator
  if (frame.listPatternAnalysis?.isListPattern) {
    return generateSvelteListComponent(frame.listPatternAnalysis, options);
  }

  // If frame has form analysis, use form component generator
  if (frame.formAnalysis?.isForm) {
    return generateSvelteFormComponent(frame.formAnalysis, options);
  }

  // If frame has navigation patterns, use the first navigation pattern
  if (frame.navigationPatterns && frame.navigationPatterns.length > 0) {
    return generateSvelteNavComponent(frame.navigationPatterns[0], options);
  }

  // Default: Generate a generic Svelte component based on the frame structure
  return generateGenericSvelteComponent(frame, options);
}

/**
 * Generate a generic Svelte component for frames that don't match specific patterns
 */
function generateGenericSvelteComponent(
  frame: AnalyzedFrame,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  const opts = {
    useTypeScript: true,
    useTailwind: true,
    useSvelte5Runes: false,
    generateStores: false,
    generateActions: false,
    includeTransitions: true,
    componentPrefix: "",
    includeSampleData: false,
    responsive: true,
    ...options,
  };

  const componentName = frame.name.replace(/[^a-zA-Z0-9]/g, "") || "Component";
  const scriptLang = opts.useTypeScript ? ' lang="ts"' : "";

  // Build script section
  let script = `<script${scriptLang}>`;

  if (opts.includeTransitions) {
    script += `\n  import { fade } from 'svelte/transition';`;
  }

  if (opts.useSvelte5Runes) {
    script += `\n
  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();`;
  } else {
    script += `\n
  export let className = '';`;
  }

  script += `\n</script>`;

  // Build template from semantic structure
  const template = generateSvelteTemplateFromStructure(frame.semanticStructure, opts);

  // Build styles if not using Tailwind
  let styles = "";
  if (!opts.useTailwind) {
    styles = `\n\n<style>\n${generateSvelteStylesFromStructure(frame.semanticStructure)}\n</style>`;
  }

  const component = `${script}

${template}${styles}`;

  return {
    component,
    types: opts.useTypeScript ? `// Types for ${componentName} component\nexport interface ${componentName}Props {\n  className?: string;\n}` : "",
    styles: "",
    stores: "",
    actions: "",
  };
}

/**
 * Generate Svelte template from semantic structure nodes
 */
function generateSvelteTemplateFromStructure(
  nodes: SemanticStructureNode[],
  options: { useTailwind: boolean; includeTransitions: boolean }
): string {
  if (nodes.length === 0) {
    return `<div class="{className}">\n  <!-- Content -->\n</div>`;
  }

  const lines: string[] = [`<div class="{className}">`];

  for (const node of nodes) {
    lines.push(generateSvelteNodeTemplate(node, 1, options));
  }

  lines.push("</div>");

  return lines.join("\n");
}

/**
 * Generate Svelte template for a single semantic structure node
 */
function generateSvelteNodeTemplate(
  node: SemanticStructureNode,
  indent: number,
  options: { useTailwind: boolean; includeTransitions: boolean }
): string {
  const indentStr = "  ".repeat(indent);
  const classes = node.tailwindClasses.join(" ");
  const Element = node.element;
  const transition = options.includeTransitions && Element !== "nav" ? " transition:fade" : "";

  let template = `${indentStr}<${Element}`;

  if (classes) {
    template += ` class="${classes}"`;
  }

  template += `${transition}>`;

  if (node.children && node.children.length > 0) {
    template += "\n";
    for (const child of node.children) {
      template += generateSvelteNodeTemplate(child, indent + 1, options) + "\n";
    }
    template += `${indentStr}</${Element}>`;
  } else {
    const contentHint = node.sourceNodeName
      ? `<!-- ${node.sourceNodeName} -->`
      : "<!-- Content -->";
    template += `${contentHint}</${Element}>`;
  }

  return template;
}

/**
 * Generate Svelte styles from semantic structure nodes
 */
function generateSvelteStylesFromStructure(nodes: SemanticStructureNode[]): string {
  const styles: string[] = [];

  for (const node of nodes) {
    if (node.role !== "unknown") {
      styles.push(`  .${node.role} {\n    /* Add styles for ${node.role} */\n  }`);
    }
    if (node.children) {
      const childStyles = generateSvelteStylesFromStructure(node.children);
      if (childStyles) {
        styles.push(childStyles);
      }
    }
  }

  return styles.join("\n\n");
}

/**
 * Analyze a frame and generate Svelte code in one step
 */
export function analyzeFrameAndGenerateSvelte(
  frame: FigmaNode,
  options: Partial<SvelteGenerationOptions> = {}
): { analysis: AnalyzedFrame; svelteCode: GeneratedSvelteCode } {
  const analysis = analyzeFrameIntent(frame);
  const svelteCode = generateSvelteCodeForFrame(analysis, options);

  return { analysis, svelteCode };
}

// ============================================================================
// Semantic Structure Building
// ============================================================================

/**
 * Build a semantic structure tree from layout analysis
 */
function buildSemanticStructure(
  analysis: FrameLayoutAnalysis,
  formAnalysis?: FormAnalysisResult,
  navigationPatterns?: NavigationPatternAnalysis[]
): SemanticStructureNode[] {
  const nodes: SemanticStructureNode[] = [];

  // Map navigation patterns by their source node IDs for lookup
  const navPatternsByNodeId = new Map<string, NavigationPatternAnalysis>();
  if (navigationPatterns) {
    for (const pattern of navigationPatterns) {
      navPatternsByNodeId.set(pattern.sourceNode.nodeId, pattern);
    }
  }

  for (const section of analysis.sections) {
    // Check if this section has a navigation pattern
    const navPattern = section.nodeIds.length > 0
      ? navPatternsByNodeId.get(section.nodeIds[0])
      : undefined;

    if (navPattern) {
      // Use navigation-specific structure
      nodes.push(buildNavigationStructureNode(navPattern));
    } else if (section.role === "form" && formAnalysis?.isForm) {
      // If this section is a form and we have form analysis, use form-specific structure
      nodes.push(buildFormStructureNode(formAnalysis));
    } else if (section.role === "navigation" || section.role === "tab-bar" || section.role === "breadcrumb") {
      // Look for matching navigation pattern
      const matchingNav = navigationPatterns?.find(
        (p) => p.sourceNode.nodeId === section.nodeIds[0] ||
               (p.patternType === "tabs" && section.role === "tab-bar") ||
               (p.patternType === "breadcrumb" && section.role === "breadcrumb")
      );
      if (matchingNav) {
        nodes.push(buildNavigationStructureNode(matchingNav));
      } else {
        nodes.push(buildSectionNode(section));
      }
    } else {
      nodes.push(buildSectionNode(section));
    }
  }

  // If the entire frame is a form but wasn't detected as a section, add form structure
  if (formAnalysis?.isForm && !analysis.sections.some((s) => s.role === "form")) {
    nodes.push(buildFormStructureNode(formAnalysis));
  }

  // Add any navigation patterns that weren't matched to sections
  if (navigationPatterns) {
    const addedNodeIds = new Set(
      nodes.flatMap((n) => (n.sourceNodeId ? [n.sourceNodeId] : []))
    );

    for (const navPattern of navigationPatterns) {
      if (!addedNodeIds.has(navPattern.sourceNode.nodeId)) {
        nodes.push(buildNavigationStructureNode(navPattern));
      }
    }
  }

  return nodes;
}

/**
 * Build a semantic structure node for navigation from pattern analysis
 */
function buildNavigationStructureNode(
  navPattern: NavigationPatternAnalysis
): SemanticStructureNode {
  const { patternType, items, ariaRole, ariaLabel, direction, semanticMarkup } = navPattern;

  // Map pattern type to semantic role
  const roleMap: Record<NavigationPatternType, SemanticRole> = {
    "top-nav": "navigation",
    "sidebar-nav": "sidebar",
    breadcrumb: "breadcrumb",
    tabs: "tab-bar",
    pagination: "navigation",
    "bottom-nav": "tab-bar",
    "mega-menu": "navigation",
    "dropdown-menu": "navigation",
    "nested-nav": "navigation",
    unknown: "navigation",
  };

  const role = roleMap[patternType] || "navigation";

  // Build children from navigation items
  const children: SemanticStructureNode[] = items.map((item) =>
    buildNavigationItemNode(item, patternType)
  );

  return {
    role,
    element: semanticMarkup.element,
    tailwindClasses: semanticMarkup.tailwindClasses,
    children: children.length > 0 ? children : undefined,
    sourceNodeId: navPattern.sourceNode.nodeId,
    sourceNodeName: navPattern.sourceNode.nodeName,
  };
}

/**
 * Build a semantic structure node for a navigation item
 */
function buildNavigationItemNode(
  item: NavigationItem,
  patternType: NavigationPatternType
): SemanticStructureNode {
  const tailwindClasses: string[] = [];

  // Add item-specific classes based on pattern
  switch (patternType) {
    case "tabs":
      tailwindClasses.push("px-4", "py-2", "font-medium");
      if (item.isActive) {
        tailwindClasses.push("border-b-2", "border-primary", "text-primary");
      }
      break;
    case "breadcrumb":
      tailwindClasses.push("text-sm");
      if (item.isActive) {
        tailwindClasses.push("text-foreground", "font-medium");
      } else {
        tailwindClasses.push("text-muted-foreground");
      }
      break;
    case "sidebar-nav":
      tailwindClasses.push("flex", "items-center", "gap-3", "rounded-lg", "px-3", "py-2");
      if (item.isActive) {
        tailwindClasses.push("bg-muted", "text-foreground");
      } else {
        tailwindClasses.push("text-muted-foreground");
      }
      break;
    default:
      tailwindClasses.push("px-3", "py-2");
      if (item.isActive) {
        tailwindClasses.push("bg-muted", "text-foreground");
      }
  }

  // Handle disabled state
  if (item.isDisabled) {
    tailwindClasses.push("opacity-50", "pointer-events-none");
  }

  // Build children for nested items
  const children = item.children?.map((child) =>
    buildNavigationItemNode(child, patternType)
  );

  return {
    role: "unknown", // List items don't have a specific semantic role
    element: item.isActive ? "span" : "a",
    tailwindClasses,
    children,
    sourceNodeId: item.nodeId,
    sourceNodeName: item.label,
  };
}

/**
 * Build a semantic structure node for a form from form analysis
 */
function buildFormStructureNode(formAnalysis: FormAnalysisResult): SemanticStructureNode {
  const children: SemanticStructureNode[] = [];

  // Add form title if present
  if (formAnalysis.formTitle) {
    children.push({
      role: "content-section",
      element: "h2",
      tailwindClasses: ["text-2xl", "font-semibold", "mb-4"],
      sourceNodeId: formAnalysis.formTitle.nodeId,
      sourceNodeName: formAnalysis.formTitle.nodeName,
    });
  }

  // Add fieldsets or field groups
  if (formAnalysis.fieldsets.length > 1) {
    for (const fieldset of formAnalysis.fieldsets) {
      children.push(buildFieldsetNode(fieldset));
    }
  } else {
    // No distinct fieldsets, add fields directly
    for (const field of formAnalysis.fieldGroups) {
      children.push(buildFieldGroupNode(field));
    }
  }

  // Add submit button
  if (formAnalysis.submitButton) {
    children.push({
      role: "button-group",
      element: "div",
      tailwindClasses: ["flex", "gap-2", "mt-6"],
      children: [
        {
          role: "unknown",
          element: "button",
          tailwindClasses: ["w-full"],
          sourceNodeId: formAnalysis.submitButton.nodeId,
          sourceNodeName: formAnalysis.submitButton.nodeName,
        },
      ],
    });
  }

  return {
    role: "form",
    element: "form",
    tailwindClasses: ["space-y-6", "max-w-md"],
    children,
  };
}

/**
 * Build a semantic structure node for a fieldset
 */
function buildFieldsetNode(fieldset: FieldsetGroup): SemanticStructureNode {
  const children: SemanticStructureNode[] = [];

  // Add legend if present
  if (fieldset.legend) {
    children.push({
      role: "content-section",
      element: "legend",
      tailwindClasses: ["text-lg", "font-medium", "px-2"],
      sourceNodeId: fieldset.legend.nodeId,
      sourceNodeName: fieldset.legend.nodeName,
    });
  }

  // Add field groups
  for (const field of fieldset.fields) {
    children.push(buildFieldGroupNode(field));
  }

  return {
    role: "content-section",
    element: "fieldset",
    tailwindClasses: ["space-y-4", "p-4", "border", "rounded-lg"],
    children,
  };
}

/**
 * Build a semantic structure node for a form field group
 */
function buildFieldGroupNode(field: FormFieldGroup): SemanticStructureNode {
  const children: SemanticStructureNode[] = [];

  // Add label
  if (field.label) {
    children.push({
      role: "unknown",
      element: "label",
      tailwindClasses: ["text-sm", "font-medium"],
      sourceNodeId: field.label.nodeId,
      sourceNodeName: field.label.nodeName,
    });
  }

  // Add input (represented as div placeholder for structure)
  children.push({
    role: "unknown",
    element: getInputElement(field.input.elementType),
    tailwindClasses: getInputClasses(field.input.elementType),
    sourceNodeId: field.input.nodeId,
    sourceNodeName: field.input.nodeName,
  });

  // Add helper text
  if (field.helperText) {
    children.push({
      role: "unknown",
      element: "p",
      tailwindClasses: ["text-sm", "text-muted-foreground"],
      sourceNodeId: field.helperText.nodeId,
      sourceNodeName: field.helperText.nodeName,
    });
  }

  // Add error message placeholder
  if (field.errorMessage) {
    children.push({
      role: "unknown",
      element: "p",
      tailwindClasses: ["text-sm", "text-destructive"],
      sourceNodeId: field.errorMessage.nodeId,
      sourceNodeName: field.errorMessage.nodeName,
    });
  }

  return {
    role: "unknown",
    element: "div",
    tailwindClasses: ["space-y-2"],
    children,
  };
}

/**
 * Get HTML element for input type
 */
function getInputElement(elementType: DetectedFormElement["elementType"]): string {
  switch (elementType) {
    case "textarea":
      return "textarea";
    case "select":
      return "select";
    case "checkbox":
    case "radio":
    case "toggle":
      return "input";
    default:
      return "input";
  }
}

/**
 * Get Tailwind classes for input type
 */
function getInputClasses(elementType: DetectedFormElement["elementType"]): string[] {
  const baseClasses = [
    "flex",
    "w-full",
    "rounded-md",
    "border",
    "border-input",
    "bg-background",
    "px-3",
    "py-2",
    "text-sm",
    "ring-offset-background",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
  ];

  switch (elementType) {
    case "textarea":
      return [...baseClasses, "min-h-[80px]", "resize-y"];
    case "checkbox":
    case "radio":
      return ["h-4", "w-4", "rounded", "border", "border-primary"];
    case "toggle":
      return ["relative", "inline-flex", "h-6", "w-11", "rounded-full"];
    default:
      return [...baseClasses, "h-10"];
  }
}

/**
 * Build a semantic structure node from a section
 */
function buildSectionNode(section: SectionAnalysis): SemanticStructureNode {
  return {
    role: section.role,
    element: mapRoleToElement(section.role),
    tailwindClasses: getRoleClasses(section.role, section.childPattern),
    sourceNodeId: section.nodeIds[0],
  };
}

/**
 * Map semantic role to HTML element
 */
function mapRoleToElement(role: SemanticRole): string {
  const elementMap: Record<SemanticRole, string> = {
    header: "header",
    footer: "footer",
    sidebar: "aside",
    navigation: "nav",
    "main-content": "main",
    card: "article",
    "card-grid": "div",
    list: "ul",
    "list-item": "li",
    hero: "section",
    form: "form",
    modal: "dialog",
    toolbar: "div",
    "tab-bar": "nav",
    breadcrumb: "nav",
    search: "form",
    avatar: "div",
    "button-group": "div",
    "content-section": "section",
    unknown: "div",
  };

  return elementMap[role] || "div";
}

/**
 * Get Tailwind classes for a semantic role
 */
function getRoleClasses(role: SemanticRole, pattern: LayoutPattern): string[] {
  const classes: string[] = [];

  // Role-specific classes
  const roleClasses: Record<SemanticRole, string[]> = {
    header: ["sticky", "top-0", "z-50", "bg-background", "border-b"],
    footer: ["mt-auto", "border-t"],
    sidebar: ["flex-shrink-0", "w-64", "border-r"],
    navigation: ["flex", "items-center", "gap-4"],
    "main-content": ["flex-1", "overflow-auto", "p-4"],
    card: ["rounded-lg", "border", "bg-card", "p-4", "shadow-sm"],
    "card-grid": ["grid", "gap-4"],
    list: ["space-y-2"],
    "list-item": [],
    hero: ["py-12", "px-4", "text-center"],
    form: ["space-y-4"],
    modal: ["fixed", "inset-0", "z-50", "flex", "items-center", "justify-center"],
    toolbar: ["flex", "items-center", "gap-2", "p-2"],
    "tab-bar": ["flex", "border-t", "bg-background"],
    breadcrumb: ["flex", "items-center", "gap-2", "text-sm"],
    search: ["relative"],
    avatar: ["rounded-full", "overflow-hidden"],
    "button-group": ["flex", "gap-2"],
    "content-section": ["py-8"],
    unknown: [],
  };

  classes.push(...(roleClasses[role] || []));

  // Pattern-specific classes
  const patternClasses = getTailwindForPattern(pattern);
  for (const cls of patternClasses) {
    if (!classes.includes(cls)) {
      classes.push(cls);
    }
  }

  return classes;
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate code suggestion from layout analysis
 */
function generateCodeSuggestion(
  analysis: FrameLayoutAnalysis,
  structure: SemanticStructureNode[]
): CodeSuggestion {
  return {
    jsx: generateJSX(structure, analysis),
    css: generateCSS(analysis),
    tailwind: generateTailwind(structure),
  };
}

/**
 * Generate JSX code from semantic structure
 */
function generateJSX(structure: SemanticStructureNode[], analysis: FrameLayoutAnalysis): string {
  const lines: string[] = [];

  // Container wrapper
  lines.push(`<div className="min-h-screen flex flex-col">`);

  for (const node of structure) {
    lines.push(generateNodeJSX(node, 1));
  }

  lines.push("</div>");

  return lines.join("\n");
}

/**
 * Generate JSX for a single node
 */
function generateNodeJSX(node: SemanticStructureNode, indent: number): string {
  const indentStr = "  ".repeat(indent);
  const classes = node.tailwindClasses.join(" ");
  const Element = node.element;

  let jsx = `${indentStr}<${Element}`;

  if (classes) {
    jsx += ` className="${classes}"`;
  }

  if (node.sourceNodeName) {
    jsx += ` {/* ${node.sourceNodeName} */}`;
  }

  jsx += ">";

  if (node.children && node.children.length > 0) {
    jsx += "\n";
    for (const child of node.children) {
      jsx += generateNodeJSX(child, indent + 1) + "\n";
    }
    jsx += `${indentStr}</${Element}>`;
  } else {
    jsx += `{/* Content */}</${Element}>`;
  }

  return jsx;
}

/**
 * Generate CSS from layout analysis
 */
function generateCSS(analysis: FrameLayoutAnalysis): string {
  const lines: string[] = [];

  lines.push("/* Container */");
  lines.push(".container {");
  lines.push("  min-height: 100vh;");
  lines.push("  display: flex;");
  lines.push("  flex-direction: column;");
  lines.push("}");
  lines.push("");

  // Generate CSS for each section
  for (const section of analysis.sections) {
    lines.push(`/* ${capitalizeRole(section.role)} */`);
    lines.push(`.${section.role} {`);

    const patternCSS = getCSSForPattern(section.childPattern);
    for (const line of patternCSS.split("\n")) {
      if (line.trim()) {
        lines.push(`  ${line}`);
      }
    }

    // Add role-specific styles
    const roleStyles = getRoleCSSStyles(section.role);
    for (const [prop, value] of Object.entries(roleStyles)) {
      lines.push(`  ${prop}: ${value};`);
    }

    lines.push("}");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Get CSS styles for a semantic role
 */
function getRoleCSSStyles(role: SemanticRole): Record<string, string> {
  const styles: Record<SemanticRole, Record<string, string>> = {
    header: {
      position: "sticky",
      top: "0",
      "z-index": "50",
      "border-bottom": "1px solid var(--border)",
    },
    footer: {
      "margin-top": "auto",
      "border-top": "1px solid var(--border)",
    },
    sidebar: {
      "flex-shrink": "0",
      width: "16rem",
      "border-right": "1px solid var(--border)",
    },
    navigation: {},
    "main-content": {
      flex: "1",
      overflow: "auto",
      padding: "1rem",
    },
    card: {
      "border-radius": "0.5rem",
      border: "1px solid var(--border)",
      padding: "1rem",
      "box-shadow": "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    "card-grid": {},
    list: {},
    "list-item": {},
    hero: {
      padding: "3rem 1rem",
      "text-align": "center",
    },
    form: {},
    modal: {
      position: "fixed",
      inset: "0",
      "z-index": "50",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
    },
    toolbar: {},
    "tab-bar": {
      display: "flex",
      "border-top": "1px solid var(--border)",
    },
    breadcrumb: {
      "font-size": "0.875rem",
    },
    search: {},
    avatar: {
      "border-radius": "9999px",
      overflow: "hidden",
    },
    "button-group": {},
    "content-section": {
      padding: "2rem 0",
    },
    unknown: {},
  };

  return styles[role] || {};
}

/**
 * Generate Tailwind code from semantic structure
 */
function generateTailwind(structure: SemanticStructureNode[]): string {
  const classes: string[] = [];

  for (const node of structure) {
    collectTailwindClasses(node, classes);
  }

  return [...new Set(classes)].join(" ");
}

/**
 * Collect all Tailwind classes from structure tree
 */
function collectTailwindClasses(node: SemanticStructureNode, classes: string[]): void {
  classes.push(...node.tailwindClasses);

  if (node.children) {
    for (const child of node.children) {
      collectTailwindClasses(child, classes);
    }
  }
}

// ============================================================================
// Description Helpers
// ============================================================================

/**
 * Get human-readable description for a section
 */
function getSectionDescription(section: SectionAnalysis): string {
  const roleDescriptions: Record<SemanticRole, string> = {
    header: "Top navigation or app bar",
    footer: "Bottom content area or page footer",
    sidebar: "Side navigation panel",
    navigation: "Navigation links or menu",
    "main-content": "Primary content area",
    card: "Card or content container",
    "card-grid": "Grid of cards or tiles",
    list: "List of items",
    "list-item": "Individual list item",
    hero: "Hero banner or splash section",
    form: "Form or input area",
    modal: "Modal or dialog overlay",
    toolbar: "Toolbar with actions",
    "tab-bar": "Tab navigation bar",
    breadcrumb: "Breadcrumb navigation",
    search: "Search input area",
    avatar: "User avatar or profile image",
    "button-group": "Group of action buttons",
    "content-section": "Content section or block",
    unknown: "Unidentified layout section",
  };

  return roleDescriptions[section.role] || "Layout section";
}

/**
 * Describe overall structure
 */
function describeStructure(analysis: FrameLayoutAnalysis): string {
  const parts: string[] = [];

  const hasHeader = analysis.sections.some((s) => s.role === "header");
  const hasFooter = analysis.sections.some((s) => s.role === "footer" || s.role === "tab-bar");
  const hasSidebar = analysis.sections.some((s) => s.role === "sidebar");
  const hasMainContent = analysis.sections.some((s) => s.role === "main-content");

  if (hasHeader) parts.push("header");
  if (hasSidebar) parts.push("sidebar");
  if (hasMainContent) parts.push("main content");
  if (hasFooter) parts.push("footer");

  if (parts.length === 0) {
    return `Single section with ${analysis.overallPattern} layout`;
  }

  return `Layout with ${parts.join(", ")}`;
}

/**
 * Capitalize role name for display
 */
function capitalizeRole(role: SemanticRole): string {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================================
// Frame Categorization
// ============================================================================

/**
 * Categorize frame by size
 */
function categorizeFrameBySize(width: number, height: number): "screen" | "component" | "asset" | "unknown" {
  // Small frames are assets
  if (width <= 100 && height <= 100) {
    return "asset";
  }

  // Large frames are screens
  if (width >= 320 || height >= 480) {
    return "screen";
  }

  // Medium frames are components
  if (width <= 500 && height <= 500) {
    return "component";
  }

  return "unknown";
}

// ============================================================================
// Export Convenience Functions
// ============================================================================

export {
  analyzeNodeLayout,
  analyzeFrameLayout,
  quickAnalyze,
  flattenAnalysis,
  getCSSForPattern,
  getTailwindForPattern,
} from "./layout-analyzer";

export type {
  NodeLayoutAnalysis,
  FrameLayoutAnalysis,
  SemanticRole,
  LayoutPattern,
  BoundingBox,
  SectionAnalysis,
} from "./layout-analyzer";

// Form analysis exports
export {
  analyzeFormLayout,
  isLikelyForm,
} from "./form-analyzer";

export type {
  FormAnalysisResult,
  DetectedFormElement,
  FormFieldGroup,
  FieldsetGroup,
  LabelInputAssociation,
  FormElementType,
  FormCodeSuggestion,
} from "./form-analyzer";

// Navigation pattern exports
export {
  analyzeNavigationPatterns,
} from "./navigation-pattern-detector";

export type {
  NavigationPatternAnalysis,
  NavigationPatternType,
  NavigationItem,
  SemanticNavMarkup,
  NavigationAnalysisResult,
  SemanticNavItemMarkup,
  AriaLandmarkRole,
} from "./navigation-pattern-detector";

// List pattern and repetition detection exports
export {
  detectListPattern,
  detectListPatternFromAnalysis,
} from "./list-pattern-detector";

export type {
  ListPatternResult,
  ListPatternType,
  ListSemanticType,
  ListStructure,
  ListItemInfo,
  ListElementSuggestion,
  ItemContentType,
} from "./list-pattern-detector";

export {
  detectRepeatingUnits,
  detectRepeatingUnitsFromAnalysis,
} from "./repetition-detector";

export type {
  RepeatingUnitResult,
  RepeatingItem,
  ItemVariation,
  VariationType,
  ArrangementType,
  SpacingInfo,
} from "./repetition-detector";

// Semantic list markup generation exports
export {
  generateListMarkup,
  generateListJSX,
  generateListCSS,
} from "./semantic-list-generator";

export type {
  GeneratedListCode,
  CodeGenerationOptions,
} from "./semantic-list-generator";

// Svelte component generation exports
export {
  generateSvelteListComponent,
  generateSvelteFormComponent,
  generateSvelteNavComponent,
  SVELTE_GENERATION_DEFAULTS,
} from "./svelte-component-generator";

export type {
  GeneratedSvelteCode,
  SvelteGenerationOptions,
  TransitionConfig,
  StoreConfig,
  ActionConfig,
} from "./svelte-component-generator";

// Component boundary analysis exports
export {
  analyzeComponentBoundaries,
  analyzeComponentBoundariesWithOptions,
  generateComponentName,
  generateFileName,
  COMPONENT_BOUNDARY_CONFIG,
} from "./component-boundary-analyzer";

export type {
  ComponentBoundaryAnalysis,
  ComponentBoundary,
  BoundaryType,
  BoundaryReason,
  BoundaryReasonType,
  ReusablePattern,
  PatternInstance,
  PatternDifference,
  PatternVariation,
  PatternCategory,
  PatternComplexity,
  PatternRecommendation,
  ExtractionRecommendation,
  ComponentHierarchy,
  HierarchyNode,
  HierarchyNodeType,
  AnalysisMetrics,
  ComponentRecommendation,
  RecommendationType,
} from "./component-boundary-analyzer";
