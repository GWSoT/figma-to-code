/**
 * Semantic List Generator - Generates Appropriate List Markup
 *
 * Produces semantic HTML/JSX markup for detected list patterns:
 * - Card grids with proper grid CSS
 * - Ordered/unordered lists with correct semantics
 * - Navigation lists with proper ARIA
 * - Tab interfaces with accessibility support
 * - Carousels with scroll behaviors
 */

import type { BoundingBox } from "./layout-analyzer";
import type {
  ListPatternResult,
  ListPatternType,
  ListSemanticType,
  ListStructure,
  ListElementSuggestion,
  ListItemInfo,
  ItemContentType,
} from "./list-pattern-detector";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Generated code output */
export interface GeneratedListCode {
  /** JSX/React code */
  jsx: string;
  /** Plain CSS styles */
  css: string;
  /** Tailwind CSS classes summary */
  tailwindSummary: string;
  /** TypeScript interface for item data */
  typeDefinition: string;
  /** React component template */
  componentTemplate: string;
}

/** Configuration for code generation */
export interface CodeGenerationOptions {
  /** Use TypeScript types */
  useTypeScript: boolean;
  /** Use Tailwind CSS */
  useTailwind: boolean;
  /** Use CSS modules */
  useCSSModules: boolean;
  /** Component name prefix */
  componentPrefix: string;
  /** Include sample data */
  includeSampleData: boolean;
  /** Responsive breakpoints */
  responsive: boolean;
}

/** Default generation options */
const DEFAULT_OPTIONS: CodeGenerationOptions = {
  useTypeScript: true,
  useTailwind: true,
  useCSSModules: false,
  componentPrefix: "",
  includeSampleData: true,
  responsive: true,
};

// ============================================================================
// Main Generation Functions
// ============================================================================

/**
 * Generate semantic list markup from pattern analysis
 */
export function generateListMarkup(
  patternResult: ListPatternResult,
  options: Partial<CodeGenerationOptions> = {}
): GeneratedListCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const jsx = generateJSX(patternResult, opts);
  const css = generateCSS(patternResult, opts);
  const tailwindSummary = generateTailwindSummary(patternResult);
  const typeDefinition = generateTypeDefinition(patternResult, opts);
  const componentTemplate = generateComponentTemplate(patternResult, opts);

  return {
    jsx,
    css,
    tailwindSummary,
    typeDefinition,
    componentTemplate,
  };
}

/**
 * Generate just the JSX for a list pattern
 */
export function generateListJSX(
  patternResult: ListPatternResult,
  options: Partial<CodeGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return generateJSX(patternResult, opts);
}

/**
 * Generate just the CSS for a list pattern
 */
export function generateListCSS(
  patternResult: ListPatternResult,
  options: Partial<CodeGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return generateCSS(patternResult, opts);
}

// ============================================================================
// JSX Generation
// ============================================================================

/**
 * Generate JSX code based on pattern type
 */
function generateJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { patternType, structure, suggestedElement, listItems } = result;

  switch (patternType) {
    case "card-grid":
      return generateCardGridJSX(result, options);
    case "vertical-list":
      return generateVerticalListJSX(result, options);
    case "horizontal-list":
      return generateHorizontalListJSX(result, options);
    case "navigation-menu":
      return generateNavigationJSX(result, options);
    case "tabs":
      return generateTabsJSX(result, options);
    case "carousel":
      return generateCarouselJSX(result, options);
    case "table":
      return generateTableJSX(result, options);
    default:
      return generateGenericListJSX(result, options);
  }
}

/**
 * Generate card grid JSX
 */
function generateCardGridJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { structure, suggestedElement, listItems, semanticType } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");
  const itemClasses = suggestedElement.itemClasses.join(" ");

  const itemName = getItemTypeName(semanticType);
  const itemsVar = `${itemName.toLowerCase()}s`;

  let jsx = "";

  if (options.useTailwind) {
    jsx = `<ul className="${containerClasses}" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="${itemClasses}">
      {/* Card content */}
      <div className="aspect-video bg-muted rounded-md mb-3" />
      <h3 className="font-semibold text-base">{${itemName.toLowerCase()}.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{${itemName.toLowerCase()}.description}</p>
    </li>
  ))}
</ul>`;
  } else {
    jsx = `<ul className="card-grid" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="card">
      {/* Card content */}
      <div className="card-image" />
      <h3 className="card-title">{${itemName.toLowerCase()}.title}</h3>
      <p className="card-description">{${itemName.toLowerCase()}.description}</p>
    </li>
  ))}
</ul>`;
  }

  return jsx;
}

/**
 * Generate vertical list JSX
 */
function generateVerticalListJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { structure, suggestedElement, semanticType } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");

  const itemName = getItemTypeName(semanticType);
  const itemsVar = `${itemName.toLowerCase()}s`;

  if (options.useTailwind) {
    return `<ul className="${containerClasses}" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="flex items-center gap-4 p-3 hover:bg-accent rounded-lg">
      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{${itemName.toLowerCase()}.title}</p>
        <p className="text-sm text-muted-foreground truncate">{${itemName.toLowerCase()}.subtitle}</p>
      </div>
    </li>
  ))}
</ul>`;
  }

  return `<ul className="list" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="list-item">
      <div className="list-item-avatar" />
      <div className="list-item-content">
        <p className="list-item-title">{${itemName.toLowerCase()}.title}</p>
        <p className="list-item-subtitle">{${itemName.toLowerCase()}.subtitle}</p>
      </div>
    </li>
  ))}
</ul>`;
}

/**
 * Generate horizontal list JSX
 */
function generateHorizontalListJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { suggestedElement, semanticType } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");

  const itemName = getItemTypeName(semanticType);
  const itemsVar = `${itemName.toLowerCase()}s`;

  if (options.useTailwind) {
    return `<ul className="${containerClasses}" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="flex-shrink-0">
      {${itemName.toLowerCase()}.label}
    </li>
  ))}
</ul>`;
  }

  return `<ul className="horizontal-list" role="list">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <li key={${itemName.toLowerCase()}.id ?? index} className="horizontal-list-item">
      {${itemName.toLowerCase()}.label}
    </li>
  ))}
</ul>`;
}

/**
 * Generate navigation JSX
 */
function generateNavigationJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { suggestedElement } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");
  const ariaLabel = suggestedElement.ariaAttributes["aria-label"] || "Navigation";

  if (options.useTailwind) {
    return `<nav className="${containerClasses}" aria-label="${ariaLabel}">
  {navItems.map((item, index) => (
    <a
      key={item.href ?? index}
      href={item.href}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-current={item.isActive ? "page" : undefined}
    >
      {item.label}
    </a>
  ))}
</nav>`;
  }

  return `<nav className="navigation" aria-label="${ariaLabel}">
  {navItems.map((item, index) => (
    <a
      key={item.href ?? index}
      href={item.href}
      className="nav-link"
      aria-current={item.isActive ? "page" : undefined}
    >
      {item.label}
    </a>
  ))}
</nav>`;
}

/**
 * Generate tabs JSX
 */
function generateTabsJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { suggestedElement } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");

  if (options.useTailwind) {
    return `<div className="${containerClasses}" role="tablist" aria-label="Tabs">
  {tabs.map((tab, index) => (
    <button
      key={tab.id ?? index}
      role="tab"
      aria-selected={tab.isActive}
      aria-controls={\`panel-\${tab.id}\`}
      className={\`px-4 py-2 text-sm font-medium border-b-2 transition-colors \${
        tab.isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }\`}
    >
      {tab.label}
    </button>
  ))}
</div>`;
  }

  return `<div className="tabs" role="tablist" aria-label="Tabs">
  {tabs.map((tab, index) => (
    <button
      key={tab.id ?? index}
      role="tab"
      aria-selected={tab.isActive}
      aria-controls={\`panel-\${tab.id}\`}
      className={\`tab \${tab.isActive ? "tab-active" : ""}\`}
    >
      {tab.label}
    </button>
  ))}
</div>`;
}

/**
 * Generate carousel JSX
 */
function generateCarouselJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { structure, suggestedElement, semanticType } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");

  const itemName = getItemTypeName(semanticType);
  const itemsVar = `${itemName.toLowerCase()}s`;

  if (options.useTailwind) {
    return `<div
  className="${containerClasses} -mx-4 px-4 scrollbar-hide"
  role="region"
  aria-label="Carousel"
  aria-roledescription="carousel"
>
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <div
      key={${itemName.toLowerCase()}.id ?? index}
      className="flex-shrink-0 snap-center w-[${structure.itemWidth}px]"
      role="group"
      aria-roledescription="slide"
      aria-label={\`Slide \${index + 1} of \${${itemsVar}.length}\`}
    >
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="aspect-video bg-muted" />
        <div className="p-4">
          <h3 className="font-semibold">{${itemName.toLowerCase()}.title}</h3>
        </div>
      </div>
    </div>
  ))}
</div>`;
  }

  return `<div className="carousel" role="region" aria-label="Carousel" aria-roledescription="carousel">
  {${itemsVar}.map((${itemName.toLowerCase()}, index) => (
    <div
      key={${itemName.toLowerCase()}.id ?? index}
      className="carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label={\`Slide \${index + 1} of \${${itemsVar}.length}\`}
    >
      <div className="carousel-card">
        <div className="carousel-image" />
        <div className="carousel-content">
          <h3>{${itemName.toLowerCase()}.title}</h3>
        </div>
      </div>
    </div>
  ))}
</div>`;
}

/**
 * Generate table JSX
 */
function generateTableJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  if (options.useTailwind) {
    return `<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b bg-muted/50">
        <th className="px-4 py-3 text-left text-sm font-medium">Column 1</th>
        <th className="px-4 py-3 text-left text-sm font-medium">Column 2</th>
        <th className="px-4 py-3 text-left text-sm font-medium">Column 3</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={row.id ?? index} className="border-b hover:bg-muted/50 transition-colors">
          <td className="px-4 py-3 text-sm">{row.cell1}</td>
          <td className="px-4 py-3 text-sm">{row.cell2}</td>
          <td className="px-4 py-3 text-sm">{row.cell3}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>`;
  }

  return `<div className="table-container">
  <table className="data-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Column 3</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={row.id ?? index}>
          <td>{row.cell1}</td>
          <td>{row.cell2}</td>
          <td>{row.cell3}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>`;
}

/**
 * Generate generic list JSX
 */
function generateGenericListJSX(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { structure, suggestedElement } = result;
  const containerClasses = suggestedElement.containerClasses.join(" ");

  if (options.useTailwind) {
    return `<div className="${containerClasses || "flex flex-col gap-4"}">
  {items.map((item, index) => (
    <div key={item.id ?? index} className="p-4 border rounded-lg">
      {item.content}
    </div>
  ))}
</div>`;
  }

  return `<div className="list-container">
  {items.map((item, index) => (
    <div key={item.id ?? index} className="list-item">
      {item.content}
    </div>
  ))}
</div>`;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS styles
 */
function generateCSS(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { patternType, structure } = result;

  let css = `/* Generated CSS for ${patternType} pattern */\n\n`;

  switch (patternType) {
    case "card-grid":
      css += generateCardGridCSS(structure, options);
      break;
    case "vertical-list":
      css += generateVerticalListCSS(structure, options);
      break;
    case "horizontal-list":
      css += generateHorizontalListCSS(structure, options);
      break;
    case "navigation-menu":
      css += generateNavigationCSS(structure, options);
      break;
    case "tabs":
      css += generateTabsCSS(structure, options);
      break;
    case "carousel":
      css += generateCarouselCSS(structure, options);
      break;
    case "table":
      css += generateTableCSS(options);
      break;
    default:
      css += generateGenericListCSS(structure, options);
  }

  return css;
}

/**
 * Generate card grid CSS
 */
function generateCardGridCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  const columnTemplate =
    structure.columns > 1
      ? `repeat(${structure.columns}, 1fr)`
      : "repeat(auto-fill, minmax(280px, 1fr))";

  return `.card-grid {
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
  background: var(--muted, #f3f4f6);
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.card-title {
  font-weight: 600;
  font-size: 1rem;
}

.card-description {
  font-size: 0.875rem;
  color: var(--muted-foreground, #6b7280);
  margin-top: 0.25rem;
}

${options.responsive ? `
/* Responsive breakpoints */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}` : ""}
`;
}

/**
 * Generate vertical list CSS
 */
function generateVerticalListCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.list {
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

.list-item-avatar {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 9999px;
  background: var(--muted, #e5e7eb);
  flex-shrink: 0;
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.list-item-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground, #6b7280);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}
`;
}

/**
 * Generate horizontal list CSS
 */
function generateHorizontalListCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.horizontal-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${structure.horizontalGap}px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.horizontal-list-item {
  flex-shrink: 0;
}
`;
}

/**
 * Generate navigation CSS
 */
function generateNavigationCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.navigation {
  display: flex;
  align-items: center;
  gap: ${structure.horizontalGap || 16}px;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground, #6b7280);
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--foreground, #111827);
}

.nav-link[aria-current="page"] {
  color: var(--primary, #2563eb);
}
`;
}

/**
 * Generate tabs CSS
 */
function generateTabsCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.tabs {
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

.tab-active {
  color: var(--foreground, #111827);
  border-bottom-color: var(--primary, #2563eb);
}
`;
}

/**
 * Generate carousel CSS
 */
function generateCarouselCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: ${structure.horizontalGap || 16}px;
  padding: 0 1rem;
  margin: 0 -1rem;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.carousel-item {
  flex-shrink: 0;
  scroll-snap-align: center;
  width: ${structure.itemWidth}px;
}

.carousel-card {
  border-radius: 0.5rem;
  border: 1px solid var(--border, #e5e7eb);
  background: var(--card, #ffffff);
  overflow: hidden;
}

.carousel-image {
  aspect-ratio: 16 / 9;
  background: var(--muted, #f3f4f6);
}

.carousel-content {
  padding: 1rem;
}
`;
}

/**
 * Generate table CSS
 */
function generateTableCSS(options: CodeGenerationOptions): string {
  return `.table-container {
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

.data-table tr {
  border-bottom: 1px solid var(--border, #e5e7eb);
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background-color: var(--muted, #f3f4f6);
}
`;
}

/**
 * Generate generic list CSS
 */
function generateGenericListCSS(
  structure: ListStructure,
  options: CodeGenerationOptions
): string {
  return `.list-container {
  display: flex;
  flex-direction: column;
  gap: ${structure.verticalGap || 16}px;
}

.list-item {
  padding: 1rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 0.5rem;
}
`;
}

// ============================================================================
// Tailwind Summary Generation
// ============================================================================

/**
 * Generate Tailwind classes summary
 */
function generateTailwindSummary(result: ListPatternResult): string {
  const { suggestedElement, patternType, structure } = result;

  const containerClasses = suggestedElement.containerClasses.join(" ");
  const itemClasses = suggestedElement.itemClasses.join(" ");

  let summary = `/* Tailwind CSS Classes for ${patternType} */\n\n`;

  summary += `Container:\n  ${containerClasses || "(no specific classes)"}\n\n`;
  summary += `Item:\n  ${itemClasses || "(no specific classes)"}\n\n`;

  // Add responsive classes suggestion
  if (patternType === "card-grid" && structure.columns > 2) {
    summary += `Responsive Suggestion:\n`;
    summary += `  grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(structure.columns, 4)} xl:grid-cols-${structure.columns}\n`;
  }

  return summary;
}

// ============================================================================
// TypeScript Type Generation
// ============================================================================

/**
 * Generate TypeScript type definitions
 */
function generateTypeDefinition(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated (useTypeScript: false)";
  }

  const { semanticType, listItems, patternType } = result;
  const typeName = getTypeNameFromSemantic(semanticType);

  let typedef = `/** Auto-generated type for ${patternType} items */\n`;

  // Detect common content types across items
  const allContentTypes = new Set<ItemContentType>();
  for (const item of listItems) {
    for (const type of item.contentTypes) {
      allContentTypes.add(type);
    }
  }

  typedef += `interface ${typeName} {\n`;
  typedef += `  id: string | number;\n`;

  // Add fields based on content types
  if (allContentTypes.has("image")) {
    typedef += `  imageUrl?: string;\n`;
  }
  if (allContentTypes.has("text")) {
    typedef += `  title: string;\n`;
    typedef += `  description?: string;\n`;
  } else {
    typedef += `  title: string;\n`;
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

  typedef += `}\n`;

  // Add array type
  typedef += `\ntype ${typeName}List = ${typeName}[];\n`;

  return typedef;
}

/**
 * Get type name from semantic type
 */
function getTypeNameFromSemantic(semanticType: ListSemanticType): string {
  const typeNames: Record<ListSemanticType, string> = {
    "product-catalog": "Product",
    "user-list": "User",
    "article-feed": "Article",
    "media-gallery": "MediaItem",
    "settings-list": "Setting",
    navigation: "NavItem",
    breadcrumb: "BreadcrumbItem",
    tabs: "Tab",
    menu: "MenuItem",
    "data-table": "TableRow",
    "generic-list": "ListItem",
    unknown: "Item",
  };

  return typeNames[semanticType] || "Item";
}

// ============================================================================
// Component Template Generation
// ============================================================================

/**
 * Generate a complete React component template
 */
function generateComponentTemplate(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { patternType, semanticType, structure } = result;
  const typeName = getTypeNameFromSemantic(semanticType);
  const componentName = `${options.componentPrefix || ""}${typeName}List`;

  const typeDefinition = generateTypeDefinition(result, options);
  const jsx = generateJSX(result, options);

  let template = "";

  if (options.useTypeScript) {
    template += `"use client";\n\n`;
    template += `import React from "react";\n\n`;
    template += typeDefinition;
    template += `\ninterface ${componentName}Props {\n`;
    template += `  items: ${typeName}[];\n`;
    template += `  className?: string;\n`;
    template += `}\n\n`;
    template += `export function ${componentName}({ items, className }: ${componentName}Props) {\n`;
  } else {
    template += `"use client";\n\n`;
    template += `import React from "react";\n\n`;
    template += `export function ${componentName}({ items, className }) {\n`;
  }

  // Rename items variable to match the expected name in generated JSX
  const itemsVar = `${typeName.toLowerCase()}s`;
  template += `  const ${itemsVar} = items;\n\n`;

  template += `  return (\n`;
  template += indentCode(jsx, 4);
  template += `\n  );\n`;
  template += `}\n`;

  // Add sample data if requested
  if (options.includeSampleData) {
    template += generateSampleData(result, options);
  }

  return template;
}

/**
 * Generate sample data
 */
function generateSampleData(
  result: ListPatternResult,
  options: CodeGenerationOptions
): string {
  const { semanticType, listItems } = result;
  const typeName = getTypeNameFromSemantic(semanticType);
  const count = Math.min(listItems.length, 4);

  let sampleData = `\n// Sample data\n`;

  if (options.useTypeScript) {
    sampleData += `export const sample${typeName}s: ${typeName}[] = [\n`;
  } else {
    sampleData += `export const sample${typeName}s = [\n`;
  }

  for (let i = 0; i < count; i++) {
    sampleData += `  {\n`;
    sampleData += `    id: ${i + 1},\n`;
    sampleData += `    title: "${typeName} ${i + 1}",\n`;
    sampleData += `    description: "Description for ${typeName.toLowerCase()} ${i + 1}",\n`;
    sampleData += `  },\n`;
  }

  sampleData += `];\n`;

  return sampleData;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get item type name from semantic type
 */
function getItemTypeName(semanticType: ListSemanticType): string {
  const names: Record<ListSemanticType, string> = {
    "product-catalog": "product",
    "user-list": "user",
    "article-feed": "article",
    "media-gallery": "media",
    "settings-list": "setting",
    navigation: "navItem",
    breadcrumb: "crumb",
    tabs: "tab",
    menu: "menuItem",
    "data-table": "row",
    "generic-list": "item",
    unknown: "item",
  };

  return names[semanticType] || "item";
}

/**
 * Indent code by a number of spaces
 */
function indentCode(code: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => (line.trim() ? indent + line : line))
    .join("\n");
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_OPTIONS as GENERATION_DEFAULTS };
