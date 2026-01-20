/**
 * AI Code Generation Agent - Prompt Templates
 *
 * Contains carefully crafted prompts for each phase of code generation.
 * Optimized for readability, maintainability, and framework best practices.
 */

import type {
  FrameworkType,
  StylingType,
  PromptTemplate,
  PromptTemplateRegistry,
  FrameworkBestPractices,
  CodeGenerationConfig,
  DesignContext,
  RefinementFeedback,
} from "./types";

// ============================================================================
// System Prompts
// ============================================================================

const SYSTEM_PROMPT_BASE = `You are an expert frontend developer specializing in translating designs into production-ready code. Your code should be:

1. **Readable**: Clear variable names, logical structure, appropriate comments
2. **Maintainable**: Follows SOLID principles, single responsibility, DRY
3. **Accessible**: Proper ARIA attributes, semantic HTML, keyboard navigation
4. **Performant**: Efficient rendering, appropriate memoization, lazy loading when needed
5. **Consistent**: Follows established patterns and conventions

You follow these principles:
- Write code that humans can easily understand and modify
- Use semantic HTML elements appropriately
- Ensure proper TypeScript types without overusing \`any\`
- Apply consistent formatting and naming conventions
- Add helpful comments for complex logic only (not obvious code)
- Consider responsive design and mobile-first approach
- Include proper error handling where appropriate`;

const FRAMEWORK_SYSTEM_PROMPTS: Record<FrameworkType, string> = {
  react: `${SYSTEM_PROMPT_BASE}

**React-Specific Guidelines:**
- Use functional components with hooks
- Prefer composition over inheritance
- Use proper React patterns: custom hooks, context, memo
- Handle state with useState/useReducer appropriately
- Use useEffect correctly with proper cleanup
- Apply proper key props for lists
- Use React.memo for expensive renders
- Forward refs when needed for composability
- Use proper event handler naming (onXxx props, handleXxx handlers)
- Prefer controlled components for forms`,

  vue: `${SYSTEM_PROMPT_BASE}

**Vue-Specific Guidelines:**
- Use Vue 3 Composition API with script setup
- Leverage reactive refs and computed properties
- Use v-model for two-way binding appropriately
- Apply proper slot patterns for composition
- Use provide/inject for deep prop drilling
- Handle events with proper naming (@event-name)
- Use defineProps and defineEmits for type safety
- Apply watchers sparingly, prefer computed
- Use Vue transitions for animations
- Follow Vue style guide recommendations`,

  svelte: `${SYSTEM_PROMPT_BASE}

**Svelte-Specific Guidelines:**
- Use Svelte 5 runes syntax ($state, $derived, $effect)
- Leverage reactive declarations effectively
- Use component props with proper typing
- Apply slot patterns for composition
- Handle events with proper svelte conventions
- Use transitions and animations appropriately
- Keep components focused and composable
- Use stores for shared state when needed
- Apply proper two-way binding with bind:
- Follow Svelte best practices for accessibility`,

  html: `${SYSTEM_PROMPT_BASE}

**HTML/Vanilla JS Guidelines:**
- Use semantic HTML5 elements
- Apply progressive enhancement
- Use data attributes for JavaScript hooks
- Keep JavaScript unobtrusive
- Use proper event delegation
- Apply CSS classes for styling hooks
- Ensure proper document structure
- Include proper meta tags and accessibility
- Use modern vanilla JS (no jQuery)
- Apply proper error handling`,
};

const STYLING_PROMPTS: Record<StylingType, string> = {
  tailwind: `
**Tailwind CSS Guidelines:**
- Use utility classes effectively
- Apply responsive modifiers (sm:, md:, lg:, xl:)
- Use dark mode variants when appropriate (dark:)
- Group related utilities logically
- Extract common patterns to @apply when repeated
- Use arbitrary values sparingly [value]
- Apply hover/focus/active states properly
- Use flexbox/grid utilities for layout
- Apply proper spacing scale
- Use Tailwind's color palette or custom tokens`,

  "styled-components": `
**Styled Components Guidelines:**
- Use styled-components or Emotion CSS-in-JS
- Apply proper component organization
- Use theme provider for design tokens
- Leverage props for dynamic styling
- Use css helper for shared styles
- Apply proper TypeScript types for themes
- Use keyframes for animations
- Handle global styles appropriately
- Apply media queries using template literals
- Use attrs for static props optimization`,

  "css-modules": `
**CSS Modules Guidelines:**
- Use .module.css file naming
- Apply BEM-like naming within modules
- Use camelCase for class names
- Compose styles for reuse
- Apply proper specificity management
- Use CSS custom properties for theming
- Handle responsive design with media queries
- Apply proper nesting (with CSS nesting)
- Keep selectors simple and flat
- Use :global() sparingly`,

  inline: `
**Inline Styles Guidelines:**
- Use inline styles for dynamic values only
- Apply proper style object structure
- Use camelCase property names
- Handle vendor prefixes appropriately
- Use CSS variables for theming
- Keep inline styles minimal
- Combine with CSS classes when appropriate
- Handle responsive design carefully
- Apply proper TypeScript typing for styles
- Avoid complex selectors (not supported inline)`,

  scss: `
**SCSS Guidelines:**
- Use proper nesting (max 3 levels)
- Apply variables for design tokens
- Use mixins for reusable patterns
- Apply proper BEM naming
- Use @use/@forward over @import
- Apply proper file organization
- Use placeholder selectors for extends
- Handle responsive with mixin patterns
- Apply proper color functions
- Use maps for organized tokens`,
};

// ============================================================================
// Prompt Templates
// ============================================================================

/**
 * Analysis prompt template
 */
export const ANALYZE_PROMPT: PromptTemplate = {
  name: "analyze",
  system: `You are a design analysis expert. Analyze the provided Figma design data and extract:
1. Component semantic type (button, card, form, etc.)
2. Layout structure (flex, grid, positioning)
3. Typography styles
4. Color palette and fills
5. Interactive states (if variant data provided)
6. Accessibility considerations
7. Responsive behavior hints

Provide structured analysis in JSON format.`,
  user: `Analyze this Figma design component:

**Component Name**: {{componentName}}
**Node Type**: {{nodeType}}

**Design Data**:
\`\`\`json
{{designData}}
\`\`\`

{{#if variants}}
**Variants**:
\`\`\`json
{{variants}}
\`\`\`
{{/if}}

Provide a comprehensive analysis including:
1. Semantic component type
2. Layout details
3. Typography
4. Colors
5. Interactive states
6. Accessibility needs
7. Responsive considerations`,
  placeholders: ["componentName", "nodeType", "designData", "variants"],
};

/**
 * Code generation prompt template
 */
export const GENERATE_PROMPT: PromptTemplate = {
  name: "generate",
  system: `{{frameworkPrompt}}

{{stylingPrompt}}

Generate clean, production-ready code following all the guidelines above.
Your response should include complete, working code files.`,
  user: `Generate a {{framework}} component with {{styling}} styling based on this design analysis:

**Component Name**: {{componentName}}

**Design Context**:
\`\`\`json
{{designContext}}
\`\`\`

**Configuration**:
- Language: {{language}}
- Component Style: {{componentStyle}}
- Generate Props Interface: {{generatePropsInterface}}
- Add Documentation: {{addDocumentation}}
- Naming Convention: {{namingConvention}}

{{#if customInstructions}}
**Additional Instructions**:
{{customInstructions}}
{{/if}}

{{#if designTokens}}
**Design Tokens**:
\`\`\`json
{{designTokens}}
\`\`\`
{{/if}}

Generate the complete component code. Include:
1. Component file with proper types and implementation
2. Styles (if separate file needed)
3. Types/interfaces file (if TypeScript)

Format your response with clear file markers:
\`\`\`{{language}}:filename.tsx
// code here
\`\`\``,
  placeholders: [
    "framework",
    "styling",
    "componentName",
    "designContext",
    "language",
    "componentStyle",
    "generatePropsInterface",
    "addDocumentation",
    "namingConvention",
    "customInstructions",
    "designTokens",
    "frameworkPrompt",
    "stylingPrompt",
  ],
};

/**
 * Refinement prompt template
 */
export const REFINE_PROMPT: PromptTemplate = {
  name: "refine",
  system: `You are refining generated code based on feedback. Apply the requested changes while:
1. Maintaining consistency with existing code style
2. Preserving working functionality
3. Improving code quality where possible
4. Following framework best practices`,
  user: `Refine the following code based on the provided feedback:

**Current Code**:
{{#each files}}
\`\`\`{{language}}:{{path}}
{{content}}
\`\`\`
{{/each}}

**Feedback to Apply**:
{{#each feedback}}
- [{{priority}}] {{type}}: {{description}}
  {{#if targetFile}}Target: {{targetFile}}{{/if}}
  {{#if lineRange}}Lines: {{lineRange.start}}-{{lineRange.end}}{{/if}}
{{/each}}

Apply all feedback items and return the complete updated code files.
Explain the changes made for each feedback item.

Format your response with clear file markers:
\`\`\`{{language}}:filename.tsx
// updated code here
\`\`\``,
  placeholders: ["files", "feedback", "language"],
};

/**
 * Validation prompt template
 */
export const VALIDATE_PROMPT: PromptTemplate = {
  name: "validate",
  system: `You are a code review expert. Analyze the generated code for:
1. Syntax errors
2. Type errors (if TypeScript)
3. Accessibility issues
4. Performance concerns
5. Best practice violations
6. Style consistency

Provide structured feedback in JSON format.`,
  user: `Validate this generated {{framework}} component code:

{{#each files}}
**File: {{path}}**
\`\`\`{{language}}
{{content}}
\`\`\`
{{/each}}

**Design Requirements**:
\`\`\`json
{{designContext}}
\`\`\`

Check for:
1. Does the code match the design requirements?
2. Are there any syntax or type errors?
3. Is the code accessible?
4. Are there performance concerns?
5. Does it follow {{framework}} best practices?
6. Is the {{styling}} styling applied correctly?

Return a JSON validation result with errors, warnings, and suggestions.`,
  placeholders: ["framework", "styling", "files", "designContext", "language"],
};

// ============================================================================
// Template Registry
// ============================================================================

/**
 * Complete prompt template registry
 */
export const promptRegistry: PromptTemplateRegistry = {
  analyze: ANALYZE_PROMPT,
  generate: GENERATE_PROMPT,
  refine: REFINE_PROMPT,
  validate: VALIDATE_PROMPT,
  frameworks: {
    react: { system: FRAMEWORK_SYSTEM_PROMPTS.react },
    vue: { system: FRAMEWORK_SYSTEM_PROMPTS.vue },
    svelte: { system: FRAMEWORK_SYSTEM_PROMPTS.svelte },
    html: { system: FRAMEWORK_SYSTEM_PROMPTS.html },
  },
  styling: {
    tailwind: { system: STYLING_PROMPTS.tailwind },
    "styled-components": { system: STYLING_PROMPTS["styled-components"] },
    "css-modules": { system: STYLING_PROMPTS["css-modules"] },
    inline: { system: STYLING_PROMPTS.inline },
    scss: { system: STYLING_PROMPTS.scss },
  },
};

// ============================================================================
// Framework Best Practices
// ============================================================================

/**
 * React best practices
 */
export const REACT_BEST_PRACTICES: FrameworkBestPractices = {
  framework: "react",
  requiredImports: ["react"],
  patterns: {
    stateManagement: "Use useState for simple state, useReducer for complex state logic",
    propsHandling: "Destructure props with default values, use TypeScript interfaces",
    eventHandling: "Use handleXxx naming for handlers, onXxx for props",
    lifecycle: "Use useEffect with proper dependencies and cleanup",
  },
  antiPatterns: [
    "Mutating state directly",
    "Missing dependency array in useEffect",
    "Using index as key for dynamic lists",
    "Prop drilling beyond 2-3 levels",
    "Inline object/array props causing re-renders",
  ],
  performanceTips: [
    "Use React.memo for expensive pure components",
    "Use useMemo for expensive calculations",
    "Use useCallback for stable function references",
    "Lazy load heavy components with React.lazy",
    "Use proper key props for list reconciliation",
  ],
  accessibilityRequirements: [
    "Use semantic HTML elements",
    "Include proper ARIA attributes",
    "Ensure keyboard navigation",
    "Manage focus for modals/dialogs",
    "Provide alt text for images",
  ],
};

/**
 * Vue best practices
 */
export const VUE_BEST_PRACTICES: FrameworkBestPractices = {
  framework: "vue",
  requiredImports: ["vue"],
  patterns: {
    stateManagement: "Use ref/reactive for local state, Pinia for global state",
    propsHandling: "Use defineProps with TypeScript for type-safe props",
    eventHandling: "Use emit with proper event naming (kebab-case)",
    lifecycle: "Use onMounted, onUnmounted hooks appropriately",
  },
  antiPatterns: [
    "Mutating props directly",
    "Overusing watchers instead of computed",
    "Deep nesting of components",
    "Missing v-bind:key in v-for",
    "Using v-if with v-for on same element",
  ],
  performanceTips: [
    "Use v-once for static content",
    "Use v-memo for expensive list items",
    "Use computed for derived state",
    "Use shallowRef for large objects",
    "Lazy load routes and components",
  ],
  accessibilityRequirements: [
    "Use semantic HTML elements",
    "Include proper ARIA attributes",
    "Manage focus for dynamic content",
    "Use proper heading hierarchy",
    "Ensure color contrast",
  ],
};

/**
 * Svelte best practices
 */
export const SVELTE_BEST_PRACTICES: FrameworkBestPractices = {
  framework: "svelte",
  requiredImports: [],
  patterns: {
    stateManagement: "Use $state for reactive state, stores for shared state",
    propsHandling: "Use $props() rune with TypeScript interfaces",
    eventHandling: "Use on:event or $effect for side effects",
    lifecycle: "Use $effect for lifecycle-like behavior, onMount for DOM",
  },
  antiPatterns: [
    "Mutating $state arrays without reassignment",
    "Overusing stores for local state",
    "Missing key in {#each} blocks",
    "Using $effect for computed values (use $derived)",
    "Deep prop drilling without context",
  ],
  performanceTips: [
    "Use $derived for computed values",
    "Use keyed {#each} blocks for lists",
    "Use {#snippet} for reusable templates",
    "Use transitions sparingly",
    "Use $effect.pre for pre-render updates",
  ],
  accessibilityRequirements: [
    "Use semantic HTML elements",
    "Include proper ARIA attributes",
    "Use svelte transitions accessibly",
    "Manage focus for dynamic content",
    "Support reduced motion preferences",
  ],
};

export const FRAMEWORK_BEST_PRACTICES: Record<FrameworkType, FrameworkBestPractices> = {
  react: REACT_BEST_PRACTICES,
  vue: VUE_BEST_PRACTICES,
  svelte: SVELTE_BEST_PRACTICES,
  html: {
    framework: "html",
    requiredImports: [],
    patterns: {
      stateManagement: "Use data attributes and vanilla JS",
      propsHandling: "Use data attributes for configuration",
      eventHandling: "Use event delegation and addEventListener",
      lifecycle: "Use DOMContentLoaded and proper event cleanup",
    },
    antiPatterns: [
      "Using inline event handlers",
      "Not cleaning up event listeners",
      "Using document.write",
      "Blocking the main thread",
      "Using eval or innerHTML unsafely",
    ],
    performanceTips: [
      "Use requestAnimationFrame for animations",
      "Debounce expensive event handlers",
      "Use IntersectionObserver for lazy loading",
      "Minimize DOM queries",
      "Use DocumentFragment for batch insertions",
    ],
    accessibilityRequirements: [
      "Use semantic HTML elements",
      "Include proper ARIA attributes",
      "Ensure keyboard navigation",
      "Provide skip links",
      "Use proper heading hierarchy",
    ],
  },
};

// ============================================================================
// Template Compilation Helpers
// ============================================================================

/**
 * Compile a prompt template with provided values
 */
export function compilePrompt(
  template: string,
  values: Record<string, unknown>
): string {
  let result = template;

  // Handle conditional blocks {{#if key}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key, content) => {
      const value = values[key];
      return value ? content : "";
    }
  );

  // Handle each blocks {{#each key}}...{{/each}}
  result = result.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, key, content) => {
      const items = values[key];
      if (!Array.isArray(items)) return "";
      return items
        .map((item) => {
          let itemContent = content;
          if (typeof item === "object" && item !== null) {
            Object.entries(item).forEach(([k, v]) => {
              itemContent = itemContent.replace(
                new RegExp(`\\{\\{${k}\\}\\}`, "g"),
                String(v ?? "")
              );
            });
          }
          return itemContent;
        })
        .join("\n");
    }
  );

  // Handle simple value substitution {{key}}
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
    } else if (value && typeof value === "object") {
      result = result.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        JSON.stringify(value, null, 2)
      );
    }
  });

  // Clean up any remaining unmatched placeholders
  result = result.replace(/\{\{[\w.]+\}\}/g, "");

  return result.trim();
}

/**
 * Build generation prompt with full context
 */
export function buildGenerationPrompt(
  designContext: DesignContext,
  config: CodeGenerationConfig
): { system: string; user: string } {
  const frameworkPrompt = FRAMEWORK_SYSTEM_PROMPTS[config.framework];
  const stylingPrompt = STYLING_PROMPTS[config.styling];

  const systemPrompt = compilePrompt(GENERATE_PROMPT.system, {
    frameworkPrompt,
    stylingPrompt,
  });

  const userPrompt = compilePrompt(GENERATE_PROMPT.user, {
    framework: config.framework,
    styling: config.styling,
    componentName: designContext.componentName,
    designContext: JSON.stringify(designContext, null, 2),
    language: config.language,
    componentStyle: config.componentStyle,
    generatePropsInterface: config.generatePropsInterface,
    addDocumentation: config.addDocumentation,
    namingConvention: config.namingConvention,
    customInstructions: config.customInstructions,
    designTokens: config.designTokens
      ? JSON.stringify(config.designTokens, null, 2)
      : undefined,
  });

  return { system: systemPrompt, user: userPrompt };
}

/**
 * Build refinement prompt with feedback
 */
export function buildRefinementPrompt(
  files: Array<{ path: string; content: string; language: string }>,
  feedback: RefinementFeedback[]
): { system: string; user: string } {
  const userPrompt = compilePrompt(REFINE_PROMPT.user, {
    files,
    feedback: feedback.map((f) => ({
      priority: f.priority,
      type: f.type,
      description: f.description,
      targetFile: f.targetFile,
      lineRange: f.lineRange,
    })),
    language: files[0]?.language ?? "typescript",
  });

  return { system: REFINE_PROMPT.system, user: userPrompt };
}

/**
 * Build validation prompt
 */
export function buildValidationPrompt(
  files: Array<{ path: string; content: string; language: string }>,
  designContext: DesignContext,
  framework: FrameworkType,
  styling: StylingType
): { system: string; user: string } {
  const userPrompt = compilePrompt(VALIDATE_PROMPT.user, {
    framework,
    styling,
    files,
    designContext: JSON.stringify(designContext, null, 2),
    language: files[0]?.language ?? "typescript",
  });

  return { system: VALIDATE_PROMPT.system, user: userPrompt };
}
