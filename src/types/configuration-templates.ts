/**
 * Pre-built Configuration Templates
 *
 * These templates provide common configurations for different project types.
 * They can be used as starting points for users.
 */

import type { CSSFramework, JSFramework, CSSFrameworkOptions } from "./css-frameworks";
import { DEFAULT_OPTIONS } from "./css-frameworks";

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  jsFramework: JSFramework;
  cssFramework: CSSFramework;
  cssOptions: CSSFrameworkOptions;
  codeStyle: "camelCase" | "kebab-case" | "PascalCase" | "snake_case";
  componentNaming: "camelCase" | "kebab-case" | "PascalCase" | "snake_case";
  fileNaming: "camelCase" | "kebab-case" | "PascalCase" | "snake_case";
  componentStructure: "flat" | "folder" | "feature-based";
  tags: string[];
}

export const CONFIGURATION_TEMPLATES: ConfigurationTemplate[] = [
  // React Templates
  {
    id: "react-tailwind-modern",
    name: "React + Tailwind (Modern)",
    description: "Modern React setup with Tailwind CSS v4, ideal for new projects",
    jsFramework: "react",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "folder",
    tags: ["react", "tailwind", "modern"],
  },
  {
    id: "react-css-modules",
    name: "React + CSS Modules",
    description: "React with scoped CSS Modules for component isolation",
    jsFramework: "react",
    cssFramework: "css-modules",
    cssOptions: {
      framework: "css-modules",
      options: {
        generateTypings: true,
        camelCaseOnly: true,
        scopeBehaviour: "local",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "folder",
    tags: ["react", "css-modules", "typescript"],
  },
  {
    id: "react-styled-components",
    name: "React + Styled Components",
    description: "React with CSS-in-JS using styled-components",
    jsFramework: "react",
    cssFramework: "styled-components",
    cssOptions: {
      framework: "styled-components",
      options: {
        useServerStyleSheet: false,
        generateTheme: true,
        useCSSProp: false,
        babelPlugin: true,
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "folder",
    tags: ["react", "styled-components", "css-in-js"],
  },

  // Next.js Templates
  {
    id: "nextjs-tailwind",
    name: "Next.js + Tailwind",
    description: "Next.js App Router with Tailwind CSS",
    jsFramework: "nextjs",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "feature-based",
    tags: ["nextjs", "tailwind", "app-router"],
  },
  {
    id: "nextjs-css-modules",
    name: "Next.js + CSS Modules",
    description: "Next.js with built-in CSS Modules support",
    jsFramework: "nextjs",
    cssFramework: "css-modules",
    cssOptions: {
      framework: "css-modules",
      options: {
        generateTypings: true,
        camelCaseOnly: true,
        scopeBehaviour: "local",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "feature-based",
    tags: ["nextjs", "css-modules"],
  },

  // Vue Templates
  {
    id: "vue-tailwind",
    name: "Vue 3 + Tailwind",
    description: "Vue 3 Composition API with Tailwind CSS",
    jsFramework: "vue",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "folder",
    tags: ["vue", "tailwind", "composition-api"],
  },
  {
    id: "vue-scss",
    name: "Vue 3 + SCSS",
    description: "Vue 3 with scoped SCSS styles",
    jsFramework: "vue",
    cssFramework: "scss",
    cssOptions: {
      framework: "scss",
      options: {
        useVariables: true,
        useMixins: true,
        useNesting: true,
        generatePartials: false,
        outputStyle: "expanded",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "folder",
    tags: ["vue", "scss"],
  },

  // Nuxt Templates
  {
    id: "nuxt-tailwind",
    name: "Nuxt 3 + Tailwind",
    description: "Nuxt 3 with @nuxtjs/tailwindcss module",
    jsFramework: "nuxt",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "feature-based",
    tags: ["nuxt", "tailwind"],
  },

  // Angular Templates
  {
    id: "angular-scss",
    name: "Angular + SCSS",
    description: "Angular with SCSS styles (Angular default)",
    jsFramework: "angular",
    cssFramework: "scss",
    cssOptions: {
      framework: "scss",
      options: {
        useVariables: true,
        useMixins: true,
        useNesting: true,
        generatePartials: true,
        outputStyle: "expanded",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "feature-based",
    tags: ["angular", "scss"],
  },
  {
    id: "angular-tailwind",
    name: "Angular + Tailwind",
    description: "Angular with Tailwind CSS integration",
    jsFramework: "angular",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "feature-based",
    tags: ["angular", "tailwind"],
  },

  // Svelte Templates
  {
    id: "svelte-tailwind",
    name: "Svelte + Tailwind",
    description: "Svelte with Tailwind CSS",
    jsFramework: "svelte",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "class",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "flat",
    tags: ["svelte", "tailwind"],
  },
  {
    id: "svelte-vanilla-css",
    name: "Svelte + Vanilla CSS",
    description: "Svelte with scoped vanilla CSS",
    jsFramework: "svelte",
    cssFramework: "vanilla-css",
    cssOptions: {
      framework: "vanilla-css",
      options: {
        useCustomProperties: true,
        generateReset: false,
        useNesting: true,
        mediaQueryStrategy: "mobile-first",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "PascalCase",
    componentStructure: "flat",
    tags: ["svelte", "vanilla-css"],
  },

  // Vanilla JS Templates
  {
    id: "vanilla-tailwind",
    name: "Vanilla JS + Tailwind",
    description: "Plain JavaScript with Tailwind CSS",
    jsFramework: "vanilla",
    cssFramework: "tailwind",
    cssOptions: {
      framework: "tailwind",
      options: {
        version: "4",
        useArbitraryValues: true,
        generateConfig: true,
        prefixClasses: false,
        darkModeStrategy: "media",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "flat",
    tags: ["vanilla", "tailwind"],
  },
  {
    id: "vanilla-css",
    name: "Vanilla JS + CSS",
    description: "Plain JavaScript with modern vanilla CSS",
    jsFramework: "vanilla",
    cssFramework: "vanilla-css",
    cssOptions: {
      framework: "vanilla-css",
      options: {
        useCustomProperties: true,
        generateReset: true,
        useNesting: true,
        mediaQueryStrategy: "mobile-first",
      },
    },
    codeStyle: "camelCase",
    componentNaming: "PascalCase",
    fileNaming: "kebab-case",
    componentStructure: "flat",
    tags: ["vanilla", "vanilla-css"],
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ConfigurationTemplate | undefined {
  return CONFIGURATION_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by framework
 */
export function getTemplatesByFramework(
  jsFramework?: JSFramework,
  cssFramework?: CSSFramework
): ConfigurationTemplate[] {
  return CONFIGURATION_TEMPLATES.filter((t) => {
    if (jsFramework && t.jsFramework !== jsFramework) return false;
    if (cssFramework && t.cssFramework !== cssFramework) return false;
    return true;
  });
}

/**
 * Search templates by tag
 */
export function searchTemplatesByTag(tag: string): ConfigurationTemplate[] {
  const lowerTag = tag.toLowerCase();
  return CONFIGURATION_TEMPLATES.filter((t) =>
    t.tags.some((tag) => tag.toLowerCase().includes(lowerTag))
  );
}
