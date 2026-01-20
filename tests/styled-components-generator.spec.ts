/**
 * Playwright verification test for styled-components/emotion generator
 *
 * This test verifies the generator functionality without needing the web server.
 */

import { test, expect } from "@playwright/test";

// Configure test to not need web server
test.use({
  baseURL: undefined,
});

test.describe("styled-components-generator verification", () => {
  test("generator module exports all required functions", async () => {
    const module = await import("../src/utils/styled-components-generator.js");

    // Verify all main exports exist
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

    // Verify constants are exported
    expect(module.DEFAULT_OPTIONS).toBeDefined();
    expect(module.DEFAULT_LIGHT_THEME).toBeDefined();
    expect(module.DEFAULT_DARK_THEME).toBeDefined();
    expect(module.DEFAULT_BREAKPOINTS).toBeDefined();
  });

  test("generates valid styled-components code", async () => {
    const { generateStyledOutput } = await import("../src/utils/styled-components-generator.js");

    const props = {
      layoutMode: "HORIZONTAL",
      gap: 16,
      padding: { top: 16, right: 24, bottom: 16, left: 24 },
      cornerRadius: 8,
      backgroundColor: { r: 0.2, g: 0.4, b: 0.8, a: 1 },
    };

    const result = generateStyledOutput(
      "Card",
      "div",
      props as any,
      [],
      {
        library: "styled-components",
        generateTheme: true,
        useTypeScript: true,
      } as any
    );

    // Verify component generation
    expect(result.component).toContain("import styled");
    expect(result.component).toContain("export const Card = styled.div");
    expect(result.component).toContain("display: flex;");
    expect(result.component).toContain("gap: 16px;");
    expect(result.component).toContain("padding: 16px 24px;");
    expect(result.component).toContain("border-radius: 8px;");

    // Verify theme generation
    expect(result.theme).toContain("export const lightTheme");
    expect(result.theme).toContain("export interface Theme");
    expect(result.theme).toContain("colors:");
    expect(result.theme).toContain("spacing:");

    // Verify theme provider
    expect(result.themeProvider).toContain("ThemeProvider");
    expect(result.themeProvider).toContain("useTheme");
    expect(result.themeProvider).toContain("toggleTheme");

    // Verify helpers
    expect(result.helpers).toContain("export const media");
    expect(result.helpers).toContain("export const fadeIn");
    expect(result.helpers).toContain("export const flexCenter");
  });

  test("generates valid Emotion code", async () => {
    const { generateStyledOutput } = await import("../src/utils/styled-components-generator.js");

    const props = {
      layoutMode: "VERTICAL",
      gap: 8,
    };

    const result = generateStyledOutput(
      "Stack",
      "div",
      props as any,
      [],
      {
        library: "emotion",
        generateTheme: true,
      } as any
    );

    expect(result.component).toContain("import styled from '@emotion/styled'");
    expect(result.component).toContain("flex-direction: column;");
    expect(result.themeProvider).toContain("EmotionThemeProvider");
    expect(result.helpers).toContain("@emotion/react");
  });

  test("generates TypeScript types for dynamic props", async () => {
    const { generateStyledComponentsCode } = await import("../src/utils/styled-components-generator.js");

    const definition = {
      name: "Button",
      baseElement: "button",
      styles: "cursor: pointer;",
      dynamicProps: [
        {
          name: "variant",
          type: "'primary' | 'secondary'",
          cssProperty: "background-color",
          themeKey: "colors",
          defaultValue: "primary",
        },
        {
          name: "size",
          type: "'sm' | 'md' | 'lg'",
          cssProperty: "padding",
          themeKey: "spacing",
        },
      ],
    };

    const code = generateStyledComponentsCode(definition, { useTypeScript: true } as any);

    // Check TypeScript interface generation
    expect(code).toContain("interface ButtonProps {");
    expect(code).toContain("variant?: 'primary' | 'secondary'");
    expect(code).toContain("size: 'sm' | 'md' | 'lg'");
    expect(code).toContain("<ButtonProps>");

    // Check dynamic prop interpolation
    expect(code).toContain("${({ variant, theme })");
    expect(code).toContain("theme.colors[variant]");
  });

  test("generates style composition utilities", async () => {
    const { generateExtendedComponent, generateHelperUtilities } = await import(
      "../src/utils/styled-components-generator.js"
    );

    // Test component extension
    const extended = generateExtendedComponent(
      "PrimaryButton",
      "Button",
      "background-color: blue;\n  color: white;"
    );
    expect(extended).toContain("export const PrimaryButton = styled(Button)");
    expect(extended).toContain("background-color: blue;");

    // Test helper utilities
    const helpers = generateHelperUtilities();
    expect(helpers).toContain("export const media");
    expect(helpers).toContain("sm:");
    expect(helpers).toContain("md:");
    expect(helpers).toContain("lg:");
    expect(helpers).toContain("export const fadeIn = keyframes");
    expect(helpers).toContain("export const slideUp = keyframes");
    expect(helpers).toContain("export const flexCenter = css");
    expect(helpers).toContain("export const truncate = css");
    expect(helpers).toContain("export const visuallyHidden = css");
  });

  test("converts design tokens to theme", async () => {
    const { designTokensToTheme } = await import("../src/utils/styled-components-generator.js");

    const tokens = [
      { name: "primary-color", value: "#3b82f6", type: "color" as const },
      { name: "secondary-color", value: "#64748b", type: "color" as const },
      { name: "spacing-sm", value: "8px", type: "spacing" as const },
      { name: "spacing-md", value: "16px", type: "spacing" as const },
      { name: "font-size-base", value: "16px", type: "fontSize" as const },
      { name: "font-weight-bold", value: "700", type: "fontWeight" as const },
      { name: "radius-md", value: "8px", type: "borderRadius" as const },
      { name: "shadow-sm", value: "0 1px 2px rgba(0,0,0,0.1)", type: "boxShadow" as const },
    ];

    const theme = designTokensToTheme(tokens);

    expect(theme.colors?.primaryColor).toBe("#3b82f6");
    expect(theme.colors?.secondaryColor).toBe("#64748b");
    expect(theme.spacing?.spacingSm).toBe("8px");
    expect(theme.spacing?.spacingMd).toBe("16px");
    expect(theme.fontSizes?.fontSizeBase).toBe("16px");
    expect(theme.fontWeights?.fontWeightBold).toBe(700);
    expect(theme.borderRadius?.radiusMd).toBe("8px");
    expect(theme.shadows?.shadowSm).toBe("0 1px 2px rgba(0,0,0,0.1)");
  });

  test("theme provider includes dark mode toggle", async () => {
    const { generateThemeProviderCode } = await import("../src/utils/styled-components-generator.js");

    const code = generateThemeProviderCode({ useTypeScript: true } as any);

    // Verify dark mode functionality
    expect(code).toContain("isDark");
    expect(code).toContain("setIsDark");
    expect(code).toContain("toggleTheme");
    expect(code).toContain("localStorage.getItem('theme')");
    expect(code).toContain("localStorage.setItem('theme'");
    expect(code).toContain("prefers-color-scheme: dark");
    expect(code).toContain("darkTheme");
    expect(code).toContain("lightTheme");
  });
});
