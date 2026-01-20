/**
 * Responsive Element Mapper
 *
 * Maps corresponding elements across different viewport designs in Figma.
 * Tracks which elements appear/disappear at breakpoints, identifies element
 * transformations between sizes, and generates responsive CSS with proper
 * breakpoint handling.
 */

import type { FigmaNode } from "./figma-api";
import { COMMON_DEVICE_SIZES, findMatchingDevice } from "./figma-api";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Viewport breakpoint category */
export type ViewportCategory = "mobile" | "tablet" | "desktop";

/** Standard CSS breakpoints */
export const CSS_BREAKPOINTS = {
  mobile: { max: 640 },
  tablet: { min: 641, max: 1024 },
  desktop: { min: 1025 },
} as const;

/** Frame info with viewport classification */
export interface ViewportFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  category: ViewportCategory;
  matchedDevice?: string;
  node?: FigmaNode;
}

/** A group of frames representing the same screen at different viewports */
export interface ResponsiveFrameGroup {
  /** Unique identifier for the group */
  groupId: string;
  /** Base name shared across viewports (e.g., "Homepage" from "Homepage - Mobile") */
  baseName: string;
  /** Confidence score for the grouping (0-1) */
  confidence: number;
  /** Frames in this group, indexed by viewport category */
  frames: Map<ViewportCategory, ViewportFrame>;
  /** All frames in the group as array */
  frameList: ViewportFrame[];
}

/** Element visibility across viewports */
export type ElementVisibility = "visible" | "hidden" | "absent";

/** Element transformation type */
export type TransformationType =
  | "unchanged"
  | "resized"
  | "repositioned"
  | "restyled"
  | "restructured"
  | "hidden"
  | "shown";

/** Position and size of an element */
export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Element properties that can change across viewports */
export interface ElementProperties {
  bounds: ElementBounds;
  visible: boolean;
  opacity?: number;
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  constraints?: { vertical: string; horizontal: string };
  fills?: unknown[];
  strokes?: unknown[];
  cornerRadius?: number;
}

/** Mapping of an element across viewports */
export interface ElementViewportMapping {
  /** Original element ID in each viewport */
  elementIds: Map<ViewportCategory, string>;
  /** Element name (should be consistent across viewports) */
  elementName: string;
  /** Element type (e.g., "FRAME", "TEXT", "RECTANGLE") */
  elementType: string;
  /** Path to element in the tree (e.g., "Header/Logo") */
  elementPath: string;
  /** Properties at each viewport */
  properties: Map<ViewportCategory, ElementProperties>;
  /** Visibility at each viewport */
  visibility: Map<ViewportCategory, ElementVisibility>;
  /** Confidence score for this mapping (0-1) */
  confidence: number;
}

/** Transformation detected between two viewports */
export interface ElementTransformation {
  /** Element mapping reference */
  elementName: string;
  elementPath: string;
  /** Source viewport */
  fromViewport: ViewportCategory;
  /** Target viewport */
  toViewport: ViewportCategory;
  /** Type of transformation */
  transformationType: TransformationType;
  /** Details about the change */
  details: TransformationDetails;
}

/** Detailed information about a transformation */
export interface TransformationDetails {
  /** Size change info */
  sizeChange?: {
    widthDelta: number;
    heightDelta: number;
    widthPercent: number;
    heightPercent: number;
  };
  /** Position change info */
  positionChange?: {
    xDelta: number;
    yDelta: number;
    relativeXPercent: number;
    relativeYPercent: number;
  };
  /** Style changes */
  styleChanges?: string[];
  /** Layout mode change */
  layoutChange?: {
    from?: string;
    to?: string;
  };
  /** Visibility change */
  visibilityChange?: {
    from: ElementVisibility;
    to: ElementVisibility;
  };
}

/** Generated responsive CSS output */
export interface ResponsiveCSS {
  /** Base CSS (applies to all viewports, mobile-first) */
  base: string;
  /** Media query blocks */
  mediaQueries: MediaQueryBlock[];
  /** Combined CSS string */
  combined: string;
  /** Tailwind classes (if applicable) */
  tailwind?: ResponsiveTailwind;
}

/** A media query block with CSS rules */
export interface MediaQueryBlock {
  /** Media query condition */
  query: string;
  /** Viewport category this applies to */
  viewport: ViewportCategory;
  /** CSS rules inside this media query */
  rules: string;
}

/** Tailwind classes organized by breakpoint */
export interface ResponsiveTailwind {
  base: string[];
  sm: string[];
  md: string[];
  lg: string[];
  xl: string[];
}

/** Result of analyzing responsive mappings */
export interface ResponsiveMappingResult {
  /** The frame group analyzed */
  frameGroup: ResponsiveFrameGroup;
  /** All element mappings */
  elementMappings: ElementViewportMapping[];
  /** Detected transformations */
  transformations: ElementTransformation[];
  /** Elements that appear/disappear at breakpoints */
  breakpointChanges: BreakpointChange[];
  /** Generated responsive CSS */
  responsiveCSS: ResponsiveCSS;
}

/** An element that appears or disappears at a breakpoint */
export interface BreakpointChange {
  elementName: string;
  elementPath: string;
  changeType: "appears" | "disappears";
  atBreakpoint: ViewportCategory;
  fromBreakpoint: ViewportCategory;
}

// ============================================================================
// Frame Grouping Functions
// ============================================================================

/**
 * Classify a frame into a viewport category based on its dimensions
 */
export function classifyViewport(width: number, height: number): ViewportCategory {
  // Use the smaller dimension for orientation-agnostic classification
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);

  // Mobile: typical phone dimensions (phones are usually tall and narrow)
  // Max dimension around 932 (iPhone 14 Pro Max), min around 430
  if (maxDim <= 932 && minDim <= 430) {
    return "mobile";
  }

  // Desktop: screens with width >= 1200 (common laptop/desktop breakpoint)
  // Check this before tablet since some desktops have smaller heights
  if (maxDim >= 1200) {
    return "desktop";
  }

  // Tablet: iPad and similar - between phone and desktop
  // Typically 744-1024 width, 1024-1400 height for tablets in portrait
  if (maxDim <= 1400 && minDim >= 600) {
    return "tablet";
  }

  // Desktop for larger screens that don't fit tablet profile
  if (minDim >= 800) {
    return "desktop";
  }

  // Default based on width (assuming portrait orientation)
  if (width <= 480) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

/**
 * Extract base name from a frame name that includes viewport suffix
 * e.g., "Homepage - Mobile" -> "Homepage"
 *       "Dashboard/Desktop" -> "Dashboard"
 *       "Login Screen (Tablet)" -> "Login Screen"
 */
export function extractBaseName(frameName: string): string {
  // Common patterns for viewport suffixes
  const patterns = [
    // Dash separator: "Name - Mobile", "Name - Desktop"
    /^(.+?)\s*[-–—]\s*(mobile|tablet|desktop|phone|iphone|android|ipad|web|responsive)/i,
    // Slash separator: "Name/Mobile", "Name/Desktop"
    /^(.+?)\s*\/\s*(mobile|tablet|desktop|phone|iphone|android|ipad|web)/i,
    // Parentheses: "Name (Mobile)", "Name (Desktop)"
    /^(.+?)\s*\(\s*(mobile|tablet|desktop|phone|iphone|android|ipad|web)\s*\)/i,
    // Brackets: "Name [Mobile]", "Name [Desktop]"
    /^(.+?)\s*\[\s*(mobile|tablet|desktop|phone|iphone|android|ipad|web)\s*\]/i,
    // Device names: "Homepage - iPhone 14", "Dashboard - MacBook"
    /^(.+?)\s*[-–—]\s*(iphone|android|pixel|samsung|ipad|macbook|surface|desktop|laptop)/i,
    // Size suffixes: "Homepage 375", "Dashboard 1440"
    /^(.+?)\s+\d{3,4}(?:x\d{3,4})?$/i,
  ];

  for (const pattern of patterns) {
    const match = frameName.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return frameName;
}

/**
 * Calculate similarity between two frame names
 * Returns a score from 0 to 1
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  const base1 = extractBaseName(name1).toLowerCase();
  const base2 = extractBaseName(name2).toLowerCase();

  // Exact match after extracting base name
  if (base1 === base2) return 1.0;

  // Levenshtein distance-based similarity
  const maxLen = Math.max(base1.length, base2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(base1, base2);
  const similarity = 1 - distance / maxLen;

  return similarity;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
}

/**
 * Group frames that represent the same screen at different viewports
 */
export function groupFramesByScreen(frames: ViewportFrame[]): ResponsiveFrameGroup[] {
  const groups: ResponsiveFrameGroup[] = [];
  const assigned = new Set<string>();

  // Sort frames by name to process in consistent order
  const sortedFrames = [...frames].sort((a, b) => a.name.localeCompare(b.name));

  for (const frame of sortedFrames) {
    if (assigned.has(frame.id)) continue;

    const baseName = extractBaseName(frame.name);
    const group: ResponsiveFrameGroup = {
      groupId: `group-${groups.length + 1}`,
      baseName,
      confidence: 1.0,
      frames: new Map(),
      frameList: [],
    };

    // Find all frames that might belong to this group
    const candidates = sortedFrames.filter((f) => {
      if (assigned.has(f.id)) return false;
      const similarity = calculateNameSimilarity(frame.name, f.name);
      return similarity >= 0.7; // 70% similarity threshold
    });

    // Group by viewport category, taking best match for each
    for (const candidate of candidates) {
      const category = candidate.category;
      const existing = group.frames.get(category);

      if (!existing) {
        group.frames.set(category, candidate);
        group.frameList.push(candidate);
        assigned.add(candidate.id);
      } else {
        // If same category, prefer the one with more similar name
        const existingSimilarity = calculateNameSimilarity(baseName, existing.name);
        const candidateSimilarity = calculateNameSimilarity(baseName, candidate.name);
        if (candidateSimilarity > existingSimilarity) {
          // Remove existing, add candidate
          group.frameList = group.frameList.filter((f) => f.id !== existing.id);
          assigned.delete(existing.id);
          group.frames.set(category, candidate);
          group.frameList.push(candidate);
          assigned.add(candidate.id);
        }
      }
    }

    // Calculate group confidence based on coverage and similarity
    const viewportCount = group.frames.size;
    const avgSimilarity =
      group.frameList.reduce(
        (sum, f) => sum + calculateNameSimilarity(baseName, f.name),
        0
      ) / group.frameList.length;

    group.confidence = (viewportCount / 3) * 0.5 + avgSimilarity * 0.5;

    if (group.frameList.length > 0) {
      groups.push(group);
    }
  }

  return groups;
}

// ============================================================================
// Element Mapping Functions
// ============================================================================

/**
 * Build a path string for an element in the tree
 */
function buildElementPath(node: FigmaNode, parentPath: string = ""): string {
  const nodeName = node.name || node.id;
  return parentPath ? `${parentPath}/${nodeName}` : nodeName;
}

/**
 * Flatten a Figma node tree into a map of path -> node
 */
function flattenNodeTree(
  node: FigmaNode,
  parentPath: string = ""
): Map<string, { node: FigmaNode; path: string }> {
  const result = new Map<string, { node: FigmaNode; path: string }>();
  const path = buildElementPath(node, parentPath);

  result.set(path, { node, path });

  if (node.children) {
    for (const child of node.children) {
      const childMap = flattenNodeTree(child, path);
      Array.from(childMap.entries()).forEach(([childPath, childData]) => {
        result.set(childPath, childData);
      });
    }
  }

  return result;
}

/**
 * Extract properties from a Figma node
 */
function extractElementProperties(node: FigmaNode): ElementProperties {
  const bounds: ElementBounds = {
    x: node.absoluteBoundingBox?.x ?? 0,
    y: node.absoluteBoundingBox?.y ?? 0,
    width: node.absoluteBoundingBox?.width ?? 0,
    height: node.absoluteBoundingBox?.height ?? 0,
  };

  return {
    bounds,
    visible: node.visible !== false,
    opacity: node.opacity,
    constraints: node.constraints,
    fills: node.fills,
    strokes: node.strokes,
    cornerRadius: node.cornerRadius,
  };
}

/**
 * Calculate similarity between two elements for mapping
 */
function calculateElementSimilarity(
  element1: { node: FigmaNode; path: string },
  element2: { node: FigmaNode; path: string }
): number {
  const node1 = element1.node;
  const node2 = element2.node;

  let score = 0;
  let factors = 0;

  // Name match (highest weight)
  if (node1.name === node2.name) {
    score += 0.4;
  } else {
    const nameSimilarity = calculateNameSimilarity(node1.name, node2.name);
    score += nameSimilarity * 0.3;
  }
  factors += 0.4;

  // Type match
  if (node1.type === node2.type) {
    score += 0.2;
  }
  factors += 0.2;

  // Path similarity
  const pathSimilarity = calculateNameSimilarity(element1.path, element2.path);
  score += pathSimilarity * 0.2;
  factors += 0.2;

  // Component ID match (for instances)
  if (node1.componentId && node1.componentId === node2.componentId) {
    score += 0.2;
  }
  factors += 0.2;

  return score / factors;
}

/**
 * Map elements across viewports in a frame group
 */
export function mapElementsAcrossViewports(
  frameGroup: ResponsiveFrameGroup
): ElementViewportMapping[] {
  const mappings: ElementViewportMapping[] = [];

  // Build flattened trees for each viewport
  const viewportTrees = new Map<
    ViewportCategory,
    Map<string, { node: FigmaNode; path: string }>
  >();

  Array.from(frameGroup.frames.entries()).forEach(([category, frame]) => {
    if (frame.node) {
      viewportTrees.set(category, flattenNodeTree(frame.node));
    }
  });

  // Get all unique element paths across viewports
  const allPaths = new Set<string>();
  Array.from(viewportTrees.values()).forEach((tree) => {
    Array.from(tree.keys()).forEach((path) => {
      allPaths.add(path);
    });
  });

  // For each path, try to find corresponding elements across viewports
  const processedElements = new Set<string>();

  for (const path of Array.from(allPaths)) {
    if (processedElements.has(path)) continue;

    // Find this element in each viewport
    const elementIds = new Map<ViewportCategory, string>();
    const properties = new Map<ViewportCategory, ElementProperties>();
    const visibility = new Map<ViewportCategory, ElementVisibility>();

    let elementName = "";
    let elementType = "";
    let foundCount = 0;

    Array.from(viewportTrees.entries()).forEach(([category, tree]) => {
      const element = tree.get(path);
      if (element) {
        elementIds.set(category, element.node.id);
        properties.set(category, extractElementProperties(element.node));
        visibility.set(category, element.node.visible !== false ? "visible" : "hidden");
        elementName = element.node.name;
        elementType = element.node.type;
        foundCount++;
      } else {
        visibility.set(category, "absent");
      }
    });

    if (foundCount > 0) {
      mappings.push({
        elementIds,
        elementName,
        elementType,
        elementPath: path,
        properties,
        visibility,
        confidence: foundCount / viewportTrees.size,
      });
      processedElements.add(path);
    }
  }

  // Try to find fuzzy matches for elements that only exist in one viewport
  const singleViewportMappings = mappings.filter((m) => m.elementIds.size === 1);
  for (const mapping of singleViewportMappings) {
    const sourceViewport = Array.from(mapping.elementIds.keys())[0]!;
    const sourceTree = viewportTrees.get(sourceViewport);
    const sourceElement = sourceTree?.get(mapping.elementPath);

    if (!sourceElement) continue;

    // Look for similar elements in other viewports
    const viewportEntries = Array.from(viewportTrees.entries());
    for (const [category, tree] of viewportEntries) {
      if (category === sourceViewport) continue;
      if (mapping.elementIds.has(category)) continue;

      // Find best matching element in this viewport
      const treeEntries = Array.from(tree.entries());
      let bestMatchPath: string | null = null;
      let bestMatchSimilarity = 0;

      for (const [candidatePath, candidateElement] of treeEntries) {
        if (processedElements.has(candidatePath)) continue;

        const similarity = calculateElementSimilarity(sourceElement, candidateElement);
        if (similarity >= 0.6 && similarity > bestMatchSimilarity) {
          bestMatchPath = candidatePath;
          bestMatchSimilarity = similarity;
        }
      }

      if (bestMatchPath) {
        const matchedElement = tree.get(bestMatchPath);
        if (matchedElement) {
          mapping.elementIds.set(category, matchedElement.node.id);
          mapping.properties.set(category, extractElementProperties(matchedElement.node));
          mapping.visibility.set(
            category,
            matchedElement.node.visible !== false ? "visible" : "hidden"
          );
          mapping.confidence = (mapping.confidence + bestMatchSimilarity) / 2;
          processedElements.add(bestMatchPath);
        }
      }
    }
  }

  return mappings;
}

// ============================================================================
// Transformation Detection Functions
// ============================================================================

/**
 * Detect transformations between viewports for an element
 */
export function detectTransformations(
  mapping: ElementViewportMapping
): ElementTransformation[] {
  const transformations: ElementTransformation[] = [];
  const viewports: ViewportCategory[] = ["mobile", "tablet", "desktop"];

  for (let i = 0; i < viewports.length - 1; i++) {
    const fromViewport = viewports[i]!;
    const toViewport = viewports[i + 1]!;

    const fromVisibility = mapping.visibility.get(fromViewport);
    const toVisibility = mapping.visibility.get(toViewport);
    const fromProps = mapping.properties.get(fromViewport);
    const toProps = mapping.properties.get(toViewport);

    // Check visibility changes
    if (fromVisibility !== toVisibility) {
      transformations.push({
        elementName: mapping.elementName,
        elementPath: mapping.elementPath,
        fromViewport,
        toViewport,
        transformationType:
          toVisibility === "visible" || toVisibility === "hidden" ? "shown" : "hidden",
        details: {
          visibilityChange: {
            from: fromVisibility ?? "absent",
            to: toVisibility ?? "absent",
          },
        },
      });
      continue;
    }

    if (!fromProps || !toProps) continue;

    const details: TransformationDetails = {};
    let hasChanges = false;

    // Check size changes
    const widthDelta = toProps.bounds.width - fromProps.bounds.width;
    const heightDelta = toProps.bounds.height - fromProps.bounds.height;
    const widthPercent =
      fromProps.bounds.width > 0
        ? (widthDelta / fromProps.bounds.width) * 100
        : widthDelta === 0
          ? 0
          : 100;
    const heightPercent =
      fromProps.bounds.height > 0
        ? (heightDelta / fromProps.bounds.height) * 100
        : heightDelta === 0
          ? 0
          : 100;

    if (Math.abs(widthPercent) > 5 || Math.abs(heightPercent) > 5) {
      details.sizeChange = { widthDelta, heightDelta, widthPercent, heightPercent };
      hasChanges = true;
    }

    // Check position changes (relative to parent)
    const xDelta = toProps.bounds.x - fromProps.bounds.x;
    const yDelta = toProps.bounds.y - fromProps.bounds.y;
    const relativeXPercent =
      fromProps.bounds.x !== 0 ? (xDelta / fromProps.bounds.x) * 100 : xDelta === 0 ? 0 : 100;
    const relativeYPercent =
      fromProps.bounds.y !== 0 ? (yDelta / fromProps.bounds.y) * 100 : yDelta === 0 ? 0 : 100;

    if (Math.abs(xDelta) > 10 || Math.abs(yDelta) > 10) {
      details.positionChange = { xDelta, yDelta, relativeXPercent, relativeYPercent };
      hasChanges = true;
    }

    // Check layout mode changes
    if (fromProps.layoutMode !== toProps.layoutMode) {
      details.layoutChange = {
        from: fromProps.layoutMode,
        to: toProps.layoutMode,
      };
      hasChanges = true;
    }

    if (hasChanges) {
      let transformationType: TransformationType = "unchanged";
      if (details.sizeChange && details.positionChange) {
        transformationType = "restructured";
      } else if (details.sizeChange) {
        transformationType = "resized";
      } else if (details.positionChange) {
        transformationType = "repositioned";
      } else if (details.layoutChange || details.styleChanges) {
        transformationType = "restyled";
      }

      transformations.push({
        elementName: mapping.elementName,
        elementPath: mapping.elementPath,
        fromViewport,
        toViewport,
        transformationType,
        details,
      });
    }
  }

  return transformations;
}

/**
 * Detect breakpoint changes (elements appearing/disappearing)
 */
export function detectBreakpointChanges(
  mappings: ElementViewportMapping[]
): BreakpointChange[] {
  const changes: BreakpointChange[] = [];
  const viewports: ViewportCategory[] = ["mobile", "tablet", "desktop"];

  for (const mapping of mappings) {
    for (let i = 0; i < viewports.length - 1; i++) {
      const fromViewport = viewports[i]!;
      const toViewport = viewports[i + 1]!;

      const fromVisibility = mapping.visibility.get(fromViewport);
      const toVisibility = mapping.visibility.get(toViewport);

      // Element appears
      if (
        (fromVisibility === "absent" || fromVisibility === "hidden") &&
        toVisibility === "visible"
      ) {
        changes.push({
          elementName: mapping.elementName,
          elementPath: mapping.elementPath,
          changeType: "appears",
          atBreakpoint: toViewport,
          fromBreakpoint: fromViewport,
        });
      }

      // Element disappears
      if (
        fromVisibility === "visible" &&
        (toVisibility === "absent" || toVisibility === "hidden")
      ) {
        changes.push({
          elementName: mapping.elementName,
          elementPath: mapping.elementPath,
          changeType: "disappears",
          atBreakpoint: toViewport,
          fromBreakpoint: fromViewport,
        });
      }
    }
  }

  return changes;
}

// ============================================================================
// CSS Generation Functions
// ============================================================================

/**
 * Generate CSS selector from element path
 */
function pathToSelector(path: string): string {
  // Convert path like "Header/Logo/Image" to ".header .logo .image"
  return path
    .split("/")
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter((part) => part.length > 0)
    .map((part) => `.${part}`)
    .join(" ");
}

/**
 * Generate CSS properties from element bounds
 */
function boundsToCSS(bounds: ElementBounds, parentBounds?: ElementBounds): string {
  const rules: string[] = [];

  if (parentBounds) {
    // Use relative sizing
    const widthPercent = (bounds.width / parentBounds.width) * 100;
    const heightPercent = (bounds.height / parentBounds.height) * 100;

    if (widthPercent <= 100) {
      rules.push(`width: ${widthPercent.toFixed(1)}%`);
    } else {
      rules.push(`width: ${bounds.width}px`);
    }

    if (heightPercent <= 100 && heightPercent > 0) {
      rules.push(`height: ${heightPercent.toFixed(1)}%`);
    }
  } else {
    rules.push(`width: ${bounds.width}px`);
    if (bounds.height > 0) {
      rules.push(`height: ${bounds.height}px`);
    }
  }

  return rules.join(";\n  ");
}

/**
 * Generate responsive CSS from element mappings and transformations
 */
export function generateResponsiveCSS(
  mappings: ElementViewportMapping[],
  transformations: ElementTransformation[],
  breakpointChanges: BreakpointChange[]
): ResponsiveCSS {
  const baseRules: string[] = [];
  const tabletRules: string[] = [];
  const desktopRules: string[] = [];

  // Generate base styles from mobile viewport (mobile-first approach)
  for (const mapping of mappings) {
    const mobileProps = mapping.properties.get("mobile");
    const selector = pathToSelector(mapping.elementPath);

    if (!selector) continue;

    if (mobileProps) {
      const css = boundsToCSS(mobileProps.bounds);
      if (css) {
        baseRules.push(`${selector} {\n  ${css};\n}`);
      }
    }
  }

  // Generate tablet overrides
  for (const transformation of transformations) {
    if (transformation.toViewport === "tablet") {
      const selector = pathToSelector(transformation.elementPath);
      if (!selector) continue;

      const rules: string[] = [];

      if (transformation.details.sizeChange) {
        const mapping = mappings.find((m) => m.elementPath === transformation.elementPath);
        const tabletProps = mapping?.properties.get("tablet");
        if (tabletProps) {
          rules.push(boundsToCSS(tabletProps.bounds));
        }
      }

      if (rules.length > 0) {
        tabletRules.push(`${selector} {\n  ${rules.join(";\n  ")};\n}`);
      }
    }
  }

  // Generate desktop overrides
  for (const transformation of transformations) {
    if (transformation.toViewport === "desktop") {
      const selector = pathToSelector(transformation.elementPath);
      if (!selector) continue;

      const rules: string[] = [];

      if (transformation.details.sizeChange) {
        const mapping = mappings.find((m) => m.elementPath === transformation.elementPath);
        const desktopProps = mapping?.properties.get("desktop");
        if (desktopProps) {
          rules.push(boundsToCSS(desktopProps.bounds));
        }
      }

      if (rules.length > 0) {
        desktopRules.push(`${selector} {\n  ${rules.join(";\n  ")};\n}`);
      }
    }
  }

  // Handle visibility changes
  for (const change of breakpointChanges) {
    const selector = pathToSelector(change.elementPath);
    if (!selector) continue;

    if (change.changeType === "appears") {
      // Hidden by default, shown at breakpoint
      if (change.atBreakpoint === "tablet") {
        baseRules.push(`${selector} {\n  display: none;\n}`);
        tabletRules.push(`${selector} {\n  display: block;\n}`);
      } else if (change.atBreakpoint === "desktop") {
        if (change.fromBreakpoint === "tablet") {
          tabletRules.push(`${selector} {\n  display: none;\n}`);
        } else {
          baseRules.push(`${selector} {\n  display: none;\n}`);
        }
        desktopRules.push(`${selector} {\n  display: block;\n}`);
      }
    } else if (change.changeType === "disappears") {
      // Visible by default, hidden at breakpoint
      if (change.atBreakpoint === "tablet") {
        tabletRules.push(`${selector} {\n  display: none;\n}`);
      } else if (change.atBreakpoint === "desktop") {
        desktopRules.push(`${selector} {\n  display: none;\n}`);
      }
    }
  }

  // Build media query blocks
  const mediaQueries: MediaQueryBlock[] = [];

  if (tabletRules.length > 0) {
    mediaQueries.push({
      query: `@media (min-width: ${CSS_BREAKPOINTS.tablet.min}px)`,
      viewport: "tablet",
      rules: tabletRules.join("\n\n"),
    });
  }

  if (desktopRules.length > 0) {
    mediaQueries.push({
      query: `@media (min-width: ${CSS_BREAKPOINTS.desktop.min}px)`,
      viewport: "desktop",
      rules: desktopRules.join("\n\n"),
    });
  }

  // Combine all CSS
  let combined = "";
  if (baseRules.length > 0) {
    combined += `/* Base styles (mobile-first) */\n${baseRules.join("\n\n")}\n\n`;
  }
  for (const mq of mediaQueries) {
    combined += `/* ${mq.viewport.charAt(0).toUpperCase() + mq.viewport.slice(1)} styles */\n`;
    combined += `${mq.query} {\n${mq.rules}\n}\n\n`;
  }

  return {
    base: baseRules.join("\n\n"),
    mediaQueries,
    combined: combined.trim(),
    tailwind: generateTailwindClasses(mappings, transformations, breakpointChanges),
  };
}

/**
 * Generate Tailwind CSS classes from mappings
 */
function generateTailwindClasses(
  mappings: ElementViewportMapping[],
  transformations: ElementTransformation[],
  breakpointChanges: BreakpointChange[]
): ResponsiveTailwind {
  const result: ResponsiveTailwind = {
    base: [],
    sm: [],
    md: [],
    lg: [],
    xl: [],
  };

  // Map viewport categories to Tailwind breakpoints
  const viewportToTailwind: Record<ViewportCategory, keyof ResponsiveTailwind> = {
    mobile: "base",
    tablet: "md",
    desktop: "lg",
  };

  // Generate visibility classes for breakpoint changes
  for (const change of breakpointChanges) {
    const breakpoint = viewportToTailwind[change.atBreakpoint];

    if (change.changeType === "appears") {
      result.base.push("hidden");
      if (breakpoint === "md") {
        result.md.push("block");
      } else if (breakpoint === "lg") {
        result.lg.push("block");
      }
    } else if (change.changeType === "disappears") {
      if (breakpoint === "md") {
        result.md.push("hidden");
      } else if (breakpoint === "lg") {
        result.lg.push("hidden");
      }
    }
  }

  // Generate sizing classes from transformations
  for (const transformation of transformations) {
    if (transformation.details.sizeChange) {
      const breakpoint = viewportToTailwind[transformation.toViewport];
      const { widthPercent } = transformation.details.sizeChange;

      // Map width changes to Tailwind classes
      if (Math.abs(widthPercent) > 20) {
        const widthClass = widthPercent > 0 ? "w-full" : "w-auto";
        if (breakpoint === "md") {
          result.md.push(widthClass);
        } else if (breakpoint === "lg") {
          result.lg.push(widthClass);
        }
      }
    }
  }

  return result;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze a responsive frame group and generate mappings, transformations, and CSS
 */
export function analyzeResponsiveFrameGroup(
  frameGroup: ResponsiveFrameGroup
): ResponsiveMappingResult {
  // Map elements across viewports
  const elementMappings = mapElementsAcrossViewports(frameGroup);

  // Detect transformations for each element
  const transformations: ElementTransformation[] = [];
  for (const mapping of elementMappings) {
    const elementTransformations = detectTransformations(mapping);
    transformations.push(...elementTransformations);
  }

  // Detect breakpoint changes
  const breakpointChanges = detectBreakpointChanges(elementMappings);

  // Generate responsive CSS
  const responsiveCSS = generateResponsiveCSS(
    elementMappings,
    transformations,
    breakpointChanges
  );

  return {
    frameGroup,
    elementMappings,
    transformations,
    breakpointChanges,
    responsiveCSS,
  };
}

/**
 * Analyze multiple frames and return grouped responsive mappings
 */
export function analyzeResponsiveDesigns(frames: ViewportFrame[]): ResponsiveMappingResult[] {
  const frameGroups = groupFramesByScreen(frames);
  return frameGroups.map(analyzeResponsiveFrameGroup);
}
