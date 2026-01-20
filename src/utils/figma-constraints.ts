/**
 * Figma Constraint Parser and CSS Generator
 *
 * This module handles parsing Figma constraint settings (left, right, top, bottom, center, scale)
 * for non-auto-layout frames and translates them to appropriate CSS positioning strategies.
 */

import type { FigmaNode } from "./figma-api";

// Figma constraint values as per Figma API
export type HorizontalConstraint =
  | "LEFT"
  | "RIGHT"
  | "CENTER"
  | "LEFT_RIGHT"
  | "SCALE";

export type VerticalConstraint =
  | "TOP"
  | "BOTTOM"
  | "CENTER"
  | "TOP_BOTTOM"
  | "SCALE";

export interface FigmaConstraints {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
}

// Extended node interface with additional properties needed for constraint calculation
export interface ConstraintNode {
  id: string;
  name: string;
  constraints?: FigmaConstraints;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Parent frame dimensions for relative positioning calculations
  parentBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// CSS positioning properties generated from constraints
export interface CSSPositioning {
  position: "absolute" | "relative" | "static";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  transform?: string;
}

// Complete CSS output including positioning and sizing
export interface ConstraintCSSOutput {
  positioning: CSSPositioning;
  // Additional context about the constraint translation
  constraintType: "fixed" | "stretch" | "center" | "scale";
  horizontalStrategy: string;
  verticalStrategy: string;
}

// Default constraints if none specified (Figma defaults to TOP-LEFT)
export const DEFAULT_CONSTRAINTS: FigmaConstraints = {
  horizontal: "LEFT",
  vertical: "TOP",
};

/**
 * Parse constraint values from a Figma node
 */
export function parseConstraints(node: FigmaNode): FigmaConstraints {
  if (!node.constraints) {
    return DEFAULT_CONSTRAINTS;
  }

  return {
    horizontal: normalizeHorizontalConstraint(node.constraints.horizontal),
    vertical: normalizeVerticalConstraint(node.constraints.vertical),
  };
}

/**
 * Normalize horizontal constraint string to typed value
 */
function normalizeHorizontalConstraint(value: string): HorizontalConstraint {
  const normalized = value.toUpperCase();
  switch (normalized) {
    case "LEFT":
    case "MIN":
      return "LEFT";
    case "RIGHT":
    case "MAX":
      return "RIGHT";
    case "CENTER":
      return "CENTER";
    case "LEFT_RIGHT":
    case "STRETCH":
      return "LEFT_RIGHT";
    case "SCALE":
      return "SCALE";
    default:
      return "LEFT";
  }
}

/**
 * Normalize vertical constraint string to typed value
 */
function normalizeVerticalConstraint(value: string): VerticalConstraint {
  const normalized = value.toUpperCase();
  switch (normalized) {
    case "TOP":
    case "MIN":
      return "TOP";
    case "BOTTOM":
    case "MAX":
      return "BOTTOM";
    case "CENTER":
      return "CENTER";
    case "TOP_BOTTOM":
    case "STRETCH":
      return "TOP_BOTTOM";
    case "SCALE":
      return "SCALE";
    default:
      return "TOP";
  }
}

/**
 * Calculate the relative position of a node within its parent
 */
export function calculateRelativePosition(node: ConstraintNode): {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
} | null {
  if (!node.absoluteBoundingBox || !node.parentBounds) {
    return null;
  }

  const { x: nodeX, y: nodeY, width, height } = node.absoluteBoundingBox;
  const {
    x: parentX,
    y: parentY,
    width: parentWidth,
    height: parentHeight,
  } = node.parentBounds;

  // Calculate offsets relative to parent
  const left = nodeX - parentX;
  const top = nodeY - parentY;
  const right = parentWidth - (left + width);
  const bottom = parentHeight - (top + height);

  return { top, right, bottom, left, width, height };
}

/**
 * Generate CSS positioning from Figma constraints
 */
export function generateConstraintCSS(
  node: ConstraintNode,
  constraints?: FigmaConstraints
): ConstraintCSSOutput {
  const effectiveConstraints = constraints || DEFAULT_CONSTRAINTS;
  const relativePos = calculateRelativePosition(node);

  const positioning: CSSPositioning = {
    position: "absolute",
  };

  let horizontalStrategy = "";
  let verticalStrategy = "";
  let constraintType: "fixed" | "stretch" | "center" | "scale" = "fixed";

  // Handle horizontal constraint
  switch (effectiveConstraints.horizontal) {
    case "LEFT":
      if (relativePos) {
        positioning.left = `${relativePos.left}px`;
        positioning.width = `${relativePos.width}px`;
      }
      horizontalStrategy = "fixed-left";
      break;

    case "RIGHT":
      if (relativePos) {
        positioning.right = `${relativePos.right}px`;
        positioning.width = `${relativePos.width}px`;
      }
      horizontalStrategy = "fixed-right";
      break;

    case "CENTER":
      if (relativePos && node.parentBounds) {
        // Calculate center offset
        const centerX =
          relativePos.left + relativePos.width / 2 - node.parentBounds.width / 2;
        positioning.left = "50%";
        positioning.transform = `translateX(calc(-50% + ${centerX}px))`;
        positioning.width = `${relativePos.width}px`;
      } else {
        positioning.left = "50%";
        positioning.transform = "translateX(-50%)";
      }
      horizontalStrategy = "center-horizontal";
      constraintType = "center";
      break;

    case "LEFT_RIGHT":
      if (relativePos) {
        positioning.left = `${relativePos.left}px`;
        positioning.right = `${relativePos.right}px`;
        // Width is determined by left and right, not explicitly set
      }
      horizontalStrategy = "stretch-horizontal";
      constraintType = "stretch";
      break;

    case "SCALE":
      if (relativePos && node.parentBounds) {
        // Calculate percentages for scale
        const leftPercent = (relativePos.left / node.parentBounds.width) * 100;
        const widthPercent = (relativePos.width / node.parentBounds.width) * 100;
        positioning.left = `${leftPercent.toFixed(2)}%`;
        positioning.width = `${widthPercent.toFixed(2)}%`;
      }
      horizontalStrategy = "scale-horizontal";
      constraintType = "scale";
      break;
  }

  // Handle vertical constraint
  switch (effectiveConstraints.vertical) {
    case "TOP":
      if (relativePos) {
        positioning.top = `${relativePos.top}px`;
        if (!positioning.height) {
          positioning.height = `${relativePos.height}px`;
        }
      }
      verticalStrategy = "fixed-top";
      break;

    case "BOTTOM":
      if (relativePos) {
        positioning.bottom = `${relativePos.bottom}px`;
        if (!positioning.height) {
          positioning.height = `${relativePos.height}px`;
        }
      }
      verticalStrategy = "fixed-bottom";
      break;

    case "CENTER":
      if (relativePos && node.parentBounds) {
        // Calculate center offset
        const centerY =
          relativePos.top + relativePos.height / 2 - node.parentBounds.height / 2;
        positioning.top = "50%";
        // Combine transforms if horizontal is also centered
        if (
          positioning.transform &&
          positioning.transform.includes("translateX")
        ) {
          positioning.transform = positioning.transform.replace(
            "translateX",
            `translateY(calc(-50% + ${centerY}px)) translateX`
          );
        } else {
          positioning.transform = `translateY(calc(-50% + ${centerY}px))`;
        }
        if (!positioning.height) {
          positioning.height = `${relativePos.height}px`;
        }
      } else {
        positioning.top = "50%";
        if (positioning.transform) {
          positioning.transform = `translateY(-50%) ${positioning.transform}`;
        } else {
          positioning.transform = "translateY(-50%)";
        }
      }
      verticalStrategy = "center-vertical";
      if (constraintType !== "stretch" && constraintType !== "scale") {
        constraintType = "center";
      }
      break;

    case "TOP_BOTTOM":
      if (relativePos) {
        positioning.top = `${relativePos.top}px`;
        positioning.bottom = `${relativePos.bottom}px`;
        // Height is determined by top and bottom, not explicitly set
        delete positioning.height;
      }
      verticalStrategy = "stretch-vertical";
      constraintType = "stretch";
      break;

    case "SCALE":
      if (relativePos && node.parentBounds) {
        // Calculate percentages for scale
        const topPercent = (relativePos.top / node.parentBounds.height) * 100;
        const heightPercent =
          (relativePos.height / node.parentBounds.height) * 100;
        positioning.top = `${topPercent.toFixed(2)}%`;
        positioning.height = `${heightPercent.toFixed(2)}%`;
      }
      verticalStrategy = "scale-vertical";
      constraintType = "scale";
      break;
  }

  return {
    positioning,
    constraintType,
    horizontalStrategy,
    verticalStrategy,
  };
}

/**
 * Convert CSS positioning to Tailwind classes where possible
 */
export function constraintCSSToTailwind(css: CSSPositioning): {
  classes: string[];
  inlineStyles: Record<string, string>;
} {
  const classes: string[] = [];
  const inlineStyles: Record<string, string> = {};

  // Position class
  if (css.position === "absolute") {
    classes.push("absolute");
  } else if (css.position === "relative") {
    classes.push("relative");
  }

  // Handle positioning with Tailwind utilities where possible
  if (css.left === "0px" || css.left === "0") {
    classes.push("left-0");
  } else if (css.left === "50%") {
    classes.push("left-1/2");
  } else if (css.left) {
    inlineStyles.left = css.left;
  }

  if (css.right === "0px" || css.right === "0") {
    classes.push("right-0");
  } else if (css.right) {
    inlineStyles.right = css.right;
  }

  if (css.top === "0px" || css.top === "0") {
    classes.push("top-0");
  } else if (css.top === "50%") {
    classes.push("top-1/2");
  } else if (css.top) {
    inlineStyles.top = css.top;
  }

  if (css.bottom === "0px" || css.bottom === "0") {
    classes.push("bottom-0");
  } else if (css.bottom) {
    inlineStyles.bottom = css.bottom;
  }

  // Transform
  if (css.transform === "translateX(-50%)") {
    classes.push("-translate-x-1/2");
  } else if (css.transform === "translateY(-50%)") {
    classes.push("-translate-y-1/2");
  } else if (
    css.transform === "translateY(-50%) translateX(-50%)" ||
    css.transform === "translate(-50%, -50%)"
  ) {
    classes.push("-translate-x-1/2", "-translate-y-1/2");
  } else if (css.transform) {
    inlineStyles.transform = css.transform;
  }

  // Width and height need inline styles for specific pixel values
  if (css.width) {
    inlineStyles.width = css.width;
  }
  if (css.height) {
    inlineStyles.height = css.height;
  }

  return { classes, inlineStyles };
}

// Types for mixed constraint analysis
export interface ChildConstraintInfo {
  nodeId: string;
  nodeName: string;
  constraints: FigmaConstraints;
  cssOutput: ConstraintCSSOutput;
}

export interface MixedConstraintAnalysis {
  hasConstraints: boolean;
  allSameConstraints: boolean;
  constraintGroups: Map<string, ChildConstraintInfo[]>;
  children: ChildConstraintInfo[];
  parentRequiresRelative: boolean;
}

/**
 * Analyze mixed constraint modes within a parent frame
 * This helps determine if special handling is needed for frames with children
 * that have different constraint configurations
 */
export function analyzeMixedConstraints(
  parentNode: FigmaNode,
  childNodes: FigmaNode[]
): MixedConstraintAnalysis {
  const children: ChildConstraintInfo[] = [];
  const constraintGroups = new Map<string, ChildConstraintInfo[]>();

  for (const child of childNodes) {
    const constraints = parseConstraints(child);
    const constraintKey = `${constraints.horizontal}-${constraints.vertical}`;

    // Create a constraint node with parent bounds for CSS calculation
    const constraintNode: ConstraintNode = {
      id: child.id,
      name: child.name,
      constraints,
      absoluteBoundingBox: child.absoluteBoundingBox,
      parentBounds: parentNode.absoluteBoundingBox,
    };

    const cssOutput = generateConstraintCSS(constraintNode, constraints);

    const childInfo: ChildConstraintInfo = {
      nodeId: child.id,
      nodeName: child.name,
      constraints,
      cssOutput,
    };

    children.push(childInfo);

    // Group by constraint combination
    const existing = constraintGroups.get(constraintKey) || [];
    existing.push(childInfo);
    constraintGroups.set(constraintKey, existing);
  }

  const hasConstraints = children.length > 0;
  const allSameConstraints = constraintGroups.size <= 1;

  // Parent requires position: relative if any child uses absolute positioning
  const parentRequiresRelative = children.some(
    (child) => child.cssOutput.positioning.position === "absolute"
  );

  return {
    hasConstraints,
    allSameConstraints,
    constraintGroups,
    children,
    parentRequiresRelative,
  };
}

/**
 * Generate CSS for a parent frame that contains constrained children
 */
export function generateParentFrameCSS(
  analysis: MixedConstraintAnalysis
): CSSPositioning {
  return {
    position: analysis.parentRequiresRelative ? "relative" : "static",
  };
}

/**
 * Check if a frame uses auto-layout (constraints don't apply)
 */
export function isAutoLayoutFrame(node: FigmaNode): boolean {
  // Auto-layout frames have layoutMode property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extendedNode = node as any;
  return (
    extendedNode.layoutMode === "HORIZONTAL" ||
    extendedNode.layoutMode === "VERTICAL"
  );
}

/**
 * Determine if constraints should be used for a node
 * Constraints only apply to direct children of non-auto-layout frames
 */
export function shouldUseConstraints(
  node: FigmaNode,
  parentNode?: FigmaNode
): boolean {
  // No parent means top-level frame - constraints don't apply
  if (!parentNode) {
    return false;
  }

  // Constraints don't apply if parent uses auto-layout
  if (isAutoLayoutFrame(parentNode)) {
    return false;
  }

  // Node must have constraints defined
  if (!node.constraints) {
    return false;
  }

  return true;
}

/**
 * Convert a constraint CSS output to inline style string
 */
export function constraintCSSToStyleString(css: CSSPositioning): string {
  const styles: string[] = [];

  if (css.position && css.position !== "static") {
    styles.push(`position: ${css.position}`);
  }
  if (css.top) styles.push(`top: ${css.top}`);
  if (css.right) styles.push(`right: ${css.right}`);
  if (css.bottom) styles.push(`bottom: ${css.bottom}`);
  if (css.left) styles.push(`left: ${css.left}`);
  if (css.width) styles.push(`width: ${css.width}`);
  if (css.height) styles.push(`height: ${css.height}`);
  if (css.transform) styles.push(`transform: ${css.transform}`);

  return styles.join("; ");
}

/**
 * Generate a complete code snippet for a constrained element
 */
export function generateConstrainedElementCode(
  node: ConstraintNode,
  options: {
    useTailwind?: boolean;
    elementType?: string;
  } = {}
): string {
  const { useTailwind = true, elementType = "div" } = options;
  const constraints = node.constraints || DEFAULT_CONSTRAINTS;
  const cssOutput = generateConstraintCSS(node, constraints);

  if (useTailwind) {
    const { classes, inlineStyles } = constraintCSSToTailwind(
      cssOutput.positioning
    );

    const classAttr = classes.length > 0 ? ` className="${classes.join(" ")}"` : "";

    const styleAttr =
      Object.keys(inlineStyles).length > 0
        ? ` style={{ ${Object.entries(inlineStyles)
            .map(([k, v]) => `${k}: "${v}"`)
            .join(", ")} }}`
        : "";

    return `<${elementType}${classAttr}${styleAttr}>
  {/* ${node.name} */}
</${elementType}>`;
  }

  // Plain CSS version
  const styleString = constraintCSSToStyleString(cssOutput.positioning);
  return `<${elementType} style="${styleString}">
  <!-- ${node.name} -->
</${elementType}>`;
}
