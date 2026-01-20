/**
 * Vue Slot Generator
 *
 * Generates Vue components with slot support from Figma designs.
 * Features:
 * - Default and named slots
 * - Scoped slots with props
 * - Slot fallback content
 * - TypeScript support with defineSlots
 * - Vue 3 Composition API
 */

import type { FigmaNode } from "./figma-api";
import type { DetectedSlot, SlotPatternResult, VueSlotCode } from "./slot-pattern-detector";
import { detectSlotPatterns } from "./slot-pattern-detector";

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Configuration for Vue slot component generation
 */
export interface VueSlotGenerationOptions {
  /** Component name */
  componentName: string;
  /** Use TypeScript */
  useTypeScript: boolean;
  /** Use Tailwind CSS */
  useTailwind: boolean;
  /** Base HTML element */
  baseElement: string;
  /** Additional component classes */
  componentClasses: string;
  /** Use scoped slots */
  useScopedSlots: boolean;
  /** Include slot props in type definitions */
  includeSlotProps: boolean;
  /** Generate slot documentation */
  generateSlotDocs: boolean;
  /** Additional props */
  additionalProps: VuePropDefinition[];
}

/**
 * Vue prop definition
 */
export interface VuePropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

/**
 * Generated Vue slot component
 */
export interface GeneratedVueSlotComponent {
  /** Complete .vue SFC content */
  component: string;
  /** Script setup content */
  scriptSetup: string;
  /** Template content */
  template: string;
  /** Style content */
  style: string;
  /** TypeScript types */
  types: string;
  /** Detected slots */
  slots: DetectedSlot[];
  /** Usage example */
  usageExample: string;
}

const DEFAULT_OPTIONS: VueSlotGenerationOptions = {
  componentName: "Component",
  useTypeScript: true,
  useTailwind: true,
  baseElement: "div",
  componentClasses: "",
  useScopedSlots: false,
  includeSlotProps: true,
  generateSlotDocs: true,
  additionalProps: [],
};

// ============================================================================
// Main Generation Functions
// ============================================================================

/**
 * Generate a Vue component with slots from a Figma node
 */
export function generateVueSlotComponent(
  node: FigmaNode,
  options: Partial<VueSlotGenerationOptions> = {}
): GeneratedVueSlotComponent {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Detect slots from the Figma node
  const slotResult = detectSlotPatterns(node, {
    componentName: opts.componentName,
    useTypeScript: opts.useTypeScript,
    framework: "vue",
  });

  // Generate component parts
  const scriptSetup = generateScriptSetup(slotResult, opts);
  const template = generateTemplate(slotResult, opts);
  const style = opts.useTailwind ? "" : generateStyle(slotResult, opts);
  const types = generateTypes(slotResult, opts);
  const usageExample = generateUsageExample(slotResult, opts);

  // Combine into full SFC
  const component = generateSFC(scriptSetup, template, style, opts);

  return {
    component,
    scriptSetup,
    template,
    style,
    types,
    slots: slotResult.slots,
    usageExample,
  };
}

/**
 * Generate just Vue slot code from a Figma node
 */
export function generateVueSlots(
  node: FigmaNode,
  options: Partial<VueSlotGenerationOptions> = {}
): VueSlotCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const slotResult = detectSlotPatterns(node, {
    componentName: opts.componentName,
    useTypeScript: opts.useTypeScript,
    framework: "vue",
  });

  return slotResult.frameworkCode.vue;
}

// ============================================================================
// Script Generation
// ============================================================================

/**
 * Generate the script setup section
 */
function generateScriptSetup(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  const lines: string[] = [];

  // Props definition
  if (options.additionalProps.length > 0) {
    lines.push(generatePropsDefinition(options));
  }

  // Class prop
  lines.push(`const props = withDefaults(defineProps<{`);
  lines.push(`  /** Additional CSS classes */`);
  lines.push(`  class?: string;`);

  for (const prop of options.additionalProps) {
    const description = prop.description ? `  /** ${prop.description} */\n` : "";
    const optional = !prop.required || prop.default !== undefined ? "?" : "";
    lines.push(`${description}  ${prop.name}${optional}: ${prop.type};`);
  }

  lines.push(`}>(), {`);
  lines.push(`  class: '',`);

  for (const prop of options.additionalProps) {
    if (prop.default !== undefined) {
      lines.push(`  ${prop.name}: ${prop.default},`);
    }
  }

  lines.push(`});`);
  lines.push("");

  // Slots definition with TypeScript
  if (options.useTypeScript && slotResult.hasSlots) {
    lines.push(generateSlotsDefinition(slotResult, options));
  }

  return lines.join("\n");
}

/**
 * Generate props definition
 */
function generatePropsDefinition(options: VueSlotGenerationOptions): string {
  const propsLines: string[] = [];

  for (const prop of options.additionalProps) {
    propsLines.push(`  ${prop.name}: {`);
    propsLines.push(`    type: ${mapTypeToVuePropType(prop.type)},`);
    propsLines.push(`    required: ${prop.required},`);
    if (prop.default !== undefined) {
      propsLines.push(`    default: ${prop.default},`);
    }
    propsLines.push(`  },`);
  }

  return "";  // Using defineProps with TypeScript instead
}

/**
 * Generate slots definition with TypeScript
 */
function generateSlotsDefinition(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  const lines: string[] = [];

  lines.push(`defineSlots<{`);

  for (const slot of slotResult.slots) {
    const slotName = slot.isDefault ? "default" : slot.name;
    lines.push(`  /** ${slot.description} */`);

    if (options.useScopedSlots && options.includeSlotProps) {
      // Scoped slot with props
      const slotProps = getSlotPropsForType(slot);
      lines.push(`  ${slotName}?(props: { ${slotProps} }): any;`);
    } else {
      lines.push(`  ${slotName}?(props: {}): any;`);
    }
  }

  lines.push(`}>();`);

  return lines.join("\n");
}

/**
 * Get slot props based on slot type
 */
function getSlotPropsForType(slot: DetectedSlot): string {
  switch (slot.type) {
    case "header":
    case "title":
      return "title?: string";
    case "content":
    case "default":
      return "isActive?: boolean";
    case "actions":
      return "disabled?: boolean";
    case "icon":
      return "size?: number";
    default:
      return "";
  }
}

/**
 * Map TypeScript type to Vue prop type
 */
function mapTypeToVuePropType(type: string): string {
  switch (type.toLowerCase()) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "object":
      return "Object";
    case "array":
      return "Array";
    case "function":
      return "Function";
    default:
      return "Object";
  }
}

// ============================================================================
// Template Generation
// ============================================================================

/**
 * Generate the template section
 */
function generateTemplate(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  const { slots } = slotResult;
  const { baseElement, componentClasses } = options;

  const classBinding = componentClasses
    ? `:class="[\`${componentClasses}\`, props.class]"`
    : `:class="props.class"`;

  // Organize slots by position
  const defaultSlot = slots.find(s => s.isDefault);
  const namedSlots = slots.filter(s => !s.isDefault);

  const positionOrder = ["start", "before", "center", "after", "end", "overlay"];
  const sortedNamedSlots = [...namedSlots].sort(
    (a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  );

  const startSlots = sortedNamedSlots.filter(s => s.position === "start" || s.position === "before");
  const endSlots = sortedNamedSlots.filter(s => s.position === "end" || s.position === "after");
  const overlaySlots = sortedNamedSlots.filter(s => s.position === "overlay");

  // Build template
  let template = `<template>\n`;
  template += `  <${baseElement} ${classBinding}>\n`;

  // Start slots
  for (const slot of startSlots) {
    template += generateSlotElement(slot, options, 4);
  }

  // Default slot
  if (defaultSlot) {
    template += generateSlotElement(defaultSlot, options, 4);
  } else if (slots.length === 0) {
    template += `    <!-- Default content slot -->\n`;
    template += `    <slot />\n`;
  }

  // End slots
  for (const slot of endSlots) {
    template += generateSlotElement(slot, options, 4);
  }

  // Overlay slots
  for (const slot of overlaySlots) {
    template += `    <!-- ${slot.description} -->\n`;
    template += `    <div v-if="$slots.${slot.name}" class="${options.useTailwind ? "absolute inset-0" : "overlay"}">\n`;
    template += generateSlotElement(slot, options, 6);
    template += `    </div>\n`;
  }

  template += `  </${baseElement}>\n`;
  template += `</template>`;

  return template;
}

/**
 * Generate a slot element
 */
function generateSlotElement(
  slot: DetectedSlot,
  options: VueSlotGenerationOptions,
  indent: number
): string {
  const spaces = " ".repeat(indent);
  let element = `${spaces}<!-- ${slot.description} -->\n`;

  const slotName = slot.isDefault ? "" : ` name="${slot.name}"`;

  if (options.useScopedSlots && options.includeSlotProps) {
    const slotProps = getSlotPropsForType(slot);
    if (slotProps) {
      element += `${spaces}<slot${slotName} :${slotProps.split(":")[0].trim()}="${slotProps.split(":")[0].trim()}"`;
    } else {
      element += `${spaces}<slot${slotName}`;
    }
  } else {
    element += `${spaces}<slot${slotName}`;
  }

  if (slot.fallbackContent) {
    element += `>${slot.fallbackContent}</slot>\n`;
  } else {
    element += ` />\n`;
  }

  return element;
}

// ============================================================================
// Style Generation
// ============================================================================

/**
 * Generate the style section
 */
function generateStyle(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  if (options.useTailwind) {
    return "";
  }

  const hasOverlay = slotResult.slots.some(s => s.position === "overlay");

  let style = `<style scoped>\n`;

  if (hasOverlay) {
    style += `.overlay {\n`;
    style += `  position: absolute;\n`;
    style += `  top: 0;\n`;
    style += `  left: 0;\n`;
    style += `  right: 0;\n`;
    style += `  bottom: 0;\n`;
    style += `}\n`;
  }

  style += `</style>`;

  return style;
}

// ============================================================================
// Type Generation
// ============================================================================

/**
 * Generate TypeScript types
 */
function generateTypes(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated (useTypeScript: false)";
  }

  let types = `/**\n * Props for ${options.componentName} component\n */\n`;
  types += `export interface ${options.componentName}Props {\n`;
  types += `  /** Additional CSS classes */\n`;
  types += `  class?: string;\n`;

  for (const prop of options.additionalProps) {
    const description = prop.description ? `  /** ${prop.description} */\n` : "";
    const optional = !prop.required ? "?" : "";
    types += `${description}`;
    types += `  ${prop.name}${optional}: ${prop.type};\n`;
  }

  types += `}\n\n`;

  // Slot types
  types += `/**\n * Slots for ${options.componentName} component\n */\n`;
  types += `export interface ${options.componentName}Slots {\n`;

  for (const slot of slotResult.slots) {
    const slotName = slot.isDefault ? "default" : slot.name;
    types += `  /** ${slot.description} */\n`;

    if (options.useScopedSlots && options.includeSlotProps) {
      const slotProps = getSlotPropsForType(slot);
      types += `  ${slotName}?: (props: { ${slotProps} }) => VNode[];\n`;
    } else {
      types += `  ${slotName}?: () => VNode[];\n`;
    }
  }

  types += `}\n`;

  return types;
}

// ============================================================================
// Usage Example Generation
// ============================================================================

/**
 * Generate usage example
 */
function generateUsageExample(
  slotResult: SlotPatternResult,
  options: VueSlotGenerationOptions
): string {
  const { slots } = slotResult;
  const { componentName } = options;

  const defaultSlot = slots.find(s => s.isDefault);
  const namedSlots = slots.filter(s => !s.isDefault);

  let example = `<${componentName}>\n`;

  // Default slot content
  if (defaultSlot) {
    example += `  <!-- Default slot content -->\n`;
    example += `  <p>Your content here</p>\n`;
  }

  // Named slots
  for (const slot of namedSlots) {
    example += `  <!-- ${slot.description} -->\n`;
    example += `  <template #${slot.name}>\n`;
    example += `    <div>Your ${slot.name} content</div>\n`;
    example += `  </template>\n`;
  }

  example += `</${componentName}>`;

  return example;
}

// ============================================================================
// SFC Generation
// ============================================================================

/**
 * Generate the complete SFC
 */
function generateSFC(
  scriptSetup: string,
  template: string,
  style: string,
  options: VueSlotGenerationOptions
): string {
  const scriptLang = options.useTypeScript ? ' lang="ts"' : "";

  let sfc = `<script setup${scriptLang}>\n`;
  sfc += scriptSetup;
  sfc += `\n</script>\n\n`;
  sfc += template;

  if (style) {
    sfc += `\n\n${style}`;
  }

  return sfc;
}

// ============================================================================
// Additional Utilities
// ============================================================================

/**
 * Generate a card component with header, content, and footer slots
 */
export function generateVueCardComponent(
  options: Partial<VueSlotGenerationOptions> = {}
): GeneratedVueSlotComponent {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    componentName: options.componentName || "Card",
  };

  // Create a mock node with card-like structure
  const mockNode: FigmaNode = {
    id: "card-mock",
    name: "Card",
    type: "FRAME",
    children: [
      { id: "header", name: "Header Slot", type: "FRAME" },
      { id: "content", name: "Content", type: "FRAME" },
      { id: "footer", name: "Footer Slot", type: "FRAME" },
    ],
  };

  return generateVueSlotComponent(mockNode, opts);
}

/**
 * Generate a dialog component with trigger and content slots
 */
export function generateVueDialogComponent(
  options: Partial<VueSlotGenerationOptions> = {}
): GeneratedVueSlotComponent {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    componentName: options.componentName || "Dialog",
  };

  // Create a mock node with dialog-like structure
  const mockNode: FigmaNode = {
    id: "dialog-mock",
    name: "Dialog",
    type: "FRAME",
    children: [
      { id: "trigger", name: "Trigger Slot", type: "FRAME" },
      { id: "overlay", name: "Overlay Content", type: "FRAME" },
    ],
  };

  return generateVueSlotComponent(mockNode, opts);
}

/**
 * Generate a list item component with leading, content, and trailing slots
 */
export function generateVueListItemComponent(
  options: Partial<VueSlotGenerationOptions> = {}
): GeneratedVueSlotComponent {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    componentName: options.componentName || "ListItem",
  };

  // Create a mock node with list item structure
  const mockNode: FigmaNode = {
    id: "list-item-mock",
    name: "ListItem",
    type: "FRAME",
    children: [
      { id: "leading", name: "Leading", type: "FRAME" },
      { id: "content", name: "Content", type: "FRAME" },
      { id: "trailing", name: "Trailing", type: "FRAME" },
    ],
  };

  return generateVueSlotComponent(mockNode, opts);
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_OPTIONS as VUE_SLOT_GENERATION_DEFAULTS };
