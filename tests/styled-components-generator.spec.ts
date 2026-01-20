/**
 * Playwright tests for styled-components/emotion generator
 *
 * These tests verify the code generation functions work correctly.
 */

import { test, expect } from "@playwright/test";

// We'll test the generator by importing the module directly
// Since this is a unit test, we don't need the browser
test.describe("styled-components-generator", () => {
  test.beforeAll(async () => {
    // Verify the module can be imported
    const module = await import("../src/utils/styled-components-generator.ts");
    expect(module).toBeDefined();
  });

  test("should export all main functions", async () => {
    const module = await import("../src/utils/styled-components-generator.ts");

    // Check main exports
    expect(typeof module.generateCSSFromProps).toBe("function");
    expect(typeof module.generateStyledComponent).toBe("function");
    expect(typeof module.generateStyledComponentsCode).toBe("function");
    expect(typeof module.generateEmotionCode).toBe("function");
    expect(typeof module.generateThemeCode).toBe("function");
    expect(typeof module.generateThemeProviderCode).toBe("function");
    expect(typeof module.generateHelperUtilities).toBe("function");
    expect(typeof module.generateExtendedComponent).toBe("function");
    expect(typeof module.generateStyledOutput).toBe("function");
    expect(typeof module.generateImports).toBe("function");
    expect(typeof module.designTokensToTheme).toBe("function");
    expect(typeof module.formatColor).toBe("function");
  });

  test("should export default constants", async () => {
    const module = await import("../src/utils/styled-components-generator.ts");

    expect(module.DEFAULT_OPTIONS).toBeDefined();
    expect(module.DEFAULT_LIGHT_THEME).toBeDefined();
    expect(module.DEFAULT_DARK_THEME).toBeDefined();
    expect(module.DEFAULT_BREAKPOINTS).toBeDefined();
  });

  test("formatColor should convert colors correctly", async () => {
    const { formatColor } = await import("../src/utils/styled-components-generator.ts");

    const testColor = { r: 0.2, g: 0.4, b: 0.8, a: 1 };

    // Hex format
    const hexResult = formatColor(testColor, "hex");
    expect(hexResult).toBe("#3366cc");

    // RGB format
    const rgbResult = formatColor(testColor, "rgb");
    expect(rgbResult).toMatch(/^rgb\(51, 102, 204\)$/);

    // HSL format
    const hslResult = formatColor(testColor, "hsl");
    expect(hslResult).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  test("generateCSSFromProps should generate flex layout CSS", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      layoutMode: "HORIZONTAL" as const,
      primaryAxisAlignItems: "CENTER" as const,
      counterAxisAlignItems: "CENTER" as const,
      gap: 16,
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("display: flex;");
    expect(result).toContain("justify-content: center;");
    expect(result).toContain("align-items: center;");
    expect(result).toContain("gap: 16px;");
  });

  test("generateCSSFromProps should generate vertical flex layout", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      layoutMode: "VERTICAL" as const,
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("display: flex;");
    expect(result).toContain("flex-direction: column;");
  });

  test("generateCSSFromProps should generate dimension CSS", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      width: 200,
      height: 100,
      layoutSizingHorizontal: "FIXED" as const,
      layoutSizingVertical: "FIXED" as const,
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("width: 200px;");
    expect(result).toContain("height: 100px;");
  });

  test("generateCSSFromProps should generate uniform padding", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("padding: 20px;");
  });

  test("generateCSSFromProps should generate symmetric padding", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      padding: { top: 16, right: 24, bottom: 16, left: 24 },
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("padding: 16px 24px;");
  });

  test("generateCSSFromProps should generate typography CSS", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      fontSize: 16,
      fontWeight: 600,
      fontFamily: "Inter",
      textAlignHorizontal: "CENTER" as const,
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("font-size: 16px;");
    expect(result).toContain("font-weight: 600;");
    expect(result).toContain('"Inter"');
    expect(result).toContain("text-align: center;");
  });

  test("generateCSSFromProps should generate border CSS", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      strokeWeight: 1,
      strokes: [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8, a: 1 }, visible: true }],
      cornerRadius: 8,
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("border:");
    expect(result).toContain("1px solid");
    expect(result).toContain("border-radius: 8px;");
  });

  test("generateCSSFromProps should generate shadow CSS", async () => {
    const { generateCSSFromProps } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      effects: [
        {
          type: "DROP_SHADOW",
          visible: true,
          offset: { x: 0, y: 4 },
          radius: 6,
          spread: 0,
          color: { r: 0, g: 0, b: 0, a: 0.1 },
        },
      ],
    };

    const result = generateCSSFromProps(props as any);

    expect(result).toContain("box-shadow:");
    expect(result).toContain("0px 4px 6px 0px");
  });

  test("generateStyledComponentsCode should generate valid code", async () => {
    const { generateStyledComponentsCode } = await import("../src/utils/styled-components-generator.ts");

    const definition = {
      name: "StyledButton",
      baseElement: "button",
      styles: "padding: 16px;\nbackground-color: blue;",
      dynamicProps: [],
    };

    const code = generateStyledComponentsCode(definition);

    expect(code).toContain("export const StyledButton = styled.button`");
    expect(code).toContain("padding: 16px;");
    expect(code).toContain("background-color: blue;");
    expect(code).toContain("`;");
  });

  test("generateStyledComponentsCode should generate TypeScript props", async () => {
    const { generateStyledComponentsCode } = await import("../src/utils/styled-components-generator.ts");

    const definition = {
      name: "Button",
      baseElement: "button",
      styles: "cursor: pointer;",
      dynamicProps: [
        { name: "variant", type: "'primary' | 'secondary'", cssProperty: "background-color", defaultValue: "primary" },
        { name: "size", type: "'sm' | 'md' | 'lg'", cssProperty: "padding" },
      ],
    };

    const code = generateStyledComponentsCode(definition, { useTypeScript: true } as any);

    expect(code).toContain("interface ButtonProps {");
    expect(code).toContain("variant?:");
    expect(code).toContain("size:");
    expect(code).toContain("styled.button<ButtonProps>`");
  });

  test("generateEmotionCode should generate valid Emotion styled code", async () => {
    const { generateEmotionCode } = await import("../src/utils/styled-components-generator.ts");

    const definition = {
      name: "EmotionButton",
      baseElement: "button",
      styles: "padding: 16px;\nbackground-color: blue;",
      dynamicProps: [],
    };

    const code = generateEmotionCode(definition);

    expect(code).toContain("export const EmotionButton = styled.button`");
    expect(code).toContain("padding: 16px;");
    expect(code).toContain("background-color: blue;");
  });

  test("generateThemeCode should generate light theme", async () => {
    const { generateThemeCode } = await import("../src/utils/styled-components-generator.ts");

    const code = generateThemeCode();

    expect(code).toContain("export const lightTheme");
    expect(code).toContain("colors:");
    expect(code).toContain("primary");
    expect(code).toContain("spacing:");
    expect(code).toContain("fontSizes:");
  });

  test("generateThemeCode should generate dark theme", async () => {
    const { generateThemeCode } = await import("../src/utils/styled-components-generator.ts");

    const code = generateThemeCode({}, {}, { generateDarkTheme: true } as any);

    expect(code).toContain("export const darkTheme");
    expect(code).toContain("...lightTheme");
  });

  test("generateThemeCode should include TypeScript types", async () => {
    const { generateThemeCode } = await import("../src/utils/styled-components-generator.ts");

    const code = generateThemeCode({}, {}, { useTypeScript: true } as any);

    expect(code).toContain("export interface Theme {");
    expect(code).toContain("colors: {");
    expect(code).toContain("primary: string;");
  });

  test("generateThemeProviderCode should generate styled-components provider", async () => {
    const { generateThemeProviderCode } = await import("../src/utils/styled-components-generator.ts");

    const code = generateThemeProviderCode({ library: "styled-components" } as any);

    expect(code).toContain("import { ThemeProvider as SCThemeProvider");
    expect(code).toContain("createGlobalStyle");
    expect(code).toContain("export function ThemeProvider");
    expect(code).toContain("export function useTheme");
    expect(code).toContain("toggleTheme");
  });

  test("generateThemeProviderCode should generate Emotion provider", async () => {
    const { generateThemeProviderCode } = await import("../src/utils/styled-components-generator.ts");

    const code = generateThemeProviderCode({ library: "emotion" } as any);

    expect(code).toContain("import { ThemeProvider as EmotionThemeProvider");
    expect(code).toContain("Global, css");
    expect(code).toContain("export function ThemeProvider");
    expect(code).toContain("export function useTheme");
  });

  test("generateHelperUtilities should generate styled-components helpers", async () => {
    const { generateHelperUtilities } = await import("../src/utils/styled-components-generator.ts");

    const code = generateHelperUtilities({ library: "styled-components" } as any);

    expect(code).toContain("import { css, keyframes }");
    expect(code).toContain("export const media");
    expect(code).toContain("export const fadeIn");
    expect(code).toContain("export const flexCenter");
    expect(code).toContain("export const truncate");
  });

  test("generateHelperUtilities should generate Emotion helpers", async () => {
    const { generateHelperUtilities } = await import("../src/utils/styled-components-generator.ts");

    const code = generateHelperUtilities({ library: "emotion" } as any);

    expect(code).toContain("import { css, keyframes } from '@emotion/react'");
    expect(code).toContain("export const media");
    expect(code).toContain("export const fadeIn");
  });

  test("generateExtendedComponent should generate extended styled component", async () => {
    const { generateExtendedComponent } = await import("../src/utils/styled-components-generator.ts");

    const code = generateExtendedComponent(
      "PrimaryButton",
      "Button",
      "background-color: blue;\n  color: white;",
      { library: "styled-components" } as any
    );

    expect(code).toContain("export const PrimaryButton = styled(Button)");
    expect(code).toContain("background-color: blue;");
    expect(code).toContain("color: white;");
  });

  test("generateStyledOutput should generate complete output", async () => {
    const { generateStyledOutput } = await import("../src/utils/styled-components-generator.ts");

    const props = {
      layoutMode: "HORIZONTAL" as const,
      gap: 16,
      padding: { top: 16, right: 24, bottom: 16, left: 24 },
      cornerRadius: 8,
    };

    const result = generateStyledOutput(
      "Card",
      "div",
      props as any,
      [],
      { library: "styled-components", generateTheme: true } as any
    );

    expect(result.component).toContain("import styled");
    expect(result.component).toContain("export const Card = styled.div");
    expect(result.theme).toContain("export const lightTheme");
    expect(result.themeProvider).toContain("ThemeProvider");
    expect(result.helpers).toContain("export const media");
  });

  test("generateImports should generate styled-components imports", async () => {
    const { generateImports } = await import("../src/utils/styled-components-generator.ts");

    const imports = generateImports({ library: "styled-components" } as any);

    expect(imports).toContain("import styled");
    expect(imports).toContain("css");
    expect(imports).toContain("keyframes");
    expect(imports).toContain("ThemeProvider");
    expect(imports).toContain("from 'styled-components'");
  });

  test("generateImports should generate Emotion imports", async () => {
    const { generateImports } = await import("../src/utils/styled-components-generator.ts");

    const imports = generateImports({ library: "emotion" } as any);

    expect(imports).toContain("import styled from '@emotion/styled'");
    expect(imports).toContain("css");
    expect(imports).toContain("keyframes");
    expect(imports).toContain("from '@emotion/react'");
  });

  test("designTokensToTheme should convert color tokens", async () => {
    const { designTokensToTheme } = await import("../src/utils/styled-components-generator.ts");

    const tokens = [
      { name: "primary-color", value: "#3b82f6", type: "color" as const },
      { name: "secondary-color", value: "#64748b", type: "color" as const },
    ];

    const theme = designTokensToTheme(tokens);

    expect(theme.colors?.primaryColor).toBe("#3b82f6");
    expect(theme.colors?.secondaryColor).toBe("#64748b");
  });

  test("designTokensToTheme should convert spacing tokens", async () => {
    const { designTokensToTheme } = await import("../src/utils/styled-components-generator.ts");

    const tokens = [
      { name: "spacing-sm", value: "8px", type: "spacing" as const },
      { name: "spacing-md", value: "16px", type: "spacing" as const },
    ];

    const theme = designTokensToTheme(tokens);

    expect(theme.spacing?.spacingSm).toBe("8px");
    expect(theme.spacing?.spacingMd).toBe("16px");
  });

  test("DEFAULT_OPTIONS should have correct defaults", async () => {
    const { DEFAULT_OPTIONS } = await import("../src/utils/styled-components-generator.ts");

    expect(DEFAULT_OPTIONS.library).toBe("styled-components");
    expect(DEFAULT_OPTIONS.useTypeScript).toBe(true);
    expect(DEFAULT_OPTIONS.generateTheme).toBe(true);
    expect(DEFAULT_OPTIONS.colorFormat).toBe("hex");
  });

  test("DEFAULT_LIGHT_THEME should have complete theme", async () => {
    const { DEFAULT_LIGHT_THEME } = await import("../src/utils/styled-components-generator.ts");

    expect(DEFAULT_LIGHT_THEME.colors.primary).toBeDefined();
    expect(DEFAULT_LIGHT_THEME.spacing.md).toBeDefined();
    expect(DEFAULT_LIGHT_THEME.fontSizes.base).toBeDefined();
    expect(DEFAULT_LIGHT_THEME.breakpoints.md).toBeDefined();
  });

  test("DEFAULT_DARK_THEME should have dark color overrides", async () => {
    const { DEFAULT_DARK_THEME } = await import("../src/utils/styled-components-generator.ts");

    expect(DEFAULT_DARK_THEME.colors?.primary).toBeDefined();
    expect(DEFAULT_DARK_THEME.colors?.background).toBeDefined();
    expect(DEFAULT_DARK_THEME.colors?.text).toBeDefined();
  });
});
