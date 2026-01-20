/**
 * Component Boundary Analyzer
 *
 * Analyzes Figma designs to identify optimal component boundaries, detect
 * reusable patterns, suggest component hierarchy, and balance reusability
 * vs simplicity in code generation.
 *
 * Key features:
 * - Identifies natural component boundaries based on visual structure
 * - Detects patterns that appear multiple times (candidates for extraction)
 * - Suggests hierarchical component structure
 * - Provides reusability vs simplicity scoring
 */

import type { FigmaNode } from "./figma-api";
import {
  analyzeNodeLayout,
  type NodeLayoutAnalysis,
  type BoundingBox,
  type SemanticRole,
  type LayoutPattern,
} from "./layout-analyzer";
import {
  detectRepeatingUnits,
  type RepeatingUnitResult,
  type RepeatingItem,
} from "./repetition-detector";

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Result of component boundary analysis
 */
export interface ComponentBoundaryAnalysis {
  /** The analyzed frame/node */
  sourceNodeId: string;
  sourceNodeName: string;
  /** Identified component boundaries */
  boundaries: ComponentBoundary[];
  /** Detected reusable patterns */
  reusablePatterns: ReusablePattern[];
  /** Suggested component hierarchy */
  hierarchy: ComponentHierarchy;
  /** Overall analysis metrics */
  metrics: AnalysisMetrics;
  /** Recommendations for code structure */
  recommendations: ComponentRecommendation[];
}

/**
 * A detected component boundary
 */
export interface ComponentBoundary {
  /** Unique identifier for this boundary */
  id: string;
  /** The node ID that represents this boundary */
  nodeId: string;
  /** Name from the design */
  name: string;
  /** Suggested component name (PascalCase) */
  suggestedName: string;
  /** Bounding box */
  bounds: BoundingBox;
  /** Type of boundary detection */
  boundaryType: BoundaryType;
  /** Semantic role detected */
  semanticRole: SemanticRole;
  /** Layout pattern */
  layoutPattern: LayoutPattern;
  /** Confidence in this boundary (0-1) */
  confidence: number;
  /** Depth level in the component tree */
  depth: number;
  /** Child boundary IDs */
  childBoundaryIds: string[];
  /** Parent boundary ID (if any) */
  parentBoundaryId?: string;
  /** Reasons why this was identified as a boundary */
  reasons: BoundaryReason[];
  /** Extraction recommendation */
  extractionRecommendation: ExtractionRecommendation;
}

/**
 * Types of component boundaries
 */
export type BoundaryType =
  | "semantic-region" // Header, footer, sidebar, etc.
  | "repeated-element" // Part of a repeating pattern
  | "named-component" // Explicitly named in design
  | "figma-component" // Figma component instance
  | "structural" // Clear structural boundary
  | "visual-group" // Visually grouped elements
  | "interactive"; // Interactive element

/**
 * Reason why a boundary was identified
 */
export interface BoundaryReason {
  type: BoundaryReasonType;
  description: string;
  score: number;
}

export type BoundaryReasonType =
  | "name-convention" // Named like a component
  | "semantic-role" // Has semantic meaning
  | "repetition" // Appears multiple times
  | "size-proportion" // Appropriate size for component
  | "visual-isolation" // Visually distinct
  | "figma-component" // Is a Figma component
  | "layout-independence" // Independent layout unit
  | "complexity-threshold"; // Contains enough complexity

/**
 * A detected reusable pattern
 */
export interface ReusablePattern {
  /** Unique identifier */
  id: string;
  /** Pattern name */
  name: string;
  /** Suggested component name */
  suggestedComponentName: string;
  /** All instances of this pattern */
  instances: PatternInstance[];
  /** The representative instance (template) */
  representative: PatternInstance;
  /** Similarity score between instances (0-1) */
  similarity: number;
  /** Pattern category */
  category: PatternCategory;
  /** Variations detected across instances */
  variations: PatternVariation[];
  /** Reusability score (0-1) - how beneficial to extract */
  reusabilityScore: number;
  /** Complexity of the pattern */
  complexity: PatternComplexity;
  /** Recommendation */
  recommendation: PatternRecommendation;
}

/**
 * A single instance of a reusable pattern
 */
export interface PatternInstance {
  nodeId: string;
  nodeName: string;
  bounds: BoundingBox;
  index: number;
  /** Overrides/differences from representative */
  differences: PatternDifference[];
}

/**
 * A difference in a pattern instance
 */
export interface PatternDifference {
  type: "text" | "image" | "color" | "size" | "visibility" | "structure";
  path: string;
  description: string;
}

/**
 * Variation in a pattern
 */
export interface PatternVariation {
  variationType: string;
  affectedInstances: number[];
  description: string;
}

/**
 * Pattern categories
 */
export type PatternCategory =
  | "card"
  | "list-item"
  | "button"
  | "input"
  | "navigation-item"
  | "tab"
  | "avatar"
  | "badge"
  | "icon-group"
  | "data-cell"
  | "generic";

/**
 * Pattern complexity assessment
 */
export interface PatternComplexity {
  level: "simple" | "moderate" | "complex";
  childCount: number;
  depth: number;
  hasInteractiveElements: boolean;
  hasConditionalContent: boolean;
  propsNeeded: number;
}

/**
 * Recommendation for a pattern
 */
export type PatternRecommendation =
  | "extract-as-component" // Definitely extract
  | "consider-extraction" // May be worth extracting
  | "keep-inline" // Too simple to extract
  | "extract-with-variants"; // Extract with variant support

/**
 * Extraction recommendation for a boundary
 */
export interface ExtractionRecommendation {
  shouldExtract: boolean;
  reason: string;
  reusabilityScore: number;
  simplicityScore: number;
  overallScore: number;
  suggestedFileName?: string;
}

/**
 * Component hierarchy structure
 */
export interface ComponentHierarchy {
  /** Root components (top-level) */
  root: HierarchyNode;
  /** Total depth of the hierarchy */
  maxDepth: number;
  /** All nodes in the hierarchy (flat list) */
  allNodes: HierarchyNode[];
}

/**
 * A node in the component hierarchy
 */
export interface HierarchyNode {
  id: string;
  name: string;
  suggestedComponentName: string;
  type: HierarchyNodeType;
  boundaryId?: string;
  patternId?: string;
  depth: number;
  children: HierarchyNode[];
  /** Parent node ID (if any) */
  parentId?: string;
  /** Should this be its own component file? */
  shouldBeSeparateFile: boolean;
  /** Estimated lines of code */
  estimatedLOC: number;
}

export type HierarchyNodeType =
  | "page" // Top-level page/screen
  | "section" // Major section (header, main, footer)
  | "component" // Extracted component
  | "pattern" // Repeated pattern
  | "primitive" // Basic building block
  | "container"; // Container/wrapper

/**
 * Overall analysis metrics
 */
export interface AnalysisMetrics {
  /** Total number of nodes analyzed */
  totalNodes: number;
  /** Number of component boundaries detected */
  boundaryCount: number;
  /** Number of reusable patterns found */
  patternCount: number;
  /** Total instances of reusable patterns */
  totalPatternInstances: number;
  /** Hierarchy depth */
  hierarchyDepth: number;
  /** Average complexity score */
  averageComplexity: number;
  /** Recommended number of components */
  recommendedComponentCount: number;
  /** Estimated total lines of code */
  estimatedTotalLOC: number;
  /** Reusability ratio (how much code is in reusable patterns) */
  reusabilityRatio: number;
}

/**
 * A recommendation for component structure
 */
export interface ComponentRecommendation {
  priority: "high" | "medium" | "low";
  type: RecommendationType;
  title: string;
  description: string;
  affectedBoundaryIds: string[];
  affectedPatternIds: string[];
  actionItems: string[];
}

export type RecommendationType =
  | "extract-component"
  | "combine-components"
  | "simplify-hierarchy"
  | "add-variants"
  | "improve-naming";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  /** Minimum child count to consider extraction */
  MIN_CHILDREN_FOR_EXTRACTION: 2,
  /** Minimum pattern instances for extraction recommendation */
  MIN_PATTERN_INSTANCES: 2,
  /** Minimum similarity for pattern grouping */
  MIN_PATTERN_SIMILARITY: 0.7,
  /** Maximum hierarchy depth recommendation */
  MAX_RECOMMENDED_DEPTH: 4,
  /** Minimum complexity score for extraction */
  MIN_COMPLEXITY_FOR_EXTRACTION: 0.3,
  /** Maximum LOC for "simple" classification */
  SIMPLE_LOC_THRESHOLD: 20,
  /** Maximum LOC for "moderate" classification */
  MODERATE_LOC_THRESHOLD: 50,
  /** Weight for reusability in overall score */
  REUSABILITY_WEIGHT: 0.6,
  /** Weight for simplicity in overall score */
  SIMPLICITY_WEIGHT: 0.4,
  /** Keywords indicating component naming */
  COMPONENT_NAME_KEYWORDS: [
    "card",
    "button",
    "input",
    "form",
    "header",
    "footer",
    "sidebar",
    "nav",
    "menu",
    "modal",
    "dialog",
    "list",
    "item",
    "avatar",
    "badge",
    "chip",
    "tab",
    "panel",
    "section",
    "hero",
    "banner",
    "toolbar",
    "icon",
  ],
  /** Minimum size for component consideration (pixels) */
  MIN_COMPONENT_SIZE: 24,
  /** Maximum components to recommend for a single file */
  MAX_COMPONENTS_PER_FILE: 10,
} as const;

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze a Figma node tree to identify component boundaries and patterns
 */
function analyzeComponentBoundaries(
  rootNode: FigmaNode
): ComponentBoundaryAnalysis {
  // Step 1: Perform layout analysis on the entire tree
  const layoutAnalysis = analyzeNodeLayout(rootNode);

  // Step 2: Identify component boundaries
  const boundaries = identifyBoundaries(rootNode, layoutAnalysis, 0, undefined);

  // Step 3: Detect reusable patterns
  const reusablePatterns = detectReusablePatterns(rootNode, boundaries);

  // Step 4: Build component hierarchy
  const hierarchy = buildComponentHierarchy(boundaries, reusablePatterns, rootNode);

  // Step 5: Calculate metrics
  const metrics = calculateMetrics(boundaries, reusablePatterns, hierarchy, rootNode);

  // Step 6: Generate recommendations
  const recommendations = generateRecommendations(
    boundaries,
    reusablePatterns,
    hierarchy,
    metrics
  );

  return {
    sourceNodeId: rootNode.id,
    sourceNodeName: rootNode.name,
    boundaries,
    reusablePatterns,
    hierarchy,
    metrics,
    recommendations,
  };
}

/**
 * Analyze component boundaries with custom options
 */
function analyzeComponentBoundariesWithOptions(
  rootNode: FigmaNode,
  options: Partial<typeof CONFIG>
): ComponentBoundaryAnalysis {
  const mergedConfig = { ...CONFIG, ...options };
  // For now, use the default config. Could extend later.
  return analyzeComponentBoundaries(rootNode);
}

// ============================================================================
// Boundary Identification
// ============================================================================

/**
 * Recursively identify component boundaries in a node tree
 */
function identifyBoundaries(
  node: FigmaNode,
  layoutAnalysis: NodeLayoutAnalysis,
  depth: number,
  parentBoundaryId: string | undefined
): ComponentBoundary[] {
  const boundaries: ComponentBoundary[] = [];
  const bounds = extractBounds(node);

  // Check if this node should be a boundary
  const boundaryAssessment = assessBoundary(node, layoutAnalysis, depth);

  if (boundaryAssessment.isBoundary) {
    const boundaryId = `boundary-${node.id}`;
    const childBoundaries: ComponentBoundary[] = [];

    // Recursively check children
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childAnalysis = layoutAnalysis.children?.[i];

        if (childAnalysis) {
          const childBounds = identifyBoundaries(
            child,
            childAnalysis,
            depth + 1,
            boundaryId
          );
          childBoundaries.push(...childBounds);
        }
      }
    }

    const boundary: ComponentBoundary = {
      id: boundaryId,
      nodeId: node.id,
      name: node.name,
      suggestedName: generateComponentName(node.name),
      bounds,
      boundaryType: boundaryAssessment.type,
      semanticRole: layoutAnalysis.semanticRole,
      layoutPattern: layoutAnalysis.layoutPattern,
      confidence: boundaryAssessment.confidence,
      depth,
      childBoundaryIds: childBoundaries
        .filter((b) => b.parentBoundaryId === boundaryId)
        .map((b) => b.id),
      parentBoundaryId,
      reasons: boundaryAssessment.reasons,
      extractionRecommendation: calculateExtractionRecommendation(
        node,
        boundaryAssessment,
        childBoundaries.length,
        depth
      ),
    };

    boundaries.push(boundary);
    boundaries.push(...childBoundaries);
  } else {
    // Not a boundary, but still check children
    if (node.children && layoutAnalysis.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childAnalysis = layoutAnalysis.children[i];

        if (childAnalysis) {
          const childBounds = identifyBoundaries(
            child,
            childAnalysis,
            depth,
            parentBoundaryId
          );
          boundaries.push(...childBounds);
        }
      }
    }
  }

  return boundaries;
}

/**
 * Assess whether a node should be a component boundary
 */
function assessBoundary(
  node: FigmaNode,
  analysis: NodeLayoutAnalysis,
  depth: number
): {
  isBoundary: boolean;
  type: BoundaryType;
  confidence: number;
  reasons: BoundaryReason[];
} {
  const reasons: BoundaryReason[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Check 1: Is it a Figma component or instance?
  if (node.type === "COMPONENT" || node.type === "INSTANCE" || node.type === "COMPONENT_SET") {
    reasons.push({
      type: "figma-component",
      description: `Node is a Figma ${node.type.toLowerCase()}`,
      score: 1.0,
    });
    totalScore += 1.0;
  }
  maxPossibleScore += 1.0;

  // Check 2: Does the name suggest a component?
  const nameScore = assessNameForComponent(node.name);
  if (nameScore > 0) {
    reasons.push({
      type: "name-convention",
      description: `Name "${node.name}" suggests a component`,
      score: nameScore,
    });
    totalScore += nameScore;
  }
  maxPossibleScore += 0.8;

  // Check 3: Does it have a semantic role?
  if (analysis.semanticRole !== "unknown") {
    const semanticScore = getSemanticRoleScore(analysis.semanticRole);
    reasons.push({
      type: "semantic-role",
      description: `Has semantic role: ${analysis.semanticRole}`,
      score: semanticScore,
    });
    totalScore += semanticScore;
  }
  maxPossibleScore += 0.8;

  // Check 4: Is it visually isolated (appropriate size)?
  const bounds = extractBounds(node);
  const sizeScore = assessSizeForComponent(bounds);
  if (sizeScore > 0) {
    reasons.push({
      type: "size-proportion",
      description: `Appropriate size for component (${Math.round(bounds.width)}x${Math.round(bounds.height)})`,
      score: sizeScore,
    });
    totalScore += sizeScore;
  }
  maxPossibleScore += 0.6;

  // Check 5: Does it have meaningful children (complexity)?
  const childCount = node.children?.length || 0;
  if (childCount >= CONFIG.MIN_CHILDREN_FOR_EXTRACTION) {
    const complexityScore = Math.min(childCount / 10, 0.7);
    reasons.push({
      type: "complexity-threshold",
      description: `Contains ${childCount} child elements`,
      score: complexityScore,
    });
    totalScore += complexityScore;
  }
  maxPossibleScore += 0.7;

  // Check 6: Layout independence
  if (analysis.layoutPattern !== "unknown" && analysis.layoutPattern !== "absolute") {
    reasons.push({
      type: "layout-independence",
      description: `Has structured layout: ${analysis.layoutPattern}`,
      score: 0.5,
    });
    totalScore += 0.5;
  }
  maxPossibleScore += 0.5;

  // Calculate confidence
  const confidence = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

  // Determine boundary type
  let type: BoundaryType = "structural";
  if (node.type === "COMPONENT" || node.type === "INSTANCE") {
    type = "figma-component";
  } else if (analysis.semanticRole !== "unknown") {
    type = "semantic-region";
  } else if (nameScore > 0.5) {
    type = "named-component";
  }

  // Decide if it's a boundary
  const isBoundary = confidence >= 0.4 && reasons.length >= 2;

  return {
    isBoundary,
    type,
    confidence,
    reasons,
  };
}

/**
 * Assess if a name suggests a component
 */
function assessNameForComponent(name: string): number {
  const lowerName = name.toLowerCase();

  // Check for component keywords
  for (const keyword of CONFIG.COMPONENT_NAME_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 0.8;
    }
  }

  // Check for PascalCase or kebab-case naming (suggests intentional naming)
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(name);
  const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(name);
  const hasSlashes = name.includes("/"); // Figma component naming

  if (isPascalCase || hasSlashes) {
    return 0.6;
  }
  if (isKebabCase) {
    return 0.4;
  }

  return 0;
}

/**
 * Get score for semantic role
 */
function getSemanticRoleScore(role: SemanticRole): number {
  const highValueRoles: SemanticRole[] = [
    "header",
    "footer",
    "sidebar",
    "navigation",
    "main-content",
    "card",
    "modal",
    "form",
  ];

  const mediumValueRoles: SemanticRole[] = [
    "card-grid",
    "list",
    "hero",
    "toolbar",
    "tab-bar",
    "breadcrumb",
  ];

  if (highValueRoles.includes(role)) {
    return 0.8;
  }
  if (mediumValueRoles.includes(role)) {
    return 0.5;
  }

  return 0.3;
}

/**
 * Assess size appropriateness for a component
 */
function assessSizeForComponent(bounds: BoundingBox): number {
  const area = bounds.width * bounds.height;

  // Too small
  if (bounds.width < CONFIG.MIN_COMPONENT_SIZE || bounds.height < CONFIG.MIN_COMPONENT_SIZE) {
    return 0;
  }

  // Very small (likely an icon or primitive)
  if (area < 1000) {
    return 0.2;
  }

  // Small to medium (good component size)
  if (area < 50000) {
    return 0.6;
  }

  // Large (likely a section or page)
  return 0.4;
}

/**
 * Calculate extraction recommendation
 */
function calculateExtractionRecommendation(
  node: FigmaNode,
  assessment: { confidence: number; reasons: BoundaryReason[] },
  childBoundaryCount: number,
  depth: number
): ExtractionRecommendation {
  const childCount = node.children?.length || 0;

  // Calculate reusability score
  const reusabilityScore = calculateReusabilityScore(node, assessment);

  // Calculate simplicity score (inverse of complexity)
  const simplicityScore = calculateSimplicityScore(childCount, childBoundaryCount, depth);

  // Overall score weighted by reusability and simplicity
  const overallScore =
    reusabilityScore * CONFIG.REUSABILITY_WEIGHT +
    simplicityScore * CONFIG.SIMPLICITY_WEIGHT;

  // Determine if we should extract
  const shouldExtract = overallScore >= 0.5 && assessment.confidence >= 0.5;

  let reason = "";
  if (shouldExtract) {
    if (reusabilityScore >= 0.7) {
      reason = "High reusability potential - appears to be a well-structured component";
    } else if (assessment.confidence >= 0.7) {
      reason = "Clear component boundary with good structure";
    } else {
      reason = "Reasonable balance of complexity and structure";
    }
  } else {
    if (childCount < CONFIG.MIN_CHILDREN_FOR_EXTRACTION) {
      reason = "Too simple - would add unnecessary abstraction";
    } else if (depth > CONFIG.MAX_RECOMMENDED_DEPTH) {
      reason = "Deep nesting - consider flattening hierarchy";
    } else {
      reason = "Extraction not recommended - insufficient structure or complexity";
    }
  }

  return {
    shouldExtract,
    reason,
    reusabilityScore,
    simplicityScore,
    overallScore,
    suggestedFileName: shouldExtract
      ? generateFileName(generateComponentName(node.name))
      : undefined,
  };
}

/**
 * Calculate reusability score
 */
function calculateReusabilityScore(
  node: FigmaNode,
  assessment: { confidence: number; reasons: BoundaryReason[] }
): number {
  let score = assessment.confidence * 0.5;

  // Bonus for Figma component
  if (node.type === "COMPONENT" || node.type === "INSTANCE") {
    score += 0.3;
  }

  // Bonus for semantic role
  const semanticReason = assessment.reasons.find((r) => r.type === "semantic-role");
  if (semanticReason) {
    score += semanticReason.score * 0.2;
  }

  return Math.min(score, 1);
}

/**
 * Calculate simplicity score
 */
function calculateSimplicityScore(
  childCount: number,
  childBoundaryCount: number,
  depth: number
): number {
  let score = 1.0;

  // Penalize very deep nesting
  if (depth > CONFIG.MAX_RECOMMENDED_DEPTH) {
    score -= (depth - CONFIG.MAX_RECOMMENDED_DEPTH) * 0.15;
  }

  // Penalize too many children
  if (childCount > 20) {
    score -= 0.2;
  }

  // Penalize too many nested boundaries (complex hierarchy)
  if (childBoundaryCount > 5) {
    score -= 0.1;
  }

  return Math.max(score, 0);
}

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Detect reusable patterns across the design
 */
function detectReusablePatterns(
  rootNode: FigmaNode,
  boundaries: ComponentBoundary[]
): ReusablePattern[] {
  const patterns: ReusablePattern[] = [];

  // Group similar boundaries
  const boundaryGroups = groupSimilarBoundaries(boundaries);

  for (const [groupKey, groupBoundaries] of Array.from(boundaryGroups.entries())) {
    if (groupBoundaries.length < CONFIG.MIN_PATTERN_INSTANCES) {
      continue;
    }

    const representative = groupBoundaries[0];
    const instances: PatternInstance[] = groupBoundaries.map((b, idx) => ({
      nodeId: b.nodeId,
      nodeName: b.name,
      bounds: b.bounds,
      index: idx,
      differences: [], // Would be populated with actual diff analysis
    }));

    // Calculate pattern metrics
    const category = inferPatternCategory(representative);
    const complexity = assessPatternComplexity(representative, rootNode);
    const similarity = calculatePatternSimilarity(groupBoundaries);

    // Calculate reusability score
    const reusabilityScore = calculatePatternReusabilityScore(
      groupBoundaries.length,
      similarity,
      complexity
    );

    // Determine recommendation
    const recommendation = determinePatternRecommendation(
      reusabilityScore,
      complexity,
      groupBoundaries.length
    );

    patterns.push({
      id: `pattern-${groupKey}`,
      name: representative.name,
      suggestedComponentName: representative.suggestedName,
      instances,
      representative: instances[0],
      similarity,
      category,
      variations: [], // Would be populated with variation analysis
      reusabilityScore,
      complexity,
      recommendation,
    });
  }

  // Also detect patterns from repetition analysis on each level
  const additionalPatterns = detectRepetitionPatterns(rootNode);
  patterns.push(...additionalPatterns);

  // Deduplicate and merge patterns
  return deduplicatePatterns(patterns);
}

/**
 * Group similar boundaries together
 */
function groupSimilarBoundaries(
  boundaries: ComponentBoundary[]
): Map<string, ComponentBoundary[]> {
  const groups = new Map<string, ComponentBoundary[]>();

  for (const boundary of boundaries) {
    // Create a grouping key based on name pattern and semantic role
    const normalizedName = normalizeComponentName(boundary.name);
    const key = `${normalizedName}:${boundary.semanticRole}:${boundary.boundaryType}`;

    const existing = groups.get(key) || [];
    existing.push(boundary);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Normalize component name for grouping
 */
function normalizeComponentName(name: string): string {
  // Remove numbers and common suffixes
  return name
    .replace(/\d+/g, "")
    .replace(/[-_\s]+/g, "")
    .toLowerCase()
    .replace(/(copy|instance|variant)$/i, "");
}

/**
 * Infer pattern category from boundary
 */
function inferPatternCategory(boundary: ComponentBoundary): PatternCategory {
  const lowerName = boundary.name.toLowerCase();
  const role = boundary.semanticRole;

  if (role === "card" || lowerName.includes("card")) return "card";
  if (role === "list-item" || lowerName.includes("item")) return "list-item";
  if (lowerName.includes("button") || lowerName.includes("btn")) return "button";
  if (lowerName.includes("input") || lowerName.includes("field")) return "input";
  if (role === "navigation" || lowerName.includes("nav")) return "navigation-item";
  if (role === "tab-bar" || lowerName.includes("tab")) return "tab";
  if (role === "avatar" || lowerName.includes("avatar")) return "avatar";
  if (lowerName.includes("badge") || lowerName.includes("tag")) return "badge";
  if (lowerName.includes("icon")) return "icon-group";

  return "generic";
}

/**
 * Assess pattern complexity
 */
function assessPatternComplexity(
  boundary: ComponentBoundary,
  rootNode: FigmaNode
): PatternComplexity {
  // Find the actual node
  const node = findNodeById(rootNode, boundary.nodeId);
  const childCount = node?.children?.length || 0;
  const depth = boundary.depth;

  // Estimate if interactive
  const hasInteractiveElements = boundary.name.toLowerCase().includes("button") ||
    boundary.name.toLowerCase().includes("input") ||
    boundary.name.toLowerCase().includes("link");

  // Estimate props needed
  const propsNeeded = estimatePropsNeeded(boundary);

  // Determine level
  let level: "simple" | "moderate" | "complex" = "simple";
  if (childCount > 10 || depth > 3 || propsNeeded > 5) {
    level = "complex";
  } else if (childCount > 4 || depth > 2 || propsNeeded > 2) {
    level = "moderate";
  }

  return {
    level,
    childCount,
    depth,
    hasInteractiveElements,
    hasConditionalContent: false, // Would need deeper analysis
    propsNeeded,
  };
}

/**
 * Estimate number of props needed for a component
 */
function estimatePropsNeeded(boundary: ComponentBoundary): number {
  let props = 0;

  // Base props from category
  const category = inferPatternCategory(boundary);
  switch (category) {
    case "button":
      props = 3; // onClick, children, variant
      break;
    case "input":
      props = 4; // value, onChange, placeholder, label
      break;
    case "card":
      props = 3; // title, description, image
      break;
    case "list-item":
      props = 2; // content, onClick
      break;
    case "avatar":
      props = 2; // src, alt
      break;
    case "badge":
      props = 2; // text, variant
      break;
    default:
      props = 1; // children
  }

  // Add based on child count
  props += Math.floor((boundary.childBoundaryIds.length || 0) / 3);

  return props;
}

/**
 * Calculate pattern similarity
 */
function calculatePatternSimilarity(boundaries: ComponentBoundary[]): number {
  if (boundaries.length < 2) return 1;

  const first = boundaries[0];
  let totalSimilarity = 0;

  for (let i = 1; i < boundaries.length; i++) {
    const other = boundaries[i];

    // Compare dimensions
    const widthSim = Math.min(first.bounds.width, other.bounds.width) /
      Math.max(first.bounds.width, other.bounds.width);
    const heightSim = Math.min(first.bounds.height, other.bounds.height) /
      Math.max(first.bounds.height, other.bounds.height);

    // Compare structure
    const structureSim = first.semanticRole === other.semanticRole ? 1 : 0.5;
    const layoutSim = first.layoutPattern === other.layoutPattern ? 1 : 0.5;

    totalSimilarity += (widthSim + heightSim + structureSim + layoutSim) / 4;
  }

  return totalSimilarity / (boundaries.length - 1);
}

/**
 * Calculate pattern reusability score
 */
function calculatePatternReusabilityScore(
  instanceCount: number,
  similarity: number,
  complexity: PatternComplexity
): number {
  let score = 0;

  // More instances = more value in extraction
  score += Math.min(instanceCount / 5, 0.4);

  // Higher similarity = easier to extract
  score += similarity * 0.3;

  // Moderate complexity is ideal (too simple = not worth it, too complex = harder)
  if (complexity.level === "moderate") {
    score += 0.3;
  } else if (complexity.level === "simple") {
    score += 0.15;
  } else {
    score += 0.2;
  }

  return Math.min(score, 1);
}

/**
 * Determine pattern recommendation
 */
function determinePatternRecommendation(
  reusabilityScore: number,
  complexity: PatternComplexity,
  instanceCount: number
): PatternRecommendation {
  if (reusabilityScore >= 0.7 && instanceCount >= 3) {
    return "extract-as-component";
  }

  if (reusabilityScore >= 0.5 || instanceCount >= 4) {
    return "consider-extraction";
  }

  if (complexity.level === "simple" && instanceCount < 3) {
    return "keep-inline";
  }

  if (complexity.hasConditionalContent) {
    return "extract-with-variants";
  }

  return "consider-extraction";
}

/**
 * Detect patterns from repetition analysis
 */
function detectRepetitionPatterns(rootNode: FigmaNode): ReusablePattern[] {
  const patterns: ReusablePattern[] = [];

  function traverse(node: FigmaNode, depth: number) {
    if (node.children && node.children.length >= 2) {
      const repetitionResult = detectRepeatingUnits(node.children);

      if (repetitionResult.hasRepeatingUnits && repetitionResult.items.length >= CONFIG.MIN_PATTERN_INSTANCES) {
        const representative = repetitionResult.representativeUnit;
        if (!representative) {
          return;
        }

        const instances: PatternInstance[] = repetitionResult.items.map((item, idx) => ({
          nodeId: item.nodeId,
          nodeName: item.nodeName,
          bounds: item.bounds,
          index: idx,
          differences: [],
        }));

        const complexity: PatternComplexity = {
          level: representative.childCount > 5 ? "complex" : representative.childCount > 2 ? "moderate" : "simple",
          childCount: representative.childCount,
          depth,
          hasInteractiveElements: false,
          hasConditionalContent: false,
          propsNeeded: 2,
        };

        patterns.push({
          id: `rep-pattern-${node.id}`,
          name: representative.nodeName,
          suggestedComponentName: generateComponentName(representative.nodeName),
          instances,
          representative: instances[0],
          similarity: repetitionResult.similarityScore,
          category: "generic",
          variations: repetitionResult.variations.map((v) => ({
            variationType: v.variationType,
            affectedInstances: [v.itemIndex],
            description: v.description,
          })),
          reusabilityScore: calculatePatternReusabilityScore(
            instances.length,
            repetitionResult.similarityScore,
            complexity
          ),
          complexity,
          recommendation: determinePatternRecommendation(
            repetitionResult.confidence,
            complexity,
            instances.length
          ),
        });
      }

      // Continue traversing
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(rootNode, 0);
  return patterns;
}

/**
 * Deduplicate patterns
 */
function deduplicatePatterns(patterns: ReusablePattern[]): ReusablePattern[] {
  const seen = new Set<string>();
  const result: ReusablePattern[] = [];

  for (const pattern of patterns) {
    const instanceIds = pattern.instances.map((i) => i.nodeId).sort().join(",");
    if (!seen.has(instanceIds)) {
      seen.add(instanceIds);
      result.push(pattern);
    }
  }

  return result;
}

// ============================================================================
// Hierarchy Building
// ============================================================================

/**
 * Build component hierarchy from boundaries and patterns
 */
function buildComponentHierarchy(
  boundaries: ComponentBoundary[],
  patterns: ReusablePattern[],
  rootNode: FigmaNode
): ComponentHierarchy {
  // Create root node
  const rootHierarchyNode: HierarchyNode = {
    id: `hierarchy-${rootNode.id}`,
    name: rootNode.name,
    suggestedComponentName: generateComponentName(rootNode.name) + "Page",
    type: "page",
    depth: 0,
    children: [],
    shouldBeSeparateFile: true,
    estimatedLOC: estimateLOC(rootNode),
  };

  const allNodes: HierarchyNode[] = [rootHierarchyNode];

  // Build hierarchy from top-level boundaries
  const topLevelBoundaries = boundaries.filter((b) => !b.parentBoundaryId);

  for (const boundary of topLevelBoundaries) {
    const hierarchyNode = buildHierarchyNodeFromBoundary(
      boundary,
      boundaries,
      patterns,
      rootHierarchyNode.id,
      1
    );
    rootHierarchyNode.children.push(hierarchyNode);
    allNodes.push(hierarchyNode);
    collectAllNodes(hierarchyNode, allNodes);
  }

  // Calculate max depth
  const maxDepth = allNodes.reduce((max, node) => Math.max(max, node.depth), 0);

  return {
    root: rootHierarchyNode,
    maxDepth,
    allNodes,
  };
}

/**
 * Build hierarchy node from boundary
 */
function buildHierarchyNodeFromBoundary(
  boundary: ComponentBoundary,
  allBoundaries: ComponentBoundary[],
  patterns: ReusablePattern[],
  parentId: string,
  depth: number
): HierarchyNode {
  // Find child boundaries
  const childBoundaries = allBoundaries.filter(
    (b) => b.parentBoundaryId === boundary.id
  );

  // Determine node type
  let type: HierarchyNodeType = "component";
  if (boundary.semanticRole === "header" || boundary.semanticRole === "footer" ||
      boundary.semanticRole === "sidebar" || boundary.semanticRole === "main-content") {
    type = "section";
  }

  // Check if this is a pattern instance
  const matchingPattern = patterns.find((p) =>
    p.instances.some((i) => i.nodeId === boundary.nodeId)
  );
  const patternId = matchingPattern?.id;

  if (matchingPattern) {
    type = "pattern";
  }

  // Determine if should be separate file
  const shouldBeSeparateFile = boundary.extractionRecommendation.shouldExtract &&
    boundary.extractionRecommendation.overallScore >= 0.6;

  const hierarchyNode: HierarchyNode = {
    id: `hierarchy-${boundary.id}`,
    name: boundary.name,
    suggestedComponentName: boundary.suggestedName,
    type,
    boundaryId: boundary.id,
    patternId,
    depth,
    children: [],
    parentId,
    shouldBeSeparateFile,
    estimatedLOC: estimateLOCFromBoundary(boundary),
  };

  // Recursively build children
  for (const childBoundary of childBoundaries) {
    const childNode = buildHierarchyNodeFromBoundary(
      childBoundary,
      allBoundaries,
      patterns,
      hierarchyNode.id,
      depth + 1
    );
    hierarchyNode.children.push(childNode);
  }

  return hierarchyNode;
}

/**
 * Collect all nodes in a hierarchy
 */
function collectAllNodes(node: HierarchyNode, allNodes: HierarchyNode[]) {
  for (const child of node.children) {
    allNodes.push(child);
    collectAllNodes(child, allNodes);
  }
}

// ============================================================================
// Metrics Calculation
// ============================================================================

/**
 * Calculate overall analysis metrics
 */
function calculateMetrics(
  boundaries: ComponentBoundary[],
  patterns: ReusablePattern[],
  hierarchy: ComponentHierarchy,
  rootNode: FigmaNode
): AnalysisMetrics {
  const totalNodes = countNodes(rootNode);
  const totalPatternInstances = patterns.reduce(
    (sum, p) => sum + p.instances.length,
    0
  );

  // Calculate average complexity
  const complexityScores = boundaries.map((b) =>
    b.extractionRecommendation.overallScore
  );
  const averageComplexity = complexityScores.length > 0
    ? complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length
    : 0;

  // Calculate recommended component count
  const recommendedComponents = boundaries.filter(
    (b) => b.extractionRecommendation.shouldExtract
  ).length;

  // Calculate total LOC
  const estimatedTotalLOC = hierarchy.allNodes.reduce(
    (sum, n) => sum + n.estimatedLOC,
    0
  );

  // Calculate reusability ratio
  const reusableInstances = totalPatternInstances;
  const reusabilityRatio = totalNodes > 0
    ? reusableInstances / totalNodes
    : 0;

  return {
    totalNodes,
    boundaryCount: boundaries.length,
    patternCount: patterns.length,
    totalPatternInstances,
    hierarchyDepth: hierarchy.maxDepth,
    averageComplexity,
    recommendedComponentCount: recommendedComponents,
    estimatedTotalLOC,
    reusabilityRatio,
  };
}

/**
 * Count total nodes in a tree
 */
function countNodes(node: FigmaNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// ============================================================================
// Recommendations
// ============================================================================

/**
 * Generate recommendations
 */
function generateRecommendations(
  boundaries: ComponentBoundary[],
  patterns: ReusablePattern[],
  hierarchy: ComponentHierarchy,
  metrics: AnalysisMetrics
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = [];

  // Recommend extracting high-value patterns
  const highValuePatterns = patterns.filter(
    (p) => p.recommendation === "extract-as-component"
  );
  for (const pattern of highValuePatterns) {
    recommendations.push({
      priority: "high",
      type: "extract-component",
      title: `Extract "${pattern.suggestedComponentName}" component`,
      description: `Found ${pattern.instances.length} instances of this pattern with ${Math.round(pattern.similarity * 100)}% similarity. Extracting would reduce code duplication.`,
      affectedBoundaryIds: [],
      affectedPatternIds: [pattern.id],
      actionItems: [
        `Create ${pattern.suggestedComponentName}.tsx file`,
        `Define props interface for customization`,
        `Replace ${pattern.instances.length} inline usages with component`,
      ],
    });
  }

  // Recommend simplifying deep hierarchies
  if (metrics.hierarchyDepth > CONFIG.MAX_RECOMMENDED_DEPTH) {
    const deepNodes = hierarchy.allNodes.filter(
      (n) => n.depth > CONFIG.MAX_RECOMMENDED_DEPTH
    );
    recommendations.push({
      priority: "medium",
      type: "simplify-hierarchy",
      title: "Simplify component hierarchy",
      description: `Hierarchy depth is ${metrics.hierarchyDepth}, which exceeds the recommended ${CONFIG.MAX_RECOMMENDED_DEPTH}. Consider flattening nested components.`,
      affectedBoundaryIds: deepNodes.map((n) => n.boundaryId!).filter(Boolean),
      affectedPatternIds: [],
      actionItems: [
        "Review deeply nested components",
        "Consider combining related components",
        "Move commonly used components to a shared folder",
      ],
    });
  }

  // Recommend extracting boundaries with high confidence
  const highConfidenceBoundaries = boundaries.filter(
    (b) => b.confidence >= 0.8 && b.extractionRecommendation.shouldExtract
  );
  for (const boundary of highConfidenceBoundaries.slice(0, 5)) {
    if (!patterns.some((p) => p.instances.some((i) => i.nodeId === boundary.nodeId))) {
      recommendations.push({
        priority: "medium",
        type: "extract-component",
        title: `Consider extracting "${boundary.suggestedName}"`,
        description: boundary.extractionRecommendation.reason,
        affectedBoundaryIds: [boundary.id],
        affectedPatternIds: [],
        actionItems: [
          `Create ${boundary.suggestedName}.tsx file`,
          `Move component logic to separate file`,
        ],
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a component name from a layer name
 */
function generateComponentName(name: string): string {
  // Remove common prefixes and suffixes
  let clean = name
    .replace(/^(icon|img|image|bg|background)[-_\s]*/i, "")
    .replace(/[-_\s]*(copy|instance|\d+)$/i, "")
    .replace(/\//g, "");

  // Convert to PascalCase
  return clean
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Generate a file name from component name
 */
function generateFileName(componentName: string): string {
  // Convert to kebab-case
  return componentName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase() + ".tsx";
}

/**
 * Extract bounding box from a Figma node
 */
function extractBounds(node: FigmaNode): BoundingBox {
  const bbox = node.absoluteBoundingBox;
  if (!bbox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
  };
}

/**
 * Find a node by ID in a tree
 */
function findNodeById(root: FigmaNode, id: string): FigmaNode | null {
  if (root.id === id) {
    return root;
  }
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Estimate lines of code for a node
 */
function estimateLOC(node: FigmaNode): number {
  const childCount = node.children?.length || 0;

  // Base estimate
  let loc = 10; // imports, function, return statement

  // Add for children
  loc += childCount * 3; // Each child is roughly 3 lines

  // Add for component structure
  if (childCount > 5) {
    loc += 5; // Props interface
  }

  return loc;
}

/**
 * Estimate LOC from boundary
 */
function estimateLOCFromBoundary(boundary: ComponentBoundary): number {
  const childCount = boundary.childBoundaryIds.length;
  return estimateLOC({
    id: boundary.nodeId,
    name: boundary.name,
    type: "FRAME",
    children: new Array(childCount).fill({ id: "", name: "", type: "FRAME" }),
  } as FigmaNode);
}

// ============================================================================
// Exports
// ============================================================================

export {
  analyzeComponentBoundaries,
  analyzeComponentBoundariesWithOptions,
  generateComponentName,
  generateFileName,
  CONFIG as COMPONENT_BOUNDARY_CONFIG,
};
