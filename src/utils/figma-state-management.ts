/**
 * Figma State Management Generator
 *
 * Generates appropriate React state management patterns for interactive components:
 * - useState for local, simple state (toggles, inputs, selections)
 * - useReducer for complex state (forms with validation, multi-step wizards)
 * - Context for shared state (theme, auth, global UI state)
 *
 * Analyzes component variants and interactions to determine state requirements.
 */

import type {
  InteractiveElementAnalysis,
  InteractiveElementType,
  InteractiveState,
  InteractiveElementsResult,
  DetectedState,
} from "./figma-interactive-elements";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * State management approach to use
 */
export type StateManagementApproach = "useState" | "useReducer" | "context" | "none";

/**
 * State complexity classification
 */
export type StateComplexity = "simple" | "moderate" | "complex";

/**
 * State value type for code generation
 */
export type StateValueType =
  | "boolean"
  | "string"
  | "number"
  | "string[]"
  | "number[]"
  | "object"
  | "enum"
  | "Date"
  | "File"
  | "File[]";

/**
 * Individual state field definition
 */
export interface StateField {
  /** Field name (camelCase) */
  name: string;
  /** TypeScript type */
  type: StateValueType;
  /** Initial/default value */
  defaultValue: string;
  /** Human-readable description */
  description: string;
  /** Whether this is a derived/computed value */
  isComputed?: boolean;
  /** Source of this state (which element/interaction) */
  source: string;
  /** Possible values for enum types */
  enumValues?: string[];
}

/**
 * State transition/action for useReducer
 */
export interface StateAction {
  /** Action type name (SCREAMING_SNAKE_CASE) */
  type: string;
  /** Payload type definition */
  payload?: string;
  /** Description of what this action does */
  description: string;
  /** The state fields this action modifies */
  modifies: string[];
}

/**
 * Generated state management code
 */
export interface GeneratedStateCode {
  /** The approach used */
  approach: StateManagementApproach;
  /** State fields/shape */
  fields: StateField[];
  /** Actions for useReducer */
  actions: StateAction[];
  /** TypeScript type definitions */
  typeDefinitions: string;
  /** Hook implementation code */
  hookCode: string;
  /** Context provider code (if using context) */
  contextProviderCode?: string;
  /** Usage example */
  usageExample: string;
  /** Explanation of why this approach was chosen */
  rationale: string;
}

/**
 * Analysis result for a component's state requirements
 */
export interface StateAnalysis {
  /** Overall complexity rating */
  complexity: StateComplexity;
  /** Recommended approach */
  recommendedApproach: StateManagementApproach;
  /** All detected state requirements */
  stateRequirements: StateRequirement[];
  /** Whether state should be shared across components */
  requiresSharedState: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reasons for the recommendation */
  reasons: string[];
}

/**
 * Individual state requirement from an interactive element
 */
export interface StateRequirement {
  /** The element that requires this state */
  elementId: string;
  /** Element name */
  elementName: string;
  /** Element type */
  elementType: InteractiveElementType;
  /** State fields needed */
  fields: StateField[];
  /** Transitions/actions needed */
  actions: StateAction[];
  /** Whether this state should be local or shared */
  scope: "local" | "shared";
}

/**
 * Configuration for state generation
 */
export interface StateGenerationOptions {
  /** Use TypeScript */
  useTypeScript: boolean;
  /** Component name for naming conventions */
  componentName: string;
  /** Whether to generate JSDoc comments */
  includeJSDoc: boolean;
  /** Whether to include validation */
  includeValidation: boolean;
  /** Prefer simpler patterns when possible */
  preferSimplicity: boolean;
}

const DEFAULT_OPTIONS: StateGenerationOptions = {
  useTypeScript: true,
  componentName: "Component",
  includeJSDoc: true,
  includeValidation: false,
  preferSimplicity: true,
};

// ============================================================================
// State Complexity Analysis
// ============================================================================

/**
 * Analyze state complexity from interactive elements
 */
export function analyzeStateComplexity(
  result: InteractiveElementsResult
): StateAnalysis {
  const requirements: StateRequirement[] = [];
  const reasons: string[] = [];
  let requiresSharedState = false;

  // Analyze each interactive element
  for (const element of result.elements) {
    const requirement = analyzeElementStateRequirements(element);
    if (requirement) {
      requirements.push(requirement);
    }
  }

  // Determine if shared state is needed
  const sharedStateIndicators = detectSharedStateIndicators(result.elements);
  if (sharedStateIndicators.length > 0) {
    requiresSharedState = true;
    reasons.push(...sharedStateIndicators);
  }

  // Calculate overall complexity
  const complexity = calculateComplexity(requirements);
  reasons.push(...getComplexityReasons(requirements, complexity));

  // Determine recommended approach
  const recommendedApproach = determineApproach(
    complexity,
    requiresSharedState,
    requirements
  );

  return {
    complexity,
    recommendedApproach,
    stateRequirements: requirements,
    requiresSharedState,
    confidence: calculateConfidence(requirements),
    reasons,
  };
}

/**
 * Analyze state requirements for a single interactive element
 */
function analyzeElementStateRequirements(
  element: InteractiveElementAnalysis
): StateRequirement | null {
  const fields: StateField[] = [];
  const actions: StateAction[] = [];

  // Generate state fields based on element type
  const elementFields = getStateFieldsForElementType(element);
  fields.push(...elementFields);

  // Generate actions based on detected states
  const elementActions = getActionsForElement(element);
  actions.push(...elementActions);

  if (fields.length === 0 && actions.length === 0) {
    return null;
  }

  // Determine scope based on element type and context
  const scope = determineStateScope(element);

  return {
    elementId: element.nodeId,
    elementName: element.nodeName,
    elementType: element.elementType,
    fields,
    actions,
    scope,
  };
}

/**
 * Get state fields for a specific element type
 */
function getStateFieldsForElementType(
  element: InteractiveElementAnalysis
): StateField[] {
  const { elementType, nodeName, nodeId } = element;
  const baseName = sanitizeFieldName(nodeName);

  switch (elementType) {
    case "button":
    case "icon-button":
    case "fab":
      return getButtonStateFields(element, baseName);

    case "toggle":
    case "switch":
      return [
        {
          name: `is${capitalize(baseName)}On`,
          type: "boolean",
          defaultValue: "false",
          description: `Toggle state for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "checkbox":
      return [
        {
          name: `is${capitalize(baseName)}Checked`,
          type: "boolean",
          defaultValue: "false",
          description: `Checkbox state for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "radio":
      return [
        {
          name: `selected${capitalize(baseName)}`,
          type: "string",
          defaultValue: '""',
          description: `Selected radio option for ${nodeName} group`,
          source: nodeId,
        },
      ];

    case "text-input":
    case "search-input":
      return getInputStateFields(element, baseName);

    case "textarea":
      return [
        {
          name: `${baseName}Text`,
          type: "string",
          defaultValue: '""',
          description: `Text content for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "select":
    case "dropdown":
      return getSelectStateFields(element, baseName);

    case "slider":
    case "range":
      return [
        {
          name: `${baseName}Value`,
          type: "number",
          defaultValue: "0",
          description: `Slider value for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "tab":
      return [
        {
          name: "activeTab",
          type: "string",
          defaultValue: '""',
          description: `Currently active tab`,
          source: nodeId,
        },
      ];

    case "accordion":
    case "disclosure":
      return [
        {
          name: `is${capitalize(baseName)}Expanded`,
          type: "boolean",
          defaultValue: "false",
          description: `Expansion state for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "dialog-trigger":
      return [
        {
          name: `is${capitalize(baseName)}Open`,
          type: "boolean",
          defaultValue: "false",
          description: `Dialog open state for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "chip":
    case "tag":
      return [
        {
          name: `is${capitalize(baseName)}Selected`,
          type: "boolean",
          defaultValue: "false",
          description: `Selection state for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "rating":
      return [
        {
          name: `${baseName}Rating`,
          type: "number",
          defaultValue: "0",
          description: `Rating value for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "file-upload":
      return [
        {
          name: `${baseName}Files`,
          type: "File[]",
          defaultValue: "[]",
          description: `Uploaded files for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "date-picker":
      return [
        {
          name: `${baseName}Date`,
          type: "Date",
          defaultValue: "null",
          description: `Selected date for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "time-picker":
      return [
        {
          name: `${baseName}Time`,
          type: "string",
          defaultValue: '""',
          description: `Selected time for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "color-picker":
      return [
        {
          name: `${baseName}Color`,
          type: "string",
          defaultValue: '"#000000"',
          description: `Selected color for ${nodeName}`,
          source: nodeId,
        },
      ];

    case "pagination-control":
      return [
        {
          name: "currentPage",
          type: "number",
          defaultValue: "1",
          description: "Current page number",
          source: nodeId,
        },
      ];

    case "stepper-control":
      return [
        {
          name: `${baseName}Value`,
          type: "number",
          defaultValue: "0",
          description: `Stepper value for ${nodeName}`,
          source: nodeId,
        },
      ];

    default:
      return [];
  }
}

/**
 * Get state fields for button elements
 */
function getButtonStateFields(
  element: InteractiveElementAnalysis,
  baseName: string
): StateField[] {
  const fields: StateField[] = [];
  const hasLoadingState = element.states.some((s) => s.state === "loading");
  const hasDisabledState = element.states.some((s) => s.state === "disabled");

  if (hasLoadingState) {
    fields.push({
      name: `is${capitalize(baseName)}Loading`,
      type: "boolean",
      defaultValue: "false",
      description: `Loading state for ${element.nodeName}`,
      source: element.nodeId,
    });
  }

  if (hasDisabledState) {
    fields.push({
      name: `is${capitalize(baseName)}Disabled`,
      type: "boolean",
      defaultValue: "false",
      description: `Disabled state for ${element.nodeName}`,
      source: element.nodeId,
    });
  }

  return fields;
}

/**
 * Get state fields for input elements
 */
function getInputStateFields(
  element: InteractiveElementAnalysis,
  baseName: string
): StateField[] {
  const fields: StateField[] = [
    {
      name: `${baseName}Value`,
      type: "string",
      defaultValue: '""',
      description: `Input value for ${element.nodeName}`,
      source: element.nodeId,
    },
  ];

  const hasErrorState = element.states.some((s) => s.state === "error");
  if (hasErrorState) {
    fields.push({
      name: `${baseName}Error`,
      type: "string",
      defaultValue: '""',
      description: `Error message for ${element.nodeName}`,
      source: element.nodeId,
    });
  }

  return fields;
}

/**
 * Get state fields for select elements
 */
function getSelectStateFields(
  element: InteractiveElementAnalysis,
  baseName: string
): StateField[] {
  const fields: StateField[] = [
    {
      name: `selected${capitalize(baseName)}`,
      type: "string",
      defaultValue: '""',
      description: `Selected value for ${element.nodeName}`,
      source: element.nodeId,
    },
  ];

  // Check if dropdown has expanded state
  const hasExpandedState = element.states.some(
    (s) => s.state === "expanded" || s.state === "collapsed"
  );
  if (hasExpandedState) {
    fields.push({
      name: `is${capitalize(baseName)}Open`,
      type: "boolean",
      defaultValue: "false",
      description: `Open state for ${element.nodeName} dropdown`,
      source: element.nodeId,
    });
  }

  return fields;
}

/**
 * Get actions for an interactive element
 */
function getActionsForElement(
  element: InteractiveElementAnalysis
): StateAction[] {
  const actions: StateAction[] = [];
  const baseName = sanitizeFieldName(element.nodeName);

  switch (element.elementType) {
    case "toggle":
    case "switch":
      actions.push({
        type: `TOGGLE_${toScreamingSnake(baseName)}`,
        description: `Toggle ${element.nodeName} on/off`,
        modifies: [`is${capitalize(baseName)}On`],
      });
      break;

    case "checkbox":
      actions.push({
        type: `TOGGLE_${toScreamingSnake(baseName)}`,
        description: `Toggle ${element.nodeName} checked state`,
        modifies: [`is${capitalize(baseName)}Checked`],
      });
      break;

    case "text-input":
    case "search-input":
    case "textarea":
      actions.push({
        type: `SET_${toScreamingSnake(baseName)}`,
        payload: "string",
        description: `Update ${element.nodeName} value`,
        modifies: [`${baseName}Value`],
      });
      if (element.states.some((s) => s.state === "error")) {
        actions.push({
          type: `SET_${toScreamingSnake(baseName)}_ERROR`,
          payload: "string",
          description: `Set error for ${element.nodeName}`,
          modifies: [`${baseName}Error`],
        });
        actions.push({
          type: `CLEAR_${toScreamingSnake(baseName)}_ERROR`,
          description: `Clear error for ${element.nodeName}`,
          modifies: [`${baseName}Error`],
        });
      }
      break;

    case "select":
    case "dropdown":
      actions.push({
        type: `SELECT_${toScreamingSnake(baseName)}`,
        payload: "string",
        description: `Select value in ${element.nodeName}`,
        modifies: [`selected${capitalize(baseName)}`],
      });
      break;

    case "slider":
    case "range":
    case "stepper-control":
      actions.push({
        type: `SET_${toScreamingSnake(baseName)}_VALUE`,
        payload: "number",
        description: `Set value for ${element.nodeName}`,
        modifies: [`${baseName}Value`],
      });
      break;

    case "tab":
      actions.push({
        type: "SET_ACTIVE_TAB",
        payload: "string",
        description: "Change active tab",
        modifies: ["activeTab"],
      });
      break;

    case "accordion":
    case "disclosure":
      actions.push({
        type: `TOGGLE_${toScreamingSnake(baseName)}_EXPANDED`,
        description: `Toggle expansion of ${element.nodeName}`,
        modifies: [`is${capitalize(baseName)}Expanded`],
      });
      break;

    case "dialog-trigger":
      actions.push({
        type: `OPEN_${toScreamingSnake(baseName)}`,
        description: `Open ${element.nodeName} dialog`,
        modifies: [`is${capitalize(baseName)}Open`],
      });
      actions.push({
        type: `CLOSE_${toScreamingSnake(baseName)}`,
        description: `Close ${element.nodeName} dialog`,
        modifies: [`is${capitalize(baseName)}Open`],
      });
      break;

    case "pagination-control":
      actions.push({
        type: "SET_PAGE",
        payload: "number",
        description: "Navigate to specific page",
        modifies: ["currentPage"],
      });
      actions.push({
        type: "NEXT_PAGE",
        description: "Go to next page",
        modifies: ["currentPage"],
      });
      actions.push({
        type: "PREV_PAGE",
        description: "Go to previous page",
        modifies: ["currentPage"],
      });
      break;
  }

  return actions;
}

/**
 * Detect indicators that shared state is needed
 */
function detectSharedStateIndicators(
  elements: InteractiveElementAnalysis[]
): string[] {
  const indicators: string[] = [];

  // Check for multiple tabs (tab state is typically shared)
  const tabCount = elements.filter((e) => e.elementType === "tab").length;
  if (tabCount > 1) {
    indicators.push("Multiple tabs detected - tab state should be shared");
  }

  // Check for dialog triggers with related elements
  const dialogTriggers = elements.filter(
    (e) => e.elementType === "dialog-trigger"
  );
  if (dialogTriggers.length > 0) {
    indicators.push(
      "Dialog triggers detected - dialog state may need to be shared"
    );
  }

  // Check for pagination
  const paginationControls = elements.filter(
    (e) => e.elementType === "pagination-control"
  );
  if (paginationControls.length > 0) {
    indicators.push(
      "Pagination controls detected - page state should be shared"
    );
  }

  // Check for multiple related checkboxes (form state)
  const checkboxes = elements.filter((e) => e.elementType === "checkbox");
  if (checkboxes.length > 3) {
    indicators.push("Multiple checkboxes detected - form state should be shared");
  }

  // Check for multiple inputs (form state)
  const inputs = elements.filter(
    (e) =>
      e.elementType === "text-input" ||
      e.elementType === "textarea" ||
      e.elementType === "search-input"
  );
  if (inputs.length > 2) {
    indicators.push("Multiple inputs detected - form state may benefit from shared management");
  }

  return indicators;
}

/**
 * Calculate overall state complexity
 */
function calculateComplexity(requirements: StateRequirement[]): StateComplexity {
  const totalFields = requirements.reduce((sum, r) => sum + r.fields.length, 0);
  const totalActions = requirements.reduce(
    (sum, r) => sum + r.actions.length,
    0
  );
  const hasSharedState = requirements.some((r) => r.scope === "shared");

  // Simple: 1-3 fields, simple interactions
  if (totalFields <= 3 && totalActions <= 4 && !hasSharedState) {
    return "simple";
  }

  // Complex: Many fields, many actions, or shared state
  if (totalFields > 8 || totalActions > 10 || hasSharedState) {
    return "complex";
  }

  return "moderate";
}

/**
 * Get reasons for complexity classification
 */
function getComplexityReasons(
  requirements: StateRequirement[],
  complexity: StateComplexity
): string[] {
  const reasons: string[] = [];
  const totalFields = requirements.reduce((sum, r) => sum + r.fields.length, 0);
  const totalActions = requirements.reduce(
    (sum, r) => sum + r.actions.length,
    0
  );

  switch (complexity) {
    case "simple":
      reasons.push(`Simple state with ${totalFields} field(s) and ${totalActions} action(s)`);
      break;
    case "moderate":
      reasons.push(`Moderate complexity with ${totalFields} fields and ${totalActions} actions`);
      break;
    case "complex":
      reasons.push(`Complex state with ${totalFields} fields and ${totalActions} actions`);
      if (requirements.some((r) => r.scope === "shared")) {
        reasons.push("Contains state that needs to be shared across components");
      }
      break;
  }

  return reasons;
}

/**
 * Determine the recommended state management approach
 */
function determineApproach(
  complexity: StateComplexity,
  requiresSharedState: boolean,
  requirements: StateRequirement[]
): StateManagementApproach {
  // No state needed
  if (requirements.length === 0) {
    return "none";
  }

  // Shared state requires context
  if (requiresSharedState) {
    return "context";
  }

  // Simple state uses useState
  if (complexity === "simple") {
    return "useState";
  }

  // Complex state uses useReducer
  if (complexity === "complex") {
    return "useReducer";
  }

  // Moderate complexity - check action count
  const totalActions = requirements.reduce(
    (sum, r) => sum + r.actions.length,
    0
  );
  if (totalActions > 5) {
    return "useReducer";
  }

  return "useState";
}

/**
 * Determine scope for element's state
 */
function determineStateScope(
  element: InteractiveElementAnalysis
): "local" | "shared" {
  // These element types typically need shared state
  const sharedTypes: InteractiveElementType[] = [
    "tab",
    "pagination-control",
    "dialog-trigger",
  ];

  if (sharedTypes.includes(element.elementType)) {
    return "shared";
  }

  return "local";
}

/**
 * Calculate confidence score for the analysis
 */
function calculateConfidence(requirements: StateRequirement[]): number {
  if (requirements.length === 0) return 0.5;

  // Base confidence from having requirements
  let confidence = 0.7;

  // More requirements = higher confidence in analysis
  if (requirements.length > 3) confidence += 0.1;
  if (requirements.length > 6) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate state management code from analysis
 */
export function generateStateManagementCode(
  analysis: StateAnalysis,
  options: Partial<StateGenerationOptions> = {}
): GeneratedStateCode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  switch (analysis.recommendedApproach) {
    case "useState":
      return generateUseStateCode(analysis, opts);
    case "useReducer":
      return generateUseReducerCode(analysis, opts);
    case "context":
      return generateContextCode(analysis, opts);
    default:
      return generateNoStateCode(opts);
  }
}

/**
 * Generate useState-based state management
 */
function generateUseStateCode(
  analysis: StateAnalysis,
  options: StateGenerationOptions
): GeneratedStateCode {
  const allFields = analysis.stateRequirements.flatMap((r) => r.fields);
  const allActions = analysis.stateRequirements.flatMap((r) => r.actions);

  // Generate type definitions
  const typeDefinitions = generateTypeDefinitions(allFields, options);

  // Generate hook code
  const hookCode = generateUseStateHook(allFields, allActions, options);

  // Generate usage example
  const usageExample = generateUseStateUsageExample(allFields, options);

  return {
    approach: "useState",
    fields: allFields,
    actions: allActions,
    typeDefinitions,
    hookCode,
    usageExample,
    rationale:
      "useState is appropriate for simple, independent state values that don't have complex transitions.",
  };
}

/**
 * Generate useReducer-based state management
 */
function generateUseReducerCode(
  analysis: StateAnalysis,
  options: StateGenerationOptions
): GeneratedStateCode {
  const allFields = analysis.stateRequirements.flatMap((r) => r.fields);
  const allActions = analysis.stateRequirements.flatMap((r) => r.actions);

  // Generate type definitions
  const typeDefinitions = generateReducerTypeDefinitions(
    allFields,
    allActions,
    options
  );

  // Generate hook code
  const hookCode = generateUseReducerHook(allFields, allActions, options);

  // Generate usage example
  const usageExample = generateUseReducerUsageExample(allActions, options);

  return {
    approach: "useReducer",
    fields: allFields,
    actions: allActions,
    typeDefinitions,
    hookCode,
    usageExample,
    rationale:
      "useReducer is appropriate for complex state with multiple related values and transitions.",
  };
}

/**
 * Generate Context-based state management
 */
function generateContextCode(
  analysis: StateAnalysis,
  options: StateGenerationOptions
): GeneratedStateCode {
  const allFields = analysis.stateRequirements.flatMap((r) => r.fields);
  const allActions = analysis.stateRequirements.flatMap((r) => r.actions);

  // Generate type definitions
  const typeDefinitions = generateContextTypeDefinitions(
    allFields,
    allActions,
    options
  );

  // Generate hook and context provider code
  const hookCode = generateContextHook(allFields, allActions, options);
  const contextProviderCode = generateContextProvider(
    allFields,
    allActions,
    options
  );

  // Generate usage example
  const usageExample = generateContextUsageExample(options);

  return {
    approach: "context",
    fields: allFields,
    actions: allActions,
    typeDefinitions,
    hookCode,
    contextProviderCode,
    usageExample,
    rationale:
      "Context is appropriate when state needs to be shared across multiple components without prop drilling.",
  };
}

/**
 * Generate placeholder for no state
 */
function generateNoStateCode(options: StateGenerationOptions): GeneratedStateCode {
  return {
    approach: "none",
    fields: [],
    actions: [],
    typeDefinitions: "// No state types needed",
    hookCode: "// No state management needed for this component",
    usageExample: "// Component is stateless",
    rationale: "No interactive elements requiring state were detected.",
  };
}

// ============================================================================
// Type Definition Generation
// ============================================================================

/**
 * Generate TypeScript type definitions for useState
 */
function generateTypeDefinitions(
  fields: StateField[],
  options: StateGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated";
  }

  let code = "";

  if (options.includeJSDoc) {
    code += "/** State types for component */\n";
  }

  // Generate individual field types if needed
  const enumFields = fields.filter(
    (f) => f.type === "enum" && f.enumValues?.length
  );
  for (const field of enumFields) {
    code += `type ${capitalize(field.name)}Type = ${field.enumValues!.map((v) => `"${v}"`).join(" | ")};\n`;
  }

  return code || "// Simple primitive types used";
}

/**
 * Generate TypeScript type definitions for useReducer
 */
function generateReducerTypeDefinitions(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated";
  }

  const componentName = options.componentName;
  let code = "";

  // State interface
  if (options.includeJSDoc) {
    code += "/** State shape for the component */\n";
  }
  code += `interface ${componentName}State {\n`;
  for (const field of fields) {
    code += `  ${field.name}: ${mapTypeToTS(field.type)};\n`;
  }
  code += "}\n\n";

  // Action types
  if (options.includeJSDoc) {
    code += "/** Action types for the reducer */\n";
  }
  code += `type ${componentName}Action =\n`;
  const actionTypes = actions.map((action) => {
    if (action.payload) {
      return `  | { type: "${action.type}"; payload: ${action.payload} }`;
    }
    return `  | { type: "${action.type}" }`;
  });
  code += actionTypes.join("\n") + ";\n";

  return code;
}

/**
 * Generate TypeScript type definitions for Context
 */
function generateContextTypeDefinitions(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  if (!options.useTypeScript) {
    return "// TypeScript types not generated";
  }

  const componentName = options.componentName;
  let code = generateReducerTypeDefinitions(fields, actions, options);

  // Context value type
  code += "\n";
  if (options.includeJSDoc) {
    code += "/** Context value type */\n";
  }
  code += `interface ${componentName}ContextValue {\n`;
  code += `  state: ${componentName}State;\n`;
  code += `  dispatch: React.Dispatch<${componentName}Action>;\n`;

  // Add convenience action dispatchers
  for (const action of actions) {
    const fnName = actionTypeToFunctionName(action.type);
    if (action.payload) {
      code += `  ${fnName}: (payload: ${action.payload}) => void;\n`;
    } else {
      code += `  ${fnName}: () => void;\n`;
    }
  }

  code += "}\n";

  return code;
}

// ============================================================================
// Hook Code Generation
// ============================================================================

/**
 * Generate useState hook code
 */
function generateUseStateHook(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = "";

  if (options.includeJSDoc) {
    code += `/**\n * Custom hook for ${componentName} state management\n */\n`;
  }

  code += `function use${componentName}State() {\n`;

  // Generate useState calls for each field
  for (const field of fields) {
    const tsType = options.useTypeScript ? mapTypeToTS(field.type) : "";
    const typeAnnotation = tsType ? `<${tsType}>` : "";
    code += `  const [${field.name}, set${capitalize(field.name)}] = useState${typeAnnotation}(${field.defaultValue});\n`;
  }

  code += "\n";

  // Generate action handlers
  for (const action of actions) {
    const fnName = actionTypeToFunctionName(action.type);
    if (action.payload) {
      const paramType = options.useTypeScript ? `: ${action.payload}` : "";
      code += `  const ${fnName} = (value${paramType}) => {\n`;
    } else {
      code += `  const ${fnName} = () => {\n`;
    }

    // Generate the action implementation
    for (const modifiedField of action.modifies) {
      const field = fields.find((f) => f.name === modifiedField);
      if (field) {
        if (action.type.includes("TOGGLE")) {
          code += `    set${capitalize(modifiedField)}((prev) => !prev);\n`;
        } else if (action.type.includes("CLEAR")) {
          code += `    set${capitalize(modifiedField)}(${field.defaultValue});\n`;
        } else if (action.payload) {
          code += `    set${capitalize(modifiedField)}(value);\n`;
        }
      }
    }

    code += "  };\n\n";
  }

  // Return object
  code += "  return {\n";
  for (const field of fields) {
    code += `    ${field.name},\n`;
  }
  for (const action of actions) {
    code += `    ${actionTypeToFunctionName(action.type)},\n`;
  }
  code += "  };\n";
  code += "}\n";

  return code;
}

/**
 * Generate useReducer hook code
 */
function generateUseReducerHook(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = "";

  // Initial state
  if (options.includeJSDoc) {
    code += "/** Initial state */\n";
  }
  code += `const initial${componentName}State`;
  if (options.useTypeScript) {
    code += `: ${componentName}State`;
  }
  code += " = {\n";
  for (const field of fields) {
    code += `  ${field.name}: ${field.defaultValue},\n`;
  }
  code += "};\n\n";

  // Reducer function
  if (options.includeJSDoc) {
    code += "/** Reducer function */\n";
  }
  code += `function ${componentName.toLowerCase()}Reducer(\n`;
  code += `  state`;
  if (options.useTypeScript) {
    code += `: ${componentName}State`;
  }
  code += `,\n`;
  code += `  action`;
  if (options.useTypeScript) {
    code += `: ${componentName}Action`;
  }
  code += `\n)`;
  if (options.useTypeScript) {
    code += `: ${componentName}State`;
  }
  code += " {\n";
  code += "  switch (action.type) {\n";

  for (const action of actions) {
    code += `    case "${action.type}":\n`;
    code += "      return {\n";
    code += "        ...state,\n";

    for (const modifiedField of action.modifies) {
      const field = fields.find((f) => f.name === modifiedField);
      if (field) {
        if (action.type.includes("TOGGLE")) {
          code += `        ${modifiedField}: !state.${modifiedField},\n`;
        } else if (action.type.includes("CLEAR")) {
          code += `        ${modifiedField}: ${field.defaultValue},\n`;
        } else if (action.type.includes("NEXT_PAGE")) {
          code += `        ${modifiedField}: state.${modifiedField} + 1,\n`;
        } else if (action.type.includes("PREV_PAGE")) {
          code += `        ${modifiedField}: Math.max(1, state.${modifiedField} - 1),\n`;
        } else if (action.payload) {
          code += `        ${modifiedField}: action.payload,\n`;
        }
      }
    }

    code += "      };\n";
  }

  code += "    default:\n";
  code += "      return state;\n";
  code += "  }\n";
  code += "}\n\n";

  // Hook
  if (options.includeJSDoc) {
    code += `/**\n * Custom hook for ${componentName} state management\n */\n`;
  }
  code += `function use${componentName}State() {\n`;
  code += `  const [state, dispatch] = useReducer(${componentName.toLowerCase()}Reducer, initial${componentName}State);\n\n`;

  // Generate convenience action dispatchers
  for (const action of actions) {
    const fnName = actionTypeToFunctionName(action.type);
    if (action.payload) {
      const paramType = options.useTypeScript ? `: ${action.payload}` : "";
      code += `  const ${fnName} = (payload${paramType}) => dispatch({ type: "${action.type}", payload });\n`;
    } else {
      code += `  const ${fnName} = () => dispatch({ type: "${action.type}" });\n`;
    }
  }

  code += "\n  return {\n";
  code += "    state,\n";
  code += "    dispatch,\n";
  for (const action of actions) {
    code += `    ${actionTypeToFunctionName(action.type)},\n`;
  }
  code += "  };\n";
  code += "}\n";

  return code;
}

/**
 * Generate Context hook and provider code
 */
function generateContextHook(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = "";

  // Create context
  if (options.includeJSDoc) {
    code += "/** Context for component state */\n";
  }
  code += `const ${componentName}Context = createContext`;
  if (options.useTypeScript) {
    code += `<${componentName}ContextValue | undefined>`;
  }
  code += "(undefined);\n\n";

  // Hook to use context
  if (options.includeJSDoc) {
    code += `/**\n * Hook to access ${componentName} context\n * @throws Error if used outside of ${componentName}Provider\n */\n`;
  }
  code += `function use${componentName}() {\n`;
  code += `  const context = useContext(${componentName}Context);\n`;
  code += "  if (context === undefined) {\n";
  code += `    throw new Error("use${componentName} must be used within a ${componentName}Provider");\n`;
  code += "  }\n";
  code += "  return context;\n";
  code += "}\n";

  return code;
}

/**
 * Generate Context provider component
 */
function generateContextProvider(
  fields: StateField[],
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = "";

  // Props interface
  if (options.useTypeScript) {
    code += `interface ${componentName}ProviderProps {\n`;
    code += "  children: React.ReactNode;\n";
    code += "}\n\n";
  }

  // Provider component
  if (options.includeJSDoc) {
    code += `/**\n * Provider component for ${componentName} state\n */\n`;
  }

  if (options.useTypeScript) {
    code += `function ${componentName}Provider({ children }: ${componentName}ProviderProps) {\n`;
  } else {
    code += `function ${componentName}Provider({ children }) {\n`;
  }

  code += `  const [state, dispatch] = useReducer(${componentName.toLowerCase()}Reducer, initial${componentName}State);\n\n`;

  // Create action dispatchers
  for (const action of actions) {
    const fnName = actionTypeToFunctionName(action.type);
    if (action.payload) {
      const paramType = options.useTypeScript ? `: ${action.payload}` : "";
      code += `  const ${fnName} = (payload${paramType}) => dispatch({ type: "${action.type}", payload });\n`;
    } else {
      code += `  const ${fnName} = () => dispatch({ type: "${action.type}" });\n`;
    }
  }

  // Create context value
  code += "\n  const value = {\n";
  code += "    state,\n";
  code += "    dispatch,\n";
  for (const action of actions) {
    code += `    ${actionTypeToFunctionName(action.type)},\n`;
  }
  code += "  };\n\n";

  code += `  return (\n`;
  code += `    <${componentName}Context.Provider value={value}>\n`;
  code += `      {children}\n`;
  code += `    </${componentName}Context.Provider>\n`;
  code += `  );\n`;
  code += "}\n";

  return code;
}

// ============================================================================
// Usage Example Generation
// ============================================================================

/**
 * Generate usage example for useState
 */
function generateUseStateUsageExample(
  fields: StateField[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = `// Usage in component:\n`;
  code += `function ${componentName}() {\n`;
  code += `  const {\n`;

  for (const field of fields) {
    code += `    ${field.name},\n`;
  }

  code += `  } = use${componentName}State();\n\n`;
  code += `  return (\n`;
  code += `    <div>\n`;
  code += `      {/* Use state values here */}\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `}\n`;

  return code;
}

/**
 * Generate usage example for useReducer
 */
function generateUseReducerUsageExample(
  actions: StateAction[],
  options: StateGenerationOptions
): string {
  const componentName = options.componentName;
  let code = `// Usage in component:\n`;
  code += `function ${componentName}() {\n`;
  code += `  const { state, ${actions.map((a) => actionTypeToFunctionName(a.type)).join(", ")} } = use${componentName}State();\n\n`;
  code += `  return (\n`;
  code += `    <div>\n`;
  code += `      {/* Access state.fieldName and call actions */}\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `}\n`;

  return code;
}

/**
 * Generate usage example for Context
 */
function generateContextUsageExample(options: StateGenerationOptions): string {
  const componentName = options.componentName;
  let code = `// Wrap your app/component tree with the provider:\n`;
  code += `function App() {\n`;
  code += `  return (\n`;
  code += `    <${componentName}Provider>\n`;
  code += `      <${componentName} />\n`;
  code += `    </${componentName}Provider>\n`;
  code += `  );\n`;
  code += `}\n\n`;
  code += `// Use the context in any child component:\n`;
  code += `function Child${componentName}() {\n`;
  code += `  const { state, ...actions } = use${componentName}();\n\n`;
  code += `  return (\n`;
  code += `    <div>\n`;
  code += `      {/* Access shared state and actions */}\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `}\n`;

  return code;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map StateValueType to TypeScript type string
 */
function mapTypeToTS(type: StateValueType): string {
  switch (type) {
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "number":
      return "number";
    case "string[]":
      return "string[]";
    case "number[]":
      return "number[]";
    case "object":
      return "Record<string, unknown>";
    case "enum":
      return "string";
    case "Date":
      return "Date | null";
    case "File":
      return "File | null";
    case "File[]":
      return "File[]";
    default:
      return "unknown";
  }
}

/**
 * Convert action type to function name
 */
function actionTypeToFunctionName(actionType: string): string {
  // TOGGLE_DARK_MODE -> toggleDarkMode
  // SET_VALUE -> setValue
  return actionType
    .toLowerCase()
    .split("_")
    .map((part, index) => (index === 0 ? part : capitalize(part)))
    .join("");
}

/**
 * Sanitize a name for use as a field name
 */
function sanitizeFieldName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase())
    )
    .join("");
}

/**
 * Convert string to SCREAMING_SNAKE_CASE
 */
function toScreamingSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_/, "")
    .toUpperCase();
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Generate complete state management solution from interactive elements
 */
export function generateStateManagement(
  interactiveResult: InteractiveElementsResult,
  options: Partial<StateGenerationOptions> = {}
): GeneratedStateCode {
  const analysis = analyzeStateComplexity(interactiveResult);
  return generateStateManagementCode(analysis, options);
}

/**
 * Get recommended state management approach for interactive elements
 */
export function getRecommendedApproach(
  interactiveResult: InteractiveElementsResult
): StateManagementApproach {
  const analysis = analyzeStateComplexity(interactiveResult);
  return analysis.recommendedApproach;
}

// ============================================================================
// Exports
// ============================================================================

export {
  analyzeStateComplexity as analyzeState,
  generateStateManagementCode as generateCode,
};
