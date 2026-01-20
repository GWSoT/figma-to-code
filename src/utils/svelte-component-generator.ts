/**
 * Svelte Component Generator
 *
 * Generates Svelte components with:
 * - Reactive declarations ($:)
 * - Svelte template syntax ({#each}, {#if}, {#await})
 * - Svelte stores (writable, readable, derived)
 * - Actions (use:action)
 * - Transitions (transition:, in:, out:)
 *
 * Produces clean, idiomatic Svelte code from Figma design patterns.
 */

import type { BoundingBox } from "./layout-analyzer";
import type {
  ListPatternResult,
  ListPatternType,
  ListSemanticType,
  ListStructure,
  ListItemInfo,
  ItemContentType,
} from "./list-pattern-detector";
import type { FormAnalysisResult, FormFieldGroup } from "./form-analyzer";
import type { NavigationPatternAnalysis, NavigationItem } from "./navigation-pattern-detector";
import type { FigmaNode } from "./figma-api";
import type { DetectedSlot, SlotPatternResult, SvelteSlotCode } from "./slot-pattern-detector";
import { detectSlotPatterns } from "./slot-pattern-detector";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Generated Svelte component output */
export interface GeneratedSvelteCode {
  /** Complete .svelte component file content */
  component: string;
  /** TypeScript types (for separate .d.ts or inline) */
  types: string;
  /** CSS styles (can be extracted or kept in component) */
  styles: string;
  /** Store definitions (for separate store file) */
  stores: string;
  /** Actions definitions (for separate actions file) */
  actions: string;
}

/** Configuration for Svelte code generation */
export interface SvelteGenerationOptions {
  /** Use TypeScript in script tag */
  useTypeScript: boolean;
  /** Use Tailwind CSS instead of scoped styles */
  useTailwind: boolean;
  /** Use Svelte 5 runes syntax ($state, $derived, etc.) */
  useSvelte5Runes: boolean;
  /** Generate stores for state management */
  generateStores: boolean;
  /** Generate actions for reusable behaviors */
  generateActions: boolean;
  /** Include transition effects */
  includeTransitions: boolean;
  /** Component name prefix */
  componentPrefix: string;
  /** Include sample data */
  includeSampleData: boolean;
  /** Responsive design support */
  responsive: boolean;
}

/** Svelte transition configuration */
export interface TransitionConfig {
  type: "fade" | "fly" | "slide" | "scale" | "blur" | "draw";
  direction?: "in" | "out" | "both";
  params?: Record<string, number | string>;
}

/** Svelte store configuration */
export interface StoreConfig {
  name: string;
  type: "writable" | "readable" | "derived";
  initialValue: string;
  derivedFrom?: string[];
}

/** Svelte action configuration */
export interface ActionConfig {
  name: string;
  description: string;
  code: string;
}

/** Default generation options */
const DEFAULT_OPTIONS: SvelteGenerationOptions = {
  useTypeScript: true,
  useTailwind: true,
  useSvelte5Runes: false, // Use classic syntax by default for broader compatibility
  generateStores: true,
  generateActions: true,
  includeTransitions: true,
  componentPrefix: "",
  includeSampleData: true,
  responsive: true,
};

// ============================================================================
// Main Generation Functions
// ============================================================================

/**
 * Generate a complete Svelte component from list pattern analysis
 */
export function generateSvelteListComponent(
  patternResult: ListPatternResult,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const componentName = getComponentName(patternResult.semanticType, opts.componentPrefix);
  const types = generateTypeDefinitions(patternResult, opts);
  const stores = opts.generateStores ? generateStores(patternResult, opts) : "";
  const actions = opts.generateActions ? generateActions(patternResult, opts) : "";
  const styles = opts.useTailwind ? "" : generateScopedStyles(patternResult, opts);
  const component = generateComponent(patternResult, componentName, opts);

  return {
    component,
    types,
    styles,
    stores,
    actions,
  };
}

/**
 * Generate a Svelte component from form analysis
 */
export function generateSvelteFormComponent(
  formAnalysis: FormAnalysisResult,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const componentName = `${opts.componentPrefix}Form`;
  const types = generateFormTypes(formAnalysis, opts);
  const stores = opts.generateStores ? generateFormStores(formAnalysis, opts) : "";
  const actions = opts.generateActions ? generateFormActions(opts) : "";
  const styles = opts.useTailwind ? "" : generateFormStyles(formAnalysis, opts);
  const component = generateFormComponent(formAnalysis, componentName, opts);

  return {
    component,
    types,
    styles,
    stores,
    actions,
  };
}

/**
 * Generate a Svelte component from navigation pattern analysis
 */
export function generateSvelteNavComponent(
  navAnalysis: NavigationPatternAnalysis,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const componentName = getNavComponentName(navAnalysis.patternType, opts.componentPrefix);
  const types = generateNavTypes(navAnalysis, opts);
  const stores = opts.generateStores ? generateNavStores(navAnalysis, opts) : "";
  const actions = opts.generateActions ? generateNavActions(opts) : "";
  const styles = opts.useTailwind ? "" : generateNavStyles(navAnalysis, opts);
  const component = generateNavComponent(navAnalysis, componentName, opts);

  return {
    component,
    types,
    styles,
    stores,
    actions,
  };
}

// ============================================================================
// Component Generation
// ============================================================================

/**
 * Generate the main Svelte component
 */
function generateComponent(
  result: ListPatternResult,
  componentName: string,
  options: SvelteGenerationOptions
): string {
  const { patternType, semanticType } = result;
  const itemTypeName = getItemTypeName(semanticType);
  const itemsVar = `${itemTypeName.toLowerCase()}s`;

  let script = generateScript(result, options, itemTypeName);
  let template = generateTemplate(result, options, itemTypeName, itemsVar);
  let style = options.useTailwind ? "" : generateStyleBlock(result, options);

  return `${script}

${template}${style}`;
}

/**
 * Generate the script section
 */
function generateScript(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string
): string {
  const scriptLang = options.useTypeScript ? ' lang="ts"' : "";
  const itemsVar = `${itemTypeName.toLowerCase()}s`;

  let imports: string[] = [];
  let declarations: string[] = [];
  let reactiveDeclarations: string[] = [];

  // Add transition imports if needed
  if (options.includeTransitions) {
    imports.push(`  import { fade, fly, slide } from 'svelte/transition';`);
  }

  // Add store imports if using stores
  if (options.generateStores) {
    imports.push(`  import { writable, derived } from 'svelte/store';`);
  }

  // Props declaration
  if (options.useSvelte5Runes) {
    // Svelte 5 runes syntax
    if (options.useTypeScript) {
      declarations.push(`  interface Props {
    ${itemsVar}: ${itemTypeName}[];
    class?: string;
  }

  let { ${itemsVar}, class: className = '' }: Props = $props();`);
    } else {
      declarations.push(`  let { ${itemsVar}, class: className = '' } = $props();`);
    }
  } else {
    // Classic Svelte syntax
    if (options.useTypeScript) {
      declarations.push(`  export let ${itemsVar}: ${itemTypeName}[] = [];`);
    } else {
      declarations.push(`  export let ${itemsVar} = [];`);
    }
    declarations.push(`  export let className = '';`);
  }

  // Add reactive declarations based on pattern type
  if (result.patternType === "tabs") {
    if (options.useSvelte5Runes) {
      declarations.push(`  let activeIndex = $state(0);`);
      reactiveDeclarations.push(`  let activeItem = $derived(${itemsVar}[activeIndex]);`);
    } else {
      declarations.push(`  let activeIndex = 0;`);
      reactiveDeclarations.push(`  $: activeItem = ${itemsVar}[activeIndex];`);
    }
  } else if (result.patternType === "carousel") {
    if (options.useSvelte5Runes) {
      declarations.push(`  let currentSlide = $state(0);`);
      reactiveDeclarations.push(`  let totalSlides = $derived(${itemsVar}.length);`);
      reactiveDeclarations.push(`  let canGoNext = $derived(currentSlide < totalSlides - 1);`);
      reactiveDeclarations.push(`  let canGoPrev = $derived(currentSlide > 0);`);
    } else {
      declarations.push(`  let currentSlide = 0;`);
      reactiveDeclarations.push(`  $: totalSlides = ${itemsVar}.length;`);
      reactiveDeclarations.push(`  $: canGoNext = currentSlide < totalSlides - 1;`);
      reactiveDeclarations.push(`  $: canGoPrev = currentSlide > 0;`);
    }
  } else if (result.patternType === "card-grid" || result.patternType === "vertical-list") {
    // Add filter/search functionality
    if (options.useSvelte5Runes) {
      declarations.push(`  let searchQuery = $state('');`);
      reactiveDeclarations.push(`  let filtered${itemTypeName}s = $derived(
    searchQuery
      ? ${itemsVar}.filter(item =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : ${itemsVar}
  );`);
    } else {
      declarations.push(`  let searchQuery = '';`);
      reactiveDeclarations.push(`  $: filtered${itemTypeName}s = searchQuery
    ? ${itemsVar}.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ${itemsVar};`);
    }
  }

  // Add helper functions
  const functions = generateHelperFunctions(result, options);

  let script = `<script${scriptLang}>`;
  if (imports.length > 0) {
    script += `\n${imports.join("\n")}`;
  }
  if (declarations.length > 0) {
    script += `\n\n${declarations.join("\n")}`;
  }
  if (reactiveDeclarations.length > 0) {
    script += `\n\n  // Reactive declarations`;
    script += `\n${reactiveDeclarations.join("\n")}`;
  }
  if (functions) {
    script += `\n\n${functions}`;
  }
  script += `\n</script>`;

  return script;
}

/**
 * Generate helper functions based on pattern type
 */
function generateHelperFunctions(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  const functions: string[] = [];

  if (result.patternType === "tabs") {
    functions.push(`  function selectTab(index) {
    activeIndex = index;
  }`);
  } else if (result.patternType === "carousel") {
    functions.push(`  function nextSlide() {
    if (canGoNext) currentSlide++;
  }

  function prevSlide() {
    if (canGoPrev) currentSlide--;
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
  }`);
  }

  return functions.join("\n\n");
}

/**
 * Generate the template section based on pattern type
 */
function generateTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const { patternType } = result;

  switch (patternType) {
    case "card-grid":
      return generateCardGridTemplate(result, options, itemTypeName, itemsVar);
    case "vertical-list":
      return generateVerticalListTemplate(result, options, itemTypeName, itemsVar);
    case "horizontal-list":
      return generateHorizontalListTemplate(result, options, itemTypeName, itemsVar);
    case "navigation-menu":
      return generateNavigationMenuTemplate(result, options, itemTypeName, itemsVar);
    case "tabs":
      return generateTabsTemplate(result, options, itemTypeName, itemsVar);
    case "carousel":
      return generateCarouselTemplate(result, options, itemTypeName, itemsVar);
    case "table":
      return generateTableTemplate(result, options, itemTypeName, itemsVar);
    default:
      return generateGenericListTemplate(result, options, itemTypeName, itemsVar);
  }
}

/**
 * Generate card grid template
 */
function generateCardGridTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const { structure, suggestedElement } = result;
  const containerClasses = options.useTailwind
    ? suggestedElement.containerClasses.join(" ")
    : "card-grid";
  const itemClasses = options.useTailwind
    ? suggestedElement.itemClasses.join(" ")
    : "card";

  const transition = options.includeTransitions ? " transition:fade" : "";
  const filteredVar = `filtered${itemTypeName}s`;

  return `<div class="${containerClasses} {className}" role="list">
  {#each ${filteredVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}
    <article
      class="${itemClasses}"${transition}
      role="listitem"
    >
      {#if ${itemTypeName.toLowerCase()}.imageUrl}
        <img
          src={${itemTypeName.toLowerCase()}.imageUrl}
          alt={${itemTypeName.toLowerCase()}.title}
          class="${options.useTailwind ? "aspect-video object-cover rounded-md mb-3" : "card-image"}"
        />
      {:else}
        <div class="${options.useTailwind ? "aspect-video bg-muted rounded-md mb-3" : "card-placeholder"}" />
      {/if}
      <h3 class="${options.useTailwind ? "font-semibold text-base" : "card-title"}">
        {${itemTypeName.toLowerCase()}.title}
      </h3>
      {#if ${itemTypeName.toLowerCase()}.description}
        <p class="${options.useTailwind ? "text-sm text-muted-foreground mt-1" : "card-description"}">
          {${itemTypeName.toLowerCase()}.description}
        </p>
      {/if}
    </article>
  {:else}
    <p class="${options.useTailwind ? "col-span-full text-center text-muted-foreground py-8" : "empty-state"}">
      No items found
    </p>
  {/each}
</div>`;
}

/**
 * Generate vertical list template
 */
function generateVerticalListTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const containerClasses = options.useTailwind
    ? result.suggestedElement.containerClasses.join(" ")
    : "vertical-list";

  const transition = options.includeTransitions ? " transition:slide" : "";
  const filteredVar = `filtered${itemTypeName}s`;

  return `<ul class="${containerClasses} {className}" role="list">
  {#each ${filteredVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}
    <li
      class="${options.useTailwind ? "flex items-center gap-4 p-3 hover:bg-accent rounded-lg transition-colors" : "list-item"}"${transition}
    >
      {#if ${itemTypeName.toLowerCase()}.avatarUrl}
        <img
          src={${itemTypeName.toLowerCase()}.avatarUrl}
          alt=""
          class="${options.useTailwind ? "h-10 w-10 rounded-full object-cover flex-shrink-0" : "avatar"}"
        />
      {:else}
        <div class="${options.useTailwind ? "h-10 w-10 rounded-full bg-muted flex-shrink-0" : "avatar-placeholder"}" />
      {/if}
      <div class="${options.useTailwind ? "flex-1 min-w-0" : "content"}">
        <p class="${options.useTailwind ? "font-medium truncate" : "title"}">
          {${itemTypeName.toLowerCase()}.title}
        </p>
        {#if ${itemTypeName.toLowerCase()}.subtitle}
          <p class="${options.useTailwind ? "text-sm text-muted-foreground truncate" : "subtitle"}">
            {${itemTypeName.toLowerCase()}.subtitle}
          </p>
        {/if}
      </div>
    </li>
  {:else}
    <li class="${options.useTailwind ? "text-center text-muted-foreground py-4" : "empty-state"}">
      No items found
    </li>
  {/each}
</ul>`;
}

/**
 * Generate horizontal list template
 */
function generateHorizontalListTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const containerClasses = options.useTailwind
    ? result.suggestedElement.containerClasses.join(" ")
    : "horizontal-list";

  return `<ul class="${containerClasses} {className}" role="list">
  {#each ${itemsVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}
    <li class="${options.useTailwind ? "flex-shrink-0" : "horizontal-item"}">
      {${itemTypeName.toLowerCase()}.label ?? ${itemTypeName.toLowerCase()}.title}
    </li>
  {/each}
</ul>`;
}

/**
 * Generate navigation menu template
 */
function generateNavigationMenuTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const containerClasses = options.useTailwind
    ? result.suggestedElement.containerClasses.join(" ")
    : "navigation";
  const ariaLabel = result.suggestedElement.ariaAttributes["aria-label"] || "Navigation";

  return `<nav class="${containerClasses} {className}" aria-label="${ariaLabel}">
  {#each ${itemsVar} as item, index (item.href ?? index)}
    <a
      href={item.href}
      class="${options.useTailwind ? "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" : "nav-link"}"
      class:${options.useTailwind ? "text-foreground" : "active"}={item.isActive}
      aria-current={item.isActive ? 'page' : undefined}
    >
      {item.label}
    </a>
  {/each}
</nav>`;
}

/**
 * Generate tabs template
 */
function generateTabsTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const containerClasses = options.useTailwind
    ? result.suggestedElement.containerClasses.join(" ")
    : "tabs";

  return `<div class="{className}">
  <!-- Tab buttons -->
  <div class="${containerClasses}" role="tablist" aria-label="Tabs">
    {#each ${itemsVar} as tab, index (tab.id ?? index)}
      <button
        role="tab"
        aria-selected={activeIndex === index}
        aria-controls="panel-{tab.id ?? index}"
        tabindex={activeIndex === index ? 0 : -1}
        class="${options.useTailwind
          ? "px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          : "tab"}"
        class:${options.useTailwind
          ? "border-primary text-foreground"
          : "active"}={activeIndex === index}
        class:${options.useTailwind
          ? "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          : "inactive"}={activeIndex !== index}
        on:click={() => selectTab(index)}
        on:keydown={(e) => {
          if (e.key === 'ArrowRight') selectTab(Math.min(activeIndex + 1, ${itemsVar}.length - 1));
          if (e.key === 'ArrowLeft') selectTab(Math.max(activeIndex - 1, 0));
        }}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Tab panels -->
  {#each ${itemsVar} as tab, index (tab.id ?? index)}
    <div
      role="tabpanel"
      id="panel-{tab.id ?? index}"
      aria-labelledby="tab-{tab.id ?? index}"
      hidden={activeIndex !== index}
      class="${options.useTailwind ? "p-4" : "tab-panel"}"
    >
      {#if activeIndex === index}
        <slot name="panel-{index}">
          <p class="${options.useTailwind ? "text-muted-foreground" : "panel-placeholder"}">
            Content for {tab.label}
          </p>
        </slot>
      {/if}
    </div>
  {/each}
</div>`;
}

/**
 * Generate carousel template
 */
function generateCarouselTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const { structure } = result;
  const transition = options.includeTransitions ? " transition:fade" : "";

  return `<div
  class="${options.useTailwind ? "relative overflow-hidden" : "carousel"} {className}"
  role="region"
  aria-label="Carousel"
  aria-roledescription="carousel"
>
  <!-- Slides container -->
  <div
    class="${options.useTailwind ? "flex transition-transform duration-300 ease-in-out" : "slides"}"
    style="transform: translateX(-{currentSlide * 100}%)"
  >
    {#each ${itemsVar} as ${itemTypeName.toLowerCase()}, index (${itemTypeName.toLowerCase()}.id ?? index)}
      <div
        class="${options.useTailwind ? "w-full flex-shrink-0 px-4" : "slide"}"
        role="group"
        aria-roledescription="slide"
        aria-label="Slide {index + 1} of {totalSlides}"${transition}
      >
        <div class="${options.useTailwind ? "rounded-lg border bg-card overflow-hidden" : "slide-card"}">
          {#if ${itemTypeName.toLowerCase()}.imageUrl}
            <img
              src={${itemTypeName.toLowerCase()}.imageUrl}
              alt={${itemTypeName.toLowerCase()}.title}
              class="${options.useTailwind ? "aspect-video w-full object-cover" : "slide-image"}"
            />
          {:else}
            <div class="${options.useTailwind ? "aspect-video bg-muted" : "slide-placeholder"}" />
          {/if}
          <div class="${options.useTailwind ? "p-4" : "slide-content"}">
            <h3 class="${options.useTailwind ? "font-semibold" : "slide-title"}">
              {${itemTypeName.toLowerCase()}.title}
            </h3>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Navigation buttons -->
  <button
    class="${options.useTailwind
      ? "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-50"
      : "nav-prev"}"
    on:click={prevSlide}
    disabled={!canGoPrev}
    aria-label="Previous slide"
  >
    <svg class="${options.useTailwind ? "h-5 w-5" : ""}" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
    </svg>
  </button>

  <button
    class="${options.useTailwind
      ? "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background disabled:opacity-50"
      : "nav-next"}"
    on:click={nextSlide}
    disabled={!canGoNext}
    aria-label="Next slide"
  >
    <svg class="${options.useTailwind ? "h-5 w-5" : ""}" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
    </svg>
  </button>

  <!-- Dots indicator -->
  <div class="${options.useTailwind ? "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" : "dots"}">
    {#each ${itemsVar} as _, index}
      <button
        class="${options.useTailwind
          ? "h-2 w-2 rounded-full transition-colors"
          : "dot"}"
        class:${options.useTailwind ? "bg-primary" : "active"}={currentSlide === index}
        class:${options.useTailwind ? "bg-muted" : "inactive"}={currentSlide !== index}
        on:click={() => goToSlide(index)}
        aria-label="Go to slide {index + 1}"
      />
    {/each}
  </div>
</div>`;
}

/**
 * Generate table template
 */
function generateTableTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  return `<div class="${options.useTailwind ? "overflow-x-auto" : "table-container"} {className}">
  <table class="${options.useTailwind ? "w-full border-collapse" : "data-table"}">
    <thead>
      <tr class="${options.useTailwind ? "border-b bg-muted/50" : "table-header-row"}">
        <th class="${options.useTailwind ? "px-4 py-3 text-left text-sm font-medium" : ""}">Column 1</th>
        <th class="${options.useTailwind ? "px-4 py-3 text-left text-sm font-medium" : ""}">Column 2</th>
        <th class="${options.useTailwind ? "px-4 py-3 text-left text-sm font-medium" : ""}">Column 3</th>
      </tr>
    </thead>
    <tbody>
      {#each ${itemsVar} as row, index (row.id ?? index)}
        <tr class="${options.useTailwind ? "border-b hover:bg-muted/50 transition-colors" : "table-row"}">
          <td class="${options.useTailwind ? "px-4 py-3 text-sm" : ""}">{row.cell1}</td>
          <td class="${options.useTailwind ? "px-4 py-3 text-sm" : ""}">{row.cell2}</td>
          <td class="${options.useTailwind ? "px-4 py-3 text-sm" : ""}">{row.cell3}</td>
        </tr>
      {:else}
        <tr>
          <td colspan="3" class="${options.useTailwind ? "px-4 py-8 text-center text-muted-foreground" : "empty-row"}">
            No data available
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>`;
}

/**
 * Generate generic list template
 */
function generateGenericListTemplate(
  result: ListPatternResult,
  options: SvelteGenerationOptions,
  itemTypeName: string,
  itemsVar: string
): string {
  const containerClasses = options.useTailwind
    ? result.suggestedElement.containerClasses.join(" ") || "flex flex-col gap-4"
    : "list-container";
  const transition = options.includeTransitions ? " transition:fade" : "";

  return `<div class="${containerClasses} {className}">
  {#each ${itemsVar} as item, index (item.id ?? index)}
    <div
      class="${options.useTailwind ? "p-4 border rounded-lg" : "list-item"}"${transition}
    >
      {item.content ?? item.title}
    </div>
  {:else}
    <p class="${options.useTailwind ? "text-center text-muted-foreground py-4" : "empty-state"}">
      No items to display
    </p>
  {/each}
</div>`;
}

// ============================================================================
// Style Generation
// ============================================================================

/**
 * Generate the style block for non-Tailwind components
 */
function generateStyleBlock(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  const styles = generateScopedStyles(result, options);
  if (!styles) return "";

  return `

<style>
${styles}
</style>`;
}

/**
 * Generate scoped CSS styles
 */
function generateScopedStyles(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  const { patternType, structure } = result;

  switch (patternType) {
    case "card-grid":
      return generateCardGridStyles(structure, options);
    case "vertical-list":
      return generateVerticalListStyles(structure, options);
    case "horizontal-list":
      return generateHorizontalListStyles(structure, options);
    case "tabs":
      return generateTabsStyles(options);
    case "carousel":
      return generateCarouselStyles(structure, options);
    case "table":
      return generateTableStyles(options);
    default:
      return generateGenericStyles(structure, options);
  }
}

function generateCardGridStyles(structure: ListStructure, options: SvelteGenerationOptions): string {
  const columnTemplate =
    structure.columns > 1
      ? `repeat(${structure.columns}, 1fr)`
      : "repeat(auto-fill, minmax(280px, 1fr))";

  return `  .card-grid {
    display: grid;
    grid-template-columns: ${columnTemplate};
    gap: ${structure.verticalGap}px ${structure.horizontalGap}px;
  }

  .card {
    border-radius: 0.5rem;
    border: 1px solid var(--border, #e5e7eb);
    background: var(--card, #ffffff);
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .card-image {
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
    width: 100%;
  }

  .card-placeholder {
    aspect-ratio: 16 / 9;
    background: var(--muted, #f3f4f6);
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .card-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 0;
  }

  .card-description {
    font-size: 0.875rem;
    color: var(--muted-foreground, #6b7280);
    margin: 0.25rem 0 0;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--muted-foreground, #6b7280);
    padding: 2rem;
  }${options.responsive ? `

  @media (max-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .card-grid {
      grid-template-columns: 1fr;
    }
  }` : ""}`;
}

function generateVerticalListStyles(structure: ListStructure, options: SvelteGenerationOptions): string {
  return `  .vertical-list {
    display: flex;
    flex-direction: column;
    gap: ${structure.verticalGap}px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: background-color 0.15s ease;
  }

  .list-item:hover {
    background-color: var(--accent, #f3f4f6);
  }

  .avatar, .avatar-placeholder {
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .avatar {
    object-fit: cover;
  }

  .avatar-placeholder {
    background: var(--muted, #e5e7eb);
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }

  .subtitle {
    font-size: 0.875rem;
    color: var(--muted-foreground, #6b7280);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }`;
}

function generateHorizontalListStyles(structure: ListStructure, options: SvelteGenerationOptions): string {
  return `  .horizontal-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${structure.horizontalGap}px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .horizontal-item {
    flex-shrink: 0;
  }`;
}

function generateTabsStyles(options: SvelteGenerationOptions): string {
  return `  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .tab {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    color: var(--muted-foreground, #6b7280);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab:hover {
    color: var(--foreground, #111827);
    border-bottom-color: var(--border, #e5e7eb);
  }

  .tab.active {
    color: var(--foreground, #111827);
    border-bottom-color: var(--primary, #2563eb);
  }

  .tab-panel {
    padding: 1rem;
  }

  .panel-placeholder {
    color: var(--muted-foreground, #6b7280);
  }`;
}

function generateCarouselStyles(structure: ListStructure, options: SvelteGenerationOptions): string {
  return `  .carousel {
    position: relative;
    overflow: hidden;
  }

  .slides {
    display: flex;
    transition: transform 0.3s ease-in-out;
  }

  .slide {
    flex-shrink: 0;
    width: 100%;
    padding: 0 1rem;
  }

  .slide-card {
    border-radius: 0.5rem;
    border: 1px solid var(--border, #e5e7eb);
    background: var(--card, #ffffff);
    overflow: hidden;
  }

  .slide-image {
    aspect-ratio: 16 / 9;
    width: 100%;
    object-fit: cover;
  }

  .slide-placeholder {
    aspect-ratio: 16 / 9;
    background: var(--muted, #f3f4f6);
  }

  .slide-content {
    padding: 1rem;
  }

  .slide-title {
    font-weight: 600;
    margin: 0;
  }

  .nav-prev, .nav-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.5rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .nav-prev { left: 0.5rem; }
  .nav-next { right: 0.5rem; }

  .nav-prev:disabled, .nav-next:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .dot.active { background: var(--primary, #2563eb); }
  .dot.inactive { background: var(--muted, #e5e7eb); }`;
}

function generateTableStyles(options: SvelteGenerationOptions): string {
  return `  .table-container {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
  }

  .data-table th {
    font-weight: 500;
    background: var(--muted, #f3f4f6);
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .table-row {
    border-bottom: 1px solid var(--border, #e5e7eb);
    transition: background-color 0.15s ease;
  }

  .table-row:hover {
    background-color: var(--muted, #f3f4f6);
  }

  .empty-row {
    text-align: center;
    color: var(--muted-foreground, #6b7280);
    padding: 2rem;
  }`;
}

function generateGenericStyles(structure: ListStructure, options: SvelteGenerationOptions): string {
  return `  .list-container {
    display: flex;
    flex-direction: column;
    gap: ${structure.verticalGap || 16}px;
  }

  .list-item {
    padding: 1rem;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem;
  }

  .empty-state {
    text-align: center;
    color: var(--muted-foreground, #6b7280);
    padding: 1rem;
  }`;
}

// ============================================================================
// Type Definitions Generation
// ============================================================================

/**
 * Generate TypeScript type definitions
 */
function generateTypeDefinitions(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated (useTypeScript: false)";
  }

  const { semanticType, listItems, patternType } = result;
  const typeName = getTypeNameFromSemantic(semanticType);

  let typedef = `/** Auto-generated type for ${patternType} items */\n`;
  typedef += `export interface ${typeName} {\n`;
  typedef += `  id: string | number;\n`;
  typedef += `  title: string;\n`;

  // Detect common content types across items
  const allContentTypes = new Set<ItemContentType>();
  for (const item of listItems) {
    for (const type of item.contentTypes) {
      allContentTypes.add(type);
    }
  }

  if (allContentTypes.has("image")) {
    typedef += `  imageUrl?: string;\n`;
  }
  if (allContentTypes.has("text")) {
    typedef += `  description?: string;\n`;
    typedef += `  subtitle?: string;\n`;
  }
  if (allContentTypes.has("avatar")) {
    typedef += `  avatarUrl?: string;\n`;
  }
  if (allContentTypes.has("badge")) {
    typedef += `  badge?: string;\n`;
  }
  if (allContentTypes.has("price")) {
    typedef += `  price?: number;\n`;
  }
  if (allContentTypes.has("rating")) {
    typedef += `  rating?: number;\n`;
  }
  if (allContentTypes.has("timestamp")) {
    typedef += `  timestamp?: Date | string;\n`;
  }
  if (allContentTypes.has("link")) {
    typedef += `  href?: string;\n`;
  }

  // Add pattern-specific fields
  if (patternType === "navigation-menu" || patternType === "tabs") {
    typedef += `  label?: string;\n`;
    typedef += `  isActive?: boolean;\n`;
  }

  typedef += `}\n`;

  return typedef;
}

// ============================================================================
// Store Generation
// ============================================================================

/**
 * Generate Svelte store definitions
 */
function generateStores(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  const { semanticType, patternType } = result;
  const typeName = getTypeNameFromSemantic(semanticType);
  const itemsVar = `${typeName.toLowerCase()}s`;

  let stores = `/**
 * Svelte stores for ${patternType} component
 * Import: import { ${itemsVar}Store, loading, error } from './${typeName.toLowerCase()}-stores';
 */

import { writable, derived } from 'svelte/store';
`;

  if (options.useTypeScript) {
    stores += `import type { ${typeName} } from './${typeName.toLowerCase()}-types';\n\n`;
  } else {
    stores += `\n`;
  }

  // Main data store
  stores += `/** Store for ${itemsVar} data */
export const ${itemsVar}Store = writable${options.useTypeScript ? `<${typeName}[]>` : ""}([]);

/** Loading state store */
export const loading = writable(false);

/** Error state store */
export const error = writable${options.useTypeScript ? "<string | null>" : ""}(null);

`;

  // Pattern-specific stores
  if (patternType === "tabs") {
    stores += `/** Active tab index store */
export const activeTabIndex = writable(0);

/** Derived store for active tab */
export const activeTab = derived(
  [${itemsVar}Store, activeTabIndex],
  ([$${itemsVar}, $index]) => $${itemsVar}[$index]
);

`;
  } else if (patternType === "carousel") {
    stores += `/** Current slide index store */
export const currentSlide = writable(0);

/** Derived store for total slides */
export const totalSlides = derived(${itemsVar}Store, $items => $items.length);

/** Derived store for navigation state */
export const navigationState = derived(
  [currentSlide, totalSlides],
  ([$current, $total]) => ({
    canGoNext: $current < $total - 1,
    canGoPrev: $current > 0,
    current: $current,
    total: $total
  })
);

`;
  } else if (patternType === "card-grid" || patternType === "vertical-list") {
    stores += `/** Search query store */
export const searchQuery = writable('');

/** Derived store for filtered items */
export const filtered${typeName}s = derived(
  [${itemsVar}Store, searchQuery],
  ([$items, $query]) => {
    if (!$query) return $items;
    const q = $query.toLowerCase();
    return $items.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  }
);

`;
  }

  // Helper functions
  stores += `/**
 * Fetch ${itemsVar} from API
 * @param url - API endpoint URL
 */
export async function fetch${typeName}s(url${options.useTypeScript ? ": string" : ""}) {
  loading.set(true);
  error.set(null);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    ${itemsVar}Store.set(data);
  } catch (e) {
    error.set(e${options.useTypeScript ? " instanceof Error ? e.message : 'Unknown error'" : ".message"});
  } finally {
    loading.set(false);
  }
}

/**
 * Reset stores to initial state
 */
export function reset${typeName}Stores() {
  ${itemsVar}Store.set([]);
  loading.set(false);
  error.set(null);
}
`;

  return stores;
}

// ============================================================================
// Actions Generation
// ============================================================================

/**
 * Generate Svelte action definitions
 */
function generateActions(
  result: ListPatternResult,
  options: SvelteGenerationOptions
): string {
  const { patternType } = result;

  let actions = `/**
 * Svelte actions for ${patternType} component
 * Usage: <element use:actionName={params}>
 */

`;

  // Click outside action (useful for dropdowns, modals)
  actions += `/**
 * Action to detect clicks outside an element
 * Usage: <div use:clickOutside on:outclick={handleOutClick}>
 */
export function clickOutside(node${options.useTypeScript ? ": HTMLElement" : ""}) {
  function handleClick(event${options.useTypeScript ? ": MouseEvent" : ""}) {
    if (!node.contains(event.target${options.useTypeScript ? " as Node" : ""})) {
      node.dispatchEvent(new CustomEvent('outclick'));
    }
  }

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}

`;

  // Focus trap action (useful for modals, dropdowns)
  actions += `/**
 * Action to trap focus within an element
 * Usage: <div use:focusTrap>
 */
export function focusTrap(node${options.useTypeScript ? ": HTMLElement" : ""}) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function handleKeydown(event${options.useTypeScript ? ": KeyboardEvent" : ""}) {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(node.querySelectorAll(focusableSelectors))${options.useTypeScript ? " as HTMLElement[]" : ""};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  // Focus first focusable element
  const firstFocusable = node.querySelector(focusableSelectors)${options.useTypeScript ? " as HTMLElement" : ""};
  firstFocusable?.focus();

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    }
  };
}

`;

  // Lazy load action (useful for images)
  actions += `/**
 * Action for lazy loading images
 * Usage: <img use:lazyLoad={src}>
 */
export function lazyLoad(node${options.useTypeScript ? ": HTMLImageElement" : ""}, src${options.useTypeScript ? ": string" : ""}) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        node.src = src;
        observer.unobserve(node);
      }
    });
  }, { rootMargin: '100px' });

  observer.observe(node);

  return {
    destroy() {
      observer.unobserve(node);
    },
    update(newSrc${options.useTypeScript ? ": string" : ""}) {
      src = newSrc;
    }
  };
}

`;

  // Pattern-specific actions
  if (patternType === "carousel") {
    actions += `/**
 * Action for swipe gestures on carousel
 * Usage: <div use:swipeable on:swipeleft on:swiperight>
 */
export function swipeable(node${options.useTypeScript ? ": HTMLElement" : ""}) {
  let startX${options.useTypeScript ? ": number" : ""};
  let startY${options.useTypeScript ? ": number" : ""};

  function handleTouchStart(event${options.useTypeScript ? ": TouchEvent" : ""}) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }

  function handleTouchEnd(event${options.useTypeScript ? ": TouchEvent" : ""}) {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Only trigger if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        node.dispatchEvent(new CustomEvent('swiperight'));
      } else {
        node.dispatchEvent(new CustomEvent('swipeleft'));
      }
    }
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('touchend', handleTouchEnd, { passive: true });

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

`;
  }

  // Tooltip action
  actions += `/**
 * Action to show tooltip on hover
 * Usage: <element use:tooltip={'Tooltip text'}>
 */
export function tooltip(node${options.useTypeScript ? ": HTMLElement" : ""}, text${options.useTypeScript ? ": string" : ""}) {
  let tooltipEl${options.useTypeScript ? ": HTMLDivElement | null" : ""} = null;

  function showTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.textContent = text;
    tooltipEl.style.cssText = \`
      position: fixed;
      background: #1f2937;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      pointer-events: none;
    \`;
    document.body.appendChild(tooltipEl);

    const rect = node.getBoundingClientRect();
    tooltipEl.style.left = \`\${rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2}px\`;
    tooltipEl.style.top = \`\${rect.top - tooltipEl.offsetHeight - 8}px\`;
  }

  function hideTooltip() {
    tooltipEl?.remove();
    tooltipEl = null;
  }

  node.addEventListener('mouseenter', showTooltip);
  node.addEventListener('mouseleave', hideTooltip);

  return {
    destroy() {
      hideTooltip();
      node.removeEventListener('mouseenter', showTooltip);
      node.removeEventListener('mouseleave', hideTooltip);
    },
    update(newText${options.useTypeScript ? ": string" : ""}) {
      text = newText;
    }
  };
}
`;

  return actions;
}

// ============================================================================
// Form Component Generation
// ============================================================================

function generateFormComponent(
  formAnalysis: FormAnalysisResult,
  componentName: string,
  options: SvelteGenerationOptions
): string {
  const scriptLang = options.useTypeScript ? ' lang="ts"' : "";

  let script = `<script${scriptLang}>`;

  if (options.includeTransitions) {
    script += `\n  import { fade, slide } from 'svelte/transition';`;
  }

  // Form state
  if (options.useSvelte5Runes) {
    script += `\n
  interface FormData {
    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\s+/g, '_').toLowerCase()}: string;`).join('\n    ')}
  }

  let formData = $state<FormData>({
    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\s+/g, '_').toLowerCase()}: ''`).join(',\n    ')}
  });

  let errors = $state<Partial<Record<keyof FormData, string>>>({});
  let isSubmitting = $state(false);
  let isValid = $derived(Object.keys(errors).length === 0);`;
  } else {
    script += `\n
  let formData = {
    ${formAnalysis.fieldGroups.map(f => `${f.input.nodeName.replace(/\s+/g, '_').toLowerCase()}: ''`).join(',\n    ')}
  };

  let errors = {};
  let isSubmitting = false;

  $: isValid = Object.keys(errors).length === 0;`;
  }

  script += `\n
  function validate() {
    errors = {};
    // Add validation logic here
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    isSubmitting = true;
    try {
      // Submit logic here
      console.log('Submitting:', formData);
    } finally {
      isSubmitting = false;
    }
  }
</script>`;

  const template = `

<form on:submit={handleSubmit} class="${options.useTailwind ? "space-y-6 max-w-md" : "form"}">
  ${formAnalysis.fieldGroups.map(field => {
    const fieldName = field.input.nodeName.replace(/\s+/g, '_').toLowerCase();
    const labelText = field.label?.nodeName || fieldName;

    return `<div class="${options.useTailwind ? "space-y-2" : "form-field"}">
    <label for="${fieldName}" class="${options.useTailwind ? "text-sm font-medium" : "label"}">
      ${labelText}
    </label>
    <input
      type="text"
      id="${fieldName}"
      bind:value={formData.${fieldName}}
      class="${options.useTailwind ? "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "input"}"
    />
    {#if errors.${fieldName}}
      <p class="${options.useTailwind ? "text-sm text-destructive" : "error"}"${options.includeTransitions ? " transition:slide" : ""}>
        {errors.${fieldName}}
      </p>
    {/if}
  </div>`;
  }).join('\n  ')}

  <button
    type="submit"
    disabled={isSubmitting || !isValid}
    class="${options.useTailwind ? "w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" : "submit-button"}"
  >
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>`;

  const style = options.useTailwind ? "" : `

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 28rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .input:focus {
    outline: none;
    border-color: var(--primary, #2563eb);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  .error {
    font-size: 0.875rem;
    color: var(--destructive, #dc2626);
  }

  .submit-button {
    width: 100%;
    padding: 0.5rem 1rem;
    background: var(--primary, #2563eb);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-button:hover {
    opacity: 0.9;
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>`;

  return script + template + style;
}

function generateFormTypes(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {
  if (!options.useTypeScript) return "";

  const fields = formAnalysis.fieldGroups.map(f => {
    const fieldName = f.input.nodeName.replace(/\s+/g, '_').toLowerCase();
    return `  ${fieldName}: string;`;
  });

  return `export interface FormData {\n${fields.join('\n')}\n}\n\nexport interface FormErrors {\n${fields.map(f => f.replace(': string', '?: string')).join('\n')}\n}`;
}

function generateFormStores(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {
  const fields = formAnalysis.fieldGroups.map(f =>
    f.input.nodeName.replace(/\s+/g, '_').toLowerCase()
  );

  return `import { writable, derived } from 'svelte/store';

export const formData = writable({
  ${fields.map(f => `${f}: ''`).join(',\n  ')}
});

export const errors = writable({});
export const isSubmitting = writable(false);
export const touched = writable({});

export const isValid = derived(errors, $errors => Object.keys($errors).length === 0);

export function resetForm() {
  formData.set({ ${fields.map(f => `${f}: ''`).join(', ')} });
  errors.set({});
  touched.set({});
}`;
}

function generateFormActions(options: SvelteGenerationOptions): string {
  return `/**
 * Form validation action
 * Usage: <input use:validate={{ required: true, minLength: 3 }}>
 */
export function validate(node${options.useTypeScript ? ": HTMLInputElement" : ""}, rules${options.useTypeScript ? ": Record<string, any>" : ""}) {
  function runValidation() {
    let error = null;
    const value = node.value;

    if (rules.required && !value) {
      error = 'This field is required';
    } else if (rules.minLength && value.length < rules.minLength) {
      error = \`Minimum \${rules.minLength} characters required\`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = \`Maximum \${rules.maxLength} characters allowed\`;
    } else if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      error = rules.patternMessage || 'Invalid format';
    }

    node.dispatchEvent(new CustomEvent('validate', { detail: { error } }));
    return error;
  }

  node.addEventListener('blur', runValidation);
  node.addEventListener('input', runValidation);

  return {
    destroy() {
      node.removeEventListener('blur', runValidation);
      node.removeEventListener('input', runValidation);
    },
    update(newRules${options.useTypeScript ? ": Record<string, any>" : ""}) {
      rules = newRules;
    }
  };
}`;
}

function generateFormStyles(formAnalysis: FormAnalysisResult, options: SvelteGenerationOptions): string {
  return "";  // Styles are inline in the component
}

// ============================================================================
// Navigation Component Generation
// ============================================================================

function generateNavComponent(
  navAnalysis: NavigationPatternAnalysis,
  componentName: string,
  options: SvelteGenerationOptions
): string {
  const scriptLang = options.useTypeScript ? ' lang="ts"' : "";
  const { patternType, items, ariaLabel } = navAnalysis;

  let script = `<script${scriptLang}>`;

  if (options.includeTransitions) {
    script += `\n  import { fade, slide } from 'svelte/transition';`;
  }

  if (options.useSvelte5Runes) {
    script += `\n
  interface NavItem {
    label: string;
    href?: string;
    isActive?: boolean;
    children?: NavItem[];
  }

  interface Props {
    items: NavItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();`;
  } else {
    script += `\n
  export let items = [];
  export let className = '';`;
  }

  if (patternType === "sidebar-nav" || patternType === "nested-nav") {
    if (options.useSvelte5Runes) {
      script += `\n
  let expandedItems = $state(new Set());`;
    } else {
      script += `\n
  let expandedItems = new Set();

  function toggleExpanded(id) {
    if (expandedItems.has(id)) {
      expandedItems.delete(id);
    } else {
      expandedItems.add(id);
    }
    expandedItems = expandedItems; // Trigger reactivity
  }`;
    }
  }

  script += `\n</script>`;

  let template = "";

  switch (patternType) {
    case "top-nav":
    case "bottom-nav":
      template = `

<nav class="${options.useTailwind ? "flex items-center gap-4" : "nav"} {className}" aria-label="${ariaLabel}">
  {#each items as item, index (item.href ?? index)}
    <a
      href={item.href}
      class="${options.useTailwind ? "text-sm font-medium transition-colors" : "nav-link"}"
      class:${options.useTailwind ? "text-foreground" : "active"}={item.isActive}
      class:${options.useTailwind ? "text-muted-foreground hover:text-foreground" : "inactive"}={!item.isActive}
      aria-current={item.isActive ? 'page' : undefined}
    >
      {item.label}
    </a>
  {/each}
</nav>`;
      break;

    case "sidebar-nav":
      template = `

<nav class="${options.useTailwind ? "flex flex-col gap-1" : "sidebar-nav"} {className}" aria-label="${ariaLabel}">
  {#each items as item, index (item.href ?? index)}
    {#if item.children?.length}
      <div>
        <button
          class="${options.useTailwind ? "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent" : "nav-group-toggle"}"
          on:click={() => toggleExpanded(index)}
          aria-expanded={expandedItems.has(index)}
        >
          {item.label}
          <svg
            class="${options.useTailwind ? "h-4 w-4 transition-transform" : "chevron"}"
            class:rotate-180={expandedItems.has(index)}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
        {#if expandedItems.has(index)}
          <div class="${options.useTailwind ? "ml-4 mt-1 flex flex-col gap-1" : "nav-children"}"${options.includeTransitions ? " transition:slide" : ""}>
            {#each item.children as child}
              <a
                href={child.href}
                class="${options.useTailwind ? "rounded-lg px-3 py-2 text-sm transition-colors" : "nav-child-link"}"
                class:${options.useTailwind ? "bg-muted text-foreground" : "active"}={child.isActive}
                class:${options.useTailwind ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "inactive"}={!child.isActive}
              >
                {child.label}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <a
        href={item.href}
        class="${options.useTailwind ? "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors" : "nav-link"}"
        class:${options.useTailwind ? "bg-muted text-foreground" : "active"}={item.isActive}
        class:${options.useTailwind ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "inactive"}={!item.isActive}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {item.label}
      </a>
    {/if}
  {/each}
</nav>`;
      break;

    case "breadcrumb":
      template = `

<nav class="${options.useTailwind ? "flex items-center gap-2 text-sm" : "breadcrumb"} {className}" aria-label="Breadcrumb">
  <ol class="${options.useTailwind ? "flex items-center gap-2" : "breadcrumb-list"}">
    {#each items as item, index (item.href ?? index)}
      <li class="${options.useTailwind ? "flex items-center gap-2" : "breadcrumb-item"}">
        {#if index > 0}
          <span class="${options.useTailwind ? "text-muted-foreground" : "separator"}" aria-hidden="true">/</span>
        {/if}
        {#if item.isActive}
          <span class="${options.useTailwind ? "text-foreground font-medium" : "current"}" aria-current="page">
            {item.label}
          </span>
        {:else}
          <a
            href={item.href}
            class="${options.useTailwind ? "text-muted-foreground hover:text-foreground transition-colors" : "link"}"
          >
            {item.label}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>`;
      break;

    case "tabs":
      template = `

<div class="{className}" role="tablist" aria-label="${ariaLabel}">
  {#each items as item, index (item.id ?? index)}
    <button
      role="tab"
      aria-selected={item.isActive}
      tabindex={item.isActive ? 0 : -1}
      class="${options.useTailwind ? "px-4 py-2 text-sm font-medium border-b-2 transition-colors" : "tab"}"
      class:${options.useTailwind ? "border-primary text-foreground" : "active"}={item.isActive}
      class:${options.useTailwind ? "border-transparent text-muted-foreground hover:text-foreground hover:border-border" : "inactive"}={!item.isActive}
    >
      {item.label}
    </button>
  {/each}
</div>`;
      break;

    default:
      template = `

<nav class="{className}" aria-label="${ariaLabel}">
  {#each items as item, index (item.href ?? index)}
    <a href={item.href} class:active={item.isActive}>
      {item.label}
    </a>
  {/each}
</nav>`;
  }

  const style = options.useTailwind ? "" : `

<style>
  .nav, .sidebar-nav, .breadcrumb {
    display: flex;
  }

  .nav {
    align-items: center;
    gap: 1rem;
  }

  .sidebar-nav {
    flex-direction: column;
    gap: 0.25rem;
  }

  .nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-foreground, #6b7280);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .nav-link:hover, .nav-link.active {
    color: var(--foreground, #111827);
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .separator {
    color: var(--muted-foreground, #6b7280);
  }
</style>`;

  return script + template + style;
}

function generateNavTypes(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {
  if (!options.useTypeScript) return "";

  return `export interface NavItem {
  label: string;
  href?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  icon?: string;
  children?: NavItem[];
}`;
}

function generateNavStores(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {
  return `import { writable, derived } from 'svelte/store';

export const navItems = writable([]);
export const currentPath = writable('/');

export const activeItem = derived(
  [navItems, currentPath],
  ([$items, $path]) => $items.find(item => item.href === $path)
);

export function setCurrentPath(path${options.useTypeScript ? ": string" : ""}) {
  currentPath.set(path);
}`;
}

function generateNavActions(options: SvelteGenerationOptions): string {
  return `/**
 * Action to handle active link styling based on current route
 * Usage: <a use:activeLink={currentPath}>
 */
export function activeLink(node${options.useTypeScript ? ": HTMLAnchorElement" : ""}, currentPath${options.useTypeScript ? ": string" : ""}) {
  function update(path${options.useTypeScript ? ": string" : ""}) {
    if (node.pathname === path || node.href.endsWith(path)) {
      node.classList.add('active');
      node.setAttribute('aria-current', 'page');
    } else {
      node.classList.remove('active');
      node.removeAttribute('aria-current');
    }
  }

  update(currentPath);

  return {
    update
  };
}`;
}

function generateNavStyles(navAnalysis: NavigationPatternAnalysis, options: SvelteGenerationOptions): string {
  return "";  // Styles are inline in the component
}

// ============================================================================
// Helper Functions
// ============================================================================

function getComponentName(semanticType: ListSemanticType, prefix: string): string {
  const names: Record<ListSemanticType, string> = {
    "product-catalog": "ProductList",
    "user-list": "UserList",
    "article-feed": "ArticleFeed",
    "media-gallery": "MediaGallery",
    "settings-list": "SettingsList",
    navigation: "Navigation",
    breadcrumb: "Breadcrumb",
    tabs: "Tabs",
    menu: "Menu",
    "data-table": "DataTable",
    "generic-list": "List",
    unknown: "List",
  };

  return `${prefix}${names[semanticType] || "List"}`;
}

function getNavComponentName(patternType: string, prefix: string): string {
  const names: Record<string, string> = {
    "top-nav": "TopNav",
    "sidebar-nav": "SidebarNav",
    breadcrumb: "Breadcrumb",
    tabs: "Tabs",
    pagination: "Pagination",
    "bottom-nav": "BottomNav",
    "mega-menu": "MegaMenu",
    "dropdown-menu": "DropdownMenu",
    "nested-nav": "NestedNav",
    unknown: "Navigation",
  };

  return `${prefix}${names[patternType] || "Navigation"}`;
}

function getItemTypeName(semanticType: ListSemanticType): string {
  const names: Record<ListSemanticType, string> = {
    "product-catalog": "Product",
    "user-list": "User",
    "article-feed": "Article",
    "media-gallery": "Media",
    "settings-list": "Setting",
    navigation: "NavItem",
    breadcrumb: "Crumb",
    tabs: "Tab",
    menu: "MenuItem",
    "data-table": "Row",
    "generic-list": "Item",
    unknown: "Item",
  };

  return names[semanticType] || "Item";
}

function getTypeNameFromSemantic(semanticType: ListSemanticType): string {
  return getItemTypeName(semanticType);
}

// ============================================================================
// Slot-Based Component Generation
// ============================================================================

/**
 * Configuration for slot-based Svelte component generation
 */
export interface SvelteSlotComponentOptions extends Partial<SvelteGenerationOptions> {
  /** Component name */
  componentName: string;
  /** Base element for the component */
  baseElement?: string;
  /** Additional component classes */
  componentClasses?: string;
  /** Additional props to include */
  additionalProps?: Array<{
    name: string;
    type: string;
    defaultValue?: string;
    description?: string;
  }>;
}

/**
 * Generated slot-based Svelte component
 */
export interface GeneratedSlotComponent {
  /** Complete .svelte component file content */
  component: string;
  /** TypeScript types for the component */
  types: string;
  /** Detected slots from the Figma node */
  slots: DetectedSlot[];
  /** Slot code for Svelte */
  slotCode: SvelteSlotCode;
  /** Usage example */
  usageExample: string;
}

/**
 * Generate a Svelte component with slots from a Figma node
 */
export function generateSvelteSlotComponent(
  node: FigmaNode,
  options: SvelteSlotComponentOptions
): GeneratedSlotComponent {
  const opts: SvelteGenerationOptions = { ...DEFAULT_OPTIONS, ...options };
  const { componentName, baseElement = "div", componentClasses = "", additionalProps = [] } = options;

  // Detect slots from the Figma node
  const slotResult = detectSlotPatterns(node, {
    componentName,
    useTypeScript: opts.useTypeScript,
    framework: "svelte",
  });

  const slotCode = slotResult.frameworkCode.svelte;

  // Generate the component
  const component = generateSlotComponentCode(
    componentName,
    baseElement,
    componentClasses,
    slotResult,
    additionalProps,
    opts
  );

  // Generate types
  const types = generateSlotComponentTypes(componentName, slotResult, additionalProps, opts);

  // Generate usage example
  const usageExample = slotCode.usageExample;

  return {
    component,
    types,
    slots: slotResult.slots,
    slotCode,
    usageExample,
  };
}

/**
 * Generate the slot component code
 */
function generateSlotComponentCode(
  componentName: string,
  baseElement: string,
  componentClasses: string,
  slotResult: SlotPatternResult,
  additionalProps: SvelteSlotComponentOptions["additionalProps"],
  options: SvelteGenerationOptions
): string {
  const scriptLang = options.useTypeScript ? ' lang="ts"' : "";
  const { slots } = slotResult;

  // Script section
  let script = `<script${scriptLang}>`;

  // Imports
  if (options.includeTransitions) {
    script += `\n  import { fade, slide } from 'svelte/transition';`;
  }

  // Props
  if (options.useSvelte5Runes) {
    // Svelte 5 runes syntax
    const propsInterface = generateSvelte5PropsInterface(componentName, slots, additionalProps, options);
    script += `\n\n${propsInterface}`;
  } else {
    // Classic Svelte syntax
    script += `\n\n  /** Additional CSS classes */`;
    script += `\n  export let className = '';`;

    for (const prop of additionalProps || []) {
      const description = prop.description ? `\n  /** ${prop.description} */` : "";
      const defaultValue = prop.defaultValue ? ` = ${prop.defaultValue}` : "";
      script += `${description}`;
      script += `\n  export let ${prop.name}${options.useTypeScript ? `: ${prop.type}` : ""}${defaultValue};`;
    }
  }

  script += `\n</script>`;

  // Template section
  const template = generateSlotTemplate(baseElement, componentClasses, slots, options);

  // Style section
  const style = options.useTailwind ? "" : generateSlotComponentStyles(options);

  return `${script}\n\n${template}${style}`;
}

/**
 * Generate Svelte 5 props interface with runes
 */
function generateSvelte5PropsInterface(
  componentName: string,
  slots: DetectedSlot[],
  additionalProps: SvelteSlotComponentOptions["additionalProps"],
  options: SvelteGenerationOptions
): string {
  let code = `  interface Props {`;
  code += `\n    /** Additional CSS classes */`;
  code += `\n    class?: string;`;

  for (const prop of additionalProps || []) {
    const description = prop.description ? `\n    /** ${prop.description} */` : "";
    const optional = prop.defaultValue ? "?" : "";
    code += `${description}`;
    code += `\n    ${prop.name}${optional}: ${prop.type};`;
  }

  // Add snippet props for slots (Svelte 5)
  for (const slot of slots) {
    const slotName = slot.isDefault ? "children" : slot.name;
    code += `\n    /** ${slot.description} */`;
    code += `\n    ${slotName}?: import('svelte').Snippet;`;
  }

  code += `\n  }`;
  code += `\n`;
  code += `\n  let { class: className = ''`;

  for (const prop of additionalProps || []) {
    const defaultValue = prop.defaultValue ? ` = ${prop.defaultValue}` : "";
    code += `, ${prop.name}${defaultValue}`;
  }

  for (const slot of slots) {
    const slotName = slot.isDefault ? "children" : slot.name;
    code += `, ${slotName}`;
  }

  code += ` }: Props = $props();`;

  return code;
}

/**
 * Generate the slot template
 */
function generateSlotTemplate(
  baseElement: string,
  componentClasses: string,
  slots: DetectedSlot[],
  options: SvelteGenerationOptions
): string {
  const classAttr = componentClasses
    ? `class="${componentClasses} {className}"`
    : `class={className}`;

  const defaultSlot = slots.find(s => s.isDefault);
  const namedSlots = slots.filter(s => !s.isDefault);

  // Sort named slots by position
  const positionOrder = ["start", "before", "center", "after", "end", "overlay"];
  const sortedNamedSlots = [...namedSlots].sort(
    (a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  );

  // Build template
  let template = `<${baseElement} ${classAttr}>`;

  // Add slots in order based on position
  const startSlots = sortedNamedSlots.filter(s => s.position === "start" || s.position === "before");
  const endSlots = sortedNamedSlots.filter(s => s.position === "end" || s.position === "after");
  const overlaySlots = sortedNamedSlots.filter(s => s.position === "overlay");

  // Start/before slots
  for (const slot of startSlots) {
    template += `\n  <!-- ${slot.description} -->`;
    if (slot.fallbackContent) {
      template += `\n  <slot name="${slot.name}">${slot.fallbackContent}</slot>`;
    } else {
      template += `\n  <slot name="${slot.name}" />`;
    }
  }

  // Default slot
  if (defaultSlot) {
    template += `\n  <!-- ${defaultSlot.description} -->`;
    if (defaultSlot.fallbackContent) {
      template += `\n  <slot>${defaultSlot.fallbackContent}</slot>`;
    } else {
      template += `\n  <slot />`;
    }
  } else if (slots.length === 0) {
    // No slots detected, add a default slot anyway
    template += `\n  <!-- Default content slot -->`;
    template += `\n  <slot />`;
  }

  // End/after slots
  for (const slot of endSlots) {
    template += `\n  <!-- ${slot.description} -->`;
    if (slot.fallbackContent) {
      template += `\n  <slot name="${slot.name}">${slot.fallbackContent}</slot>`;
    } else {
      template += `\n  <slot name="${slot.name}" />`;
    }
  }

  // Overlay slots
  for (const slot of overlaySlots) {
    template += `\n  <!-- ${slot.description} -->`;
    template += `\n  {#if $$slots.${slot.name}}`;
    template += `\n    <div class="${options.useTailwind ? "absolute inset-0" : "overlay"}">`;
    if (slot.fallbackContent) {
      template += `\n      <slot name="${slot.name}">${slot.fallbackContent}</slot>`;
    } else {
      template += `\n      <slot name="${slot.name}" />`;
    }
    template += `\n    </div>`;
    template += `\n  {/if}`;
  }

  template += `\n</${baseElement}>`;

  return template;
}

/**
 * Generate component styles for non-Tailwind usage
 */
function generateSlotComponentStyles(options: SvelteGenerationOptions): string {
  return `

<style>
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>`;
}

/**
 * Generate TypeScript types for the slot component
 */
function generateSlotComponentTypes(
  componentName: string,
  slotResult: SlotPatternResult,
  additionalProps: SvelteSlotComponentOptions["additionalProps"],
  options: SvelteGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated (useTypeScript: false)";
  }

  let types = `/**\n * Props for ${componentName} component\n */\n`;
  types += `export interface ${componentName}Props {\n`;
  types += `  /** Additional CSS classes */\n`;
  types += `  class?: string;\n`;

  for (const prop of additionalProps || []) {
    const description = prop.description ? `  /** ${prop.description} */\n` : "";
    const optional = prop.defaultValue ? "?" : "";
    types += `${description}`;
    types += `  ${prop.name}${optional}: ${prop.type};\n`;
  }

  types += `}\n\n`;

  // Slot types
  types += `/**\n * Slots for ${componentName} component\n */\n`;
  types += `export interface ${componentName}Slots {\n`;

  for (const slot of slotResult.slots) {
    const slotName = slot.isDefault ? "default" : slot.name;
    types += `  /** ${slot.description} */\n`;
    types += `  ${slotName}?: import('svelte').Snippet;\n`;
  }

  types += `}\n`;

  return types;
}

/**
 * Generate a slot-aware wrapper component from Figma design
 */
export function generateSvelteWrapperComponent(
  node: FigmaNode,
  componentName: string,
  options: Partial<SvelteGenerationOptions> = {}
): GeneratedSvelteCode {
  const opts: SvelteGenerationOptions = { ...DEFAULT_OPTIONS, ...options };

  // Detect slots
  const slotResult = detectSlotPatterns(node, {
    componentName,
    useTypeScript: opts.useTypeScript,
    framework: "svelte",
  });

  // Generate component
  const slotComponent = generateSvelteSlotComponent(node, {
    ...opts,
    componentName,
  });

  return {
    component: slotComponent.component,
    types: slotComponent.types,
    styles: "",
    stores: "",
    actions: "",
  };
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_OPTIONS as SVELTE_GENERATION_DEFAULTS };
