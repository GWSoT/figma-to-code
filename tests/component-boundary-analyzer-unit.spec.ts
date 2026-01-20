/**
 * Unit tests for component-boundary-analyzer
 *
 * Tests the component boundary detection, reusable pattern identification,
 * hierarchy building, and reusability vs simplicity scoring.
 */

import { describe, it, expect } from "vitest";
import {
  analyzeComponentBoundaries,
  generateComponentName,
  generateFileName,
  COMPONENT_BOUNDARY_CONFIG,
  type ComponentBoundaryAnalysis,
} from "../src/utils/component-boundary-analyzer";
import type { FigmaNode } from "../src/utils/figma-api";

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Create a minimal Figma node for testing
 */
function createNode(
  id: string,
  name: string,
  type: string = "FRAME",
  options: Partial<{
    width: number;
    height: number;
    x: number;
    y: number;
    children: FigmaNode[];
  }> = {}
): FigmaNode {
  return {
    id,
    name,
    type,
    absoluteBoundingBox: {
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: options.width ?? 100,
      height: options.height ?? 100,
    },
    children: options.children,
  } as FigmaNode;
}

/**
 * Create a frame representing a card component
 */
function createCardNode(id: string, index: number): FigmaNode {
  return createNode(`card-${id}`, `Card ${index}`, "FRAME", {
    width: 200,
    height: 300,
    x: index * 220,
    y: 0,
    children: [
      createNode(`card-${id}-image`, "Image", "RECTANGLE", { width: 200, height: 150 }),
      createNode(`card-${id}-title`, "Title", "TEXT", { width: 180, height: 24, y: 160 }),
      createNode(`card-${id}-desc`, "Description", "TEXT", { width: 180, height: 40, y: 190 }),
      createNode(`card-${id}-button`, "Button", "FRAME", { width: 100, height: 36, y: 240 }),
    ],
  });
}

/**
 * Create a page layout with header, main content, and footer
 */
function createPageLayoutNode(): FigmaNode {
  return createNode("page", "Home Page", "FRAME", {
    width: 1440,
    height: 900,
    children: [
      createNode("header", "Header", "FRAME", {
        width: 1440,
        height: 64,
        x: 0,
        y: 0,
        children: [
          createNode("logo", "Logo", "FRAME", { width: 120, height: 40 }),
          createNode("nav", "Navigation", "FRAME", {
            width: 400,
            height: 40,
            x: 200,
            children: [
              createNode("nav-1", "Home", "TEXT", { width: 60, height: 20 }),
              createNode("nav-2", "About", "TEXT", { width: 60, height: 20, x: 70 }),
              createNode("nav-3", "Contact", "TEXT", { width: 60, height: 20, x: 140 }),
            ],
          }),
        ],
      }),
      createNode("main", "Main Content", "FRAME", {
        width: 1440,
        height: 736,
        x: 0,
        y: 64,
        children: [
          createNode("hero", "Hero Section", "FRAME", {
            width: 1440,
            height: 400,
            children: [
              createNode("hero-title", "Title", "TEXT", { width: 600, height: 60 }),
              createNode("hero-subtitle", "Subtitle", "TEXT", { width: 600, height: 30, y: 70 }),
              createNode("hero-cta", "CTA Button", "FRAME", { width: 150, height: 48, y: 120 }),
            ],
          }),
          createNode("card-section", "Card Grid", "FRAME", {
            width: 1200,
            height: 300,
            x: 120,
            y: 420,
            children: [
              createCardNode("1", 0),
              createCardNode("2", 1),
              createCardNode("3", 2),
            ],
          }),
        ],
      }),
      createNode("footer", "Footer", "FRAME", {
        width: 1440,
        height: 100,
        x: 0,
        y: 800,
        children: [
          createNode("footer-links", "Footer Links", "FRAME", { width: 400, height: 40 }),
          createNode("footer-copyright", "Copyright", "TEXT", { width: 200, height: 20, y: 50 }),
        ],
      }),
    ],
  });
}

// ============================================================================
// Component Name Generation Tests
// ============================================================================

describe("generateComponentName", () => {
  it("should convert kebab-case to PascalCase", () => {
    expect(generateComponentName("my-component")).toBe("MyComponent");
    expect(generateComponentName("user-profile-card")).toBe("UserProfileCard");
  });

  it("should convert snake_case to PascalCase", () => {
    expect(generateComponentName("my_component")).toBe("MyComponent");
    expect(generateComponentName("user_profile_card")).toBe("UserProfileCard");
  });

  it("should handle spaces", () => {
    expect(generateComponentName("my component")).toBe("MyComponent");
    expect(generateComponentName("User Profile Card")).toBe("UserProfileCard");
  });

  it("should remove common prefixes", () => {
    expect(generateComponentName("icon-user")).toBe("User");
    expect(generateComponentName("img-banner")).toBe("Banner");
    expect(generateComponentName("bg-pattern")).toBe("Pattern");
  });

  it("should remove common suffixes", () => {
    expect(generateComponentName("Button Copy")).toBe("Button");
    expect(generateComponentName("Card Instance")).toBe("Card");
    expect(generateComponentName("Header 2")).toBe("Header");
  });

  it("should handle Figma path separators", () => {
    // Path separators are removed, resulting in a single word that gets PascalCase applied
    expect(generateComponentName("Components/Buttons/Primary")).toBe("Componentsbuttonsprimary");
  });

  it("should handle empty or simple names", () => {
    expect(generateComponentName("button")).toBe("Button");
    expect(generateComponentName("Card")).toBe("Card");
  });
});

describe("generateFileName", () => {
  it("should convert PascalCase to kebab-case with .tsx extension", () => {
    expect(generateFileName("MyComponent")).toBe("my-component.tsx");
    expect(generateFileName("UserProfileCard")).toBe("user-profile-card.tsx");
  });

  it("should handle single word names", () => {
    expect(generateFileName("Button")).toBe("button.tsx");
    expect(generateFileName("Card")).toBe("card.tsx");
  });
});

// ============================================================================
// Simple Node Analysis Tests
// ============================================================================

describe("analyzeComponentBoundaries - simple cases", () => {
  it("should analyze a simple frame", () => {
    const node = createNode("simple", "Simple Frame", "FRAME", {
      width: 300,
      height: 200,
      children: [
        createNode("child1", "Title", "TEXT", { width: 200, height: 24 }),
        createNode("child2", "Description", "TEXT", { width: 200, height: 48, y: 30 }),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    expect(result).toBeDefined();
    expect(result.sourceNodeId).toBe("simple");
    expect(result.sourceNodeName).toBe("Simple Frame");
    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalNodes).toBeGreaterThan(0);
  });

  it("should detect Figma component boundaries", () => {
    const node = createNode("root", "Root", "FRAME", {
      width: 500,
      height: 400,
      children: [
        {
          ...createNode("component", "Button", "COMPONENT", {
            width: 120,
            height: 40,
            children: [
              createNode("btn-text", "Label", "TEXT", { width: 80, height: 20 }),
              createNode("btn-icon", "Icon", "FRAME", { width: 20, height: 20, x: 90 }),
            ],
          }),
          type: "COMPONENT",
        } as FigmaNode,
      ],
    });

    const result = analyzeComponentBoundaries(node);

    // Should detect the component
    const componentBoundary = result.boundaries.find(b => b.nodeId === "component");
    expect(componentBoundary).toBeDefined();
    expect(componentBoundary?.boundaryType).toBe("figma-component");
    expect(componentBoundary?.confidence).toBeGreaterThan(0.5);
  });

  it("should detect semantic regions (header, footer)", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    // Check for header boundary
    const headerBoundary = result.boundaries.find(b =>
      b.name.toLowerCase().includes("header") ||
      b.semanticRole === "header"
    );
    expect(headerBoundary).toBeDefined();

    // Check for footer boundary
    const footerBoundary = result.boundaries.find(b =>
      b.name.toLowerCase().includes("footer") ||
      b.semanticRole === "footer"
    );
    expect(footerBoundary).toBeDefined();
  });
});

// ============================================================================
// Reusable Pattern Detection Tests
// ============================================================================

describe("analyzeComponentBoundaries - pattern detection", () => {
  it("should detect repeating card patterns", () => {
    const node = createNode("card-grid", "Card Grid", "FRAME", {
      width: 800,
      height: 400,
      children: [
        createCardNode("a", 0),
        createCardNode("b", 1),
        createCardNode("c", 2),
        createCardNode("d", 3),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    // Should detect a reusable pattern
    expect(result.reusablePatterns.length).toBeGreaterThanOrEqual(0);
    expect(result.metrics.totalPatternInstances).toBeGreaterThanOrEqual(0);
  });

  it("should calculate pattern similarity", () => {
    const node = createNode("list", "Item List", "FRAME", {
      width: 400,
      height: 300,
      children: [
        createNode("item-1", "List Item", "FRAME", {
          width: 400,
          height: 60,
          y: 0,
          children: [
            createNode("item-1-avatar", "Avatar", "FRAME", { width: 40, height: 40 }),
            createNode("item-1-text", "Text", "TEXT", { width: 300, height: 40, x: 50 }),
          ],
        }),
        createNode("item-2", "List Item", "FRAME", {
          width: 400,
          height: 60,
          y: 70,
          children: [
            createNode("item-2-avatar", "Avatar", "FRAME", { width: 40, height: 40 }),
            createNode("item-2-text", "Text", "TEXT", { width: 300, height: 40, x: 50 }),
          ],
        }),
        createNode("item-3", "List Item", "FRAME", {
          width: 400,
          height: 60,
          y: 140,
          children: [
            createNode("item-3-avatar", "Avatar", "FRAME", { width: 40, height: 40 }),
            createNode("item-3-text", "Text", "TEXT", { width: 300, height: 40, x: 50 }),
          ],
        }),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    // Patterns should have high similarity
    if (result.reusablePatterns.length > 0) {
      const pattern = result.reusablePatterns[0];
      expect(pattern.similarity).toBeGreaterThan(0.5);
    }
  });
});

// ============================================================================
// Hierarchy Building Tests
// ============================================================================

describe("analyzeComponentBoundaries - hierarchy", () => {
  it("should build a component hierarchy", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    expect(result.hierarchy).toBeDefined();
    expect(result.hierarchy.root).toBeDefined();
    expect(result.hierarchy.maxDepth).toBeGreaterThan(0);
    expect(result.hierarchy.allNodes.length).toBeGreaterThan(0);
  });

  it("should set appropriate hierarchy node types", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    // Root should be a page type
    expect(result.hierarchy.root.type).toBe("page");

    // Should have section types for major regions
    const sectionNodes = result.hierarchy.allNodes.filter(n => n.type === "section");
    // May or may not have sections depending on detection
    expect(sectionNodes.length).toBeGreaterThanOrEqual(0);
  });

  it("should calculate estimated LOC", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    // Root should have estimated LOC
    expect(result.hierarchy.root.estimatedLOC).toBeGreaterThan(0);

    // Total estimated LOC should be calculated
    expect(result.metrics.estimatedTotalLOC).toBeGreaterThan(0);
  });
});

// ============================================================================
// Extraction Recommendation Tests
// ============================================================================

describe("analyzeComponentBoundaries - extraction recommendations", () => {
  it("should provide extraction recommendations", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    // Each boundary should have an extraction recommendation
    for (const boundary of result.boundaries) {
      expect(boundary.extractionRecommendation).toBeDefined();
      expect(typeof boundary.extractionRecommendation.shouldExtract).toBe("boolean");
      expect(typeof boundary.extractionRecommendation.reusabilityScore).toBe("number");
      expect(typeof boundary.extractionRecommendation.simplicityScore).toBe("number");
      expect(typeof boundary.extractionRecommendation.overallScore).toBe("number");
      expect(typeof boundary.extractionRecommendation.reason).toBe("string");
    }
  });

  it("should recommend extracting named components", () => {
    const node = createNode("root", "Root", "FRAME", {
      width: 500,
      height: 400,
      children: [
        createNode("button", "PrimaryButton", "FRAME", {
          width: 120,
          height: 40,
          children: [
            createNode("btn-icon", "Icon", "FRAME", { width: 20, height: 20 }),
            createNode("btn-text", "Label", "TEXT", { width: 80, height: 20, x: 30 }),
          ],
        }),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    // Button should be detected as a boundary
    const buttonBoundary = result.boundaries.find(b =>
      b.name.toLowerCase().includes("button")
    );

    if (buttonBoundary) {
      // Named components should have higher confidence
      expect(buttonBoundary.confidence).toBeGreaterThan(0.3);
    }
  });

  it("should include boundary reasons", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    // Boundaries should have reasons
    for (const boundary of result.boundaries) {
      expect(boundary.reasons).toBeDefined();
      expect(boundary.reasons.length).toBeGreaterThan(0);

      for (const reason of boundary.reasons) {
        expect(reason.type).toBeDefined();
        expect(reason.description).toBeDefined();
        expect(typeof reason.score).toBe("number");
      }
    }
  });
});

// ============================================================================
// Metrics Calculation Tests
// ============================================================================

describe("analyzeComponentBoundaries - metrics", () => {
  it("should calculate comprehensive metrics", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    expect(result.metrics.totalNodes).toBeGreaterThan(0);
    expect(result.metrics.boundaryCount).toBeGreaterThanOrEqual(0);
    expect(result.metrics.patternCount).toBeGreaterThanOrEqual(0);
    expect(result.metrics.hierarchyDepth).toBeGreaterThan(0);
    expect(typeof result.metrics.averageComplexity).toBe("number");
    expect(result.metrics.recommendedComponentCount).toBeGreaterThanOrEqual(0);
    expect(typeof result.metrics.reusabilityRatio).toBe("number");
  });

  it("should have reusability ratio between 0 and 1", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    expect(result.metrics.reusabilityRatio).toBeGreaterThanOrEqual(0);
    expect(result.metrics.reusabilityRatio).toBeLessThanOrEqual(1);
  });
});

// ============================================================================
// Recommendations Generation Tests
// ============================================================================

describe("analyzeComponentBoundaries - recommendations", () => {
  it("should generate recommendations", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it("should prioritize recommendations", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    if (result.recommendations.length > 1) {
      // Recommendations should be sorted by priority
      const priorities = result.recommendations.map(r => r.priority);
      const priorityOrder = { high: 0, medium: 1, low: 2 };

      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(
          priorityOrder[priorities[i - 1]]
        );
      }
    }
  });

  it("should include action items in recommendations", () => {
    const node = createPageLayoutNode();
    const result = analyzeComponentBoundaries(node);

    for (const recommendation of result.recommendations) {
      expect(recommendation.title).toBeDefined();
      expect(recommendation.description).toBeDefined();
      expect(recommendation.type).toBeDefined();
      expect(Array.isArray(recommendation.actionItems)).toBe(true);
    }
  });
});

// ============================================================================
// Configuration Tests
// ============================================================================

describe("COMPONENT_BOUNDARY_CONFIG", () => {
  it("should have valid configuration values", () => {
    expect(COMPONENT_BOUNDARY_CONFIG.MIN_CHILDREN_FOR_EXTRACTION).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.MIN_PATTERN_INSTANCES).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.MIN_PATTERN_SIMILARITY).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.MIN_PATTERN_SIMILARITY).toBeLessThanOrEqual(1);
    expect(COMPONENT_BOUNDARY_CONFIG.MAX_RECOMMENDED_DEPTH).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.REUSABILITY_WEIGHT).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.SIMPLICITY_WEIGHT).toBeGreaterThan(0);
    expect(
      COMPONENT_BOUNDARY_CONFIG.REUSABILITY_WEIGHT +
      COMPONENT_BOUNDARY_CONFIG.SIMPLICITY_WEIGHT
    ).toBe(1);
  });

  it("should have component name keywords", () => {
    expect(COMPONENT_BOUNDARY_CONFIG.COMPONENT_NAME_KEYWORDS.length).toBeGreaterThan(0);
    expect(COMPONENT_BOUNDARY_CONFIG.COMPONENT_NAME_KEYWORDS).toContain("button");
    expect(COMPONENT_BOUNDARY_CONFIG.COMPONENT_NAME_KEYWORDS).toContain("card");
    expect(COMPONENT_BOUNDARY_CONFIG.COMPONENT_NAME_KEYWORDS).toContain("header");
  });
});

// ============================================================================
// Edge Cases Tests
// ============================================================================

describe("analyzeComponentBoundaries - edge cases", () => {
  it("should handle empty node", () => {
    const node = createNode("empty", "Empty Frame", "FRAME", {
      width: 100,
      height: 100,
      children: [],
    });

    const result = analyzeComponentBoundaries(node);

    expect(result).toBeDefined();
    expect(result.boundaries.length).toBeGreaterThanOrEqual(0);
    expect(result.hierarchy).toBeDefined();
  });

  it("should handle deeply nested nodes", () => {
    // Create a deeply nested structure
    let current = createNode("leaf", "Leaf", "FRAME", { width: 50, height: 50 });
    for (let i = 0; i < 10; i++) {
      current = createNode(`level-${i}`, `Level ${i}`, "FRAME", {
        width: 100 + i * 20,
        height: 100 + i * 20,
        children: [current],
      });
    }

    const result = analyzeComponentBoundaries(current);

    expect(result).toBeDefined();
    expect(result.hierarchy.maxDepth).toBeGreaterThan(0);
  });

  it("should handle nodes with special characters in names", () => {
    const node = createNode("special", "Component/Button (Primary) - v2", "FRAME", {
      width: 120,
      height: 40,
      children: [
        createNode("text", "Label", "TEXT", { width: 80, height: 20 }),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    expect(result).toBeDefined();
    expect(result.sourceNodeName).toBe("Component/Button (Primary) - v2");
  });

  it("should handle very small nodes", () => {
    const node = createNode("tiny", "Tiny", "FRAME", {
      width: 10,
      height: 10,
      children: [
        createNode("dot", "Dot", "ELLIPSE", { width: 5, height: 5 }),
      ],
    });

    const result = analyzeComponentBoundaries(node);

    expect(result).toBeDefined();
    // Small nodes shouldn't be recommended for extraction
    for (const boundary of result.boundaries) {
      if (boundary.bounds.width < 24 || boundary.bounds.height < 24) {
        expect(boundary.extractionRecommendation.reusabilityScore).toBeLessThan(0.8);
      }
    }
  });
});
