/**
 * Repetition Detector - Identifies Repeated Elements in Figma Designs
 *
 * Analyzes child nodes to detect repeating patterns based on:
 * - Structural similarity (same node types, similar child counts)
 * - Dimensional similarity (similar widths, heights, aspect ratios)
 * - Spatial patterns (consistent spacing, alignment)
 * - Visual hierarchy (similar internal structure)
 */

import type { FigmaNode } from "./figma-api";
import type { BoundingBox, NodeLayoutAnalysis } from "./layout-analyzer";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Result of repeating unit detection */
export interface RepeatingUnitResult {
  /** Whether repeating units were detected */
  hasRepeatingUnits: boolean;
  /** The detected repeating items */
  items: RepeatingItem[];
  /** The representative unit (template) */
  representativeUnit: RepeatingItem | null;
  /** Detected variations between items */
  variations: ItemVariation[];
  /** Overall similarity score (0-1) */
  similarityScore: number;
  /** Arrangement type */
  arrangement: ArrangementType;
  /** Spacing information */
  spacing: SpacingInfo;
  /** Confidence in the detection */
  confidence: number;
}

/** A single repeating item */
export interface RepeatingItem {
  nodeId: string;
  nodeName: string;
  bounds: BoundingBox;
  nodeType: string;
  childCount: number;
  /** Structural fingerprint for comparison */
  structureHash: string;
  /** Index in the sequence */
  index: number;
  /** Similarity to representative unit */
  similarityToRepresentative: number;
}

/** Variation detected in a repeating item */
export interface ItemVariation {
  itemIndex: number;
  nodeId: string;
  variationType: VariationType;
  description: string;
  /** Path to the differing element within the item */
  elementPath?: string;
}

/** Types of variations that can occur */
export type VariationType =
  | "text-content"
  | "image-content"
  | "color-variation"
  | "size-variation"
  | "missing-element"
  | "extra-element"
  | "state-variation";

/** Arrangement type for repeating elements */
export type ArrangementType = "grid" | "horizontal-list" | "vertical-list" | "masonry" | "unknown";

/** Spacing information for the arrangement */
export interface SpacingInfo {
  horizontalGap: number;
  verticalGap: number;
  isUniformHorizontal: boolean;
  isUniformVertical: boolean;
  columns?: number;
  rows?: number;
}

/** Structural similarity metrics */
interface StructuralMetrics {
  typeMatch: boolean;
  childCountSimilarity: number;
  depthSimilarity: number;
  structureHashMatch: boolean;
}

/** Dimensional similarity metrics */
interface DimensionalMetrics {
  widthSimilarity: number;
  heightSimilarity: number;
  aspectRatioSimilarity: number;
}

// ============================================================================
// Configuration Constants
// ============================================================================

const CONFIG = {
  /** Minimum items to consider as repeating pattern */
  MIN_REPEATING_ITEMS: 2,
  /** Threshold for considering items similar (0-1) */
  SIMILARITY_THRESHOLD: 0.7,
  /** Weight for structural similarity in overall score */
  STRUCTURAL_WEIGHT: 0.4,
  /** Weight for dimensional similarity in overall score */
  DIMENSIONAL_WEIGHT: 0.4,
  /** Weight for spacing consistency in overall score */
  SPACING_WEIGHT: 0.2,
  /** Tolerance for gap uniformity (percentage) */
  GAP_TOLERANCE: 0.2,
  /** Tolerance for dimension matching (percentage) */
  DIMENSION_TOLERANCE: 0.15,
  /** Y-position tolerance for row detection (pixels) */
  ROW_Y_TOLERANCE: 10,
  /** X-position tolerance for column detection (pixels) */
  COLUMN_X_TOLERANCE: 10,
} as const;

// ============================================================================
// Main Detection Functions
// ============================================================================

/**
 * Detect repeating units among child nodes
 */
export function detectRepeatingUnits(
  children: FigmaNode[],
  parentBounds?: BoundingBox
): RepeatingUnitResult {
  // Filter to nodes with valid bounds
  const validChildren = children.filter((child) => child.absoluteBoundingBox);

  if (validChildren.length < CONFIG.MIN_REPEATING_ITEMS) {
    return createEmptyResult();
  }

  // Extract items with metadata
  const items = validChildren.map((child, index) =>
    extractRepeatingItem(child, index)
  );

  // Find groups of similar items
  const similarGroups = findSimilarGroups(items);

  // Find the largest group of similar items
  const largestGroup = findLargestSimilarGroup(similarGroups, items);

  if (largestGroup.length < CONFIG.MIN_REPEATING_ITEMS) {
    return createEmptyResult();
  }

  // Get the items in the largest group
  const repeatingItems = largestGroup.map((idx) => items[idx]);

  // Select representative unit (first item in sequence)
  const representativeUnit = repeatingItems[0];

  // Calculate similarity scores
  const similarityScore = calculateGroupSimilarity(repeatingItems);

  // Detect variations
  const variations = detectVariations(repeatingItems, representativeUnit);

  // Detect arrangement
  const arrangement = detectArrangement(repeatingItems);

  // Calculate spacing
  const spacing = calculateSpacing(repeatingItems, arrangement);

  // Update similarity to representative for each item
  for (const item of repeatingItems) {
    item.similarityToRepresentative = calculateItemSimilarity(
      item,
      representativeUnit
    );
  }

  // Calculate confidence
  const confidence = calculateConfidence(
    repeatingItems,
    similarityScore,
    spacing
  );

  return {
    hasRepeatingUnits: true,
    items: repeatingItems,
    representativeUnit,
    variations,
    similarityScore,
    arrangement,
    spacing,
    confidence,
  };
}

/**
 * Detect repeating units from layout analysis results
 */
export function detectRepeatingUnitsFromAnalysis(
  analyses: NodeLayoutAnalysis[]
): RepeatingUnitResult {
  if (analyses.length < CONFIG.MIN_REPEATING_ITEMS) {
    return createEmptyResult();
  }

  // Convert analyses to repeating items
  const items: RepeatingItem[] = analyses.map((analysis, index) => ({
    nodeId: analysis.nodeId,
    nodeName: analysis.nodeName,
    bounds: analysis.bounds,
    nodeType: analysis.semanticRole,
    childCount: analysis.children?.length || 0,
    structureHash: generateAnalysisHash(analysis),
    index,
    similarityToRepresentative: 1,
  }));

  // Find groups of similar items
  const similarGroups = findSimilarGroups(items);
  const largestGroup = findLargestSimilarGroup(similarGroups, items);

  if (largestGroup.length < CONFIG.MIN_REPEATING_ITEMS) {
    return createEmptyResult();
  }

  const repeatingItems = largestGroup.map((idx) => items[idx]);
  const representativeUnit = repeatingItems[0];
  const similarityScore = calculateGroupSimilarity(repeatingItems);
  const variations = detectVariations(repeatingItems, representativeUnit);
  const arrangement = detectArrangement(repeatingItems);
  const spacing = calculateSpacing(repeatingItems, arrangement);

  for (const item of repeatingItems) {
    item.similarityToRepresentative = calculateItemSimilarity(
      item,
      representativeUnit
    );
  }

  const confidence = calculateConfidence(
    repeatingItems,
    similarityScore,
    spacing
  );

  return {
    hasRepeatingUnits: true,
    items: repeatingItems,
    representativeUnit,
    variations,
    similarityScore,
    arrangement,
    spacing,
    confidence,
  };
}

// ============================================================================
// Item Extraction and Hashing
// ============================================================================

/**
 * Extract repeating item metadata from a Figma node
 */
function extractRepeatingItem(node: FigmaNode, index: number): RepeatingItem {
  const bounds = node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };

  return {
    nodeId: node.id,
    nodeName: node.name,
    bounds: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    },
    nodeType: node.type,
    childCount: node.children?.length || 0,
    structureHash: generateStructureHash(node),
    index,
    similarityToRepresentative: 1,
  };
}

/**
 * Generate a structural hash for a Figma node
 * This captures the hierarchical structure for comparison
 */
function generateStructureHash(node: FigmaNode): string {
  const parts: string[] = [node.type];

  if (node.children) {
    // Include child count and types
    parts.push(`c${node.children.length}`);

    // Hash first few children for structure signature
    const childTypes = node.children
      .slice(0, 5)
      .map((c) => c.type)
      .join(",");
    parts.push(childTypes);

    // Include depth signature
    const maxDepth = getMaxDepth(node, 0);
    parts.push(`d${maxDepth}`);
  }

  return parts.join("|");
}

/**
 * Generate structure hash from layout analysis
 */
function generateAnalysisHash(analysis: NodeLayoutAnalysis): string {
  const parts: string[] = [analysis.semanticRole, analysis.layoutPattern];

  if (analysis.children) {
    parts.push(`c${analysis.children.length}`);
    const childRoles = analysis.children
      .slice(0, 5)
      .map((c) => c.semanticRole)
      .join(",");
    parts.push(childRoles);
  }

  return parts.join("|");
}

/**
 * Get maximum depth of a node tree
 */
function getMaxDepth(node: FigmaNode, currentDepth: number): number {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }

  let maxChildDepth = currentDepth;
  for (const child of node.children) {
    const childDepth = getMaxDepth(child, currentDepth + 1);
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth;
    }
  }

  return maxChildDepth;
}

// ============================================================================
// Similarity Calculation
// ============================================================================

/**
 * Find groups of similar items using clustering
 */
function findSimilarGroups(items: RepeatingItem[]): Map<string, number[]> {
  const groups = new Map<string, number[]>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let foundGroup = false;

    // Check against existing groups
    const entries = Array.from(groups.entries());
    for (const [groupKey, indices] of entries) {
      const representativeIdx = indices[0];
      const representative = items[representativeIdx];

      const similarity = calculateItemSimilarity(item, representative);

      if (similarity >= CONFIG.SIMILARITY_THRESHOLD) {
        indices.push(i);
        foundGroup = true;
        break;
      }
    }

    // Create new group if no match found
    if (!foundGroup) {
      groups.set(`group_${i}`, [i]);
    }
  }

  return groups;
}

/**
 * Find the largest group of similar items
 */
function findLargestSimilarGroup(
  groups: Map<string, number[]>,
  items: RepeatingItem[]
): number[] {
  let largestGroup: number[] = [];

  const values = Array.from(groups.values());
  for (const indices of values) {
    if (indices.length > largestGroup.length) {
      largestGroup = indices;
    }
  }

  return largestGroup;
}

/**
 * Calculate similarity between two items
 */
function calculateItemSimilarity(
  item1: RepeatingItem,
  item2: RepeatingItem
): number {
  const structural = calculateStructuralSimilarity(item1, item2);
  const dimensional = calculateDimensionalSimilarity(item1, item2);

  return (
    structural * CONFIG.STRUCTURAL_WEIGHT +
    dimensional * CONFIG.DIMENSIONAL_WEIGHT +
    (1 - CONFIG.STRUCTURAL_WEIGHT - CONFIG.DIMENSIONAL_WEIGHT)
  );
}

/**
 * Calculate structural similarity between items
 */
function calculateStructuralSimilarity(
  item1: RepeatingItem,
  item2: RepeatingItem
): number {
  const metrics: StructuralMetrics = {
    typeMatch: item1.nodeType === item2.nodeType,
    childCountSimilarity: calculateCountSimilarity(
      item1.childCount,
      item2.childCount
    ),
    depthSimilarity: 1, // Will be calculated from hash
    structureHashMatch: item1.structureHash === item2.structureHash,
  };

  // Calculate hash similarity if not exact match
  if (!metrics.structureHashMatch) {
    metrics.depthSimilarity = calculateHashSimilarity(
      item1.structureHash,
      item2.structureHash
    );
  }

  let score = 0;
  let weight = 0;

  if (metrics.typeMatch) {
    score += 0.3;
  }
  weight += 0.3;

  score += metrics.childCountSimilarity * 0.2;
  weight += 0.2;

  score += metrics.depthSimilarity * 0.2;
  weight += 0.2;

  if (metrics.structureHashMatch) {
    score += 0.3;
  } else {
    score += metrics.depthSimilarity * 0.15;
  }
  weight += 0.3;

  return score / weight;
}

/**
 * Calculate dimensional similarity between items
 */
function calculateDimensionalSimilarity(
  item1: RepeatingItem,
  item2: RepeatingItem
): number {
  const metrics: DimensionalMetrics = {
    widthSimilarity: calculateDimensionSimilarity(
      item1.bounds.width,
      item2.bounds.width
    ),
    heightSimilarity: calculateDimensionSimilarity(
      item1.bounds.height,
      item2.bounds.height
    ),
    aspectRatioSimilarity: calculateAspectRatioSimilarity(
      item1.bounds,
      item2.bounds
    ),
  };

  return (
    (metrics.widthSimilarity + metrics.heightSimilarity + metrics.aspectRatioSimilarity) /
    3
  );
}

/**
 * Calculate similarity between two counts
 */
function calculateCountSimilarity(count1: number, count2: number): number {
  if (count1 === 0 && count2 === 0) return 1;
  if (count1 === 0 || count2 === 0) return 0;

  const max = Math.max(count1, count2);
  const min = Math.min(count1, count2);

  return min / max;
}

/**
 * Calculate similarity between two dimensions
 */
function calculateDimensionSimilarity(dim1: number, dim2: number): number {
  if (dim1 === 0 && dim2 === 0) return 1;
  if (dim1 === 0 || dim2 === 0) return 0;

  const max = Math.max(dim1, dim2);
  const min = Math.min(dim1, dim2);
  const ratio = min / max;

  return ratio >= 1 - CONFIG.DIMENSION_TOLERANCE ? 1 : ratio;
}

/**
 * Calculate similarity between aspect ratios
 */
function calculateAspectRatioSimilarity(
  bounds1: BoundingBox,
  bounds2: BoundingBox
): number {
  const ratio1 = bounds1.height !== 0 ? bounds1.width / bounds1.height : 1;
  const ratio2 = bounds2.height !== 0 ? bounds2.width / bounds2.height : 1;

  return calculateDimensionSimilarity(ratio1, ratio2);
}

/**
 * Calculate similarity between structure hashes
 */
function calculateHashSimilarity(hash1: string, hash2: string): number {
  const parts1 = hash1.split("|");
  const parts2 = hash2.split("|");

  let matches = 0;
  const maxParts = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxParts; i++) {
    if (parts1[i] === parts2[i]) {
      matches++;
    }
  }

  return matches / maxParts;
}

/**
 * Calculate overall similarity of a group
 */
function calculateGroupSimilarity(items: RepeatingItem[]): number {
  if (items.length < 2) return 1;

  const representative = items[0];
  let totalSimilarity = 0;

  for (let i = 1; i < items.length; i++) {
    totalSimilarity += calculateItemSimilarity(items[i], representative);
  }

  return totalSimilarity / (items.length - 1);
}

// ============================================================================
// Variation Detection
// ============================================================================

/**
 * Detect variations in repeating items compared to representative
 */
function detectVariations(
  items: RepeatingItem[],
  representative: RepeatingItem
): ItemVariation[] {
  const variations: ItemVariation[] = [];

  for (const item of items) {
    if (item.nodeId === representative.nodeId) continue;

    // Check for size variations
    const widthDiff = Math.abs(item.bounds.width - representative.bounds.width);
    const heightDiff = Math.abs(item.bounds.height - representative.bounds.height);

    if (widthDiff > representative.bounds.width * CONFIG.DIMENSION_TOLERANCE ||
        heightDiff > representative.bounds.height * CONFIG.DIMENSION_TOLERANCE) {
      variations.push({
        itemIndex: item.index,
        nodeId: item.nodeId,
        variationType: "size-variation",
        description: `Size differs: ${Math.round(item.bounds.width)}x${Math.round(item.bounds.height)} vs ${Math.round(representative.bounds.width)}x${Math.round(representative.bounds.height)}`,
      });
    }

    // Check for structural variations
    if (item.childCount !== representative.childCount) {
      if (item.childCount < representative.childCount) {
        variations.push({
          itemIndex: item.index,
          nodeId: item.nodeId,
          variationType: "missing-element",
          description: `Missing ${representative.childCount - item.childCount} child elements`,
        });
      } else {
        variations.push({
          itemIndex: item.index,
          nodeId: item.nodeId,
          variationType: "extra-element",
          description: `Has ${item.childCount - representative.childCount} extra child elements`,
        });
      }
    }

    // Check for hash mismatches (structural differences)
    if (item.structureHash !== representative.structureHash) {
      const hashSim = calculateHashSimilarity(
        item.structureHash,
        representative.structureHash
      );
      if (hashSim < 0.9) {
        variations.push({
          itemIndex: item.index,
          nodeId: item.nodeId,
          variationType: "state-variation",
          description: `Structural differences detected (${Math.round(hashSim * 100)}% match)`,
        });
      }
    }
  }

  return variations;
}

// ============================================================================
// Arrangement Detection
// ============================================================================

/**
 * Detect the arrangement type of repeating items
 */
function detectArrangement(items: RepeatingItem[]): ArrangementType {
  if (items.length < 2) return "unknown";

  // Group by Y position (rows)
  const rows = groupByPosition(items, "y", CONFIG.ROW_Y_TOLERANCE);

  // Group by X position (columns)
  const columns = groupByPosition(items, "x", CONFIG.COLUMN_X_TOLERANCE);

  const rowCount = rows.size;
  const columnCount = columns.size;

  // Grid: multiple rows AND multiple columns
  if (rowCount >= 2 && columnCount >= 2) {
    // Check if it's a proper grid (items per row is consistent)
    const rowSizes = Array.from(rows.values()).map((r) => r.length);
    const isRegularGrid = areValuesUniform(rowSizes, 0.5);

    if (isRegularGrid) {
      return "grid";
    }
    return "masonry";
  }

  // Single row: horizontal list
  if (rowCount === 1 && columnCount > 1) {
    return "horizontal-list";
  }

  // Single column: vertical list
  if (columnCount === 1 && rowCount > 1) {
    return "vertical-list";
  }

  // Multiple rows but arranged vertically
  if (rowCount > 1) {
    return "vertical-list";
  }

  return "unknown";
}

/**
 * Group items by position (x or y)
 */
function groupByPosition(
  items: RepeatingItem[],
  axis: "x" | "y",
  tolerance: number
): Map<number, RepeatingItem[]> {
  const groups = new Map<number, RepeatingItem[]>();

  for (const item of items) {
    const position = item.bounds[axis];
    let foundGroup = false;

    const entries = Array.from(groups.entries());
    for (const [groupPos, groupItems] of entries) {
      if (Math.abs(position - groupPos) <= tolerance) {
        groupItems.push(item);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.set(position, [item]);
    }
  }

  return groups;
}

/**
 * Check if values are uniform within tolerance
 */
function areValuesUniform(values: number[], tolerance: number): boolean {
  if (values.length < 2) return true;

  const max = Math.max(...values);
  const min = Math.min(...values);

  if (max === 0) return true;

  return (max - min) / max <= tolerance;
}

// ============================================================================
// Spacing Calculation
// ============================================================================

/**
 * Calculate spacing information for the arrangement
 */
function calculateSpacing(
  items: RepeatingItem[],
  arrangement: ArrangementType
): SpacingInfo {
  const horizontalGaps: number[] = [];
  const verticalGaps: number[] = [];

  // Sort by position for gap calculation
  const sortedByX = [...items].sort((a, b) => a.bounds.x - b.bounds.x);
  const sortedByY = [...items].sort((a, b) => a.bounds.y - b.bounds.y);

  // Group by rows for accurate horizontal gap calculation
  const rows = groupByPosition(items, "y", CONFIG.ROW_Y_TOLERANCE);

  const rowValues = Array.from(rows.values());
  for (const rowItems of rowValues) {
    const sorted = [...rowItems].sort((a, b) => a.bounds.x - b.bounds.x);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].bounds.x - (sorted[i - 1].bounds.x + sorted[i - 1].bounds.width);
      if (gap >= 0) {
        horizontalGaps.push(gap);
      }
    }
  }

  // Group by columns for accurate vertical gap calculation
  const columns = groupByPosition(items, "x", CONFIG.COLUMN_X_TOLERANCE);

  const colValues = Array.from(columns.values());
  for (const colItems of colValues) {
    const sorted = [...colItems].sort((a, b) => a.bounds.y - b.bounds.y);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].bounds.y - (sorted[i - 1].bounds.y + sorted[i - 1].bounds.height);
      if (gap >= 0) {
        verticalGaps.push(gap);
      }
    }
  }

  const avgHorizontalGap =
    horizontalGaps.length > 0
      ? horizontalGaps.reduce((a, b) => a + b, 0) / horizontalGaps.length
      : 0;

  const avgVerticalGap =
    verticalGaps.length > 0
      ? verticalGaps.reduce((a, b) => a + b, 0) / verticalGaps.length
      : 0;

  return {
    horizontalGap: Math.round(avgHorizontalGap),
    verticalGap: Math.round(avgVerticalGap),
    isUniformHorizontal: areGapsUniform(horizontalGaps),
    isUniformVertical: areGapsUniform(verticalGaps),
    columns: columns.size > 1 ? columns.size : undefined,
    rows: rows.size > 1 ? rows.size : undefined,
  };
}

/**
 * Check if gaps are uniform
 */
function areGapsUniform(gaps: number[]): boolean {
  if (gaps.length < 2) return true;

  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  if (avg === 0) return true;

  const tolerance = avg * CONFIG.GAP_TOLERANCE;
  return gaps.every((gap) => Math.abs(gap - avg) <= tolerance);
}

// ============================================================================
// Confidence Calculation
// ============================================================================

/**
 * Calculate overall confidence in the detection
 */
function calculateConfidence(
  items: RepeatingItem[],
  similarityScore: number,
  spacing: SpacingInfo
): number {
  let confidence = 0;

  // Base confidence from similarity score
  confidence += similarityScore * 0.5;

  // Bonus for uniform spacing
  if (spacing.isUniformHorizontal || spacing.isUniformVertical) {
    confidence += 0.15;
  }
  if (spacing.isUniformHorizontal && spacing.isUniformVertical) {
    confidence += 0.1;
  }

  // Bonus for more items (stronger pattern)
  if (items.length >= 4) {
    confidence += 0.1;
  }
  if (items.length >= 6) {
    confidence += 0.05;
  }

  // Bonus for clear grid structure
  if (spacing.columns && spacing.columns >= 2 && spacing.rows && spacing.rows >= 2) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an empty result for when no repeating units are found
 */
function createEmptyResult(): RepeatingUnitResult {
  return {
    hasRepeatingUnits: false,
    items: [],
    representativeUnit: null,
    variations: [],
    similarityScore: 0,
    arrangement: "unknown",
    spacing: {
      horizontalGap: 0,
      verticalGap: 0,
      isUniformHorizontal: false,
      isUniformVertical: false,
    },
    confidence: 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { CONFIG as REPETITION_CONFIG };
