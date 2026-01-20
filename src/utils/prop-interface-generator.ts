/**
 * Component Prop Interface Generator
 *
 * Generates TypeScript prop interfaces from Figma design variations.
 * Features:
 * - Extracts variant properties from component sets
 * - Identifies required vs optional props
 * - Infers prop types from usage patterns
 * - Supports default values and documentation comments
 */

import type { FigmaNode } from "./figma-api";
import type {
  InteractiveElementAnalysis,
  InteractiveElementType,
  InteractiveState,
  VariantInfo,
} from "./figma-interactive-elements";
import type { ResolvedComponent, ResolvedInstance } from "./figma-component-resolver";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * TypeScript prop types that can be inferred
 */
export type InferredPropType =
  | "string"
  | "number"
  | "boolean"
  | "string-literal"
  | "number-literal"
  | "ReactNode"
  | "(() => void)"
  | "((value: T) => void)"
  | "React.MouseEventHandler"
  | "React.ChangeEventHandler"
  | "React.FormEventHandler"
  | "React.KeyboardEventHandler"
  | "React.FocusEventHandler"
  | "CSSProperties"
  | "className"
  | "children"
  | "ref"
  | "unknown";

/**
 * Source of how a prop was inferred
 */
export type PropInferenceSource =
  | "variant-property"
  | "component-property"
  | "visual-analysis"
  | "element-type"
  | "naming-convention"
  | "state-analysis"
  | "content-slot"
  | "default";

/**
 * A single prop definition
 */
export interface PropDefinition {
  /** Prop name (camelCase) */
  name: string;
  /** Inferred TypeScript type */
  type: InferredPropType;
  /** Full TypeScript type string (may include unions, generics, etc.) */
  typeString: string;
  /** Whether the prop is required */
  required: boolean;
  /** Default value if optional */
  defaultValue?: string;
  /** JSDoc description */
  description: string;
  /** Source of inference */
  inferenceSource: PropInferenceSource;
  /** Confidence score (0-1) */
  confidence: number;
  /** Possible literal values for enum-like props */
  possibleValues?: string[];
  /** Related variant property name in Figma */
  variantPropertyName?: string;
  /** Additional JSDoc tags */
  jsdocTags?: JsDocTag[];
}

/**
 * JSDoc tag for additional documentation
 */
export interface JsDocTag {
  tag: string;
  value: string;
}

/**
 * Generated interface result
 */
export interface GeneratedInterface {
  /** Interface name (PascalCase) */
  name: string;
  /** Full interface code */
  code: string;
  /** Individual prop definitions */
  props: PropDefinition[];
  /** Base types the interface extends */
  extends: string[];
  /** Whether this is a component props interface */
  isComponentProps: boolean;
  /** Associated CVA variant props type if applicable */
  cvaVariantProps?: string;
  /** Import statements needed */
  imports: string[];
  /** Statistics about the generation */
  stats: InterfaceGenerationStats;
}

/**
 * Statistics about the interface generation
 */
export interface InterfaceGenerationStats {
  totalProps: number;
  requiredProps: number;
  optionalProps: number;
  variantProps: number;
  eventHandlerProps: number;
  averageConfidence: number;
}

/**
 * Configuration for interface generation
 */
export interface InterfaceGenerationOptions {
  /** Component name for naming the interface */
  componentName: string;
  /** Whether to extend React component props */
  extendReactProps: boolean;
  /** Base HTML element for extending native props */
  baseElement?: keyof JSX.IntrinsicElements;
  /** Whether to generate CVA (class-variance-authority) variant types */
  generateCVATypes: boolean;
  /** Whether to include JSDoc comments */
  includeJSDoc: boolean;
  /** Whether to mark all variant props as optional with defaults */
  variantPropsOptional: boolean;
  /** Prefix for the interface name */
  interfacePrefix?: string;
  /** Suffix for the interface name */
  interfaceSuffix?: string;
  /** Whether to export the interface */
  exportInterface: boolean;
  /** Whether to include ref prop for forwardRef components */
  includeRef: boolean;
  /** Custom prop overrides */
  customProps?: PropDefinition[];
}

const DEFAULT_OPTIONS: InterfaceGenerationOptions = {
  componentName: "Component",
  extendReactProps: true,
  baseElement: "div",
  generateCVATypes: true,
  includeJSDoc: true,
  variantPropsOptional: true,
  exportInterface: true,
  includeRef: false,
};

/**
 * Input for generating props from a component set
 */
export interface ComponentSetInput {
  /** Component set name */
  name: string;
  /** Variant properties from the component set */
  variantProperties: Record<string, string[]>;
  /** All variants in the set */
  variants: VariantInfo[];
  /** Description from Figma */
  description?: string;
}

/**
 * Input for generating props from an interactive element
 */
export interface InteractiveElementInput {
  /** The interactive element analysis */
  element: InteractiveElementAnalysis;
  /** Resolved component information if available */
  resolvedComponent?: ResolvedComponent;
  /** Instance information if available */
  resolvedInstance?: ResolvedInstance;
}

// ============================================================================
// Variant Property Analysis
// ============================================================================

/**
 * Analyze variant properties to infer prop definitions
 */
export function analyzeVariantProperties(
  variantProperties: Record<string, string[]>,
  variants: VariantInfo[]
): PropDefinition[] {
  const props: PropDefinition[] = [];

  for (const [propName, values] of Object.entries(variantProperties)) {
    const prop = inferPropFromVariant(propName, values, variants);
    if (prop) {
      props.push(prop);
    }
  }

  return props;
}

/**
 * Infer a prop definition from a variant property
 */
function inferPropFromVariant(
  propName: string,
  values: string[],
  variants: VariantInfo[]
): PropDefinition {
  const normalizedName = normalizeVariantPropertyName(propName);
  const { type, typeString, possibleValues } = inferTypeFromValues(propName, values);
  const defaultValue = findDefaultValue(propName, values, variants);
  const description = generateVariantDescription(propName, values);

  return {
    name: normalizedName,
    type,
    typeString,
    required: false, // Variant props are typically optional with defaults
    defaultValue,
    description,
    inferenceSource: "variant-property",
    confidence: 0.95,
    possibleValues,
    variantPropertyName: propName,
    jsdocTags: [
      { tag: "default", value: defaultValue || `"${values[0]}"` },
    ],
  };
}

/**
 * Normalize a Figma variant property name to a valid prop name
 */
function normalizeVariantPropertyName(name: string): string {
  // Handle common Figma naming patterns
  // e.g., "Size" -> "size", "Has Icon" -> "hasIcon", "Is Disabled" -> "isDisabled"

  return name
    .trim()
    .split(/[\s-_]+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

/**
 * Infer TypeScript type from variant values
 */
function inferTypeFromValues(
  propName: string,
  values: string[]
): { type: InferredPropType; typeString: string; possibleValues: string[] } {
  const lowerName = propName.toLowerCase();
  const normalizedValues = values.map((v) => v.toLowerCase().trim());

  // Check for boolean patterns
  if (isBooleanPattern(normalizedValues)) {
    return {
      type: "boolean",
      typeString: "boolean",
      possibleValues: ["true", "false"],
    };
  }

  // Check for number patterns
  if (isNumberPattern(normalizedValues)) {
    return {
      type: "number",
      typeString: "number",
      possibleValues: values,
    };
  }

  // String literal union for enum-like values
  if (values.length > 1 && values.length <= 10) {
    const literalType = values.map((v) => `"${v}"`).join(" | ");
    return {
      type: "string-literal",
      typeString: literalType,
      possibleValues: values,
    };
  }

  // Single value - still create a literal type but with string fallback
  if (values.length === 1) {
    return {
      type: "string-literal",
      typeString: `"${values[0]}"`,
      possibleValues: values,
    };
  }

  // Fallback to string
  return {
    type: "string",
    typeString: "string",
    possibleValues: values,
  };
}

/**
 * Check if values represent a boolean pattern
 */
function isBooleanPattern(values: string[]): boolean {
  const booleanPairs = [
    ["true", "false"],
    ["yes", "no"],
    ["on", "off"],
    ["enabled", "disabled"],
    ["show", "hide"],
    ["visible", "hidden"],
    ["active", "inactive"],
    ["checked", "unchecked"],
    ["selected", "unselected"],
  ];

  if (values.length !== 2) return false;

  const sorted = [...values].sort();
  return booleanPairs.some((pair) => {
    const sortedPair = [...pair].sort();
    return sorted[0] === sortedPair[0] && sorted[1] === sortedPair[1];
  });
}

/**
 * Check if values represent number patterns
 */
function isNumberPattern(values: string[]): boolean {
  return values.every((v) => {
    const num = parseFloat(v);
    return !isNaN(num) && isFinite(num);
  });
}

/**
 * Find the default value for a variant property
 */
function findDefaultValue(
  propName: string,
  values: string[],
  variants: VariantInfo[]
): string | undefined {
  const lowerName = propName.toLowerCase();

  // Look for "default" state variant
  const defaultVariant = variants.find(
    (v) => v.state === "default" || v.name.toLowerCase().includes("default")
  );

  if (defaultVariant && defaultVariant.properties[propName]) {
    return `"${defaultVariant.properties[propName]}"`;
  }

  // Common defaults based on property name
  if (lowerName.includes("size")) {
    if (values.includes("md") || values.includes("medium")) {
      return values.includes("md") ? '"md"' : '"medium"';
    }
    if (values.includes("default")) return '"default"';
  }

  if (lowerName.includes("variant") || lowerName.includes("type") || lowerName.includes("style")) {
    if (values.includes("default")) return '"default"';
    if (values.includes("primary")) return '"primary"';
  }

  // Use first value as default
  return `"${values[0]}"`;
}

/**
 * Generate a description for a variant property
 */
function generateVariantDescription(propName: string, values: string[]): string {
  const normalizedName = normalizeVariantPropertyName(propName);

  // Generate contextual descriptions based on property name
  const lowerName = propName.toLowerCase();

  if (lowerName.includes("size")) {
    return `The size variant of the component. Available sizes: ${values.join(", ")}.`;
  }

  if (lowerName.includes("variant") || lowerName.includes("style") || lowerName.includes("type")) {
    return `The visual variant of the component. Options: ${values.join(", ")}.`;
  }

  if (lowerName.includes("state")) {
    return `The interactive state of the component. States: ${values.join(", ")}.`;
  }

  if (lowerName.includes("color") || lowerName.includes("theme")) {
    return `The color/theme variant. Options: ${values.join(", ")}.`;
  }

  if (lowerName.includes("icon")) {
    return `Whether to display an icon. Options: ${values.join(", ")}.`;
  }

  if (lowerName.includes("disabled")) {
    return `Whether the component is disabled.`;
  }

  if (lowerName.includes("loading")) {
    return `Whether the component is in a loading state.`;
  }

  // Generic description
  return `The ${normalizedName} variant of the component. Possible values: ${values.join(", ")}.`;
}

// ============================================================================
// Interactive Element Analysis
// ============================================================================

/**
 * Infer props from an interactive element analysis
 */
export function inferPropsFromInteractiveElement(
  input: InteractiveElementInput
): PropDefinition[] {
  const props: PropDefinition[] = [];
  const { element, resolvedComponent, resolvedInstance } = input;

  // Add element-type specific props
  const elementTypeProps = getPropsForElementType(element.elementType);
  props.push(...elementTypeProps);

  // Add state-based props
  const stateProps = getPropsFromStates(element.states.map((s) => s.state));
  props.push(...stateProps);

  // Add event handler props
  const eventProps = getEventHandlerProps(element.elementType);
  props.push(...eventProps);

  // Add component set variant props if available
  if (element.metadata.componentSet) {
    const variantProps = analyzeVariantProperties(
      element.metadata.componentSet.variantProperties,
      element.metadata.componentSet.allVariants
    );
    props.push(...variantProps);
  }

  // Add content slot props based on visual hints
  const contentProps = getContentSlotProps(element);
  props.push(...contentProps);

  return deduplicateProps(props);
}

/**
 * Get props based on element type
 */
function getPropsForElementType(elementType: InteractiveElementType): PropDefinition[] {
  const props: PropDefinition[] = [];

  switch (elementType) {
    case "button":
    case "icon-button":
    case "fab":
      props.push(
        createProp("children", "ReactNode", false, "The button content."),
        createProp("disabled", "boolean", false, "Whether the button is disabled.", "false"),
        createProp("type", "string-literal", false, "The button type.", '"button"', [
          "button",
          "submit",
          "reset",
        ])
      );
      break;

    case "text-input":
    case "search-input":
      props.push(
        createProp("value", "string", false, "The input value."),
        createProp("placeholder", "string", false, "Placeholder text when empty."),
        createProp("disabled", "boolean", false, "Whether the input is disabled.", "false"),
        createProp("readOnly", "boolean", false, "Whether the input is read-only.", "false"),
        createProp("required", "boolean", false, "Whether the input is required.", "false")
      );
      break;

    case "textarea":
      props.push(
        createProp("value", "string", false, "The textarea value."),
        createProp("placeholder", "string", false, "Placeholder text when empty."),
        createProp("rows", "number", false, "Number of visible text rows.", "4"),
        createProp("disabled", "boolean", false, "Whether the textarea is disabled.", "false")
      );
      break;

    case "checkbox":
      props.push(
        createProp("checked", "boolean", false, "Whether the checkbox is checked.", "false"),
        createProp("indeterminate", "boolean", false, "Whether in indeterminate state.", "false"),
        createProp("disabled", "boolean", false, "Whether the checkbox is disabled.", "false"),
        createProp("label", "string", false, "Label text for the checkbox.")
      );
      break;

    case "radio":
      props.push(
        createProp("checked", "boolean", false, "Whether the radio is selected.", "false"),
        createProp("value", "string", true, "The value of the radio option."),
        createProp("disabled", "boolean", false, "Whether the radio is disabled.", "false"),
        createProp("name", "string", true, "The name for grouping radio buttons."),
        createProp("label", "string", false, "Label text for the radio button.")
      );
      break;

    case "toggle":
    case "switch":
      props.push(
        createProp("checked", "boolean", false, "Whether the toggle is on.", "false"),
        createProp("disabled", "boolean", false, "Whether the toggle is disabled.", "false"),
        createProp("label", "string", false, "Label text for the toggle.")
      );
      break;

    case "select":
    case "dropdown":
      props.push(
        createProp("value", "string", false, "The selected value."),
        createProp("options", "unknown", true, "The available options."),
        createProp("placeholder", "string", false, "Placeholder text when no selection."),
        createProp("disabled", "boolean", false, "Whether the select is disabled.", "false"),
        createProp("multiple", "boolean", false, "Whether multiple selection is allowed.", "false")
      );
      break;

    case "slider":
    case "range":
      props.push(
        createProp("value", "number", false, "The current value.", "0"),
        createProp("min", "number", false, "Minimum value.", "0"),
        createProp("max", "number", false, "Maximum value.", "100"),
        createProp("step", "number", false, "Step increment.", "1"),
        createProp("disabled", "boolean", false, "Whether the slider is disabled.", "false")
      );
      break;

    case "tab":
      props.push(
        createProp("value", "string", true, "The tab value/identifier."),
        createProp("selected", "boolean", false, "Whether this tab is selected.", "false"),
        createProp("disabled", "boolean", false, "Whether the tab is disabled.", "false"),
        createProp("children", "ReactNode", false, "The tab label content.")
      );
      break;

    case "accordion":
    case "disclosure":
      props.push(
        createProp("expanded", "boolean", false, "Whether the section is expanded.", "false"),
        createProp("disabled", "boolean", false, "Whether it can be toggled.", "false"),
        createProp("title", "ReactNode", true, "The accordion header content."),
        createProp("children", "ReactNode", true, "The expandable content.")
      );
      break;

    case "dialog-trigger":
      props.push(
        createProp("children", "ReactNode", true, "The trigger button content."),
        createProp("disabled", "boolean", false, "Whether the trigger is disabled.", "false")
      );
      break;

    case "chip":
    case "tag":
      props.push(
        createProp("children", "ReactNode", true, "The chip/tag content."),
        createProp("selected", "boolean", false, "Whether the chip is selected.", "false"),
        createProp("onDelete", "(() => void)", false, "Callback when delete is clicked."),
        createProp("disabled", "boolean", false, "Whether the chip is disabled.", "false")
      );
      break;

    case "link":
    case "breadcrumb-link":
      props.push(
        createProp("href", "string", true, "The link destination URL."),
        createProp("children", "ReactNode", true, "The link content."),
        createProp("target", "string", false, "The link target (e.g., _blank).")
      );
      break;

    case "pagination-control":
      props.push(
        createProp("page", "number", true, "The current page number."),
        createProp("totalPages", "number", true, "Total number of pages."),
        createProp("disabled", "boolean", false, "Whether pagination is disabled.", "false")
      );
      break;

    case "rating":
      props.push(
        createProp("value", "number", false, "The current rating value.", "0"),
        createProp("max", "number", false, "Maximum rating value.", "5"),
        createProp("readOnly", "boolean", false, "Whether the rating is read-only.", "false"),
        createProp("disabled", "boolean", false, "Whether the rating is disabled.", "false")
      );
      break;

    case "file-upload":
      props.push(
        createProp("accept", "string", false, "Accepted file types."),
        createProp("multiple", "boolean", false, "Whether multiple files allowed.", "false"),
        createProp("disabled", "boolean", false, "Whether upload is disabled.", "false")
      );
      break;

    default:
      // Generic interactive element props
      props.push(
        createProp("children", "ReactNode", false, "The element content."),
        createProp("disabled", "boolean", false, "Whether the element is disabled.", "false")
      );
  }

  return props;
}

/**
 * Get props from detected interactive states
 */
function getPropsFromStates(states: InteractiveState[]): PropDefinition[] {
  const props: PropDefinition[] = [];

  if (states.includes("loading")) {
    props.push(
      createProp(
        "loading",
        "boolean",
        false,
        "Whether the component is in a loading state.",
        "false",
        undefined,
        "state-analysis"
      )
    );
  }

  if (states.includes("error")) {
    props.push(
      createProp(
        "error",
        "boolean",
        false,
        "Whether the component has an error.",
        "false",
        undefined,
        "state-analysis"
      ),
      createProp(
        "errorMessage",
        "string",
        false,
        "Error message to display.",
        undefined,
        undefined,
        "state-analysis"
      )
    );
  }

  if (states.includes("success")) {
    props.push(
      createProp(
        "success",
        "boolean",
        false,
        "Whether the component shows success state.",
        "false",
        undefined,
        "state-analysis"
      )
    );
  }

  if (states.includes("warning")) {
    props.push(
      createProp(
        "warning",
        "boolean",
        false,
        "Whether the component shows a warning.",
        "false",
        undefined,
        "state-analysis"
      )
    );
  }

  return props;
}

/**
 * Get event handler props based on element type
 */
function getEventHandlerProps(elementType: InteractiveElementType): PropDefinition[] {
  const props: PropDefinition[] = [];

  switch (elementType) {
    case "button":
    case "icon-button":
    case "fab":
    case "chip":
    case "tag":
    case "link":
    case "dialog-trigger":
      props.push(
        createProp(
          "onClick",
          "React.MouseEventHandler",
          false,
          "Click event handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "text-input":
    case "search-input":
    case "textarea":
      props.push(
        createProp(
          "onChange",
          "React.ChangeEventHandler",
          false,
          "Change event handler.",
          undefined,
          undefined,
          "element-type"
        ),
        createProp(
          "onBlur",
          "React.FocusEventHandler",
          false,
          "Blur event handler.",
          undefined,
          undefined,
          "element-type"
        ),
        createProp(
          "onFocus",
          "React.FocusEventHandler",
          false,
          "Focus event handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "checkbox":
    case "radio":
    case "toggle":
    case "switch":
      props.push(
        createProp(
          "onChange",
          "((checked: boolean) => void)",
          false,
          "Change event handler with new checked value.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "select":
    case "dropdown":
      props.push(
        createProp(
          "onChange",
          "((value: T) => void)",
          false,
          "Change event handler with selected value.",
          undefined,
          undefined,
          "element-type"
        ),
        createProp(
          "onOpenChange",
          "((open: boolean) => void)",
          false,
          "Open state change handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "slider":
    case "range":
      props.push(
        createProp(
          "onChange",
          "((value: number) => void)",
          false,
          "Value change handler.",
          undefined,
          undefined,
          "element-type"
        ),
        createProp(
          "onChangeEnd",
          "((value: number) => void)",
          false,
          "Handler called when interaction ends.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "tab":
      props.push(
        createProp(
          "onSelect",
          "(() => void)",
          false,
          "Called when tab is selected.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "accordion":
    case "disclosure":
      props.push(
        createProp(
          "onExpandedChange",
          "((expanded: boolean) => void)",
          false,
          "Expansion state change handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "pagination-control":
      props.push(
        createProp(
          "onPageChange",
          "((page: number) => void)",
          false,
          "Page change handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "rating":
      props.push(
        createProp(
          "onChange",
          "((rating: number) => void)",
          false,
          "Rating change handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;

    case "file-upload":
      props.push(
        createProp(
          "onFilesChange",
          "((files: File[]) => void)",
          false,
          "File selection change handler.",
          undefined,
          undefined,
          "element-type"
        )
      );
      break;
  }

  return props;
}

/**
 * Get content slot props based on visual hints
 */
function getContentSlotProps(element: InteractiveElementAnalysis): PropDefinition[] {
  const props: PropDefinition[] = [];
  const { visualHints } = element.metadata;

  if (visualHints.hasIcon) {
    props.push(
      createProp(
        "icon",
        "ReactNode",
        false,
        "Icon element to display.",
        undefined,
        undefined,
        "visual-analysis"
      ),
      createProp(
        "iconPosition",
        "string-literal",
        false,
        "Position of the icon relative to content.",
        '"start"',
        ["start", "end"],
        "visual-analysis"
      )
    );
  }

  if (visualHints.hasText && !isTextPrimaryElement(element.elementType)) {
    props.push(
      createProp(
        "label",
        "string",
        false,
        "Label text to display.",
        undefined,
        undefined,
        "visual-analysis"
      )
    );
  }

  if (visualHints.hasIndicator) {
    props.push(
      createProp(
        "showIndicator",
        "boolean",
        false,
        "Whether to show the state indicator.",
        "false",
        undefined,
        "visual-analysis"
      )
    );
  }

  return props;
}

/**
 * Check if element type primarily displays text content
 */
function isTextPrimaryElement(elementType: InteractiveElementType): boolean {
  return [
    "button",
    "link",
    "tab",
    "chip",
    "tag",
    "breadcrumb-link",
  ].includes(elementType);
}

/**
 * Helper to create a prop definition
 */
function createProp(
  name: string,
  type: InferredPropType,
  required: boolean,
  description: string,
  defaultValue?: string,
  possibleValues?: string[],
  inferenceSource: PropInferenceSource = "element-type"
): PropDefinition {
  const typeString = getTypeString(type, possibleValues);

  return {
    name,
    type,
    typeString,
    required,
    defaultValue,
    description,
    inferenceSource,
    confidence: 0.85,
    possibleValues,
    jsdocTags: defaultValue ? [{ tag: "default", value: defaultValue }] : undefined,
  };
}

/**
 * Get the TypeScript type string for a type
 */
function getTypeString(type: InferredPropType, possibleValues?: string[]): string {
  switch (type) {
    case "string-literal":
      if (possibleValues && possibleValues.length > 0) {
        return possibleValues.map((v) => `"${v}"`).join(" | ");
      }
      return "string";
    case "ReactNode":
      return "React.ReactNode";
    case "(() => void)":
    case "((value: T) => void)":
    case "React.MouseEventHandler":
    case "React.ChangeEventHandler":
    case "React.FormEventHandler":
    case "React.KeyboardEventHandler":
    case "React.FocusEventHandler":
      return type;
    case "CSSProperties":
      return "React.CSSProperties";
    case "className":
      return "string";
    case "children":
      return "React.ReactNode";
    case "ref":
      return "React.Ref<HTMLElement>";
    default:
      return type;
  }
}

/**
 * Deduplicate props by name, keeping highest confidence
 */
function deduplicateProps(props: PropDefinition[]): PropDefinition[] {
  const propMap = new Map<string, PropDefinition>();

  for (const prop of props) {
    const existing = propMap.get(prop.name);
    if (!existing || prop.confidence > existing.confidence) {
      propMap.set(prop.name, prop);
    }
  }

  return Array.from(propMap.values());
}

// ============================================================================
// Interface Code Generation
// ============================================================================

/**
 * Generate a TypeScript interface from component analysis
 */
export function generatePropInterface(
  componentSetInput: ComponentSetInput | null,
  interactiveInput: InteractiveElementInput | null,
  options: Partial<InterfaceGenerationOptions> = {}
): GeneratedInterface {
  const opts: InterfaceGenerationOptions = { ...DEFAULT_OPTIONS, ...options };
  const allProps: PropDefinition[] = [];
  const imports: string[] = [];

  // Collect props from component set
  if (componentSetInput) {
    const variantProps = analyzeVariantProperties(
      componentSetInput.variantProperties,
      componentSetInput.variants
    );
    allProps.push(...variantProps);
  }

  // Collect props from interactive element
  if (interactiveInput) {
    const elementProps = inferPropsFromInteractiveElement(interactiveInput);
    allProps.push(...elementProps);
  }

  // Add custom props
  if (opts.customProps) {
    allProps.push(...opts.customProps);
  }

  // Add common props
  allProps.push(
    createProp(
      "className",
      "className",
      false,
      "Additional CSS class names.",
      undefined,
      undefined,
      "default"
    )
  );

  if (opts.includeRef) {
    allProps.push(
      createProp(
        "ref",
        "ref",
        false,
        "Ref to the underlying DOM element.",
        undefined,
        undefined,
        "default"
      )
    );
  }

  // Deduplicate
  const props = deduplicateProps(allProps);

  // Determine imports
  if (props.some((p) => p.typeString.includes("React."))) {
    imports.push('import * as React from "react";');
  }

  // Generate interface name
  const interfaceName = generateInterfaceName(opts);

  // Generate extends clause
  const extendsTypes = generateExtendsClause(opts, props);

  // Generate CVA variant props if needed
  let cvaVariantProps: string | undefined;
  if (opts.generateCVATypes && componentSetInput) {
    cvaVariantProps = generateCVAVariantProps(componentSetInput, opts);
  }

  // Generate the interface code
  const code = generateInterfaceCode(interfaceName, props, extendsTypes, cvaVariantProps, opts);

  // Calculate stats
  const stats = calculateInterfaceStats(props);

  return {
    name: interfaceName,
    code,
    props,
    extends: extendsTypes,
    isComponentProps: true,
    cvaVariantProps,
    imports,
    stats,
  };
}

/**
 * Generate interface name from options
 */
function generateInterfaceName(options: InterfaceGenerationOptions): string {
  const prefix = options.interfacePrefix || "";
  const suffix = options.interfaceSuffix || "Props";
  return `${prefix}${options.componentName}${suffix}`;
}

/**
 * Generate extends clause
 */
function generateExtendsClause(
  options: InterfaceGenerationOptions,
  props: PropDefinition[]
): string[] {
  const extendsTypes: string[] = [];

  if (options.extendReactProps && options.baseElement) {
    extendsTypes.push(`React.ComponentProps<"${options.baseElement}">`);
  }

  if (options.generateCVATypes) {
    extendsTypes.push(`VariantProps<typeof ${options.componentName.toLowerCase()}Variants>`);
  }

  return extendsTypes;
}

/**
 * Generate CVA variant props type definition
 */
function generateCVAVariantProps(
  componentSetInput: ComponentSetInput,
  options: InterfaceGenerationOptions
): string {
  const variantName = `${options.componentName.toLowerCase()}Variants`;
  let code = "";

  code += `const ${variantName} = cva(\n`;
  code += `  "/* base classes */",\n`;
  code += `  {\n`;
  code += `    variants: {\n`;

  for (const [propName, values] of Object.entries(componentSetInput.variantProperties)) {
    const normalizedName = normalizeVariantPropertyName(propName);
    code += `      ${normalizedName}: {\n`;
    for (const value of values) {
      code += `        "${value}": "/* ${value} styles */",\n`;
    }
    code += `      },\n`;
  }

  code += `    },\n`;
  code += `    defaultVariants: {\n`;

  // Add default variants
  for (const [propName, values] of Object.entries(componentSetInput.variantProperties)) {
    const normalizedName = normalizeVariantPropertyName(propName);
    const defaultValue = findDefaultValue(propName, values, componentSetInput.variants);
    if (defaultValue) {
      code += `      ${normalizedName}: ${defaultValue},\n`;
    }
  }

  code += `    },\n`;
  code += `  }\n`;
  code += `);\n`;

  return code;
}

/**
 * Generate the full interface code
 */
function generateInterfaceCode(
  interfaceName: string,
  props: PropDefinition[],
  extendsTypes: string[],
  cvaVariantProps: string | undefined,
  options: InterfaceGenerationOptions
): string {
  let code = "";

  // Add CVA types if present
  if (cvaVariantProps) {
    code += cvaVariantProps;
    code += "\n";
  }

  // Add interface JSDoc
  if (options.includeJSDoc) {
    code += `/**\n`;
    code += ` * Props for the ${options.componentName} component.\n`;
    code += ` */\n`;
  }

  // Start interface
  const exportKeyword = options.exportInterface ? "export " : "";
  code += `${exportKeyword}interface ${interfaceName}`;

  // Add extends
  if (extendsTypes.length > 0) {
    code += ` extends ${extendsTypes.join(", ")}`;
  }

  code += ` {\n`;

  // Filter out props that would be inherited from extended types
  const propsToInclude = filterInheritedProps(props, extendsTypes, options);

  // Add props
  for (const prop of propsToInclude) {
    // Add JSDoc for prop
    if (options.includeJSDoc && prop.description) {
      code += `  /**\n`;
      code += `   * ${prop.description}\n`;
      if (prop.jsdocTags) {
        for (const tag of prop.jsdocTags) {
          code += `   * @${tag.tag} ${tag.value}\n`;
        }
      }
      code += `   */\n`;
    }

    // Add prop definition
    const optionalMarker = prop.required ? "" : "?";
    code += `  ${prop.name}${optionalMarker}: ${prop.typeString};\n`;
  }

  code += `}\n`;

  return code;
}

/**
 * Filter out props that would be inherited from extended types
 */
function filterInheritedProps(
  props: PropDefinition[],
  extendsTypes: string[],
  options: InterfaceGenerationOptions
): PropDefinition[] {
  // If extending React component props, many common props are inherited
  const inheritedProps = new Set<string>();

  if (options.extendReactProps) {
    // Common props inherited from HTML elements
    inheritedProps.add("id");
    inheritedProps.add("style");
    inheritedProps.add("title");
    inheritedProps.add("tabIndex");
    inheritedProps.add("role");
    inheritedProps.add("aria-label");
    inheritedProps.add("aria-labelledby");
    inheritedProps.add("aria-describedby");

    // Event handlers inherited from elements
    inheritedProps.add("onKeyDown");
    inheritedProps.add("onKeyUp");
    inheritedProps.add("onMouseEnter");
    inheritedProps.add("onMouseLeave");
  }

  if (options.generateCVATypes) {
    // Variant props are included via VariantProps<typeof variants>
    // We keep them for documentation but they're technically inherited
  }

  return props.filter((p) => !inheritedProps.has(p.name));
}

/**
 * Calculate statistics about the generated interface
 */
function calculateInterfaceStats(props: PropDefinition[]): InterfaceGenerationStats {
  const requiredProps = props.filter((p) => p.required).length;
  const optionalProps = props.length - requiredProps;
  const variantProps = props.filter((p) => p.inferenceSource === "variant-property").length;
  const eventHandlerProps = props.filter((p) =>
    p.typeString.includes("=>") || p.typeString.includes("Handler")
  ).length;
  const averageConfidence =
    props.length > 0
      ? props.reduce((sum, p) => sum + p.confidence, 0) / props.length
      : 0;

  return {
    totalProps: props.length,
    requiredProps,
    optionalProps,
    variantProps,
    eventHandlerProps,
    averageConfidence,
  };
}

// ============================================================================
// High-Level API
// ============================================================================

/**
 * Generate prop interfaces from a Figma component set
 */
export function generateInterfaceFromComponentSet(
  componentSet: {
    name: string;
    variantProperties: Record<string, string[]>;
    variants: VariantInfo[];
    description?: string;
  },
  options?: Partial<InterfaceGenerationOptions>
): GeneratedInterface {
  const opts = {
    ...options,
    componentName: options?.componentName || sanitizeComponentName(componentSet.name),
  };

  return generatePropInterface(componentSet, null, opts);
}

/**
 * Generate prop interfaces from an interactive element analysis
 */
export function generateInterfaceFromElement(
  element: InteractiveElementAnalysis,
  resolvedComponent?: ResolvedComponent,
  resolvedInstance?: ResolvedInstance,
  options?: Partial<InterfaceGenerationOptions>
): GeneratedInterface {
  const componentName =
    options?.componentName ||
    (resolvedComponent
      ? sanitizeComponentName(resolvedComponent.name)
      : sanitizeComponentName(element.nodeName));

  const opts = { ...options, componentName };

  return generatePropInterface(
    element.metadata.componentSet
      ? {
          name: element.metadata.componentSet.name,
          variantProperties: element.metadata.componentSet.variantProperties,
          variants: element.metadata.componentSet.allVariants,
        }
      : null,
    { element, resolvedComponent, resolvedInstance },
    opts
  );
}

/**
 * Sanitize a component name for use in TypeScript
 */
function sanitizeComponentName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Generate multiple interfaces from a collection of components
 */
export function generateInterfacesFromComponents(
  components: Array<{
    componentSet?: ComponentSetInput;
    interactiveElement?: InteractiveElementInput;
    options?: Partial<InterfaceGenerationOptions>;
  }>
): GeneratedInterface[] {
  return components.map((component) =>
    generatePropInterface(
      component.componentSet || null,
      component.interactiveElement || null,
      component.options
    )
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  analyzeVariantProperties,
  inferPropsFromInteractiveElement,
  generatePropInterface,
  generateInterfaceFromComponentSet,
  generateInterfaceFromElement,
  generateInterfacesFromComponents,
  normalizeVariantPropertyName,
  sanitizeComponentName,
};
