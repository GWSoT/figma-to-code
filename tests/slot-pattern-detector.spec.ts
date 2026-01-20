/**
 * Unit tests for slot pattern detector
 *
 * Tests slot/children pattern detection in Figma designs and code generation
 * for React, Vue, and Svelte frameworks.
 */

import { describe, it, expect } from "vitest";
import {
  detectSlotPatterns,
  analyzeSlotCompatibility,
  generateSlotDocumentation,
  SLOT_NAME_PATTERNS,
  PLACEHOLDER_PATTERNS,
  CONTAINER_COMPONENT_PATTERNS,
  SLOT_DETECTION_DEFAULTS,
} from "../src/utils/slot-pattern-detector";
import { generateSlotPropsFromNode, generatePropInterface } from "../src/utils/prop-interface-generator";
import { generateSvelteSlotComponent } from "../src/utils/svelte-component-generator";
import { generateVueSlotComponent, generateVueCardComponent } from "../src/utils/vue-slot-generator";
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
  children: FigmaNode[] = []
): FigmaNode {
  return {
    id,
    name,
    type,
    children,
  } as FigmaNode;
}

// ============================================================================
// Slot Pattern Detector Tests
// ============================================================================

describe("slot-pattern-detector", () => {
  describe("module exports", () => {
    it("exports all required functions", () => {
      expect(typeof detectSlotPatterns).toBe("function");
      expect(typeof analyzeSlotCompatibility).toBe("function");
      expect(typeof generateSlotDocumentation).toBe("function");
    });

    it("exports all constants", () => {
      expect(SLOT_NAME_PATTERNS).toBeDefined();
      expect(PLACEHOLDER_PATTERNS).toBeDefined();
      expect(CONTAINER_COMPONENT_PATTERNS).toBeDefined();
      expect(SLOT_DETECTION_DEFAULTS).toBeDefined();
    });
  });

  describe("slot detection from node names", () => {
    it("detects default slot from node named 'Content'", () => {
      const node = createNode("1:1", "Card", "FRAME", [
        createNode("1:2", "Content", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "all",
      });

      expect(result.hasSlots).toBe(true);
      expect(result.slots.length).toBeGreaterThanOrEqual(1);

      const contentSlot = result.slots.find(s => s.nodeName === "Content");
      expect(contentSlot).toBeDefined();
      // Content slots are treated as default/content type - both are valid
      expect(["content", "default"]).toContain(contentSlot?.type);
    });

    it("detects header and footer slots", () => {
      const node = createNode("2:1", "Card", "FRAME", [
        createNode("2:2", "Header", "FRAME"),
        createNode("2:3", "Body", "FRAME"),
        createNode("2:4", "Footer", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "all",
      });

      expect(result.hasSlots).toBe(true);

      const headerSlot = result.slots.find(s => s.type === "header");
      const footerSlot = result.slots.find(s => s.type === "footer");

      expect(headerSlot).toBeDefined();
      expect(footerSlot).toBeDefined();
      expect(headerSlot?.position).toBe("start");
      expect(footerSlot?.position).toBe("end");
    });

    it("detects leading and trailing slots", () => {
      const node = createNode("3:1", "ListItem", "FRAME", [
        createNode("3:2", "Leading", "FRAME"),
        createNode("3:3", "Content", "FRAME"),
        createNode("3:4", "Trailing", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "ListItem",
        useTypeScript: true,
        framework: "all",
      });

      expect(result.hasSlots).toBe(true);

      const leadingSlot = result.slots.find(s => s.type === "leading");
      const trailingSlot = result.slots.find(s => s.type === "trailing");

      expect(leadingSlot).toBeDefined();
      expect(trailingSlot).toBeDefined();
      expect(leadingSlot?.position).toBe("start");
      expect(trailingSlot?.position).toBe("end");
    });

    it("detects icon and actions slots", () => {
      const node = createNode("4:1", "Button", "FRAME", [
        createNode("4:2", "Icon", "FRAME"),
        createNode("4:3", "Label", "TEXT"),
        createNode("4:4", "Actions", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Button",
        useTypeScript: true,
        framework: "all",
      });

      const iconSlot = result.slots.find(s => s.type === "icon");
      const actionsSlot = result.slots.find(s => s.type === "actions");

      expect(iconSlot).toBeDefined();
      expect(actionsSlot).toBeDefined();
      expect(iconSlot?.expectedContentType).toBe("icon");
      expect(actionsSlot?.expectedContentType).toBe("interactive");
    });

    it("detects prefix, suffix, and overlay slots", () => {
      const node = createNode("13:1", "Component", "FRAME", [
        createNode("13:2", "Prefix", "FRAME"),
        createNode("13:3", "Content", "FRAME"),
        createNode("13:4", "Suffix", "FRAME"),
        createNode("13:5", "Overlay", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Component",
        useTypeScript: true,
        framework: "all",
      });

      const prefixSlot = result.slots.find(s => s.type === "prefix");
      const suffixSlot = result.slots.find(s => s.type === "suffix");
      const overlaySlot = result.slots.find(s => s.type === "overlay");

      expect(prefixSlot?.position).toBe("start");
      expect(suffixSlot?.position).toBe("end");
      expect(overlaySlot?.position).toBe("overlay");
    });

    it("handles explicit slot naming convention", () => {
      const node = createNode("8:1", "Component", "FRAME", [
        createNode("8:2", "Slot: Custom Area", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Component",
        useTypeScript: true,
        framework: "all",
      });

      expect(result.hasSlots).toBe(true);
      const customSlot = result.slots.find(s => s.nodeName.includes("Custom"));
      expect(customSlot).toBeDefined();
      expect(customSlot?.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe("container component detection", () => {
    it("detects container components and adds default slot", () => {
      const containerPatterns = ["Card", "Modal", "Dialog", "Panel", "Section"];

      for (const containerName of containerPatterns) {
        const node = createNode(`${containerName}:1`, containerName, "FRAME", [
          createNode(`${containerName}:2`, "Inner Content", "FRAME"),
        ]);

        const result = detectSlotPatterns(node, {
          componentName: containerName,
          useTypeScript: true,
          framework: "all",
        });

        expect(result.hasSlots).toBe(true);
      }
    });
  });

  describe("component type inference", () => {
    it("infers dropdown from trigger and overlay", () => {
      const dialogNode = createNode("14:1", "PopupComponent", "FRAME", [
        createNode("14:2", "Trigger", "FRAME"),
        createNode("14:3", "Overlay", "FRAME"),
      ]);

      const dialogResult = detectSlotPatterns(dialogNode, {
        componentName: "PopupComponent",
        useTypeScript: true,
        framework: "all",
      });

      expect(dialogResult.componentTypeHint).toBe("dropdown");
    });

    it("infers card from header and footer", () => {
      const cardNode = createNode("15:1", "SomeComponent", "FRAME", [
        createNode("15:2", "Header", "FRAME"),
        createNode("15:3", "Content", "FRAME"),
        createNode("15:4", "Footer", "FRAME"),
      ]);

      const cardResult = detectSlotPatterns(cardNode, {
        componentName: "SomeComponent",
        useTypeScript: true,
        framework: "all",
      });

      expect(cardResult.componentTypeHint).toBe("card");
    });
  });

  describe("framework code generation", () => {
    it("generates React slot code", () => {
      const node = createNode("5:1", "Card", "FRAME", [
        createNode("5:2", "Header Slot", "FRAME"),
        createNode("5:3", "Content", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "react",
      });

      const reactCode = result.frameworkCode.react;

      expect(reactCode.propsInterface).toContain("children?:");
      expect(reactCode.propsInterface).toContain("React.ReactNode");
      expect(reactCode.jsx).toContain("{children}");
      expect(reactCode.usageExample).toContain("<Card");
    });

    it("generates Vue slot code", () => {
      const node = createNode("6:1", "Card", "FRAME", [
        createNode("6:2", "Header", "FRAME"),
        createNode("6:3", "Slot", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "vue",
      });

      const vueCode = result.frameworkCode.vue;

      expect(vueCode.template).toContain("<slot");
      expect(vueCode.template).toContain('name="header"');
      expect(vueCode.usageExample).toContain("<Card");
      expect(vueCode.usageExample).toContain("#header");
    });

    it("generates Svelte slot code", () => {
      const node = createNode("7:1", "Card", "FRAME", [
        createNode("7:2", "Header", "FRAME"),
        createNode("7:3", "Content", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "svelte",
      });

      const svelteCode = result.frameworkCode.svelte;

      expect(svelteCode.template).toContain("<slot");
      expect(svelteCode.template).toContain('name="header"');
      expect(svelteCode.usageExample).toContain("<Card");
      expect(svelteCode.usageExample).toContain('slot="header"');
    });
  });

  describe("slot documentation", () => {
    it("generates markdown documentation", () => {
      const node = createNode("9:1", "Card", "FRAME", [
        createNode("9:2", "Header", "FRAME"),
        createNode("9:3", "Content", "FRAME"),
        createNode("9:4", "Footer", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "all",
      });

      const markdownDoc = generateSlotDocumentation(result, "markdown");

      expect(markdownDoc).toContain("## Slots");
      expect(markdownDoc).toContain("### Named Slots");
      expect(markdownDoc).toContain("| Name |");
      expect(markdownDoc).toContain("header");
      expect(markdownDoc).toContain("footer");
    });

    it("generates jsdoc documentation", () => {
      const node = createNode("10:1", "Card", "FRAME", [
        createNode("10:2", "Header", "FRAME"),
      ]);

      const result = detectSlotPatterns(node, {
        componentName: "Card",
        useTypeScript: true,
        framework: "all",
      });

      const jsdocDoc = generateSlotDocumentation(result, "jsdoc");

      expect(jsdocDoc).toContain("/**");
      expect(jsdocDoc).toContain("@slot");
      expect(jsdocDoc).toContain("*/");
    });
  });

  describe("slot compatibility analysis", () => {
    it("analyzes slot compatibility for different frameworks", () => {
      const node = createNode("11:1", "Card", "FRAME", [
        createNode("11:2", "Header", "FRAME"),
        createNode("11:3", "Content", "FRAME"),
      ]);

      const reactResult = analyzeSlotCompatibility(node, "react");
      const vueResult = analyzeSlotCompatibility(node, "vue");
      const svelteResult = analyzeSlotCompatibility(node, "svelte");

      // The function should return valid result objects
      expect(reactResult).toHaveProperty("isCompatible");
      expect(reactResult).toHaveProperty("issues");
      expect(reactResult).toHaveProperty("suggestions");

      expect(vueResult).toHaveProperty("isCompatible");
      expect(svelteResult).toHaveProperty("isCompatible");

      // Arrays should be defined
      expect(Array.isArray(reactResult.issues)).toBe(true);
      expect(Array.isArray(reactResult.suggestions)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles nodes with no slots", () => {
      const node = createNode("12:1", "Icon", "FRAME", []);

      const result = detectSlotPatterns(node, {
        componentName: "Icon",
        useTypeScript: true,
        framework: "all",
      });

      expect(result.overallConfidence).toBeLessThanOrEqual(1);
    });

    it("filters slots by minimum confidence", () => {
      const node = createNode("16:1", "Component", "FRAME", [
        createNode("16:2", "Slot", "FRAME"),
        createNode("16:3", "Wrapper", "FRAME"),
      ]);

      const resultHighConfidence = detectSlotPatterns(node, {
        componentName: "Component",
        useTypeScript: true,
        framework: "all",
        minConfidence: 0.8,
      });

      const resultLowConfidence = detectSlotPatterns(node, {
        componentName: "Component",
        useTypeScript: true,
        framework: "all",
        minConfidence: 0.3,
      });

      expect(resultLowConfidence.slots.length).toBeGreaterThanOrEqual(
        resultHighConfidence.slots.length
      );
    });
  });
});

// ============================================================================
// Prop Interface Generator Slot Integration Tests
// ============================================================================

describe("prop-interface-generator slot integration", () => {
  it("generates slot props from Figma node", () => {
    const node = createNode("20:1", "Card", "FRAME", [
      createNode("20:2", "Header", "FRAME"),
      createNode("20:3", "Content", "FRAME"),
    ]);

    const result = generateSlotPropsFromNode(node, {
      componentName: "Card",
    });

    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.props.length).toBeGreaterThan(0);
    expect(result.react.propsInterface).toContain("React.ReactNode");
  });

  it("generates interface with slot props", () => {
    const node = createNode("21:1", "Dialog", "FRAME", [
      createNode("21:2", "Header", "FRAME"),
      createNode("21:3", "Content", "FRAME"),
      createNode("21:4", "Footer", "FRAME"),
    ]);

    const result = generatePropInterface(null, null, {
      componentName: "Dialog",
      detectSlots: true,
      figmaNode: node,
    });

    expect(result.slotPatternResult).toBeDefined();
    expect(result.slotPatternResult?.hasSlots).toBe(true);
    expect(result.slotProps).toBeDefined();
    expect(result.slotProps?.length).toBeGreaterThan(0);
    expect(result.code).toContain("children?:");
  });
});

// ============================================================================
// Svelte Component Generator Slot Integration Tests
// ============================================================================

describe("svelte-component-generator slot integration", () => {
  it("generates Svelte slot component", () => {
    const node = createNode("30:1", "Card", "FRAME", [
      createNode("30:2", "Header", "FRAME"),
      createNode("30:3", "Content", "FRAME"),
    ]);

    const result = generateSvelteSlotComponent(node, {
      componentName: "Card",
      useTypeScript: true,
      useTailwind: true,
    });

    expect(result.component).toContain("<script");
    expect(result.component).toContain("<slot");
    expect(result.component).toContain('name="header"');
    expect(result.types).toContain("CardProps");
    expect(result.types).toContain("CardSlots");
    expect(result.usageExample).toContain("<Card>");
  });

  it("generates Svelte 5 runes syntax", () => {
    const node = createNode("31:1", "Card", "FRAME", [
      createNode("31:2", "Content", "FRAME"),
    ]);

    const result = generateSvelteSlotComponent(node, {
      componentName: "Card",
      useTypeScript: true,
      useSvelte5Runes: true,
    });

    expect(result.component).toContain("$props()");
    expect(result.component).toContain("interface Props");
    expect(result.component).toContain("Snippet");
  });
});

// ============================================================================
// Vue Slot Generator Tests
// ============================================================================

describe("vue-slot-generator", () => {
  it("generates Vue slot component", () => {
    const node = createNode("40:1", "Card", "FRAME", [
      createNode("40:2", "Header", "FRAME"),
      createNode("40:3", "Content", "FRAME"),
    ]);

    const result = generateVueSlotComponent(node, {
      componentName: "Card",
      useTypeScript: true,
      useTailwind: true,
    });

    expect(result.component).toContain("<script setup");
    expect(result.component).toContain("<template>");
    expect(result.component).toContain("<slot");
    expect(result.template).toContain('name="header"');
    expect(result.types).toContain("CardProps");
    expect(result.types).toContain("CardSlots");
    expect(result.usageExample).toContain("<Card>");
  });

  it("generates Vue defineSlots", () => {
    const node = createNode("41:1", "Dialog", "FRAME", [
      createNode("41:2", "Header", "FRAME"),
      createNode("41:3", "Content", "FRAME"),
      createNode("41:4", "Footer", "FRAME"),
    ]);

    const result = generateVueSlotComponent(node, {
      componentName: "Dialog",
      useTypeScript: true,
    });

    expect(result.scriptSetup).toContain("defineSlots");
    expect(result.scriptSetup).toContain("default");
    expect(result.scriptSetup).toContain("header");
    expect(result.scriptSetup).toContain("footer");
  });

  it("generates Vue card component helper", () => {
    const result = generateVueCardComponent({
      componentName: "CustomCard",
    });

    // The helper generates a working Vue component with slots
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.template).toContain("<slot");
    // Verify component generates valid Vue SFC structure
    expect(result.component).toContain("<script setup");
    expect(result.component).toContain("<template>");
  });
});
