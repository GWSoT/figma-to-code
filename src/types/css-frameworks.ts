/**
 * CSS Framework Types and Configuration
 *
 * Defines the supported CSS approaches for Figma-to-code conversion,
 * their compatibility with JS frameworks, and configuration options.
 */

// Supported CSS approaches
export type CSSFramework =
  | "vanilla-css"
  | "tailwind"
  | "css-modules"
  | "styled-components"
  | "emotion"
  | "scss";

// Supported JS frameworks for compatibility checking
export type JSFramework =
  | "react"
  | "vue"
  | "angular"
  | "svelte"
  | "nextjs"
  | "nuxt"
  | "vanilla";

// Compatibility level between CSS and JS frameworks
export type CompatibilityLevel = "full" | "partial" | "none";

export interface CSSFrameworkInfo {
  id: CSSFramework;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  features: string[];
  requiresRuntime: boolean;
  supportsBundling: boolean;
}

export interface JSFrameworkInfo {
  id: JSFramework;
  name: string;
  icon: string;
}

export interface CompatibilityInfo {
  level: CompatibilityLevel;
  notes?: string;
}

// Framework-specific configuration options

export interface VanillaCSSOptions {
  useCustomProperties: boolean;
  generateReset: boolean;
  useNesting: boolean;
  mediaQueryStrategy: "mobile-first" | "desktop-first";
}

export interface TailwindOptions {
  version: "3" | "4";
  useArbitraryValues: boolean;
  generateConfig: boolean;
  prefixClasses: boolean;
  classPrefix?: string;
  darkModeStrategy: "class" | "media";
}

export interface CSSModulesOptions {
  generateTypings: boolean;
  camelCaseOnly: boolean;
  scopeBehaviour: "local" | "global";
  hashPrefix?: string;
}

export interface StyledComponentsOptions {
  useServerStyleSheet: boolean;
  generateTheme: boolean;
  useCSSProp: boolean;
  babelPlugin: boolean;
}

export interface EmotionOptions {
  useSSR: boolean;
  generateTheme: boolean;
  useCSSProp: boolean;
  labelFormat: "component" | "filename" | "none";
}

export interface SCSSOptions {
  useVariables: boolean;
  useMixins: boolean;
  useNesting: boolean;
  generatePartials: boolean;
  outputStyle: "expanded" | "compressed";
}

export type CSSFrameworkOptions =
  | { framework: "vanilla-css"; options: VanillaCSSOptions }
  | { framework: "tailwind"; options: TailwindOptions }
  | { framework: "css-modules"; options: CSSModulesOptions }
  | { framework: "styled-components"; options: StyledComponentsOptions }
  | { framework: "emotion"; options: EmotionOptions }
  | { framework: "scss"; options: SCSSOptions };

export interface CSSConfiguration {
  framework: CSSFramework;
  jsFramework: JSFramework;
  options: CSSFrameworkOptions;
}

// Framework metadata
export const CSS_FRAMEWORKS: Record<CSSFramework, CSSFrameworkInfo> = {
  "vanilla-css": {
    id: "vanilla-css",
    name: "Vanilla CSS",
    description: "Plain CSS with modern features like custom properties and nesting",
    icon: "Palette",
    features: [
      "No build step required",
      "CSS custom properties (variables)",
      "Native CSS nesting",
      "Container queries",
    ],
    requiresRuntime: false,
    supportsBundling: true,
  },
  tailwind: {
    id: "tailwind",
    name: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    icon: "Wind",
    features: [
      "Utility-first approach",
      "JIT compilation",
      "Built-in responsive design",
      "Dark mode support",
    ],
    requiresRuntime: false,
    supportsBundling: true,
  },
  "css-modules": {
    id: "css-modules",
    name: "CSS Modules",
    description: "Locally scoped CSS with automatic class name generation",
    icon: "Box",
    features: [
      "Scoped class names",
      "No global conflicts",
      "Works with any CSS",
      "TypeScript support",
    ],
    requiresRuntime: false,
    supportsBundling: true,
  },
  "styled-components": {
    id: "styled-components",
    name: "Styled Components",
    description: "CSS-in-JS with tagged template literals for React",
    icon: "Code",
    features: [
      "Dynamic styling with props",
      "Automatic vendor prefixing",
      "Theme support",
      "Server-side rendering",
    ],
    requiresRuntime: true,
    supportsBundling: true,
  },
  emotion: {
    id: "emotion",
    name: "Emotion",
    description: "Performant CSS-in-JS library with flexible styling APIs",
    icon: "Sparkles",
    features: [
      "Multiple styling APIs",
      "High performance",
      "Source maps in dev",
      "Framework agnostic",
    ],
    requiresRuntime: true,
    supportsBundling: true,
  },
  scss: {
    id: "scss",
    name: "SCSS/Sass",
    description: "CSS preprocessor with variables, mixins, and nesting",
    icon: "FileCode",
    features: [
      "Variables and mixins",
      "Nesting syntax",
      "Partials and imports",
      "Functions and loops",
    ],
    requiresRuntime: false,
    supportsBundling: true,
  },
};

export const JS_FRAMEWORKS: Record<JSFramework, JSFrameworkInfo> = {
  react: { id: "react", name: "React", icon: "Atom" },
  vue: { id: "vue", name: "Vue", icon: "Triangle" },
  angular: { id: "angular", name: "Angular", icon: "Shield" },
  svelte: { id: "svelte", name: "Svelte", icon: "Flame" },
  nextjs: { id: "nextjs", name: "Next.js", icon: "Zap" },
  nuxt: { id: "nuxt", name: "Nuxt", icon: "Layers" },
  vanilla: { id: "vanilla", name: "Vanilla JS", icon: "Code" },
};

// Compatibility matrix between CSS and JS frameworks
export const COMPATIBILITY_MATRIX: Record<
  CSSFramework,
  Record<JSFramework, CompatibilityInfo>
> = {
  "vanilla-css": {
    react: { level: "full" },
    vue: { level: "full" },
    angular: { level: "full" },
    svelte: { level: "full" },
    nextjs: { level: "full" },
    nuxt: { level: "full" },
    vanilla: { level: "full" },
  },
  tailwind: {
    react: { level: "full" },
    vue: { level: "full" },
    angular: { level: "full" },
    svelte: { level: "full" },
    nextjs: { level: "full", notes: "Built-in support with v4" },
    nuxt: { level: "full", notes: "Use @nuxtjs/tailwindcss module" },
    vanilla: { level: "full" },
  },
  "css-modules": {
    react: { level: "full" },
    vue: { level: "full", notes: "Use <style module>" },
    angular: { level: "partial", notes: "Requires custom configuration" },
    svelte: { level: "partial", notes: "Use svelte-preprocess" },
    nextjs: { level: "full", notes: "Built-in support" },
    nuxt: { level: "full" },
    vanilla: { level: "partial", notes: "Requires bundler setup" },
  },
  "styled-components": {
    react: { level: "full" },
    vue: { level: "none", notes: "Not supported, use vue-styled-components" },
    angular: { level: "none", notes: "Not supported" },
    svelte: { level: "none", notes: "Not supported" },
    nextjs: { level: "full", notes: "Requires babel plugin config" },
    nuxt: { level: "none", notes: "Not supported" },
    vanilla: { level: "none", notes: "Requires React" },
  },
  emotion: {
    react: { level: "full" },
    vue: { level: "partial", notes: "Use @emotion/css directly" },
    angular: { level: "partial", notes: "Use @emotion/css directly" },
    svelte: { level: "partial", notes: "Use @emotion/css directly" },
    nextjs: { level: "full" },
    nuxt: { level: "partial", notes: "Use @emotion/css directly" },
    vanilla: { level: "full", notes: "Use @emotion/css" },
  },
  scss: {
    react: { level: "full" },
    vue: { level: "full", notes: "Built-in support with lang='scss'" },
    angular: { level: "full", notes: "Default style preprocessor" },
    svelte: { level: "full", notes: "Use svelte-preprocess" },
    nextjs: { level: "full", notes: "Built-in support" },
    nuxt: { level: "full" },
    vanilla: { level: "full", notes: "Requires Sass compiler" },
  },
};

// Default options for each CSS framework
export const DEFAULT_OPTIONS: Record<CSSFramework, CSSFrameworkOptions> = {
  "vanilla-css": {
    framework: "vanilla-css",
    options: {
      useCustomProperties: true,
      generateReset: true,
      useNesting: true,
      mediaQueryStrategy: "mobile-first",
    },
  },
  tailwind: {
    framework: "tailwind",
    options: {
      version: "4",
      useArbitraryValues: true,
      generateConfig: true,
      prefixClasses: false,
      darkModeStrategy: "class",
    },
  },
  "css-modules": {
    framework: "css-modules",
    options: {
      generateTypings: true,
      camelCaseOnly: true,
      scopeBehaviour: "local",
    },
  },
  "styled-components": {
    framework: "styled-components",
    options: {
      useServerStyleSheet: true,
      generateTheme: true,
      useCSSProp: false,
      babelPlugin: true,
    },
  },
  emotion: {
    framework: "emotion",
    options: {
      useSSR: true,
      generateTheme: true,
      useCSSProp: true,
      labelFormat: "component",
    },
  },
  scss: {
    framework: "scss",
    options: {
      useVariables: true,
      useMixins: true,
      useNesting: true,
      generatePartials: true,
      outputStyle: "expanded",
    },
  },
};
