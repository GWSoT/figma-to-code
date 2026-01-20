I'll start by exploring the codebase to understand the existing structure and then implement the Svelte component generation feature.

🔧 Tool: Task
Input: {
  "subagent_type": "Explore",
  "prompt": "Explore this codebase to understand:\n1. The overall project structure\n2. How code generation is currently implemented (if any)\n3. Any existing component generation patterns\n4. The framework/library structure for generating code from Figma designs\n5. Look for any existing generators, transformers, or code output utilities\n\nFocus on understanding the architecture for code generation and how components are structured.",
  "description": "Explore codebase structure"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/README.md"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.ts\" -o -name \"*.tsx\" | head -30",
  "description": "List TypeScript source files to understand structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | grep -v node_modules | head -50",
  "description": "List source files in src directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/",
  "description": "List top-level src directories"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/.automaker/",
  "description": "Check what's in .automaker directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/",
  "description": "List components directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/ | grep -i figma",
  "description": "List Figma-related utilities"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/.automaker/features/ | head -30",
  "description": "List features in automaker"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-component-resolver.ts",
  "limit": 100
}

🔧 Tool: Glob
Input: {
  "pattern": "**/figma*generator*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code/src"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/frames.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/figma.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-state-management.ts",
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type f -name \"*.ts\" | sort",
  "description": "List all utility files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/data-access/",
  "description": "List data-access functions"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/hooks/",
  "description": "List custom hooks"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/hooks"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/hooks/useFigmaExport.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/hooks/useFigmaFiles.ts"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/fn/",
  "description": "List server functions"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma-export.ts",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/db/",
  "description": "List database files"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"FigmaFrame\" /home/rainman/figma-to-code/figma-to-code/src/db/ --include=\"*.ts\" -A 5 | head -100",
  "description": "Find Figma frame schema"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f \\( -name \"*generator*\" -o -name \"*template*\" -o -name \"*codegen*\" -o -name \"*transform*\" \\) | grep -v node_modules | head -20",
  "description": "Find code generation related files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/lib/",
  "description": "Check lib directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/semantic-list-generator.ts",
  "limit": 120
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "limit": 120
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-interactive-elements.ts",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/CLAUDE.md"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/.automaker/features -name \"*.md\" -o -name \"*.json\" | head -20",
  "description": "List feature configuration files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/.automaker/features/feature-1768844694859-pj7t713cb/feature.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/.automaker/app_spec.txt"
}
Now I understand the codebase structure. This is a Figma-to-code generation platform. Let me look at the existing code generators to understand the patterns better, especially for React, so I can create a similar Svelte generator.

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*generator*.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*svelte*.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "code.*generator|Generator.*class",
  "glob": "*.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/semantic-list-generator.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "generateCode|generateJSX|generateHTML|codeOutput",
  "glob": "*.ts"
}
Let me also look at the figma-layout-intent.ts for more context on how the code generation integrates:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/*Generation*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/CodeGenerationSettings.tsx"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze existing code generation patterns (React, semantic-list-generator)",
      "status": "completed",
      "activeForm": "Analyzing existing code generation patterns"
    },
    {
      "content": "Create Svelte component generator utility file",
      "status": "in_progress",
      "activeForm": "Creating Svelte component generator utility file"
    },
    {
      "content": "Add Svelte as a framework option in CodeGenerationSettings",
      "status": "pending",
      "activeForm": "Adding Svelte framework option to settings"
    },
    {
      "content": "Integrate Svelte generator with figma-layout-intent system",
      "status": "pending",
      "activeForm": "Integrating Svelte generator with layout intent system"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/figma/CSSFrameworkSelector.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/types/css-frameworks.ts"
}
Now I have a complete understanding of the codebase. The project already has Svelte listed as a JS framework option, but needs a Svelte component generator. Let me create the Svelte generator that follows the same patterns as the existing React generator in `semantic-list-generator.ts` but generates idiomatic Svelte code with:

1. Reactive declarations (`$:`)
2. Svelte template syntax (`{#each}`, `{#if}`)
3. Stores support
4. Actions support
5. Transitions support

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/svelte-component-generator.ts",
  "content": "/**\n * Svelte Component Generator\n *\n * Generates Svelte components with:\n * - Reactive declarations ($:)\n * - Svelte template syntax ({#each}, {#if}, {#await})\n * - Svelte stores (writable, readable, derived)\n * - Actions (use:action)\n * - Transitions (transition:, in:, out:)\n *\n * Produces clean, idiomatic Svelte code from Figma design patterns.\n */\n\nimport type { BoundingBox } from \"./layout-analyzer\";\nimport type {\n  ListPatternResult,\n  ListPatternType,\n  ListSemanticType,\n  ListStructure,\n  ListItemInfo,\n  ItemContentType,\n} from \"./list-pattern-detector\";\nimport type { FormAnalysisResult, FormFieldGroup } from \"./form-analyzer\";\nimport type { NavigationPatternAnalysis, NavigationItem } from \"./navigation-pattern-detector\";\n\n// ============================================================================\n// Types and Interfaces\n// ============================================================================\n\n/** Generated Svelte component output */\nexport interface GeneratedSvelteCode {\n  /** Complete .svelte component file content */\n  component: string;\n  /** TypeScript types (for separate .d.ts or inline) */\n  types: string;\n  /** CSS styles (can be extracted or kept in component) */\n  styles: string;\n  /** Store definitions (for separate store file) */\n  stores: string;\n  /** Actions definitions (for separate actions file) */\n  actions: string;\n}\n\n/** Configuration for Svelte code generation */\nexport interface SvelteGenerationOptions {\n  /** Use TypeScript in script tag */\n  useTypeScript: boolean;\n  /** Use Tailwind CSS instead of scoped styles */\n  useTailwind: boolean;\n  /** Use Svelte 5 runes syntax ($state, $derived, etc.) */\n  useSvelte5Runes: boolean;\n  /** Generate stores for state management */\n  generateStores: boolean;\n  /** Generate actions for reusable behaviors */\n  generateActions: boolean;\n  /** Include transition effects */\n  includeTransitions: boolean;\n  /** Component name prefix */\n  componentPrefix: string;\n  /** Include sample data */\n  includeSampleData: boolean;\n  /** Responsive design support */\n  responsive: boolean;\n}\n\n/** Svelte transition configuration */\nexport interface TransitionConfig {\n  type: \"fade\" | \"fly\" | \"slide\" | \"scale\" | \"blur\" | \"draw\";\n  direction?: \"in\" | \"out\" | \"both\";\n  params?: Record<string, number | string>;\n}\n\n/** Svelte store configuration */\nexport interface StoreConfig {\n  name: string;\n  type: \"writable\" | \"readable\" | \"derived\";\n  initialValue: string;\n  derivedFrom?: string[];\n}\n\n/** Svelte action configuration */\nexport interface ActionConfig {\n  name: string;\n  description: string;\n  code: string;\n}\n\n/** Default generation options */\nconst DEFAULT_OPTIONS: SvelteGenerationOptions = {\n  useTypeScript: true,\n  useTailwind: true,\n  useSvelte5Runes: false, // Use classic syntax by default for broader compatibility\n  generateStores: true,\n  generateActions: true,\n  includeTransitions: true,\n  componentPrefix: \"\",\n  includeSampleData: true,\n  responsive: true,\n};\n\n// ============================================================================\n// Main Generation Functions\n// ============================================================================\n\n/**\n * Generate a complete Svelte component from list pattern analysis\n */\nexport function generateSvelteListComponent(\n  patternResult: ListPatternResult,\n  options: Partial<SvelteGenerationOptions> = {}\n): GeneratedSvelteCode {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n\n  const componentName = getComponentName(patternResult.semanticType, opts.componentPrefix);\n  const types = generateTypeDefinitions(patternResult, opts);\n  const stores = opts.generateStores ? generateStores(patternResult, opts) : \"\";\n  const actions = opts.generateActions ? generateActions(patternResult, opts) : \"\";\n  const styles = opts.useTailwind ? \"\" : generateScopedStyles(patternResult, opts);\n  const component = generateComponent(patternResult, componentName, opts);\n\n  return {\n    component,\n    types,\n    styles,\n    stores,\n    actions,\n  };\n}\n\n/**\n * Generate a Svelte component from form analysis\n */\nexport function generateSvelteFormComponent(\n  formAnalysis: FormAnalysisResult,\n  options: Partial<SvelteGenerationOptions> = {}\n): GeneratedSvelteCode {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n\n  const componentName = `${opts.componentPrefix}Form`;\n  const types = generateFormTypes(formAnalysis, opts);\n  const stores = opts.generateStores ? generateFormStores(formAnalysis, opts) : \"\";\n  const actions = opts.generateActions ? generateFormActions(opts) : \"\";\n  const styles = opts.useTailwind ? \"\" : generateFormStyles(formAnalysis, opts);\n  const component = generateFormComponent(formAnalysis, componentName, opts);\n\n  return {\n    component,\n    types,\n    styles,\n    stores,\n    actions,\n  };\n}\n\n/**\n * Generate a Svelte component from navigation pattern analysis\n */\nexport function generateSvelteNavComponent(\n  navAnalysis: NavigationPatternAnalysis,\n  options: Partial<SvelteGenerationOptions> = {}\n): GeneratedSvelteCode {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n\n  const componentName = getNavComponentName(navAnalysis.patternType, opts.componentPrefix);\n  const types = generateNavTypes(navAnalysis, opts);\n  const stores = opts.generateStores ? generateNavStores(navAnalysis, opts) : \"\";\n  const actions = opts.generateActions ? generateNavActions(opts) : \"\";\n  const styles = opts.useTailwind ? \"\" : generateNavStyles(navAnalysis, opts);\n  const component = generateNavComponent(navAnalysis, componentName, opts);\n\n  return {\n    component,\n    types,\n    styles,\n    stores,\n    actions,\n  };\n}\n\n// ============================================================================\n// Component Generation\n// ============================================================================\n\n/**\n * Generate the main Svelte component\n */\nfunction generateComponent(\n  result: ListPatternResult,\n  componentName: string,\n  options: SvelteGenerationOptions\n): string {\n  const { patternType, semanticType } = result;\n  const itemTypeName = getItemTypeName(semanticType);\n  const itemsVar = `${itemTypeName.toLowerCase()}s`;\n\n  let script = generateScript(result, options, itemTypeName);\n  let template = generateTemplate(result, options, itemTypeName, itemsVar);\n  let style = options.useTailwind ? \"\" : generateStyleBlock(result, options);\n\n  return `${script}\n\n${template}${style}`;\n}\n\n/**\n * Generate the script section\n */\nfunction generateScript(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string\n): string {\n  const scriptLang = options.useTypeScript ? ' lang=\"ts\"' : \"\";\n  const itemsVar = `${itemTypeName.toLowerCase()}s`;\n\n  let imports: string[] = [];\n  let declarations: string[] = [];\n  let reactiveDeclarations: string[] = [];\n\n  // Add transition imports if needed\n  if (options.includeTransitions) {\n    imports.push(`  import { fade, fly, slide } from 'svelte/transition';`);\n  }\n\n  // Add store imports if using stores\n  if (options.generateStores) {\n    imports.push(`  import { writable, derived } from 'svelte/store';`);\n  }\n\n  // Props declaration\n  if (options.useSvelte5Runes) {\n    // Svelte 5 runes syntax\n    if (options.useTypeScript) {\n      declarations.push(`  interface Props {\n    ${itemsVar}: ${itemTypeName}[];\n    class?: string;\n  }\n\n  let { ${itemsVar}, class: className = '' }: Props = $props();`);\n    } else {\n      declarations.push(`  let { ${itemsVar}, class: className = '' } = $props();`);\n    }\n  } else {\n    // Classic Svelte syntax\n    if (options.useTypeScript) {\n      declarations.push(`  export let ${itemsVar}: ${itemTypeName}[] = [];`);\n    } else {\n      declarations.push(`  export let ${itemsVar} = [];`);\n    }\n    declarations.push(`  export let className = '';`);\n  }\n\n  // Add reactive declarations based on pattern type\n  if (result.patternType === \"tabs\") {\n    if (options.useSvelte5Runes) {\n      declarations.push(`  let activeIndex = $state(0);`);\n      reactiveDeclarations.push(`  let activeItem = $derived(${itemsVar}[activeIndex]);`);\n    } else {\n      declarations.push(`  let activeIndex = 0;`);\n      reactiveDeclarations.push(`  $: activeItem = ${itemsVar}[activeIndex];`);\n    }\n  } else if (result.patternType === \"carousel\") {\n    if (options.useSvelte5Runes) {\n      declarations.push(`  let currentSlide = $state(0);`);\n      reactiveDeclarations.push(`  let totalSlides = $derived(${itemsVar}.length);`);\n      reactiveDeclarations.push(`  let canGoNext = $derived(currentSlide < totalSlides - 1);`);\n      reactiveDeclarations.push(`  let canGoPrev = $derived(currentSlide > 0);`);\n    } else {\n      declarations.push(`  let currentSlide = 0;`);\n      reactiveDeclarations.push(`  $: totalSlides = ${itemsVar}.length;`);\n      reactiveDeclarations.push(`  $: canGoNext = currentSlide < totalSlides - 1;`);\n      reactiveDeclarations.push(`  $: canGoPrev = currentSlide > 0;`);\n    }\n  } else if (result.patternType === \"card-grid\" || result.patternType === \"vertical-list\") {\n    // Add filter/search functionality\n    if (options.useSvelte5Runes) {\n      declarations.push(`  let searchQuery = $state('');`);\n      reactiveDeclarations.push(`  let filtered${itemTypeName}s = $derived(\n    searchQuery\n      ? ${itemsVar}.filter(item =>\n          item.title?.toLowerCase().includes(searchQuery.toLowerCase())\n        )\n      : ${itemsVar}\n  );`);\n    } else {\n      declarations.push(`  let searchQuery = '';`);\n      reactiveDeclarations.push(`  $: filtered${itemTypeName}s = searchQuery\n    ? ${itemsVar}.filter(item =>\n        item.title?.toLowerCase().includes(searchQuery.toLowerCase())\n      )\n    : ${itemsVar};`);\n    }\n  }\n\n  // Add helper functions\n  const functions = generateHelperFunctions(result, options);\n\n  let script = `<script${scriptLang}>`;\n  if (imports.length > 0) {\n    script += `\\n${imports.join(\"\\n\")}`;\n  }\n  if (declarations.length > 0) {\n    script += `\\n\\n${declarations.join(\"\\n\")}`;\n  }\n  if (reactiveDeclarations.length > 0) {\n    script += `\\n\\n  // Reactive declarations`;\n    script += `\\n${reactiveDeclarations.join(\"\\n\")}`;\n  }\n  if (functions) {\n    script += `\\n\\n${functions}`;\n  }\n  script += `\\n</script>`;\n\n  return script;\n}\n\n/**\n * Generate helper functions based on pattern type\n */\nfunction generateHelperFunctions(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  const functions: string[] = [];\n\n  if (result.patternType === \"tabs\") {\n    functions.push(`  function selectTab(index) {\n    activeIndex = index;\n  }`);\n  } else if (result.patternType === \"carousel\") {\n    functions.push(`  function nextSlide() {\n    if (canGoNext) currentSlide++;\n  }\n\n  function prevSlide() {\n    if (canGoPrev) currentSlide--;\n  }\n\n  function goToSlide(index) {\n    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));\n  }`);\n  }\n\n  return functions.join(\"\\n\\n\");\n}\n\n/**\n * Generate the template section based on pattern type\n */\nfunction generateTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const { patternType } = result;\n\n  switch (patternType) {\n    case \"card-grid\":\n      return generateCardGridTemplate(result, options, itemTypeName, itemsVar);\n    case \"vertical-list\":\n      return generateVerticalListTemplate(result, options, itemTypeName, itemsVar);\n    case \"horizontal-list\":\n      return generateHorizontalListTemplate(result, options, itemTypeName, itemsVar);\n    case \"navigation-menu\":\n      return generateNavigationMenuTemplate(result, options, itemTypeName, itemsVar);\n    case \"tabs\":\n      return generateTabsTemplate(result, options, itemTypeName, itemsVar);\n    case \"carousel\":\n      return generateCarouselTemplate(result, options, itemTypeName, itemsVar);\n    case \"table\":\n      return generateTableTemplate(result, options, itemTypeName, itemsVar);\n    default:\n      return generateGenericListTemplate(result, options, itemTypeName, itemsVar);\n  }\n}\n\n/**\n * Generate card grid template\n */\nfunction generateCardGridTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const { structure, suggestedElement } = result;\n  const containerClasses = options.useTailwind\n    ? suggestedElement.containerClasses.join(\" \")\n    : \"card-grid\";\n  const itemClasses = options.useTailwind\n    ? suggestedElement.itemClasses.join(\" \")\n    : \"card\";\n\n  const transition = options.includeTransitions ? \" transition:fade\" : \"\";\n  const filteredVar = `filtered${itemTypeName}s`;\n\n  return `<div class=\"${containerClasses} {className}\" role=\"list\">\n  {#each ${filteredVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}\n    <article\n      class=\"${itemClasses}\"${transition}\n      role=\"listitem\"\n    >\n      {#if ${itemTypeName.toLowerCase()}.imageUrl}\n        <img\n          src={${itemTypeName.toLowerCase()}.imageUrl}\n          alt={${itemTypeName.toLowerCase()}.title}\n          class=\"${options.useTailwind ? \"aspect-video object-cover rounded-md mb-3\" : \"card-image\"}\"\n        />\n      {:else}\n        <div class=\"${options.useTailwind ? \"aspect-video bg-muted rounded-md mb-3\" : \"card-placeholder\"}\" />\n      {/if}\n      <h3 class=\"${options.useTailwind ? \"font-semibold text-base\" : \"card-title\"}\">\n        {${itemTypeName.toLowerCase()}.title}\n      </h3>\n      {#if ${itemTypeName.toLowerCase()}.description}\n        <p class=\"${options.useTailwind ? \"text-sm text-muted-foreground mt-1\" : \"card-description\"}\">\n          {${itemTypeName.toLowerCase()}.description}\n        </p>\n      {/if}\n    </article>\n  {:else}\n    <p class=\"${options.useTailwind ? \"col-span-full text-center text-muted-foreground py-8\" : \"empty-state\"}\">\n      No items found\n    </p>\n  {/each}\n</div>`;\n}\n\n/**\n * Generate vertical list template\n */\nfunction generateVerticalListTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const containerClasses = options.useTailwind\n    ? result.suggestedElement.containerClasses.join(\" \")\n    : \"vertical-list\";\n\n  const transition = options.includeTransitions ? \" transition:slide\" : \"\";\n  const filteredVar = `filtered${itemTypeName}s`;\n\n  return `<ul class=\"${containerClasses} {className}\" role=\"list\">\n  {#each ${filteredVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}\n    <li\n      class=\"${options.useTailwind ? \"flex items-center gap-4 p-3 hover:bg-accent rounded-lg transition-colors\" : \"list-item\"}\"${transition}\n    >\n      {#if ${itemTypeName.toLowerCase()}.avatarUrl}\n        <img\n          src={${itemTypeName.toLowerCase()}.avatarUrl}\n          alt=\"\"\n          class=\"${options.useTailwind ? \"h-10 w-10 rounded-full object-cover flex-shrink-0\" : \"avatar\"}\"\n        />\n      {:else}\n        <div class=\"${options.useTailwind ? \"h-10 w-10 rounded-full bg-muted flex-shrink-0\" : \"avatar-placeholder\"}\" />\n      {/if}\n      <div class=\"${options.useTailwind ? \"flex-1 min-w-0\" : \"content\"}\">\n        <p class=\"${options.useTailwind ? \"font-medium truncate\" : \"title\"}\">\n          {${itemTypeName.toLowerCase()}.title}\n        </p>\n        {#if ${itemTypeName.toLowerCase()}.subtitle}\n          <p class=\"${options.useTailwind ? \"text-sm text-muted-foreground truncate\" : \"subtitle\"}\">\n            {${itemTypeName.toLowerCase()}.subtitle}\n          </p>\n        {/if}\n      </div>\n    </li>\n  {:else}\n    <li class=\"${options.useTailwind ? \"text-center text-muted-foreground py-4\" : \"empty-state\"}\">\n      No items found\n    </li>\n  {/each}\n</ul>`;\n}\n\n/**\n * Generate horizontal list template\n */\nfunction generateHorizontalListTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const containerClasses = options.useTailwind\n    ? result.suggestedElement.containerClasses.join(\" \")\n    : \"horizontal-list\";\n\n  return `<ul class=\"${containerClasses} {className}\" role=\"list\">\n  {#each ${itemsVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}\n    <li class=\"${options.useTailwind ? \"flex-shrink-0\" : \"horizontal-item\"}\">\n      {${itemTypeName.toLowerCase()}.label ?? ${itemTypeName.toLowerCase()}.title}\n    </li>\n  {/each}\n</ul>`;\n}\n\n/**\n * Generate navigation menu template\n */\nfunction generateNavigationMenuTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const containerClasses = options.useTailwind\n    ? result.suggestedElement.containerClasses.join(\" \")\n    : \"navigation\";\n  const ariaLabel = result.suggestedElement.ariaAttributes[\"aria-label\"] || \"Navigation\";\n\n  return `<nav class=\"${containerClasses} {className}\" aria-label=\"${ariaLabel}\">\n  {#each ${itemsVar} as item, index (item.href ?? index)}\n    <a\n      href={item.href}\n      class=\"${options.useTailwind ? \"text-sm font-medium text-muted-foreground hover:text-foreground transition-colors\" : \"nav-link\"}\"\n      class:${options.useTailwind ? \"text-foreground\" : \"active\"}={item.isActive}\n      aria-current={item.isActive ? 'page' : undefined}\n    >\n      {item.label}\n    </a>\n  {/each}\n</nav>`;\n}\n\n/**\n * Generate tabs template\n */\nfunction generateTabsTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const containerClasses = options.useTailwind\n    ? result.suggestedElement.containerClasses.join(\" \")\n    : \"tabs\";\n\n  return `<div class=\"{className}\">\n  <!-- Tab buttons -->\n  <div class=\"${containerClasses}\" role=\"tablist\" aria-label=\"Tabs\">\n    {#each ${itemsVar} as tab, index (tab.id ?? index)}\n      <button\n        role=\"tab\"\n        aria-selected={activeIndex === index}\n        aria-controls=\"panel-{tab.id ?? index}\"\n        tabindex={activeIndex === index ? 0 : -1}\n        class=\"${options.useTailwind\n          ? \"px-4 py-2 text-sm font-medium border-b-2 transition-colors\"\n          : \"tab\"}\"\n        class:${options.useTailwind\n          ? \"border-primary text-foreground\"\n          : \"active\"}={activeIndex === index}\n        class:${options.useTailwind\n          ? \"border-transparent text-muted-foreground hover:text-foreground hover:border-border\"\n          : \"inactive\"}={activeIndex !== index}\n        on:click={() => selectTab(index)}\n        on:keydown={(e) => {\n          if (e.key === 'ArrowRight') selectTab(Math.min(activeIndex + 1, ${itemsVar}.length - 1));\n          if (e.key === 'ArrowLeft') selectTab(Math.max(activeIndex - 1, 0));\n        }}\n      >\n        {tab.label}\n      </button>\n    {/each}\n  </div>\n\n  <!-- Tab panels -->\n  {#each ${itemsVar} as tab, index (tab.id ?? index)}\n    <div\n      role=\"tabpanel\"\n      id=\"panel-{tab.id ?? index}\"\n      aria-labelledby=\"tab-{tab.id ?? index}\"\n      hidden={activeIndex !== index}\n      class=\"${options.useTailwind ? \"p-4\" : \"tab-panel\"}\"\n    >\n      {#if activeIndex === index}\n        <slot name=\"panel-{index}\">\n          <p class=\"${options.useTailwind ? \"text-muted-foreground\" : \"panel-placeholder\"}\">\n            Content for {tab.label}\n          </p>\n        </slot>\n      {/if}\n    </div>\n  {/each}\n</div>`;\n}\n\n/**\n * Generate carousel template\n */\nfunction generateCarouselTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const { structure } = result;\n  const transition = options.includeTransitions ? \" transition:fade\" : \"\";\n\n  return `<div\n  class=\"${options.useTailwind ? \"relative overflow-hidden\" : \"carousel\"} {className}\"\n  role=\"region\"\n  aria-label=\"Carousel\"\n  aria-roledescription=\"carousel\"\n>\n  <!-- Slides container -->\n  <div\n    class=\"${options.useTailwind ? \"flex transition-transform duration-300 ease-in-out\" : \"slides\"}\"\n    style=\"transform: translateX(-{currentSlide * 100}%)\"\n  >\n    {#each ${itemsVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}\n      <div\n        class=\"${options.useTailwind ? \"w-full flex-shrink-0 px-4\" : \"slide\"}\"\n        role=\"group\"\n        aria-roledescription=\"slide\"\n        aria-label=\"Slide {index + 1} of {totalSlides}\"${transition}\n      >\n        <div class=\"${options.useTailwind ? \"rounded-lg border bg-card overflow-hidden\" : \"slide-card\"}\">\n          {#if ${itemTypeName.toLowerCase()}.imageUrl}\n            <img\n              src={${itemTypeName.toLowerCase()}.imageUrl}\n              alt={${itemTypeName.toLowerCase()}.title}\n              class=\"${options.useTailwind ? \"aspect-video w-full object-cover\" : \"slide-image\"}\"\n            />\n          {:else}\n            <div class=\"${options.useTailwind ? \"aspect-video bg-muted\" : \"slide-placeholder\"}\" />\n          {/if}\n          <div class=\"${options.useTailwind ? \"p-4\" : \"slide-content\"}\">\n            <h3 class=\"${options.useTailwind ? \"font-semibold\" : \"slide-title\"}\">\n              {${itemTypeName.toLowerCase()}.title}\n            </h3>\n          </div>\n        </div>\n      </div>\n    {/each}\n  </div>\n\n  <!-- Navigation buttons -->\n  <button\n    class=\"${options.useTailwind\n      ? \"absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-50\"\n      : \"nav-prev\"}\"\n    on:click={prevSlide}\n    disabled={!canGoPrev}\n    aria-label=\"Previous slide\"\n  >\n    <svg class=\"${options.useTailwind ? \"h-5 w-5\" : \"\"}\" viewBox=\"0 0 20 20\" fill=\"currentColor\">\n      <path fill-rule=\"evenodd\" d=\"M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z\" clip-rule=\"evenodd\" />\n    </svg>\n  </button>\n\n  <button\n    class=\"${options.useTailwind\n      ? \"absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-50\"\n      : \"nav-next\"}\"\n    on:click={nextSlide}\n    disabled={!canGoNext}\n    aria-label=\"Next slide\"\n  >\n    <svg class=\"${options.useTailwind ? \"h-5 w-5\" : \"\"}\" viewBox=\"0 0 20 20\" fill=\"currentColor\">\n      <path fill-rule=\"evenodd\" d=\"M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z\" clip-rule=\"evenodd\" />\n    </svg>\n  </button>\n\n  <!-- Dots indicator -->\n  <div class=\"${options.useTailwind ? \"absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2\" : \"dots\"}\">\n    {#each ${itemsVar} as _, index}\n      <button\n        class=\"${options.useTailwind\n          ? \"h-2 w-2 rounded-full transition-colors\"\n          : \"dot\"}\"\n        class:${options.useTailwind ? \"bg-primary\" : \"active\"}={currentSlide === index}\n        class:${options.useTailwind ? \"bg-muted\" : \"inactive\"}={currentSlide !== index}\n        on:click={() => goToSlide(index)}\n        aria-label=\"Go to slide {index + 1}\"\n      />\n    {/each}\n  </div>\n</div>`;\n}\n\n/**\n * Generate table template\n */\nfunction generateTableTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  return `<div class=\"${options.useTailwind ? \"overflow-x-auto\" : \"table-container\"} {className}\">\n  <table class=\"${options.useTailwind ? \"w-full border-collapse\" : \"data-table\"}\">\n    <thead>\n      <tr class=\"${options.useTailwind ? \"border-b bg-muted/50\" : \"table-header-row\"}\">\n        <th class=\"${options.useTailwind ? \"px-4 py-3 text-left text-sm font-medium\" : \"\"}\">Column 1</th>\n        <th class=\"${options.useTailwind ? \"px-4 py-3 text-left text-sm font-medium\" : \"\"}\">Column 2</th>\n        <th class=\"${options.useTailwind ? \"px-4 py-3 text-left text-sm font-medium\" : \"\"}\">Column 3</th>\n      </tr>\n    </thead>\n    <tbody>\n      {#each ${itemsVar} as row, index (row.id ?? index)}\n        <tr class=\"${options.useTailwind ? \"border-b hover:bg-muted/50 transition-colors\" : \"table-row\"}\">\n          <td class=\"${options.useTailwind ? \"px-4 py-3 text-sm\" : \"\"}\">{row.cell1}</td>\n          <td class=\"${options.useTailwind ? \"px-4 py-3 text-sm\" : \"\"}\">{row.cell2}</td>\n          <td class=\"${options.useTailwind ? \"px-4 py-3 text-sm\" : \"\"}\">{row.cell3}</td>\n        </tr>\n      {:else}\n        <tr>\n          <td colspan=\"3\" class=\"${options.useTailwind ? \"px-4 py-8 text-center text-muted-foreground\" : \"empty-row\"}\">\n            No data available\n          </td>\n        </tr>\n      {/each}\n    </tbody>\n  </table>\n</div>`;\n}\n\n/**\n * Generate generic list template\n */\nfunction generateGenericListTemplate(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions,\n  itemTypeName: string,\n  itemsVar: string\n): string {\n  const containerClasses = options.useTailwind\n    ? result.suggestedElement.containerClasses.join(\" \") || \"flex flex-col gap-4\"\n    : \"list-container\";\n  const transition = options.includeTransitions ? \" transition:fade\" : \"\";\n\n  return `<div class=\"${containerClasses} {className}\">\n  {#each ${itemsVar} as item, index (item.id ?? index)}\n    <div\n      class=\"${options.useTailwind ? \"p-4 border rounded-lg\" : \"list-item\"}\"${transition}\n    >\n      {item.content ?? item.title}\n    </div>\n  {:else}\n    <p class=\"${options.useTailwind ? \"text-center text-muted-foreground py-4\" : \"empty-state\"}\">\n      No items to display\n    </p>\n  {/each}\n</div>`;\n}\n\n// ============================================================================\n// Style Generation\n// ============================================================================\n\n/**\n * Generate the style block for non-Tailwind components\n */\nfunction generateStyleBlock(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  const styles = generateScopedStyles(result, options);\n  if (!styles) return \"\";\n\n  return `\n\n<style>\n${styles}\n</style>`;\n}\n\n/**\n * Generate scoped CSS styles\n */\nfunction generateScopedStyles(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  const { patternType, structure } = result;\n\n  switch (patternType) {\n    case \"card-grid\":\n      return generateCardGridStyles(structure, options);\n    case \"vertical-list\":\n      return generateVerticalListStyles(structure, options);\n    case \"horizontal-list\":\n      return generateHorizontalListStyles(structure, options);\n    case \"tabs\":\n      return generateTabsStyles(options);\n    case \"carousel\":\n      return generateCarouselStyles(structure, options);\n    case \"table\":\n      return generateTableStyles(options);\n    default:\n      return generateGenericStyles(structure, options);\n  }\n}\n\nfunction generateCardGridStyles(structure: ListStructure, options: SvelteGenerationOptions): string {\n  const columnTemplate =\n    structure.columns > 1\n      ? `repeat(${structure.columns}, 1fr)`\n      : \"repeat(auto-fill, minmax(280px, 1fr))\";\n\n  return `  .card-grid {\n    display: grid;\n    grid-template-columns: ${columnTemplate};\n    gap: ${structure.verticalGap}px ${structure.horizontalGap}px;\n  }\n\n  .card {\n    border-radius: 0.5rem;\n    border: 1px solid var(--border, #e5e7eb);\n    background: var(--card, #ffffff);\n    padding: 1rem;\n    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);\n  }\n\n  .card-image {\n    aspect-ratio: 16 / 9;\n    object-fit: cover;\n    border-radius: 0.375rem;\n    margin-bottom: 0.75rem;\n    width: 100%;\n  }\n\n  .card-placeholder {\n    aspect-ratio: 16 / 9;\n    background: var(--muted, #f3f4f6);\n    border-radius: 0.375rem;\n    margin-bottom: 0.75rem;\n  }\n\n  .card-title {\n    font-weight: 600;\n    font-size: 1rem;\n    margin: 0;\n  }\n\n  .card-description {\n    font-size: 0.875rem;\n    color: var(--muted-foreground, #6b7280);\n    margin: 0.25rem 0 0;\n  }\n\n  .empty-state {\n    grid-column: 1 / -1;\n    text-align: center;\n    color: var(--muted-foreground, #6b7280);\n    padding: 2rem;\n  }${options.responsive ? `\n\n  @media (max-width: 768px) {\n    .card-grid {\n      grid-template-columns: repeat(2, 1fr);\n    }\n  }\n\n  @media (max-width: 480px) {\n    .card-grid {\n      grid-template-columns: 1fr;\n    }\n  }` : \"\"}`;\n}\n\nfunction generateVerticalListStyles(structure: ListStructure, options: SvelteGenerationOptions): string {\n  return `  .vertical-list {\n    display: flex;\n    flex-direction: column;\n    gap: ${structure.verticalGap}px;\n    list-style: none;\n    padding: 0;\n    margin: 0;\n  }\n\n  .list-item {\n    display: flex;\n    align-items: center;\n    gap: 1rem;\n    padding: 0.75rem;\n    border-radius: 0.5rem;\n    transition: background-color 0.15s ease;\n  }\n\n  .list-item:hover {\n    background-color: var(--accent, #f3f4f6);\n  }\n\n  .avatar, .avatar-placeholder {\n    height: 2.5rem;\n    width: 2.5rem;\n    border-radius: 9999px;\n    flex-shrink: 0;\n  }\n\n  .avatar {\n    object-fit: cover;\n  }\n\n  .avatar-placeholder {\n    background: var(--muted, #e5e7eb);\n  }\n\n  .content {\n    flex: 1;\n    min-width: 0;\n  }\n\n  .title {\n    font-weight: 500;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    margin: 0;\n  }\n\n  .subtitle {\n    font-size: 0.875rem;\n    color: var(--muted-foreground, #6b7280);\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    margin: 0;\n  }`;\n}\n\nfunction generateHorizontalListStyles(structure: ListStructure, options: SvelteGenerationOptions): string {\n  return `  .horizontal-list {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    gap: ${structure.horizontalGap}px;\n    list-style: none;\n    padding: 0;\n    margin: 0;\n  }\n\n  .horizontal-item {\n    flex-shrink: 0;\n  }`;\n}\n\nfunction generateTabsStyles(options: SvelteGenerationOptions): string {\n  return `  .tabs {\n    display: flex;\n    border-bottom: 1px solid var(--border, #e5e7eb);\n  }\n\n  .tab {\n    padding: 0.5rem 1rem;\n    font-size: 0.875rem;\n    font-weight: 500;\n    border: none;\n    border-bottom: 2px solid transparent;\n    background: none;\n    color: var(--muted-foreground, #6b7280);\n    cursor: pointer;\n    transition: all 0.15s ease;\n  }\n\n  .tab:hover {\n    color: var(--foreground, #111827);\n    border-bottom-color: var(--border, #e5e7eb);\n  }\n\n  .tab.active {\n    color: var(--foreground, #111827);\n    border-bottom-color: var(--primary, #2563eb);\n  }\n\n  .tab-panel {\n    padding: 1rem;\n  }\n\n  .panel-placeholder {\n    color: var(--muted-foreground, #6b7280);\n  }`;\n}\n\nfunction generateCarouselStyles(structure: ListStructure, options: SvelteGenerationOptions): string {\n  return `  .carousel {\n    position: relative;\n    overflow: hidden;\n  }\n\n  .slides {\n    display: flex;\n    transition: transform 0.3s ease-in-out;\n  }\n\n  .slide {\n    flex-shrink: 0;\n    width: 100%;\n    padding: 0 1rem;\n  }\n\n  .slide-card {\n    border-radius: 0.5rem;\n    border: 1px solid var(--border, #e5e7eb);\n    background: var(--card, #ffffff);\n    overflow: hidden;\n  }\n\n  .slide-image {\n    aspect-ratio: 16 / 9;\n    width: 100%;\n    object-fit: cover;\n  }\n\n  .slide-placeholder {\n    aspect-ratio: 16 / 9;\n    background: var(--muted, #f3f4f6);\n  }\n\n  .slide-content {\n    padding: 1rem;\n  }\n\n  .slide-title {\n    font-weight: 600;\n    margin: 0;\n  }\n\n  .nav-prev, .nav-next {\n    position: absolute;\n    top: 50%;\n    transform: translateY(-50%);\n    padding: 0.5rem;\n    border-radius: 9999px;\n    background: rgba(255, 255, 255, 0.8);\n    border: none;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n    cursor: pointer;\n  }\n\n  .nav-prev { left: 0.5rem; }\n  .nav-next { right: 0.5rem; }\n\n  .nav-prev:disabled, .nav-next:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  .dots {\n    position: absolute;\n    bottom: 1rem;\n    left: 50%;\n    transform: translateX(-50%);\n    display: flex;\n    gap: 0.5rem;\n  }\n\n  .dot {\n    width: 0.5rem;\n    height: 0.5rem;\n    border-radius: 9999px;\n    border: none;\n    cursor: pointer;\n    transition: background-color 0.15s ease;\n  }\n\n  .dot.active { background: var(--primary, #2563eb); }\n  .dot.inactive { background: var(--muted, #e5e7eb); }`;\n}\n\nfunction generateTableStyles(options: SvelteGenerationOptions): string {\n  return `  .table-container {\n    overflow-x: auto;\n  }\n\n  .data-table {\n    width: 100%;\n    border-collapse: collapse;\n  }\n\n  .data-table th,\n  .data-table td {\n    padding: 0.75rem 1rem;\n    text-align: left;\n    font-size: 0.875rem;\n  }\n\n  .data-table th {\n    font-weight: 500;\n    background: var(--muted, #f3f4f6);\n    border-bottom: 1px solid var(--border, #e5e7eb);\n  }\n\n  .table-row {\n    border-bottom: 1px solid var(--border, #e5e7eb);\n    transition: background-color 0.15s ease;\n  }\n\n  .table-row:hover {\n    background-color: var(--muted, #f3f4f6);\n  }\n\n  .empty-row {\n    text-align: center;\n    color: var(--muted-foreground, #6b7280);\n    padding: 2rem;\n  }`;\n}\n\nfunction generateGenericStyles(structure: ListStructure, options: SvelteGenerationOptions): string {\n  return `  .list-container {\n    display: flex;\n    flex-direction: column;\n    gap: ${structure.verticalGap || 16}px;\n  }\n\n  .list-item {\n    padding: 1rem;\n    border: 1px solid var(--border, #e5e7eb);\n    border-radius: 0.5rem;\n  }\n\n  .empty-state {\n    text-align: center;\n    color: var(--muted-foreground, #6b7280);\n    padding: 1rem;\n  }`;\n}\n\n// ============================================================================\n// Type Definitions Generation\n// ============================================================================\n\n/**\n * Generate TypeScript type definitions\n */\nfunction generateTypeDefinitions(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  if (!options.useTypeScript) {\n    return \"// TypeScript types not generated (useTypeScript: false)\";\n  }\n\n  const { semanticType, listItems, patternType } = result;\n  const typeName = getTypeNameFromSemantic(semanticType);\n\n  let typedef = `/** Auto-generated type for ${patternType} items */\\n`;\n  typedef += `export interface ${typeName} {\\n`;\n  typedef += `  id: string | number;\\n`;\n  typedef += `  title: string;\\n`;\n\n  // Detect common content types across items\n  const allContentTypes = new Set<ItemContentType>();\n  for (const item of listItems) {\n    for (const type of item.contentTypes) {\n      allContentTypes.add(type);\n    }\n  }\n\n  if (allContentTypes.has(\"image\")) {\n    typedef += `  imageUrl?: string;\\n`;\n  }\n  if (allContentTypes.has(\"text\")) {\n    typedef += `  description?: string;\\n`;\n    typedef += `  subtitle?: string;\\n`;\n  }\n  if (allContentTypes.has(\"avatar\")) {\n    typedef += `  avatarUrl?: string;\\n`;\n  }\n  if (allContentTypes.has(\"badge\")) {\n    typedef += `  badge?: string;\\n`;\n  }\n  if (allContentTypes.has(\"price\")) {\n    typedef += `  price?: number;\\n`;\n  }\n  if (allContentTypes.has(\"rating\")) {\n    typedef += `  rating?: number;\\n`;\n  }\n  if (allContentTypes.has(\"timestamp\")) {\n    typedef += `  timestamp?: Date | string;\\n`;\n  }\n  if (allContentTypes.has(\"link\")) {\n    typedef += `  href?: string;\\n`;\n  }\n\n  // Add pattern-specific fields\n  if (patternType === \"navigation-menu\" || patternType === \"tabs\") {\n    typedef += `  label?: string;\\n`;\n    typedef += `  isActive?: boolean;\\n`;\n  }\n\n  typedef += `}\\n`;\n\n  return typedef;\n}\n\n// ============================================================================\n// Store Generation\n// ============================================================================\n\n/**\n * Generate Svelte store definitions\n */\nfunction generateStores(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  const { semanticType, patternType } = result;\n  const typeName = getTypeNameFromSemantic(semanticType);\n  const itemsVar = `${typeName.toLowerCase()}s`;\n\n  let stores = `/**\n * Svelte stores for ${patternType} component\n * Import: import { ${itemsVar}Store, loading, error } from './${typeName.toLowerCase()}-stores';\n */\n\nimport { writable, derived } from 'svelte/store';\n`;\n\n  if (options.useTypeScript) {\n    stores += `import type { ${typeName} } from './${typeName.toLowerCase()}-types';\\n\\n`;\n  } else {\n    stores += `\\n`;\n  }\n\n  // Main data store\n  stores += `/** Store for ${itemsVar} data */\nexport const ${itemsVar}Store = writable${options.useTypeScript ? `<${typeName}[]>` : \"\"}([]);\n\n/** Loading state store */\nexport const loading = writable(false);\n\n/** Error state store */\nexport const error = writable${options.useTypeScript ? \"<string | null>\" : \"\"}(null);\n\n`;\n\n  // Pattern-specific stores\n  if (patternType === \"tabs\") {\n    stores += `/** Active tab index store */\nexport const activeTabIndex = writable(0);\n\n/** Derived store for active tab */\nexport const activeTab = derived(\n  [${itemsVar}Store, activeTabIndex],\n  ([$${itemsVar}, $index]) => $${itemsVar}[$index]\n);\n\n`;\n  } else if (patternType === \"carousel\") {\n    stores += `/** Current slide index store */\nexport const currentSlide = writable(0);\n\n/** Derived store for total slides */\nexport const totalSlides = derived(${itemsVar}Store, $items => $items.length);\n\n/** Derived store for navigation state */\nexport const navigationState = derived(\n  [currentSlide, totalSlides],\n  ([$current, $total]) => ({\n    canGoNext: $current < $total - 1,\n    canGoPrev: $current > 0,\n    current: $current,\n    total: $total\n  })\n);\n\n`;\n  } else if (patternType === \"card-grid\" || patternType === \"vertical-list\") {\n    stores += `/** Search query store */\nexport const searchQuery = writable('');\n\n/** Derived store for filtered items */\nexport const filtered${typeName}s = derived(\n  [${itemsVar}Store, searchQuery],\n  ([$items, $query]) => {\n    if (!$query) return $items;\n    const q = $query.toLowerCase();\n    return $items.filter(item =>\n      item.title?.toLowerCase().includes(q) ||\n      item.description?.toLowerCase().includes(q)\n    );\n  }\n);\n\n`;\n  }\n\n  // Helper functions\n  stores += `/**\n * Fetch ${itemsVar} from API\n * @param url - API endpoint URL\n */\nexport async function fetch${typeName}s(url${options.useTypeScript ? \": string\" : \"\"}) {\n  loading.set(true);\n  error.set(null);\n\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error('Failed to fetch data');\n    const data = await response.json();\n    ${itemsVar}Store.set(data);\n  } catch (e) {\n    error.set(e${options.useTypeScript ? \" instanceof Error ? e.message : 'Unknown error'\" : \".message\"});\n  } finally {\n    loading.set(false);\n  }\n}\n\n/**\n * Reset stores to initial state\n */\nexport function reset${typeName}Stores() {\n  ${itemsVar}Store.set([]);\n  loading.set(false);\n  error.set(null);\n}\n`;\n\n  return stores;\n}\n\n// ============================================================================\n// Actions Generation\n// ============================================================================\n\n/**\n * Generate Svelte action definitions\n */\nfunction generateActions(\n  result: ListPatternResult,\n  options: SvelteGenerationOptions\n): string {\n  const { patternType } = result;\n\n  let actions = `/**\n * Svelte actions for ${patternType} component\n * Usage: <element use:actionName={params}>\n */\n\n`;\n\n  // Click outside action (useful for dropdowns, modals)\n  actions += `/**\n * Action to detect clicks outside an element\n * Usage: <div use:clickOutside on:outclick={handleOutClick}>\n */\nexport function clickOutside(node${options.useTypeScript ? \": HTMLElement\" : \"\"}) {\n  function handleClick(event${options.useTypeScript ? \": MouseEvent\" : \"\"}) {\n    if (!node.contains(event.target${options.useTypeScript ? \" as Node\" : \"\"})) {\n      node.dispatchEvent(new CustomEvent('outclick'));\n    }\n  }\n\n  document.addEventListener('click', handleClick, true);\n\n  return {\n    destroy() {\n      document.removeEventListener('click', handleClick, true);\n    }\n  };\n}\n\n`;\n\n  // Focus trap action (useful for modals, dropdowns)\n  actions += `/**\n * Action to trap focus within an element\n * Usage: <div use:focusTrap>\n */\nexport function focusTrap(node${options.useTypeScript ? \": HTMLElement\" : \"\"}) {\n  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])';\n\n  function handleKeydown(event${options.useTypeScript ? \": KeyboardEvent\" : \"\"}) {\n    if (event.key !== 'Tab') return;\n\n    const focusable = Array.from(node.querySelectorAll(focusableSelectors))${options.useTypeScript ? \" as HTMLElement[]\" : \"\"};\n    const first = focusable[0];\n    const last = focusable[focusable.length - 1];\n\n    if (event.shiftKey && document.activeElement === first) {\n      event.preventDefault();\n      last?.focus();\n    } else if (!event.shiftKey && document.activeElement === last) {\n      event.preventDefault();\n      first?.focus();\n    }\n  }\n\n  node.addEventListener('keydown', handleKeydown);\n\n  // Focus first focusable element\n  const firstFocusable = node.querySelector(focusableSelectors)${options.useTypeScript ? \" as HTMLElement\" : \"\"};\n  firstFocusable?.focus();\n\n  return {\n    destroy() {\n      node.removeEventListener('keydown', handleKeydown);\n    }\n  };\n}\n\n`;\n\n  // Lazy load action (useful for images)\n  actions += `/**\n * Action for lazy loading images\n * Usage: <img use:lazyLoad={src}>\n */\nexport function lazyLoad(node${options.useTypeScript ? \": HTMLImageElement\" : \"\"}, src${options.useTypeScript ? \": string\" : \"\"}) {\n  const observer = new IntersectionObserver((entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        node.src = src;\n        observer.unobserve(node);\n      }\n    });\n  }, { rootMargin: '100px' });\n\n  observer.observe(node);\n\n  return {\n    destroy() {\n      observer.unobserve(node);\n    },\n    update(newSrc${options.useTypeScript ? \": string\" : \"\"}) {\n      src = newSrc;\n    }\n  };\n}\n\n`;\n\n  // Pattern-specific actions\n  if (patternType === \"carousel\") {\n    actions += `/**\n * Action for swipe gestures on carousel\n * Usage: <div use:swipeable on:swipeleft on:swiperight>\n */\nexport function swipeable(node${options.useTypeScript ? \": HTMLElement\" : \"\"}) {\n  let startX${options.useTypeScript ? \": number\" : \"\"};\n  let startY${options.useTypeScript ? \": number\" : \"\"};\n\n  function handleTouchStart(event${options.useTypeScript ? \": TouchEvent\" : \"\"}) {\n    startX = event.touches[0].clientX;\n    startY = event.touches[0].clientY;\n  }\n\n  function handleTouchEnd(event${options.useTypeScript ? \": TouchEvent\" : \"\"}) {\n    const endX = event.changedTouches[0].clientX;\n    const endY = event.changedTouches[0].clientY;\n    const diffX = endX - startX;\n    const diffY = endY - startY;\n\n    // Only trigger if horizontal movement is greater than vertical\n    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {\n      if (diffX > 0) {\n        node.dispatchEvent(new CustomEvent('swiperight'));\n      } else {\n        node.dispatchEvent(new CustomEvent('swipeleft'));\n      }\n    }\n  }\n\n  node.addEventListener('touchstart', handleTouchStart, { passive: true });\n  node.addEventListener('touchend', handleTouchEnd, { passive: true });\n\n  return {\n    destroy() {\n      node.removeEventListener('touchstart', handleTouchStart);\n      node.removeEventListener('touchend', handleTouchEnd);\n    }\n  };\n}\n\n`;\n  }\n\n  // Tooltip action\n  actions += `/**\n * Action to show tooltip on hover\n * Usage: <element use:tooltip={'Tooltip text'}>\n */\nexport function tooltip(node${options.useTypeScript ? \": HTMLElement\" : \"\"}, text${options.useTypeScript ? \": string\" : \"\"}) {\n  let tooltipEl${options.useTypeScript ? \": HTMLDivElement | null\" : \"\"} = null;\n\n  function showTooltip() {\n    tooltipEl = document.createElement('div');\n    tooltipEl.textContent = text;\n    tooltipEl.style.cssText = \\`\n      position: fixed;\n      background: #1f2937;\n      color: white;\n      padding: 4px 8px;\n      border-radius: 4px;\n      font-size: 12px;\n      z-index: 9999;\n      pointer-events: none;\n    \\`;\n    document.body.appendChild(tooltipEl);\n\n    const rect = node.getBoundingClientRect();\n    tooltipEl.style.left = \\`\\${rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2}px\\`;\n    tooltipEl.style.top = \\`\\${rect.top - tooltipEl.offsetHeight - 8}px\\`;\n  }\n\n  function hideTooltip() {\n    tooltipEl?.remove();\n    tooltipEl = null;\n  }\n\n  node.addEventListener('mouseenter', showTooltip);\n  node.addEventListener('mouseleave', hideTooltip);\n\n  return {\n    destroy() {\n      hideTooltip();\n      node.removeEventListener('mouseenter', showTooltip);\n      node.removeEventListener('mouseleave', hideTooltip);\n    },\n    update(newText${options.useTypeScript ? \": string\" : \"\"}) {\n      text = newText;\n    }\n  };\n}\n`;\n\n  return actions;\n}\n\n// ============================================================================\n// Form Component Generation\n// ============================================================================\n\nfunction generateFormComponent(\n  formAnalysis: FormAnalysisResult,\n  componentName: string,\n  options: SvelteGenerationOptions\n): string {\n  const scriptLang = options.useTypeScript ? ' lang=\"ts\"' : \"\";\n\n  let script = `<script${scriptLang}>`;\n\n  if (options.includeTransitions) {\n    script += `\\n  import { fade, slide } from 'svelte/transition';`;\n  }\n\n  // Form state\n  if (options.useSvelte5Runes) {\n    script += `\\n\n  interface FormData {\n    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\\s+/g, '_').toLowerCase()}: string;`).join('\\n    ')}\n  }\n\n  let formData = $state<FormData>({\n    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\\s+/g, '_').toLowerCase()}: ''`).join(',\\n    ')}\n  });\n\n  let errors = $state<Partial<Record<keyof FormData, string>>>({});\n  let isSubmitting = $state(false);\n  let isValid = $derived(Object.keys(errors).length === 0);`;\n  } else {\n    script += `\\n\n  let formData = {\n    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\\s+/g, '_').toLowerCase()}: ''`).join(',\\n    ')}\n  };\n\n  let errors = {};\n  let isSubmitting = false;\n\n  $: isValid = Object.keys(errors).length === 0;`;\n  }\n\n  script += `\\n\n  function validate() {\n    errors = {};\n    // Add validation logic here\n    return Object.keys(errors).length === 0;\n  }\n\n  async function handleSubmit(event) {\n    event.preventDefault();\n    if (!validate()) return;\n\n    isSubmitting = true;\n    try {\n      // Submit logic here\n      console.log('Submitting:', formData);\n    } finally {\n      isSubmitting = false;\n    }\n  }\n</script>`;\n\n  const template = `\n\n<form on:submit={handleSubmit} class=\"${options.useTailwind ? \"space-y-6 max-w-md\" : \"form\"}\">\n  ${formAnalysis.fieldGroups.map(field => {\n    const fieldName = field.input.nodeName.replace(/\\s+/g, '_').toLowerCase();\n    const labelText = field.label?.nodeName || fieldName;\n\n    return `<div class=\"${options.useTailwind ? \"space-y-2\" : \"form-field\"}\">\n    <label for=\"${fieldName}\" class=\"${options.useTailwind ? \"text-sm font-medium\" : \"label\"}\">\n      ${labelText}\n    </label>\n    <input\n      type=\"text\"\n      id=\"${fieldName}\"\n      bind:value={formData.${fieldName}}\n      class=\"${options.useTailwind ? \"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring\" : \"input\"}\"\n    />\n    {#if errors.${fieldName}}\n      <p class=\"${options.useTailwind ? \"text-sm text-destructive\" : \"error\"}\"${options.includeTransitions ? \" transition:slide\" : \"\"}>\n        {errors.${fieldName}}\n      </p>\n    {/if}\n  </div>`;\n  }).join('\\n  ')}\n\n  <button\n    type=\"submit\"\n    disabled={isSubmitting || !isValid}\n    class=\"${options.useTailwind ? \"w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50\" : \"submit-button\"}\"\n  >\n    {isSubmitting ? 'Submitting...' : 'Submit'}\n  </button>\n</form>`;\n\n  const style = options.useTailwind ? \"\" : `\n\n<style>\n  .form {\n    display: flex;\n    flex-direction: column;\n    gap: 1.5rem;\n    max-width: 28rem;\n  }\n\n  .form-field {\n    display: flex;\n    flex-direction: column;\n    gap: 0.5rem;\n  }\n\n  .label {\n    font-size: 0.875rem;\n    font-weight: 500;\n  }\n\n  .input {\n    width: 100%;\n    padding: 0.5rem 0.75rem;\n    border: 1px solid var(--border, #e5e7eb);\n    border-radius: 0.375rem;\n    font-size: 0.875rem;\n  }\n\n  .input:focus {\n    outline: none;\n    border-color: var(--primary, #2563eb);\n    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);\n  }\n\n  .error {\n    font-size: 0.875rem;\n    color: var(--destructive, #dc2626);\n  }\n\n  .submit-button {\n    width: 100%;\n    padding: 0.5rem 1rem;\n    background: var(--primary, #2563eb);\n    color: white;\n    border: none;\n    border-radius: 0.375rem;\n    font-size: 0.875rem;\n    font-weight: 500;\n    cursor: pointer;\n  }\n\n  .submit-button:hover {\n    opacity: 0.9;\n  }\n\n  .submit-button:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n</style>`;\n\n  return script + template + style;\n}\n\nfunction generateFormTypes(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {\n  if (!options.useTypeScript) return \"\";\n\n  const fields = formAnalysis.fieldGroups.map(f => {\n    const fieldName = f.input.nodeName.replace(/\\s+/g, '_').toLowerCase();\n    return `  ${fieldName}: string;`;\n  });\n\n  return `export interface FormData {\\n${fields.join('\\n')}\\n}\\n\\nexport interface FormErrors {\\n${fields.map(f => f.replace(': string', '?: string')).join('\\n')}\\n}`;\n}\n\nfunction generateFormStores(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {\n  const fields = formAnalysis.fieldGroups.map(f =>\n    f.input.nodeName.replace(/\\s+/g, '_').toLowerCase()\n  );\n\n  return `import { writable, derived } from 'svelte/store';\n\nexport const formData = writable({\n  ${fields.map(f => `${f}: ''`).join(',\\n  ')}\n});\n\nexport const errors = writable({});\nexport const isSubmitting = writable(false);\nexport const touched = writable({});\n\nexport const isValid = derived(errors, $errors => Object.keys($errors).length === 0);\n\nexport function resetForm() {\n  formData.set({ ${fields.map(f => `${f}: ''`).join(', ')} });\n  errors.set({});\n  touched.set({});\n}`;\n}\n\nfunction generateFormActions(options: SvelteGenerationOptions): string {\n  return `/**\n * Form validation action\n * Usage: <input use:validate={{ required: true, minLength: 3 }}>\n */\nexport function validate(node${options.useTypeScript ? \": HTMLInputElement\" : \"\"}, rules${options.useTypeScript ? \": Record<string, any>\" : \"\"}) {\n  function runValidation() {\n    let error = null;\n    const value = node.value;\n\n    if (rules.required && !value) {\n      error = 'This field is required';\n    } else if (rules.minLength && value.length < rules.minLength) {\n      error = \\`Minimum \\${rules.minLength} characters required\\`;\n    } else if (rules.maxLength && value.length > rules.maxLength) {\n      error = \\`Maximum \\${rules.maxLength} characters allowed\\`;\n    } else if (rules.pattern && !new RegExp(rules.pattern).test(value)) {\n      error = rules.patternMessage || 'Invalid format';\n    }\n\n    node.dispatchEvent(new CustomEvent('validate', { detail: { error } }));\n    return error;\n  }\n\n  node.addEventListener('blur', runValidation);\n  node.addEventListener('input', runValidation);\n\n  return {\n    destroy() {\n      node.removeEventListener('blur', runValidation);\n      node.removeEventListener('input', runValidation);\n    },\n    update(newRules${options.useTypeScript ? \": Record<string, any>\" : \"\"}) {\n      rules = newRules;\n    }\n  };\n}`;\n}\n\nfunction generateFormStyles(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {\n  return \"\";  // Styles are inline in the component\n}\n\n// ============================================================================\n// Navigation Component Generation\n// ============================================================================\n\nfunction generateNavComponent(\n  navAnalysis: NavigationPatternAnalysis,\n  componentName: string,\n  options: SvelteGenerationOptions\n): string {\n  const scriptLang = options.useTypeScript ? ' lang=\"ts\"' : \"\";\n  const { patternType, items, ariaLabel } = navAnalysis;\n\n  let script = `<script${scriptLang}>`;\n\n  if (options.includeTransitions) {\n    script += `\\n  import { fade, slide } from 'svelte/transition';`;\n  }\n\n  if (options.useSvelte5Runes) {\n    script += `\\n\n  interface NavItem {\n    label: string;\n    href?: string;\n    isActive?: boolean;\n    children?: NavItem[];\n  }\n\n  interface Props {\n    items: NavItem[];\n    class?: string;\n  }\n\n  let { items, class: className = '' }: Props = $props();`;\n  } else {\n    script += `\\n\n  export let items = [];\n  export let className = '';`;\n  }\n\n  if (patternType === \"sidebar-nav\" || patternType === \"nested-nav\") {\n    if (options.useSvelte5Runes) {\n      script += `\\n\n  let expandedItems = $state(new Set());`;\n    } else {\n      script += `\\n\n  let expandedItems = new Set();\n\n  function toggleExpanded(id) {\n    if (expandedItems.has(id)) {\n      expandedItems.delete(id);\n    } else {\n      expandedItems.add(id);\n    }\n    expandedItems = expandedItems; // Trigger reactivity\n  }`;\n    }\n  }\n\n  script += `\\n</script>`;\n\n  let template = \"\";\n\n  switch (patternType) {\n    case \"top-nav\":\n    case \"bottom-nav\":\n      template = `\n\n<nav class=\"${options.useTailwind ? \"flex items-center gap-4\" : \"nav\"} {className}\" aria-label=\"${ariaLabel}\">\n  {#each items as item, index (item.href ?? index)}\n    <a\n      href={item.href}\n      class=\"${options.useTailwind ? \"text-sm font-medium transition-colors\" : \"nav-link\"}\"\n      class:${options.useTailwind ? \"text-foreground\" : \"active\"}={item.isActive}\n      class:${options.useTailwind ? \"text-muted-foreground hover:text-foreground\" : \"inactive\"}={!item.isActive}\n      aria-current={item.isActive ? 'page' : undefined}\n    >\n      {item.label}\n    </a>\n  {/each}\n</nav>`;\n      break;\n\n    case \"sidebar-nav\":\n      template = `\n\n<nav class=\"${options.useTailwind ? \"flex flex-col gap-1\" : \"sidebar-nav\"} {className}\" aria-label=\"${ariaLabel}\">\n  {#each items as item, index (item.href ?? index)}\n    {#if item.children?.length}\n      <div>\n        <button\n          class=\"${options.useTailwind ? \"flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent\" : \"nav-group-toggle\"}\"\n          on:click={() => toggleExpanded(index)}\n          aria-expanded={expandedItems.has(index)}\n        >\n          {item.label}\n          <svg\n            class=\"${options.useTailwind ? \"h-4 w-4 transition-transform\" : \"chevron\"}\"\n            class:rotate-180={expandedItems.has(index)}\n            viewBox=\"0 0 20 20\"\n            fill=\"currentColor\"\n          >\n            <path fill-rule=\"evenodd\" d=\"M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\" clip-rule=\"evenodd\" />\n          </svg>\n        </button>\n        {#if expandedItems.has(index)}\n          <div class=\"${options.useTailwind ? \"ml-4 mt-1 flex flex-col gap-1\" : \"nav-children\"}\"${options.includeTransitions ? \" transition:slide\" : \"\"}>\n            {#each item.children as child}\n              <a\n                href={child.href}\n                class=\"${options.useTailwind ? \"rounded-lg px-3 py-2 text-sm transition-colors\" : \"nav-child-link\"}\"\n                class:${options.useTailwind ? \"bg-muted text-foreground\" : \"active\"}={child.isActive}\n                class:${options.useTailwind ? \"text-muted-foreground hover:text-foreground hover:bg-accent\" : \"inactive\"}={!child.isActive}\n              >\n                {child.label}\n              </a>\n            {/each}\n          </div>\n        {/if}\n      </div>\n    {:else}\n      <a\n        href={item.href}\n        class=\"${options.useTailwind ? \"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors\" : \"nav-link\"}\"\n        class:${options.useTailwind ? \"bg-muted text-foreground\" : \"active\"}={item.isActive}\n        class:${options.useTailwind ? \"text-muted-foreground hover:text-foreground hover:bg-accent\" : \"inactive\"}={!item.isActive}\n        aria-current={item.isActive ? 'page' : undefined}\n      >\n        {item.label}\n      </a>\n    {/if}\n  {/each}\n</nav>`;\n      break;\n\n    case \"breadcrumb\":\n      template = `\n\n<nav class=\"${options.useTailwind ? \"flex items-center gap-2 text-sm\" : \"breadcrumb\"} {className}\" aria-label=\"Breadcrumb\">\n  <ol class=\"${options.useTailwind ? \"flex items-center gap-2\" : \"breadcrumb-list\"}\">\n    {#each items as item, index (item.href ?? index)}\n      <li class=\"${options.useTailwind ? \"flex items-center gap-2\" : \"breadcrumb-item\"}\">\n        {#if index > 0}\n          <span class=\"${options.useTailwind ? \"text-muted-foreground\" : \"separator\"}\" aria-hidden=\"true\">/</span>\n        {/if}\n        {#if item.isActive}\n          <span class=\"${options.useTailwind ? \"text-foreground font-medium\" : \"current\"}\" aria-current=\"page\">\n            {item.label}\n          </span>\n        {:else}\n          <a\n            href={item.href}\n            class=\"${options.useTailwind ? \"text-muted-foreground hover:text-foreground transition-colors\" : \"link\"}\"\n          >\n            {item.label}\n          </a>\n        {/if}\n      </li>\n    {/each}\n  </ol>\n</nav>`;\n      break;\n\n    case \"tabs\":\n      template = `\n\n<div class=\"{className}\" role=\"tablist\" aria-label=\"${ariaLabel}\">\n  {#each items as item, index (item.id ?? index)}\n    <button\n      role=\"tab\"\n      aria-selected={item.isActive}\n      tabindex={item.isActive ? 0 : -1}\n      class=\"${options.useTailwind ? \"px-4 py-2 text-sm font-medium border-b-2 transition-colors\" : \"tab\"}\"\n      class:${options.useTailwind ? \"border-primary text-foreground\" : \"active\"}={item.isActive}\n      class:${options.useTailwind ? \"border-transparent text-muted-foreground hover:text-foreground hover:border-border\" : \"inactive\"}={!item.isActive}\n    >\n      {item.label}\n    </button>\n  {/each}\n</div>`;\n      break;\n\n    default:\n      template = `\n\n<nav class=\"{className}\" aria-label=\"${ariaLabel}\">\n  {#each items as item, index (item.href ?? index)}\n    <a href={item.href} class:active={item.isActive}>\n      {item.label}\n    </a>\n  {/each}\n</nav>`;\n  }\n\n  const style = options.useTailwind ? \"\" : `\n\n<style>\n  .nav, .sidebar-nav, .breadcrumb {\n    display: flex;\n  }\n\n  .nav {\n    align-items: center;\n    gap: 1rem;\n  }\n\n  .sidebar-nav {\n    flex-direction: column;\n    gap: 0.25rem;\n  }\n\n  .nav-link {\n    font-size: 0.875rem;\n    font-weight: 500;\n    color: var(--muted-foreground, #6b7280);\n    text-decoration: none;\n    transition: color 0.15s ease;\n  }\n\n  .nav-link:hover, .nav-link.active {\n    color: var(--foreground, #111827);\n  }\n\n  .breadcrumb-list {\n    display: flex;\n    align-items: center;\n    gap: 0.5rem;\n    list-style: none;\n    padding: 0;\n    margin: 0;\n  }\n\n  .separator {\n    color: var(--muted-foreground, #6b7280);\n  }\n</style>`;\n\n  return script + template + style;\n}\n\nfunction generateNavTypes(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {\n  if (!options.useTypeScript) return \"\";\n\n  return `export interface NavItem {\n  label: string;\n  href?: string;\n  isActive?: boolean;\n  isDisabled?: boolean;\n  icon?: string;\n  children?: NavItem[];\n}`;\n}\n\nfunction generateNavStores(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {\n  return `import { writable, derived } from 'svelte/store';\n\nexport const navItems = writable([]);\nexport const currentPath = writable('/');\n\nexport const activeItem = derived(\n  [navItems, currentPath],\n  ([$items, $path]) => $items.find(item => item.href === $path)\n);\n\nexport function setCurrentPath(path${options.useTypeScript ? \": string\" : \"\"}) {\n  currentPath.set(path);\n}`;\n}\n\nfunction generateNavActions(options: SvelteGenerationOptions): string {\n  return `/**\n * Action to handle active link styling based on current route\n * Usage: <a use:activeLink={currentPath}>\n */\nexport function activeLink(node${options.useTypeScript ? \": HTMLAnchorElement\" : \"\"}, currentPath${options.useTypeScript ? \": string\" : \"\"}) {\n  function update(path${options.useTypeScript ? \": string\" : \"\"}) {\n    if (node.pathname === path || node.href.endsWith(path)) {\n      node.classList.add('active');\n      node.setAttribute('aria-current', 'page');\n    } else {\n      node.classList.remove('active');\n      node.removeAttribute('aria-current');\n    }\n  }\n\n  update(currentPath);\n\n  return {\n    update\n  };\n}`;\n}\n\nfunction generateNavStyles(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {\n  return \"\";  // Styles are inline in the component\n}\n\n// ============================================================================\n// Helper Functions\n// ============================================================================\n\nfunction getComponentName(semanticType: ListSemanticType, prefix: string): string {\n  const names: Record<ListSemanticType, string> = {\n    \"product-catalog\": \"ProductList\",\n    \"user-list\": \"UserList\",\n    \"article-feed\": \"ArticleFeed\",\n    \"media-gallery\": \"MediaGallery\",\n    \"settings-list\": \"SettingsList\",\n    navigation: \"Navigation\",\n    breadcrumb: \"Breadcrumb\",\n    tabs: \"Tabs\",\n    menu: \"Menu\",\n    \"data-table\": \"DataTable\",\n    \"generic-list\": \"List\",\n    unknown: \"List\",\n  };\n\n  return `${prefix}${names[semanticType] || \"List\"}`;\n}\n\nfunction getNavComponentName(patternType: string, prefix: string): string {\n  const names: Record<string, string> = {\n    \"top-nav\": \"TopNav\",\n    \"sidebar-nav\": \"SidebarNav\",\n    breadcrumb: \"Breadcrumb\",\n    tabs: \"Tabs\",\n    pagination: \"Pagination\",\n    \"bottom-nav\": \"BottomNav\",\n    \"mega-menu\": \"MegaMenu\",\n    \"dropdown-menu\": \"DropdownMenu\",\n    \"nested-nav\": \"NestedNav\",\n    unknown: \"Navigation\",\n  };\n\n  return `${prefix}${names[patternType] || \"Navigation\"}`;\n}\n\nfunction getItemTypeName(semanticType: ListSemanticType): string {\n  const names: Record<ListSemanticType, string> = {\n    \"product-catalog\": \"Product\",\n    \"user-list\": \"User\",\n    \"article-feed\": \"Article\",\n    \"media-gallery\": \"Media\",\n    \"settings-list\": \"Setting\",\n    navigation: \"NavItem\",\n    breadcrumb: \"Crumb\",\n    tabs: \"Tab\",\n    menu: \"MenuItem\",\n    \"data-table\": \"Row\",\n    \"generic-list\": \"Item\",\n    unknown: \"Item\",\n  };\n\n  return names[semanticType] || \"Item\";\n}\n\nfunction getTypeNameFromSemantic(semanticType: ListSemanticType): string {\n  return getItemTypeName(semanticType);\n}\n\n// ============================================================================\n// Exports\n// ============================================================================\n\nexport { DEFAULT_OPTIONS as SVELTE_GENERATION_DEFAULTS };\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze existing code generation patterns (React, semantic-list-generator)",
      "status": "completed",
      "activeForm": "Analyzing existing code generation patterns"
    },
    {
      "content": "Create Svelte component generator utility file",
      "status": "completed",
      "activeForm": "Creating Svelte component generator utility file"
    },
    {
      "content": "Add Svelte as a framework option in CodeGenerationSettings",
      "status": "in_progress",
      "activeForm": "Adding Svelte framework option to settings"
    },
    {
      "content": "Integrate Svelte generator with figma-layout-intent system",
      "status": "pending",
      "activeForm": "Integrating Svelte generator with layout intent system"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}
Now let me integrate the Svelte generator with the figma-layout-intent system:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "offset": 1120,
  "limit": 30
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "old_string": "// Semantic list markup generation exports\nexport {\n  generateListMarkup,\n  generateListJSX,\n  generateListCSS,\n} from \"./semantic-list-generator\";\n\nexport type {\n  GeneratedListCode,\n  CodeGenerationOptions,\n} from \"./semantic-list-generator\";",
  "new_string": "// Semantic list markup generation exports\nexport {\n  generateListMarkup,\n  generateListJSX,\n  generateListCSS,\n} from \"./semantic-list-generator\";\n\nexport type {\n  GeneratedListCode,\n  CodeGenerationOptions,\n} from \"./semantic-list-generator\";\n\n// Svelte component generation exports\nexport {\n  generateSvelteListComponent,\n  generateSvelteFormComponent,\n  generateSvelteNavComponent,\n  SVELTE_GENERATION_DEFAULTS,\n} from \"./svelte-component-generator\";\n\nexport type {\n  GeneratedSvelteCode,\n  SvelteGenerationOptions,\n  TransitionConfig,\n  StoreConfig,\n  ActionConfig,\n} from \"./svelte-component-generator\";"
}
Now let's also add a high-level function to generate Svelte code as an alternative to JSX. Let me add this functionality to the analyzeFrameIntent function:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "offset": 40,
  "limit": 50
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "old_string": "import {\n  generateListMarkup,\n  type GeneratedListCode,\n  type CodeGenerationOptions,\n} from \"./semantic-list-generator\";\nimport {\n  analyzeNavigationPatterns,\n  type NavigationPatternAnalysis,\n  type NavigationPatternType,\n  type NavigationItem,\n  type SemanticNavMarkup,\n} from \"./navigation-pattern-detector\";",
  "new_string": "import {\n  generateListMarkup,\n  type GeneratedListCode,\n  type CodeGenerationOptions,\n} from \"./semantic-list-generator\";\nimport {\n  analyzeNavigationPatterns,\n  type NavigationPatternAnalysis,\n  type NavigationPatternType,\n  type NavigationItem,\n  type SemanticNavMarkup,\n} from \"./navigation-pattern-detector\";\nimport {\n  generateSvelteListComponent,\n  generateSvelteFormComponent,\n  generateSvelteNavComponent,\n  type GeneratedSvelteCode,\n  type SvelteGenerationOptions,\n} from \"./svelte-component-generator\";"
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "old_string": "/** Enhanced frame with layout analysis */\nexport interface AnalyzedFrame extends CategorizedFrame {\n  layoutAnalysis: FrameLayoutAnalysis;\n  semanticStructure: SemanticStructureNode[];\n  suggestedCode: CodeSuggestion;\n  /** Form analysis if this frame contains a form */\n  formAnalysis?: FormAnalysisResult;\n  /** Navigation patterns detected in this frame */\n  navigationPatterns?: NavigationPatternAnalysis[];\n  /** List pattern analysis if repeating patterns detected */\n  listPatternAnalysis?: ListPatternResult;\n  /** Generated list markup if list pattern detected */\n  listMarkup?: GeneratedListCode;\n}",
  "new_string": "/** Enhanced frame with layout analysis */\nexport interface AnalyzedFrame extends CategorizedFrame {\n  layoutAnalysis: FrameLayoutAnalysis;\n  semanticStructure: SemanticStructureNode[];\n  suggestedCode: CodeSuggestion;\n  /** Form analysis if this frame contains a form */\n  formAnalysis?: FormAnalysisResult;\n  /** Navigation patterns detected in this frame */\n  navigationPatterns?: NavigationPatternAnalysis[];\n  /** List pattern analysis if repeating patterns detected */\n  listPatternAnalysis?: ListPatternResult;\n  /** Generated list markup if list pattern detected */\n  listMarkup?: GeneratedListCode;\n  /** Generated Svelte component code if Svelte target is selected */\n  svelteCode?: GeneratedSvelteCode;\n}"
}
Now let me add a function to generate Svelte code from an analyzed frame. Let me find a good place to add this:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "offset": 230,
  "limit": 80
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "old_string": "/**\n * Group frames by their detected patterns\n */\nexport function groupFramesByPattern(\n  frames: AnalyzedFrame[]\n): Map<LayoutPattern, AnalyzedFrame[]> {\n  const groups = new Map<LayoutPattern, AnalyzedFrame[]>();\n\n  for (const frame of frames) {\n    const pattern = frame.layoutAnalysis.overallPattern;\n    const existing = groups.get(pattern) || [];\n    existing.push(frame);\n    groups.set(pattern, existing);\n  }\n\n  return groups;\n}\n\n// ============================================================================\n// Semantic Structure Building\n// ============================================================================",
  "new_string": "/**\n * Group frames by their detected patterns\n */\nexport function groupFramesByPattern(\n  frames: AnalyzedFrame[]\n): Map<LayoutPattern, AnalyzedFrame[]> {\n  const groups = new Map<LayoutPattern, AnalyzedFrame[]>();\n\n  for (const frame of frames) {\n    const pattern = frame.layoutAnalysis.overallPattern;\n    const existing = groups.get(pattern) || [];\n    existing.push(frame);\n    groups.set(pattern, existing);\n  }\n\n  return groups;\n}\n\n// ============================================================================\n// Svelte Code Generation\n// ============================================================================\n\n/**\n * Generate Svelte component code for an analyzed frame\n *\n * @param frame - The analyzed frame to generate code for\n * @param options - Svelte generation options\n * @returns Generated Svelte code including component, types, stores, and actions\n */\nexport function generateSvelteCodeForFrame(\n  frame: AnalyzedFrame,\n  options: Partial<SvelteGenerationOptions> = {}\n): GeneratedSvelteCode {\n  // If frame has list pattern analysis, use list component generator\n  if (frame.listPatternAnalysis?.isListPattern) {\n    return generateSvelteListComponent(frame.listPatternAnalysis, options);\n  }\n\n  // If frame has form analysis, use form component generator\n  if (frame.formAnalysis?.isForm) {\n    return generateSvelteFormComponent(frame.formAnalysis, options);\n  }\n\n  // If frame has navigation patterns, use the first navigation pattern\n  if (frame.navigationPatterns && frame.navigationPatterns.length > 0) {\n    return generateSvelteNavComponent(frame.navigationPatterns[0], options);\n  }\n\n  // Default: Generate a generic Svelte component based on the frame structure\n  return generateGenericSvelteComponent(frame, options);\n}\n\n/**\n * Generate a generic Svelte component for frames that don't match specific patterns\n */\nfunction generateGenericSvelteComponent(\n  frame: AnalyzedFrame,\n  options: Partial<SvelteGenerationOptions> = {}\n): GeneratedSvelteCode {\n  const opts = {\n    useTypeScript: true,\n    useTailwind: true,\n    useSvelte5Runes: false,\n    generateStores: false,\n    generateActions: false,\n    includeTransitions: true,\n    componentPrefix: \"\",\n    includeSampleData: false,\n    responsive: true,\n    ...options,\n  };\n\n  const componentName = frame.name.replace(/[^a-zA-Z0-9]/g, \"\") || \"Component\";\n  const scriptLang = opts.useTypeScript ? ' lang=\"ts\"' : \"\";\n\n  // Build script section\n  let script = `<script${scriptLang}>`;\n\n  if (opts.includeTransitions) {\n    script += `\\n  import { fade } from 'svelte/transition';`;\n  }\n\n  if (opts.useSvelte5Runes) {\n    script += `\\n\n  interface Props {\n    class?: string;\n  }\n\n  let { class: className = '' }: Props = $props();`;\n  } else {\n    script += `\\n\n  export let className = '';`;\n  }\n\n  script += `\\n</script>`;\n\n  // Build template from semantic structure\n  const template = generateSvelteTemplateFromStructure(frame.semanticStructure, opts);\n\n  // Build styles if not using Tailwind\n  let styles = \"\";\n  if (!opts.useTailwind) {\n    styles = `\\n\\n<style>\\n${generateSvelteStylesFromStructure(frame.semanticStructure)}\\n</style>`;\n  }\n\n  const component = `${script}\n\n${template}${styles}`;\n\n  return {\n    component,\n    types: opts.useTypeScript ? `// Types for ${componentName} component\\nexport interface ${componentName}Props {\\n  className?: string;\\n}` : \"\",\n    styles: \"\",\n    stores: \"\",\n    actions: \"\",\n  };\n}\n\n/**\n * Generate Svelte template from semantic structure nodes\n */\nfunction generateSvelteTemplateFromStructure(\n  nodes: SemanticStructureNode[],\n  options: { useTailwind: boolean; includeTransitions: boolean }\n): string {\n  if (nodes.length === 0) {\n    return `<div class=\"{className}\">\\n  <!-- Content -->\\n</div>`;\n  }\n\n  const lines: string[] = [`<div class=\"{className}\">`];\n\n  for (const node of nodes) {\n    lines.push(generateSvelteNodeTemplate(node, 1, options));\n  }\n\n  lines.push(\"</div>\");\n\n  return lines.join(\"\\n\");\n}\n\n/**\n * Generate Svelte template for a single semantic structure node\n */\nfunction generateSvelteNodeTemplate(\n  node: SemanticStructureNode,\n  indent: number,\n  options: { useTailwind: boolean; includeTransitions: boolean }\n): string {\n  const indentStr = \"  \".repeat(indent);\n  const classes = node.tailwindClasses.join(\" \");\n  const Element = node.element;\n  const transition = options.includeTransitions && Element !== \"nav\" ? \" transition:fade\" : \"\";\n\n  let template = `${indentStr}<${Element}`;\n\n  if (classes) {\n    template += ` class=\"${classes}\"`;\n  }\n\n  template += `${transition}>`;\n\n  if (node.children && node.children.length > 0) {\n    template += \"\\n\";\n    for (const child of node.children) {\n      template += generateSvelteNodeTemplate(child, indent + 1, options) + \"\\n\";\n    }\n    template += `${indentStr}</${Element}>`;\n  } else {\n    const contentHint = node.sourceNodeName\n      ? `<!-- ${node.sourceNodeName} -->`\n      : \"<!-- Content -->\";\n    template += `${contentHint}</${Element}>`;\n  }\n\n  return template;\n}\n\n/**\n * Generate Svelte styles from semantic structure nodes\n */\nfunction generateSvelteStylesFromStructure(nodes: SemanticStructureNode[]): string {\n  const styles: string[] = [];\n\n  for (const node of nodes) {\n    if (node.role !== \"unknown\") {\n      styles.push(`  .${node.role} {\\n    /* Add styles for ${node.role} */\\n  }`);\n    }\n    if (node.children) {\n      const childStyles = generateSvelteStylesFromStructure(node.children);\n      if (childStyles) {\n        styles.push(childStyles);\n      }\n    }\n  }\n\n  return styles.join(\"\\n\\n\");\n}\n\n/**\n * Analyze a frame and generate Svelte code in one step\n */\nexport function analyzeFrameAndGenerateSvelte(\n  frame: FigmaNode,\n  options: Partial<SvelteGenerationOptions> = {}\n): { analysis: AnalyzedFrame; svelteCode: GeneratedSvelteCode } {\n  const analysis = analyzeFrameIntent(frame);\n  const svelteCode = generateSvelteCodeForFrame(analysis, options);\n\n  return { analysis, svelteCode };\n}\n\n// ============================================================================\n// Semantic Structure Building\n// ============================================================================"
}
Now I need to add the FigmaNode import at the top (it's needed for the new function). Let me check if it's already imported:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "offset": 1,
  "limit": 15
}
FigmaNode is already imported. Now let me update the TodoWrite and check if TypeScript compiles without errors:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze existing code generation patterns (React, semantic-list-generator)",
      "status": "completed",
      "activeForm": "Analyzing existing code generation patterns"
    },
    {
      "content": "Create Svelte component generator utility file",
      "status": "completed",
      "activeForm": "Creating Svelte component generator utility file"
    },
    {
      "content": "Add Svelte as a framework option in CodeGenerationSettings",
      "status": "completed",
      "activeForm": "Adding Svelte framework option to settings"
    },
    {
      "content": "Integrate Svelte generator with figma-layout-intent system",
      "status": "completed",
      "activeForm": "Integrating Svelte generator with layout intent system"
    },
    {
      "content": "Run TypeScript check to verify compilation",
      "status": "in_progress",
      "activeForm": "Running TypeScript check"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1 | head -100",
  "description": "Run TypeScript type check",
  "timeout": 120000
}
The errors are pre-existing in the codebase and not related to my changes. Let me specifically check the Svelte generator file:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit src/utils/svelte-component-generator.ts src/utils/figma-layout-intent.ts 2>&1",
  "description": "Check Svelte generator TypeScript",
  "timeout": 60000
}
The errors are configuration related (downlevelIteration) and pre-existing, not from my code. Let me verify with a simpler check and run the build:

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | tail -50",
  "description": "Run build to verify compilation",
  "timeout": 180000
}
The build errors are all pre-existing and not related to my Svelte generator changes. Let me verify that my specific files don't introduce any new errors by checking if there are any errors mentioning my new file:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1 | grep -E \"(svelte-component-generator|figma-layout-intent)\" || echo \"No errors in Svelte generator files\"",
  "description": "Check for errors in Svelte files",
  "timeout": 60000
}
No errors in my new files. Now let me update the todo and create a Playwright test to verify the implementation:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze existing code generation patterns (React, semantic-list-generator)",
      "status": "completed",
      "activeForm": "Analyzing existing code generation patterns"
    },
    {
      "content": "Create Svelte component generator utility file",
      "status": "completed",
      "activeForm": "Creating Svelte component generator utility file"
    },
    {
      "content": "Add Svelte as a framework option in CodeGenerationSettings",
      "status": "completed",
      "activeForm": "Adding Svelte framework option to settings"
    },
    {
      "content": "Integrate Svelte generator with figma-layout-intent system",
      "status": "completed",
      "activeForm": "Integrating Svelte generator with layout intent system"
    },
    {
      "content": "Run TypeScript check to verify compilation",
      "status": "completed",
      "activeForm": "Running TypeScript check"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "in_progress",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "ls -la playwright.config.* 2>/dev/null || ls -la e2e/ 2>/dev/null || ls -la tests/ 2>/dev/null || echo \"No existing Playwright config found\"",
  "description": "Check Playwright setup"
}

🔧 Tool: Bash
Input: {
  "command": "cat package.json | grep -E \"(playwright|vitest|jest)\" || echo \"No test framework found in package.json\"",
  "description": "Check for testing frameworks"
}
Playwright is installed. Let me check for existing Playwright config:

🔧 Tool: Glob
Input: {
  "pattern": "**/playwright*.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/playwright*.js"
}
No Playwright config exists yet. Since this is a utility module (not UI), I should write a unit test that verifies the Svelte component generator functions work correctly. Let me create a simple test:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "content": "import { defineConfig } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"list\",\n  use: {\n    trace: \"on-first-retry\",\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "mkdir -p /home/rainman/figma-to-code/figma-to-code/tests",
  "description": "Create tests directory"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/svelte-component-generator.spec.ts",
  "content": "/**\n * Svelte Component Generator Tests\n *\n * Verifies the Svelte component generation functionality:\n * - Generates valid Svelte component syntax\n * - Includes reactive declarations ($:)\n * - Supports Svelte template syntax ({#each}, {#if})\n * - Generates stores when enabled\n * - Generates actions when enabled\n * - Includes transitions when enabled\n */\n\nimport { test, expect } from \"@playwright/test\";\nimport {\n  generateSvelteListComponent,\n  generateSvelteFormComponent,\n  generateSvelteNavComponent,\n  SVELTE_GENERATION_DEFAULTS,\n  type GeneratedSvelteCode,\n  type SvelteGenerationOptions,\n} from \"../src/utils/svelte-component-generator\";\nimport type { ListPatternResult } from \"../src/utils/list-pattern-detector\";\nimport type { FormAnalysisResult } from \"../src/utils/form-analyzer\";\nimport type { NavigationPatternAnalysis } from \"../src/utils/navigation-pattern-detector\";\n\n// Mock data for testing\nconst mockListPatternResult: ListPatternResult = {\n  isListPattern: true,\n  patternType: \"card-grid\",\n  semanticType: \"product-catalog\",\n  confidence: 0.9,\n  structure: {\n    direction: \"both\",\n    columns: 3,\n    rows: 2,\n    horizontalGap: 16,\n    verticalGap: 24,\n    itemWidth: 280,\n    itemHeight: 320,\n    alignment: \"start\",\n    wrapping: true,\n  },\n  listItems: [\n    {\n      nodeId: \"1\",\n      bounds: { x: 0, y: 0, width: 280, height: 320 },\n      contentTypes: [\"image\", \"text\"],\n      hasInteraction: false,\n    },\n    {\n      nodeId: \"2\",\n      bounds: { x: 296, y: 0, width: 280, height: 320 },\n      contentTypes: [\"image\", \"text\"],\n      hasInteraction: false,\n    },\n  ],\n  suggestedElement: {\n    element: \"ul\",\n    containerClasses: [\"grid\", \"grid-cols-3\", \"gap-4\"],\n    itemClasses: [\"rounded-lg\", \"border\", \"p-4\"],\n    ariaAttributes: { role: \"list\" },\n  },\n};\n\nconst mockTabsPatternResult: ListPatternResult = {\n  ...mockListPatternResult,\n  patternType: \"tabs\",\n  semanticType: \"tabs\",\n  structure: {\n    ...mockListPatternResult.structure,\n    direction: \"horizontal\",\n    columns: 4,\n    rows: 1,\n  },\n  suggestedElement: {\n    element: \"div\",\n    containerClasses: [\"flex\", \"border-b\"],\n    itemClasses: [\"px-4\", \"py-2\"],\n    ariaAttributes: { role: \"tablist\" },\n  },\n};\n\nconst mockCarouselPatternResult: ListPatternResult = {\n  ...mockListPatternResult,\n  patternType: \"carousel\",\n  semanticType: \"media-gallery\",\n  structure: {\n    ...mockListPatternResult.structure,\n    direction: \"horizontal\",\n    columns: 1,\n  },\n  suggestedElement: {\n    element: \"div\",\n    containerClasses: [\"overflow-hidden\", \"relative\"],\n    itemClasses: [\"w-full\", \"flex-shrink-0\"],\n    ariaAttributes: { role: \"region\" },\n  },\n};\n\nconst mockFormAnalysisResult: FormAnalysisResult = {\n  isForm: true,\n  formType: \"login\",\n  confidence: 0.85,\n  formTitle: null,\n  fieldGroups: [\n    {\n      label: { nodeId: \"label1\", nodeName: \"Email Label\" },\n      input: { nodeId: \"input1\", nodeName: \"email\", elementType: \"text\" },\n      helperText: null,\n      errorMessage: null,\n      isRequired: true,\n    },\n    {\n      label: { nodeId: \"label2\", nodeName: \"Password Label\" },\n      input: { nodeId: \"input2\", nodeName: \"password\", elementType: \"password\" },\n      helperText: null,\n      errorMessage: null,\n      isRequired: true,\n    },\n  ],\n  fieldsets: [],\n  submitButton: { nodeId: \"submit1\", nodeName: \"Login\" },\n  cancelButton: null,\n  suggestedCode: {\n    jsx: \"\",\n    tailwindClasses: [],\n    validationHints: [],\n  },\n};\n\nconst mockNavAnalysisResult: NavigationPatternAnalysis = {\n  patternType: \"sidebar-nav\",\n  confidence: 0.9,\n  items: [\n    { label: \"Dashboard\", href: \"/dashboard\", isActive: true, nodeId: \"nav1\" },\n    { label: \"Settings\", href: \"/settings\", isActive: false, nodeId: \"nav2\" },\n    {\n      label: \"Users\",\n      href: \"/users\",\n      isActive: false,\n      nodeId: \"nav3\",\n      children: [\n        { label: \"All Users\", href: \"/users/all\", isActive: false, nodeId: \"nav3-1\" },\n        { label: \"Add User\", href: \"/users/add\", isActive: false, nodeId: \"nav3-2\" },\n      ],\n    },\n  ],\n  direction: \"vertical\",\n  ariaRole: \"navigation\",\n  ariaLabel: \"Main navigation\",\n  sourceNode: { nodeId: \"nav-container\", nodeName: \"Navigation\" },\n  semanticMarkup: {\n    element: \"nav\",\n    tailwindClasses: [\"flex\", \"flex-col\", \"gap-1\"],\n    ariaAttributes: { \"aria-label\": \"Main navigation\" },\n  },\n};\n\ntest.describe(\"Svelte Component Generator\", () => {\n  test.describe(\"List Component Generation\", () => {\n    test(\"generates valid Svelte component with script tag\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult);\n\n      expect(result.component).toContain('<script lang=\"ts\">');\n      expect(result.component).toContain(\"</script>\");\n    });\n\n    test(\"includes reactive declarations for card grid\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult);\n\n      // Should have reactive filter declaration\n      expect(result.component).toContain(\"$:\");\n      expect(result.component).toContain(\"filteredProduct\");\n    });\n\n    test(\"uses Svelte each block syntax\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult);\n\n      expect(result.component).toContain(\"{#each\");\n      expect(result.component).toContain(\"{/each}\");\n    });\n\n    test(\"uses Svelte if block syntax for conditionals\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult);\n\n      expect(result.component).toContain(\"{#if\");\n      expect(result.component).toContain(\"{/if}\");\n    });\n\n    test(\"includes else block for empty state\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult);\n\n      expect(result.component).toContain(\"{:else}\");\n    });\n\n    test(\"includes transitions when enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        includeTransitions: true,\n      });\n\n      expect(result.component).toContain(\"import { fade\");\n      expect(result.component).toContain(\"transition:\");\n    });\n\n    test(\"excludes transitions when disabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        includeTransitions: false,\n      });\n\n      expect(result.component).not.toContain(\"transition:\");\n    });\n\n    test(\"uses Tailwind classes when enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useTailwind: true,\n      });\n\n      expect(result.component).toContain(\"class=\");\n      expect(result.component).toContain(\"grid\");\n    });\n\n    test(\"generates scoped styles when Tailwind disabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useTailwind: false,\n      });\n\n      expect(result.component).toContain(\"<style>\");\n      expect(result.component).toContain(\"</style>\");\n      expect(result.component).toContain(\".card-grid\");\n    });\n\n    test(\"generates TypeScript types when enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useTypeScript: true,\n      });\n\n      expect(result.types).toContain(\"interface Product\");\n      expect(result.types).toContain(\"title: string\");\n    });\n  });\n\n  test.describe(\"Tabs Component Generation\", () => {\n    test(\"includes tab-specific reactive state\", async () => {\n      const result = generateSvelteListComponent(mockTabsPatternResult);\n\n      expect(result.component).toContain(\"activeIndex\");\n      expect(result.component).toContain(\"activeItem\");\n    });\n\n    test(\"includes selectTab function\", async () => {\n      const result = generateSvelteListComponent(mockTabsPatternResult);\n\n      expect(result.component).toContain(\"function selectTab\");\n    });\n\n    test(\"uses proper ARIA attributes for tabs\", async () => {\n      const result = generateSvelteListComponent(mockTabsPatternResult);\n\n      expect(result.component).toContain('role=\"tablist\"');\n      expect(result.component).toContain('role=\"tab\"');\n      expect(result.component).toContain(\"aria-selected\");\n    });\n\n    test(\"includes keyboard navigation\", async () => {\n      const result = generateSvelteListComponent(mockTabsPatternResult);\n\n      expect(result.component).toContain(\"on:keydown\");\n      expect(result.component).toContain(\"ArrowRight\");\n      expect(result.component).toContain(\"ArrowLeft\");\n    });\n  });\n\n  test.describe(\"Carousel Component Generation\", () => {\n    test(\"includes carousel-specific reactive state\", async () => {\n      const result = generateSvelteListComponent(mockCarouselPatternResult);\n\n      expect(result.component).toContain(\"currentSlide\");\n      expect(result.component).toContain(\"totalSlides\");\n      expect(result.component).toContain(\"canGoNext\");\n      expect(result.component).toContain(\"canGoPrev\");\n    });\n\n    test(\"includes slide navigation functions\", async () => {\n      const result = generateSvelteListComponent(mockCarouselPatternResult);\n\n      expect(result.component).toContain(\"function nextSlide\");\n      expect(result.component).toContain(\"function prevSlide\");\n      expect(result.component).toContain(\"function goToSlide\");\n    });\n\n    test(\"uses proper ARIA for carousel\", async () => {\n      const result = generateSvelteListComponent(mockCarouselPatternResult);\n\n      expect(result.component).toContain('aria-roledescription=\"carousel\"');\n      expect(result.component).toContain('aria-roledescription=\"slide\"');\n    });\n  });\n\n  test.describe(\"Store Generation\", () => {\n    test(\"generates stores when enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateStores: true,\n      });\n\n      expect(result.stores).toContain(\"import { writable, derived }\");\n      expect(result.stores).toContain(\"export const\");\n    });\n\n    test(\"includes loading and error stores\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateStores: true,\n      });\n\n      expect(result.stores).toContain(\"loading = writable(false)\");\n      expect(result.stores).toContain(\"error = writable\");\n    });\n\n    test(\"includes fetch helper function\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateStores: true,\n      });\n\n      expect(result.stores).toContain(\"async function fetch\");\n    });\n\n    test(\"skips stores when disabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateStores: false,\n      });\n\n      expect(result.stores).toBe(\"\");\n    });\n  });\n\n  test.describe(\"Action Generation\", () => {\n    test(\"generates actions when enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"export function\");\n    });\n\n    test(\"includes clickOutside action\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"function clickOutside\");\n    });\n\n    test(\"includes focusTrap action\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"function focusTrap\");\n    });\n\n    test(\"includes lazyLoad action for images\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"function lazyLoad\");\n    });\n\n    test(\"includes tooltip action\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"function tooltip\");\n    });\n\n    test(\"includes swipeable action for carousel\", async () => {\n      const result = generateSvelteListComponent(mockCarouselPatternResult, {\n        generateActions: true,\n      });\n\n      expect(result.actions).toContain(\"function swipeable\");\n      expect(result.actions).toContain(\"swipeleft\");\n      expect(result.actions).toContain(\"swiperight\");\n    });\n\n    test(\"skips actions when disabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        generateActions: false,\n      });\n\n      expect(result.actions).toBe(\"\");\n    });\n  });\n\n  test.describe(\"Form Component Generation\", () => {\n    test(\"generates valid Svelte form component\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain('<script lang=\"ts\">');\n      expect(result.component).toContain(\"<form\");\n      expect(result.component).toContain(\"on:submit\");\n    });\n\n    test(\"includes form state management\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain(\"formData\");\n      expect(result.component).toContain(\"errors\");\n      expect(result.component).toContain(\"isSubmitting\");\n    });\n\n    test(\"includes validation function\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain(\"function validate\");\n    });\n\n    test(\"includes submit handler\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain(\"async function handleSubmit\");\n    });\n\n    test(\"uses bind:value for inputs\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain(\"bind:value\");\n    });\n\n    test(\"has reactive isValid derived state\", async () => {\n      const result = generateSvelteFormComponent(mockFormAnalysisResult);\n\n      expect(result.component).toContain(\"$:\");\n      expect(result.component).toContain(\"isValid\");\n    });\n  });\n\n  test.describe(\"Navigation Component Generation\", () => {\n    test(\"generates valid Svelte nav component\", async () => {\n      const result = generateSvelteNavComponent(mockNavAnalysisResult);\n\n      expect(result.component).toContain('<script lang=\"ts\">');\n      expect(result.component).toContain(\"<nav\");\n    });\n\n    test(\"includes aria-label for navigation\", async () => {\n      const result = generateSvelteNavComponent(mockNavAnalysisResult);\n\n      expect(result.component).toContain(\"aria-label=\");\n    });\n\n    test(\"handles nested navigation items\", async () => {\n      const result = generateSvelteNavComponent(mockNavAnalysisResult);\n\n      // Should have nested each block for children\n      expect(result.component).toContain(\"item.children\");\n    });\n\n    test(\"includes expand/collapse for nested items\", async () => {\n      const result = generateSvelteNavComponent(mockNavAnalysisResult);\n\n      expect(result.component).toContain(\"expandedItems\");\n    });\n\n    test(\"uses aria-current for active items\", async () => {\n      const result = generateSvelteNavComponent(mockNavAnalysisResult);\n\n      expect(result.component).toContain(\"aria-current\");\n    });\n  });\n\n  test.describe(\"Svelte 5 Runes Support\", () => {\n    test(\"uses $state rune when Svelte 5 enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useSvelte5Runes: true,\n      });\n\n      expect(result.component).toContain(\"$state\");\n    });\n\n    test(\"uses $derived rune when Svelte 5 enabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useSvelte5Runes: true,\n      });\n\n      expect(result.component).toContain(\"$derived\");\n    });\n\n    test(\"uses $props rune for component props\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useSvelte5Runes: true,\n      });\n\n      expect(result.component).toContain(\"$props()\");\n    });\n\n    test(\"uses classic syntax when Svelte 5 disabled\", async () => {\n      const result = generateSvelteListComponent(mockListPatternResult, {\n        useSvelte5Runes: false,\n      });\n\n      expect(result.component).toContain(\"export let\");\n      expect(result.component).toContain(\"$:\");\n      expect(result.component).not.toContain(\"$state\");\n    });\n  });\n\n  test.describe(\"Default Options\", () => {\n    test(\"has expected default values\", () => {\n      expect(SVELTE_GENERATION_DEFAULTS.useTypeScript).toBe(true);\n      expect(SVELTE_GENERATION_DEFAULTS.useTailwind).toBe(true);\n      expect(SVELTE_GENERATION_DEFAULTS.useSvelte5Runes).toBe(false);\n      expect(SVELTE_GENERATION_DEFAULTS.generateStores).toBe(true);\n      expect(SVELTE_GENERATION_DEFAULTS.generateActions).toBe(true);\n      expect(SVELTE_GENERATION_DEFAULTS.includeTransitions).toBe(true);\n    });\n  });\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/svelte-component-generator.spec.ts 2>&1",
  "description": "Run Playwright test for Svelte generator",
  "timeout": 120000
}
All 44 tests passed! Now let me clean up by removing the test files (as per the instructions) and update the todo list:

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/tests/svelte-component-generator.spec.ts && rm /home/rainman/figma-to-code/figma-to-code/playwright.config.ts && rmdir /home/rainman/figma-to-code/figma-to-code/tests",
  "description": "Clean up test files"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze existing code generation patterns (React, semantic-list-generator)",
      "status": "completed",
      "activeForm": "Analyzing existing code generation patterns"
    },
    {
      "content": "Create Svelte component generator utility file",
      "status": "completed",
      "activeForm": "Creating Svelte component generator utility file"
    },
    {
      "content": "Add Svelte as a framework option in CodeGenerationSettings",
      "status": "completed",
      "activeForm": "Adding Svelte framework option to settings"
    },
    {
      "content": "Integrate Svelte generator with figma-layout-intent system",
      "status": "completed",
      "activeForm": "Integrating Svelte generator with layout intent system"
    },
    {
      "content": "Run TypeScript check to verify compilation",
      "status": "completed",
      "activeForm": "Running TypeScript check"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "completed",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}
<summary>
## Summary: Generate Svelte components with reactive declarations

### Changes Implemented
1. **Created comprehensive Svelte component generator** (`src/utils/svelte-component-generator.ts`) with:
   - Reactive declarations using `$:` syntax (classic) and `$state`/`$derived` (Svelte 5 runes)
   - Full Svelte template syntax support (`{#each}`, `{#if}`, `{:else}`, `{#await}`)
   - Store generation with writable, readable, and derived stores
   - Action generation (clickOutside, focusTrap, lazyLoad, swipeable, tooltip)
   - Transition support (fade, fly, slide, scale)
   - Pattern-specific components: card grids, vertical/horizontal lists, tabs, carousels, tables, navigation, forms

2. **Integrated with existing layout intent system** by updating `src/utils/figma-layout-intent.ts`:
   - Added imports for Svelte generator functions
   - Added `svelteCode` field to `AnalyzedFrame` interface
   - Created `generateSvelteCodeForFrame()` function for high-level Svelte code generation
   - Created `analyzeFrameAndGenerateSvelte()` convenience function
   - Exported all Svelte types and functions

3. **Key features of generated Svelte code**:
   - TypeScript support with proper type definitions
   - Tailwind CSS or scoped styles options
   - Svelte 5 runes syntax support (opt-in)
   - Accessible components with proper ARIA attributes
   - Responsive design patterns
   - Keyboard navigation support for tabs
   - Swipe gestures for carousels

### Files Modified
- `src/utils/svelte-component-generator.ts` (new file - 1,800+ lines)
- `src/utils/figma-layout-intent.ts` (updated with Svelte integration)

### Notes for Developer
- Svelte is already listed as a JS framework in `src/types/css-frameworks.ts` - no changes needed there
- The generator supports both Svelte 4 (classic `$:` syntax) and Svelte 5 (runes with `$state`, `$derived`, `$props`)
- Generated stores follow Svelte store contract and can be used with `$` prefix
- Actions use standard Svelte action pattern with `destroy()`, `update()` methods
- Playwright test verified 44 test cases passing for all generator functionality

### Verification Status
- Created and ran Playwright test suite with 44 tests covering:
  - List, tabs, carousel, form, and navigation component generation
  - Reactive declarations and Svelte template syntax
  - Store and action generation
  - Svelte 5 runes support
  - Tailwind CSS and scoped styles
  - TypeScript type generation
- All 44 tests passed successfully
- Test files removed after verification as per instructions
</summary>