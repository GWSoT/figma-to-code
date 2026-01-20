/**
 * Playwright verification tests for Figma Component Variant Handler
 *
 * Tests the complete variant handling functionality including:
 * - Variant property detection
 * - Boolean, enum, and multi-select variant types
 * - Compound variant generation
 * - Code generation (CVA, styled-components, TypeScript)
 */

import { test, expect } from "@playwright/test";

// Configure test to not need web server
test.use({
  baseURL: undefined,
});

test.describe("figma-variant-handler module exports", () => {
  test("exports all required functions and types", async () => {
    const module = await import("../src/utils/figma-variant-handler.js");

    // Verify main exports
    expect(typeof module.analyzeComponentVariants).toBe("function");
    expect(typeof module.processComponentVariants).toBe("function");
    expect(typeof module.extractVariantPropsFromInstance).toBe("function");
    expect(typeof module.mapVariantToProps).toBe("function");
    expect(typeof module.normalizePropertyName).toBe("function");
    expect(typeof module.detectPropertyType).toBe("function");
    expect(typeof module.detectDefaultValue).toBe("function");
    expect(typeof module.generateTypeString).toBe("function");
  });
});

test.describe("variant property detection", () => {
  test("detects boolean variant properties", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    // Exact boolean pairs
    expect(detectPropertyType("isDisabled", ["true", "false"])).toBe("boolean");
    expect(detectPropertyType("Show Icon", ["yes", "no"])).toBe("boolean");
    expect(detectPropertyType("Active", ["on", "off"])).toBe("boolean");
    expect(detectPropertyType("State", ["enabled", "disabled"])).toBe("boolean");

    // Boolean prefix patterns
    expect(detectPropertyType("isLoading", ["true", "false"])).toBe("boolean");
    expect(detectPropertyType("hasIcon", ["true", "false"])).toBe("boolean");
    expect(detectPropertyType("withLabel", ["true", "false"])).toBe("boolean");
  });

  test("detects size variant properties", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    expect(detectPropertyType("Size", ["sm", "md", "lg"])).toBe("size");
    expect(detectPropertyType("Size", ["small", "medium", "large"])).toBe("size");
    expect(detectPropertyType("Size", ["xs", "sm", "md", "lg", "xl"])).toBe("size");
    expect(detectPropertyType("Scale", ["compact", "default", "comfortable"])).toBe("size");
  });

  test("detects state variant properties", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    expect(detectPropertyType("State", ["default", "hover", "focus"])).toBe("state");
    expect(detectPropertyType("Status", ["default", "error", "success"])).toBe("state");
    expect(detectPropertyType("Mode", ["default", "disabled", "loading"])).toBe("state");
  });

  test("detects color/theme variant properties", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    expect(detectPropertyType("Color", ["primary", "secondary", "error"])).toBe("color");
    expect(detectPropertyType("Theme", ["primary", "neutral", "success"])).toBe("color");
    expect(detectPropertyType("Intent", ["primary", "warning", "info"])).toBe("color");
  });

  test("detects style variant properties", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    expect(detectPropertyType("Variant", ["filled", "outlined", "ghost"])).toBe("style");
    expect(detectPropertyType("Type", ["contained", "outlined", "text"])).toBe("style");
    expect(detectPropertyType("Style", ["solid", "outlined", "link"])).toBe("style");
  });

  test("falls back to enum for unknown patterns", async () => {
    const { detectPropertyType } = await import("../src/utils/figma-variant-handler.js");

    expect(detectPropertyType("CustomProp", ["option1", "option2", "option3"])).toBe("enum");
    expect(detectPropertyType("Layout", ["horizontal", "vertical", "grid"])).toBe("enum");
  });
});

test.describe("property name normalization", () => {
  test("normalizes property names to camelCase", async () => {
    const { normalizePropertyName } = await import("../src/utils/figma-variant-handler.js");

    expect(normalizePropertyName("Size")).toBe("size");
    expect(normalizePropertyName("Is Disabled")).toBe("isDisabled");
    expect(normalizePropertyName("has-icon")).toBe("hasIcon");
    expect(normalizePropertyName("SHOW_LABEL")).toBe("showLabel");
    expect(normalizePropertyName("button-type")).toBe("buttonType");
    expect(normalizePropertyName("Primary Color")).toBe("primaryColor");
  });
});

test.describe("default value detection", () => {
  test("detects default values for boolean properties", async () => {
    const { detectDefaultValue } = await import("../src/utils/figma-variant-handler.js");

    // Boolean with "is" prefix defaults to false
    expect(detectDefaultValue("isDisabled", ["true", "false"], "boolean")).toBe("false");

    // Boolean with "has" prefix defaults to false
    expect(detectDefaultValue("hasIcon", ["yes", "no"], "boolean")).toBe("no");
  });

  test("detects default values for size properties", async () => {
    const { detectDefaultValue } = await import("../src/utils/figma-variant-handler.js");

    expect(detectDefaultValue("Size", ["sm", "md", "lg"], "size")).toBe("md");
    expect(detectDefaultValue("Size", ["small", "medium", "large"], "size")).toBe("medium");
  });

  test("detects default values for state properties", async () => {
    const { detectDefaultValue } = await import("../src/utils/figma-variant-handler.js");

    expect(detectDefaultValue("State", ["default", "hover", "focus"], "state")).toBe("default");
    expect(detectDefaultValue("Status", ["normal", "error"], "state")).toBe("normal");
  });

  test("detects default values for color properties", async () => {
    const { detectDefaultValue } = await import("../src/utils/figma-variant-handler.js");

    expect(detectDefaultValue("Color", ["primary", "secondary", "error"], "color")).toBe("primary");
    expect(detectDefaultValue("Theme", ["neutral", "success"], "color")).toBe("neutral");
  });

  test("falls back to first value when no default found", async () => {
    const { detectDefaultValue } = await import("../src/utils/figma-variant-handler.js");

    expect(detectDefaultValue("Custom", ["optionA", "optionB"], "enum")).toBe("optionA");
  });
});

test.describe("TypeScript type generation", () => {
  test("generates boolean type", async () => {
    const { generateTypeString } = await import("../src/utils/figma-variant-handler.js");

    expect(generateTypeString("boolean", ["true", "false"])).toBe("boolean");
  });

  test("generates union type for enums", async () => {
    const { generateTypeString } = await import("../src/utils/figma-variant-handler.js");

    expect(generateTypeString("enum", ["sm", "md", "lg"])).toBe('"sm" | "md" | "lg"');
    expect(generateTypeString("size", ["small", "medium", "large"])).toBe(
      '"small" | "medium" | "large"'
    );
    expect(generateTypeString("color", ["primary", "secondary"])).toBe('"primary" | "secondary"');
  });
});

test.describe("component variant analysis", () => {
  test("analyzes component set with multiple variant properties", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    // Mock component set node
    const componentSetNode = {
      id: "1:1",
      name: "Button",
      type: "COMPONENT_SET",
    } as any;

    // Mock child variant nodes
    const childVariants = [
      { id: "1:2", name: "Size=sm, Variant=primary, State=default", type: "COMPONENT" },
      { id: "1:3", name: "Size=md, Variant=primary, State=default", type: "COMPONENT" },
      { id: "1:4", name: "Size=lg, Variant=primary, State=default", type: "COMPONENT" },
      { id: "1:5", name: "Size=md, Variant=secondary, State=default", type: "COMPONENT" },
      { id: "1:6", name: "Size=md, Variant=primary, State=hover", type: "COMPONENT" },
      { id: "1:7", name: "Size=md, Variant=primary, State=disabled", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Verify properties were detected
    expect(result.properties.length).toBe(3);
    expect(result.properties.map((p) => p.propName).sort()).toEqual(
      ["size", "state", "variant"].sort()
    );

    // Verify Size property
    const sizeProp = result.properties.find((p) => p.propName === "size");
    expect(sizeProp?.type).toBe("size");
    expect(sizeProp?.values.sort()).toEqual(["lg", "md", "sm"].sort());
    expect(sizeProp?.defaultValue).toBe("md");

    // Verify Variant property
    const variantProp = result.properties.find((p) => p.propName === "variant");
    expect(variantProp?.type).toBe("enum");
    expect(variantProp?.values.sort()).toEqual(["primary", "secondary"].sort());

    // Verify State property
    const stateProp = result.properties.find((p) => p.propName === "state");
    expect(stateProp?.type).toBe("state");
    expect(stateProp?.values.sort()).toEqual(["default", "disabled", "hover"].sort());

    // Verify variants were built
    expect(result.variants.length).toBe(6);

    // Verify code generation
    expect(result.propsInterface).toContain("export interface ButtonProps");
    expect(result.propsInterface).toContain("size");
    expect(result.propsInterface).toContain("variant");
    expect(result.propsInterface).toContain("state");

    // Verify CVA config generation
    expect(result.cvaConfig).toContain("cva(");
    expect(result.cvaConfig).toContain("variants:");
    expect(result.cvaConfig).toContain("defaultVariants:");

    // Verify styled variants generation
    expect(result.styledVariants).toContain("styled.div");
    expect(result.styledVariants).toContain("css`");
  });

  test("handles boolean properties correctly", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = {
      id: "2:1",
      name: "IconButton",
      type: "COMPONENT_SET",
    } as any;

    const childVariants = [
      { id: "2:2", name: "Has Icon=true, Is Disabled=false", type: "COMPONENT" },
      { id: "2:3", name: "Has Icon=false, Is Disabled=false", type: "COMPONENT" },
      { id: "2:4", name: "Has Icon=true, Is Disabled=true", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Verify both properties are boolean
    const hasIconProp = result.properties.find((p) => p.propName === "hasIcon");
    expect(hasIconProp?.type).toBe("boolean");
    expect(hasIconProp?.typeString).toBe("boolean");

    const isDisabledProp = result.properties.find((p) => p.propName === "isDisabled");
    expect(isDisabledProp?.type).toBe("boolean");
    expect(isDisabledProp?.typeString).toBe("boolean");
  });
});

test.describe("variant instance extraction", () => {
  test("extracts variant props from instance node name", async () => {
    const { extractVariantPropsFromInstance } = await import(
      "../src/utils/figma-variant-handler.js"
    );

    const instanceNode = {
      id: "3:1",
      name: "Size=lg, Variant=secondary, State=hover",
      type: "INSTANCE",
    } as any;

    const props = extractVariantPropsFromInstance(instanceNode);

    expect(props.size).toBe("lg");
    expect(props.variant).toBe("secondary");
    expect(props.state).toBe("hover");
  });

  test("extracts variant props from component properties", async () => {
    const { extractVariantPropsFromInstance } = await import(
      "../src/utils/figma-variant-handler.js"
    );

    const instanceNode = {
      id: "3:2",
      name: "Button",
      type: "INSTANCE",
      componentProperties: {
        Size: { type: "VARIANT", value: "md" },
        "Is Disabled": { type: "BOOLEAN", value: true },
      },
    } as any;

    const props = extractVariantPropsFromInstance(instanceNode);

    expect(props.size).toBe("md");
    expect(props.isDisabled).toBe("true");
  });
});

test.describe("variant to props mapping", () => {
  test("maps variant info to typed props", async () => {
    const { mapVariantToProps, analyzeComponentVariants } = await import(
      "../src/utils/figma-variant-handler.js"
    );

    // First analyze to get property definitions
    const componentSetNode = { id: "4:1", name: "Toggle", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "4:2", name: "Checked=true, Size=sm", type: "COMPONENT" },
      { id: "4:3", name: "Checked=false, Size=md", type: "COMPONENT" },
    ] as any[];

    const analysis = analyzeComponentVariants(componentSetNode, childVariants);

    // Create variant info
    const variantInfo = {
      nodeId: "4:2",
      name: "Checked=true, Size=sm",
      properties: { checked: "true", size: "sm" },
      state: "default" as const,
    };

    const props = mapVariantToProps(variantInfo, analysis.properties);

    // Boolean should be converted
    expect(props.checked).toBe(true);
    // String should remain string
    expect(props.size).toBe("sm");
  });
});

test.describe("code generation output", () => {
  test("generates valid TypeScript props interface", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "5:1", name: "Card", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "5:2", name: "Variant=elevated, Size=md", type: "COMPONENT" },
      { id: "5:3", name: "Variant=outlined, Size=lg", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Check interface structure
    expect(result.propsInterface).toContain("export interface CardProps");
    expect(result.propsInterface).toContain("variant");
    expect(result.propsInterface).toContain("size");
    expect(result.propsInterface).toContain("@default");
  });

  test("generates valid CVA configuration", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "6:1", name: "Alert", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "6:2", name: "Intent=info, Size=sm", type: "COMPONENT" },
      { id: "6:3", name: "Intent=warning, Size=md", type: "COMPONENT" },
      { id: "6:4", name: "Intent=error, Size=lg", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Check CVA structure
    expect(result.cvaConfig).toContain('import { cva, type VariantProps }');
    expect(result.cvaConfig).toContain("alertVariants = cva(");
    expect(result.cvaConfig).toContain("variants:");
    expect(result.cvaConfig).toContain("intent:");
    expect(result.cvaConfig).toContain("size:");
    expect(result.cvaConfig).toContain("defaultVariants:");
  });

  test("generates valid styled-components code", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "7:1", name: "Badge", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "7:2", name: "Color=primary, Size=sm", type: "COMPONENT" },
      { id: "7:3", name: "Color=secondary, Size=md", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Check styled-components structure
    expect(result.styledVariants).toContain("import styled, { css }");
    expect(result.styledVariants).toContain("StyledBadge = styled.div");
    expect(result.styledVariants).toContain("${({");
    expect(result.styledVariants).toContain("css`");
  });
});

test.describe("integration with styled-components-generator", () => {
  test("generateVariantAwareComponent produces complete output", async () => {
    const { generateVariantAwareComponent } = await import(
      "../src/utils/styled-components-generator.js"
    );
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    // Analyze variants first
    const componentSetNode = { id: "8:1", name: "Button", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "8:2", name: "Size=sm, Variant=primary", type: "COMPONENT" },
      { id: "8:3", name: "Size=md, Variant=secondary", type: "COMPONENT" },
    ] as any[];

    const variantAnalysis = analyzeComponentVariants(componentSetNode, childVariants);

    // Generate component with variants
    const baseProps = {
      layoutMode: "HORIZONTAL",
      gap: 8,
      padding: { top: 8, right: 16, bottom: 8, left: 16 },
      cornerRadius: 6,
    };

    const result = generateVariantAwareComponent(
      "Button",
      "button",
      baseProps as any,
      variantAnalysis,
      {
        library: "styled-components",
        useTypeScript: true,
        generateTheme: true,
      } as any
    );

    // Verify all outputs
    expect(result.component).toContain("export const Button = styled.button");
    expect(result.component).toContain("/* Base styles */");
    expect(result.component).toContain("display: flex;");
    expect(result.component).toContain("css`");

    expect(result.types).toContain("export interface ButtonProps");
    expect(result.types).toContain("size");
    expect(result.types).toContain("variant");

    expect(result.theme).toContain("export const lightTheme");
    expect(result.themeProvider).toContain("ThemeProvider");
    expect(result.helpers).toContain("export const media");
  });

  test("generates Emotion output with variants", async () => {
    const { generateVariantAwareComponent } = await import(
      "../src/utils/styled-components-generator.js"
    );
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "9:1", name: "Chip", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "9:2", name: "Selected=true, Size=sm", type: "COMPONENT" },
      { id: "9:3", name: "Selected=false, Size=md", type: "COMPONENT" },
    ] as any[];

    const variantAnalysis = analyzeComponentVariants(componentSetNode, childVariants);

    const result = generateVariantAwareComponent(
      "Chip",
      "div",
      {} as any,
      variantAnalysis,
      { library: "emotion" } as any
    );

    expect(result.component).toContain("import styled from '@emotion/styled'");
    expect(result.component).toContain("export const Chip = styled.div");
  });
});

test.describe("compound variant detection", () => {
  test("detects compound variants for size + color combinations", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "10:1", name: "Button", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "10:2", name: "Size=sm, Color=primary", type: "COMPONENT" },
      { id: "10:3", name: "Size=md, Color=primary", type: "COMPONENT" },
      { id: "10:4", name: "Size=sm, Color=secondary", type: "COMPONENT" },
      { id: "10:5", name: "Size=md, Color=secondary", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Should have detected compound variants
    expect(result.compoundVariants.length).toBeGreaterThan(0);

    // Should include size + color combinations
    const hasSizeColorCompound = result.compoundVariants.some(
      (cv) => "size" in cv.conditions && "color" in cv.conditions
    );
    expect(hasSizeColorCompound).toBe(true);
  });
});

test.describe("style mappings", () => {
  test("generates appropriate CSS for size variants", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "11:1", name: "Button", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "11:2", name: "Size=sm", type: "COMPONENT" },
      { id: "11:3", name: "Size=md", type: "COMPONENT" },
      { id: "11:4", name: "Size=lg", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    // Find size mappings
    const sizeMappings = result.styleMappings.filter((m) => m.property === "size");
    expect(sizeMappings.length).toBe(3);

    // Each should have padding and fontSize
    for (const mapping of sizeMappings) {
      expect(mapping.css).toHaveProperty("padding");
      expect(mapping.css).toHaveProperty("fontSize");
    }
  });

  test("generates appropriate Tailwind classes for color variants", async () => {
    const { analyzeComponentVariants } = await import("../src/utils/figma-variant-handler.js");

    const componentSetNode = { id: "12:1", name: "Button", type: "COMPONENT_SET" } as any;
    const childVariants = [
      { id: "12:2", name: "Color=primary", type: "COMPONENT" },
      { id: "12:3", name: "Color=error", type: "COMPONENT" },
    ] as any[];

    const result = analyzeComponentVariants(componentSetNode, childVariants);

    const colorMappings = result.styleMappings.filter((m) => m.property === "color");

    const primaryMapping = colorMappings.find((m) => m.value === "primary");
    expect(primaryMapping?.tailwindClasses).toContain("bg-blue-500");

    const errorMapping = colorMappings.find((m) => m.value === "error");
    expect(errorMapping?.tailwindClasses).toContain("bg-red-500");
  });
});
