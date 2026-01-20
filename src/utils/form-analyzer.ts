/**
 * Form Layout Analyzer
 *
 * Analyzes Figma frames to detect form layouts and input groupings:
 * - Detects form elements: labels, inputs, textareas, selects, checkboxes, radio buttons
 * - Identifies label-to-input associations based on spatial proximity
 * - Detects validation messages and helper text
 * - Groups related fields into fieldsets
 * - Generates accessible form markup with proper ARIA attributes
 */

import type { FigmaNode } from "./figma-api";
import type { BoundingBox, NodeLayoutAnalysis } from "./layout-analyzer";
import { analyzeNodeLayout } from "./layout-analyzer";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Form element types that can be detected */
export type FormElementType =
  | "text-input"
  | "email-input"
  | "password-input"
  | "number-input"
  | "tel-input"
  | "url-input"
  | "search-input"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "toggle"
  | "date-input"
  | "time-input"
  | "file-input"
  | "label"
  | "helper-text"
  | "error-message"
  | "submit-button"
  | "reset-button"
  | "cancel-button"
  | "form-title"
  | "fieldset-legend"
  | "unknown";

/** Input type attribute for HTML generation */
export type HTMLInputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "file"
  | "checkbox"
  | "radio";

/** Detected form element with metadata */
export interface DetectedFormElement {
  nodeId: string;
  nodeName: string;
  elementType: FormElementType;
  confidence: number;
  bounds: BoundingBox;
  textContent?: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: HTMLInputType;
}

/** Label-input association */
export interface LabelInputAssociation {
  labelElement: DetectedFormElement;
  inputElement: DetectedFormElement;
  associationType: "above" | "left" | "right" | "inside" | "floating";
  confidence: number;
}

/** Form field group (input + label + helper/error) */
export interface FormFieldGroup {
  id: string;
  label?: DetectedFormElement;
  input: DetectedFormElement;
  helperText?: DetectedFormElement;
  errorMessage?: DetectedFormElement;
  isRequired: boolean;
  fieldName: string;
}

/** Fieldset grouping */
export interface FieldsetGroup {
  id: string;
  legend?: DetectedFormElement;
  fields: FormFieldGroup[];
  bounds: BoundingBox;
  suggestedName: string;
}

/** Complete form analysis result */
export interface FormAnalysisResult {
  isForm: boolean;
  confidence: number;
  formTitle?: DetectedFormElement;
  elements: DetectedFormElement[];
  fieldGroups: FormFieldGroup[];
  fieldsets: FieldsetGroup[];
  submitButton?: DetectedFormElement;
  cancelButton?: DetectedFormElement;
  labelAssociations: LabelInputAssociation[];
  suggestedCode: FormCodeSuggestion;
}

/** Generated form code */
export interface FormCodeSuggestion {
  jsx: string;
  zodSchema: string;
  tailwindClasses: string[];
  ariaAttributes: Record<string, string>;
}

// ============================================================================
// Constants for Detection Heuristics
// ============================================================================

export const FORM_THRESHOLDS = {
  /** Maximum vertical distance for label-input association (pixels) */
  LABEL_INPUT_MAX_VERTICAL_GAP: 40,
  /** Maximum horizontal distance for label-input association (pixels) */
  LABEL_INPUT_MAX_HORIZONTAL_GAP: 20,
  /** Minimum overlap percentage for inline label detection */
  INLINE_LABEL_MIN_OVERLAP: 0.3,
  /** Maximum height for a typical input field (pixels) */
  INPUT_MAX_HEIGHT: 60,
  /** Minimum height for textarea detection (pixels) */
  TEXTAREA_MIN_HEIGHT: 80,
  /** Maximum width for checkbox/radio detection (pixels) */
  CHECKBOX_MAX_WIDTH: 40,
  /** Maximum vertical gap for grouping fields together */
  FIELD_GROUP_MAX_GAP: 60,
  /** Typical input aspect ratio (width/height) */
  INPUT_TYPICAL_ASPECT_RATIO_MIN: 2,
  /** Button aspect ratio range */
  BUTTON_ASPECT_RATIO_MIN: 1.5,
  BUTTON_ASPECT_RATIO_MAX: 8,
} as const;

/** Keywords for detecting form element types from names */
export const ELEMENT_KEYWORDS: Record<FormElementType, string[]> = {
  "text-input": ["input", "text", "field", "name", "username", "title"],
  "email-input": ["email", "e-mail", "mail"],
  "password-input": ["password", "pass", "pwd", "secret", "pin"],
  "number-input": ["number", "amount", "quantity", "qty", "count", "age"],
  "tel-input": ["phone", "tel", "telephone", "mobile", "cell"],
  "url-input": ["url", "website", "link", "web"],
  "search-input": ["search", "find", "query"],
  textarea: ["textarea", "description", "message", "comment", "bio", "notes", "content", "body"],
  select: ["select", "dropdown", "picker", "choice", "option", "combobox"],
  checkbox: ["checkbox", "check", "agree", "terms", "consent", "remember"],
  radio: ["radio", "option", "choice"],
  toggle: ["toggle", "switch", "on-off"],
  "date-input": ["date", "birthday", "dob", "calendar"],
  "time-input": ["time", "hour", "schedule"],
  "file-input": ["file", "upload", "attach", "document", "image"],
  label: ["label", "field-label"],
  "helper-text": ["helper", "hint", "help", "description", "info"],
  "error-message": ["error", "invalid", "validation", "warning", "alert"],
  "submit-button": ["submit", "send", "save", "create", "continue", "next", "sign up", "login", "log in", "register"],
  "reset-button": ["reset", "clear"],
  "cancel-button": ["cancel", "back", "close", "dismiss"],
  "form-title": ["title", "heading", "form-title", "header"],
  "fieldset-legend": ["legend", "section", "group-title"],
  unknown: [],
};

/** Visual patterns for input detection */
const INPUT_VISUAL_PATTERNS = {
  /** Typical input field background colors (light theme) */
  inputBackgrounds: [
    { r: 1, g: 1, b: 1, a: 1 }, // White
    { r: 0.95, g: 0.95, b: 0.95, a: 1 }, // Light gray
    { r: 0.98, g: 0.98, b: 0.98, a: 1 }, // Very light gray
  ],
  /** Typical border indicators */
  hasBorder: true,
  /** Corner radius typical for inputs */
  borderRadiusRange: { min: 2, max: 12 },
};

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a Figma frame for form elements and structure
 */
export function analyzeFormLayout(frameNode: FigmaNode): FormAnalysisResult {
  const bounds = extractBounds(frameNode);
  const allElements: DetectedFormElement[] = [];

  // Recursively detect form elements
  traverseAndDetect(frameNode, allElements, bounds);

  // Determine if this is actually a form
  const inputElements = allElements.filter((el) => isInputElement(el.elementType));
  const isForm = inputElements.length >= 1;
  const formConfidence = calculateFormConfidence(allElements);

  if (!isForm) {
    return {
      isForm: false,
      confidence: 0,
      elements: [],
      fieldGroups: [],
      fieldsets: [],
      labelAssociations: [],
      suggestedCode: {
        jsx: "",
        zodSchema: "",
        tailwindClasses: [],
        ariaAttributes: {},
      },
    };
  }

  // Find label-input associations
  const labelAssociations = detectLabelAssociations(allElements);

  // Group fields together
  const fieldGroups = createFieldGroups(allElements, labelAssociations);

  // Detect fieldset groupings
  const fieldsets = detectFieldsets(fieldGroups, allElements);

  // Find special elements
  const formTitle = allElements.find((el) => el.elementType === "form-title");
  const submitButton = allElements.find((el) => el.elementType === "submit-button");
  const cancelButton = allElements.find((el) => el.elementType === "cancel-button");

  // Generate code suggestions
  const suggestedCode = generateFormCode(fieldGroups, fieldsets, formTitle, submitButton);

  return {
    isForm,
    confidence: formConfidence,
    formTitle,
    elements: allElements,
    fieldGroups,
    fieldsets,
    submitButton,
    cancelButton,
    labelAssociations,
    suggestedCode,
  };
}

/**
 * Quick check if a frame likely contains a form
 */
export function isLikelyForm(frameNode: FigmaNode): boolean {
  const elements: DetectedFormElement[] = [];
  traverseAndDetect(frameNode, elements, extractBounds(frameNode));

  const inputCount = elements.filter((el) => isInputElement(el.elementType)).length;
  const hasSubmitButton = elements.some((el) => el.elementType === "submit-button");

  return inputCount >= 1 || (inputCount >= 1 && hasSubmitButton);
}

// ============================================================================
// Element Detection
// ============================================================================

/**
 * Recursively traverse nodes and detect form elements
 */
function traverseAndDetect(
  node: FigmaNode,
  elements: DetectedFormElement[],
  parentBounds: BoundingBox,
  depth: number = 0
): void {
  const bounds = extractBounds(node);

  // Detect element type
  const detection = detectFormElement(node, bounds, parentBounds);
  if (detection && detection.elementType !== "unknown") {
    elements.push(detection);
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      traverseAndDetect(child, elements, bounds, depth + 1);
    }
  }
}

/**
 * Detect what type of form element a node represents
 */
function detectFormElement(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox
): DetectedFormElement | null {
  if (!bounds || bounds.width === 0 || bounds.height === 0) {
    return null;
  }

  const name = node.name.toLowerCase();
  const type = node.type;

  // Score different element types
  const scores: Array<{ type: FormElementType; score: number; inputType?: HTMLInputType }> = [];

  // Check for text nodes (labels, helper text, error messages)
  if (type === "TEXT") {
    const textScores = scoreTextElement(node, name, bounds);
    scores.push(...textScores);
  }

  // Check for input-like elements (rectangles with specific properties)
  if (type === "RECTANGLE" || type === "FRAME" || type === "INSTANCE" || type === "COMPONENT") {
    const inputScores = scoreInputElement(node, name, bounds);
    scores.push(...inputScores);
  }

  // Check for button-like elements
  if (type === "FRAME" || type === "INSTANCE" || type === "COMPONENT" || type === "RECTANGLE") {
    const buttonScores = scoreButtonElement(node, name, bounds);
    scores.push(...buttonScores);
  }

  // Find highest scoring element type
  if (scores.length === 0) {
    return null;
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best.score < 0.3) {
    return null;
  }

  return {
    nodeId: node.id,
    nodeName: node.name,
    elementType: best.type,
    confidence: Math.min(best.score, 1),
    bounds,
    textContent: extractTextContent(node),
    inputType: best.inputType,
    isRequired: detectRequiredField(node, name),
    placeholder: extractPlaceholder(node),
  };
}

/**
 * Score text element types
 */
function scoreTextElement(
  node: FigmaNode,
  name: string,
  bounds: BoundingBox
): Array<{ type: FormElementType; score: number }> {
  const scores: Array<{ type: FormElementType; score: number }> = [];

  // Check for label
  if (matchesKeywords(name, ELEMENT_KEYWORDS.label) || isLikelyLabel(node, bounds)) {
    scores.push({ type: "label", score: 0.8 });
  }

  // Check for error message
  if (matchesKeywords(name, ELEMENT_KEYWORDS["error-message"]) || hasErrorStyling(node)) {
    scores.push({ type: "error-message", score: 0.9 });
  }

  // Check for helper text
  if (matchesKeywords(name, ELEMENT_KEYWORDS["helper-text"]) || isLikelyHelperText(node, bounds)) {
    scores.push({ type: "helper-text", score: 0.7 });
  }

  // Check for form title (larger text at top)
  if (matchesKeywords(name, ELEMENT_KEYWORDS["form-title"]) || isLikelyFormTitle(node, bounds)) {
    scores.push({ type: "form-title", score: 0.6 });
  }

  // Check for fieldset legend
  if (matchesKeywords(name, ELEMENT_KEYWORDS["fieldset-legend"])) {
    scores.push({ type: "fieldset-legend", score: 0.7 });
  }

  return scores;
}

/**
 * Score input element types
 */
function scoreInputElement(
  node: FigmaNode,
  name: string,
  bounds: BoundingBox
): Array<{ type: FormElementType; score: number; inputType?: HTMLInputType }> {
  const scores: Array<{ type: FormElementType; score: number; inputType?: HTMLInputType }> = [];
  const aspectRatio = bounds.width / bounds.height;

  // Check for checkbox/radio (small, square-ish)
  if (bounds.width <= FORM_THRESHOLDS.CHECKBOX_MAX_WIDTH && aspectRatio >= 0.7 && aspectRatio <= 1.5) {
    if (matchesKeywords(name, ELEMENT_KEYWORDS.checkbox)) {
      scores.push({ type: "checkbox", score: 0.9, inputType: "checkbox" });
    }
    if (matchesKeywords(name, ELEMENT_KEYWORDS.radio)) {
      scores.push({ type: "radio", score: 0.9, inputType: "radio" });
    }
    // Generic small square is likely checkbox
    scores.push({ type: "checkbox", score: 0.5, inputType: "checkbox" });
  }

  // Check for toggle/switch
  if (matchesKeywords(name, ELEMENT_KEYWORDS.toggle) || isLikelyToggle(node, bounds)) {
    scores.push({ type: "toggle", score: 0.85, inputType: "checkbox" });
  }

  // Check for select/dropdown
  if (matchesKeywords(name, ELEMENT_KEYWORDS.select) || hasDropdownIndicator(node)) {
    scores.push({ type: "select", score: 0.85 });
  }

  // Check for textarea (taller input area)
  if (bounds.height >= FORM_THRESHOLDS.TEXTAREA_MIN_HEIGHT || matchesKeywords(name, ELEMENT_KEYWORDS.textarea)) {
    scores.push({ type: "textarea", score: 0.8 });
  }

  // Check for specific input types by keywords
  if (matchesKeywords(name, ELEMENT_KEYWORDS["email-input"])) {
    scores.push({ type: "email-input", score: 0.9, inputType: "email" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["password-input"])) {
    scores.push({ type: "password-input", score: 0.9, inputType: "password" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["tel-input"])) {
    scores.push({ type: "tel-input", score: 0.9, inputType: "tel" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["url-input"])) {
    scores.push({ type: "url-input", score: 0.9, inputType: "url" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["number-input"])) {
    scores.push({ type: "number-input", score: 0.9, inputType: "number" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["search-input"])) {
    scores.push({ type: "search-input", score: 0.9, inputType: "search" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["date-input"])) {
    scores.push({ type: "date-input", score: 0.9, inputType: "date" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["time-input"])) {
    scores.push({ type: "time-input", score: 0.9, inputType: "time" });
  }
  if (matchesKeywords(name, ELEMENT_KEYWORDS["file-input"])) {
    scores.push({ type: "file-input", score: 0.9, inputType: "file" });
  }

  // Generic text input detection based on shape
  if (
    bounds.height <= FORM_THRESHOLDS.INPUT_MAX_HEIGHT &&
    aspectRatio >= FORM_THRESHOLDS.INPUT_TYPICAL_ASPECT_RATIO_MIN &&
    (matchesKeywords(name, ELEMENT_KEYWORDS["text-input"]) || looksLikeInputField(node, bounds))
  ) {
    scores.push({ type: "text-input", score: 0.6, inputType: "text" });
  }

  return scores;
}

/**
 * Score button element types
 */
function scoreButtonElement(
  node: FigmaNode,
  name: string,
  bounds: BoundingBox
): Array<{ type: FormElementType; score: number }> {
  const scores: Array<{ type: FormElementType; score: number }> = [];
  const aspectRatio = bounds.width / bounds.height;

  // Check aspect ratio is button-like
  const isButtonShaped =
    aspectRatio >= FORM_THRESHOLDS.BUTTON_ASPECT_RATIO_MIN &&
    aspectRatio <= FORM_THRESHOLDS.BUTTON_ASPECT_RATIO_MAX;

  if (!isButtonShaped && !name.includes("button") && !name.includes("btn")) {
    return scores;
  }

  // Check for submit button
  if (matchesKeywords(name, ELEMENT_KEYWORDS["submit-button"])) {
    scores.push({ type: "submit-button", score: 0.95 });
  }

  // Check for reset button
  if (matchesKeywords(name, ELEMENT_KEYWORDS["reset-button"])) {
    scores.push({ type: "reset-button", score: 0.9 });
  }

  // Check for cancel button
  if (matchesKeywords(name, ELEMENT_KEYWORDS["cancel-button"])) {
    scores.push({ type: "cancel-button", score: 0.9 });
  }

  // Generic button detection - if it has "button" or "btn" in name
  if ((name.includes("button") || name.includes("btn")) && scores.length === 0) {
    scores.push({ type: "submit-button", score: 0.5 });
  }

  return scores;
}

// ============================================================================
// Label Association Detection
// ============================================================================

/**
 * Detect associations between labels and their input fields
 */
function detectLabelAssociations(elements: DetectedFormElement[]): LabelInputAssociation[] {
  const associations: LabelInputAssociation[] = [];
  const labels = elements.filter((el) => el.elementType === "label");
  const inputs = elements.filter((el) => isInputElement(el.elementType));

  for (const label of labels) {
    let bestMatch: { input: DetectedFormElement; type: LabelInputAssociation["associationType"]; confidence: number } | null = null;
    let bestScore = 0;

    for (const input of inputs) {
      const association = calculateLabelInputAssociation(label, input);
      if (association && association.confidence > bestScore) {
        bestScore = association.confidence;
        bestMatch = { input, type: association.type, confidence: association.confidence };
      }
    }

    if (bestMatch && bestMatch.confidence > 0.3) {
      associations.push({
        labelElement: label,
        inputElement: bestMatch.input,
        associationType: bestMatch.type,
        confidence: bestMatch.confidence,
      });
    }
  }

  return associations;
}

/**
 * Calculate association between a label and input based on position
 */
function calculateLabelInputAssociation(
  label: DetectedFormElement,
  input: DetectedFormElement
): { type: LabelInputAssociation["associationType"]; confidence: number } | null {
  const labelBounds = label.bounds;
  const inputBounds = input.bounds;

  // Check if label is above input (most common pattern)
  const labelBottom = labelBounds.y + labelBounds.height;
  const verticalGap = inputBounds.y - labelBottom;

  if (
    verticalGap >= 0 &&
    verticalGap <= FORM_THRESHOLDS.LABEL_INPUT_MAX_VERTICAL_GAP &&
    hasHorizontalOverlap(labelBounds, inputBounds)
  ) {
    const horizontalOverlap = calculateHorizontalOverlap(labelBounds, inputBounds);
    const confidence = Math.min(0.9, 0.7 + horizontalOverlap * 0.3 - verticalGap * 0.01);
    return { type: "above", confidence };
  }

  // Check if label is to the left of input
  const labelRight = labelBounds.x + labelBounds.width;
  const horizontalGap = inputBounds.x - labelRight;

  if (
    horizontalGap >= 0 &&
    horizontalGap <= FORM_THRESHOLDS.LABEL_INPUT_MAX_HORIZONTAL_GAP &&
    hasVerticalOverlap(labelBounds, inputBounds)
  ) {
    const verticalOverlap = calculateVerticalOverlap(labelBounds, inputBounds);
    const confidence = Math.min(0.85, 0.6 + verticalOverlap * 0.3 - horizontalGap * 0.01);
    return { type: "left", confidence };
  }

  // Check if label is to the right (less common)
  const inputRight = inputBounds.x + inputBounds.width;
  const rightGap = labelBounds.x - inputRight;

  if (
    rightGap >= 0 &&
    rightGap <= FORM_THRESHOLDS.LABEL_INPUT_MAX_HORIZONTAL_GAP &&
    hasVerticalOverlap(labelBounds, inputBounds)
  ) {
    const verticalOverlap = calculateVerticalOverlap(labelBounds, inputBounds);
    const confidence = Math.min(0.7, 0.5 + verticalOverlap * 0.3 - rightGap * 0.01);
    return { type: "right", confidence };
  }

  // Check if label is inside input (floating label pattern)
  if (isInsideBounds(labelBounds, inputBounds)) {
    return { type: "floating", confidence: 0.8 };
  }

  return null;
}

// ============================================================================
// Field Grouping
// ============================================================================

/**
 * Create field groups from detected elements and associations
 */
function createFieldGroups(
  elements: DetectedFormElement[],
  associations: LabelInputAssociation[]
): FormFieldGroup[] {
  const groups: FormFieldGroup[] = [];
  const usedInputIds = new Set<string>();
  const usedLabelIds = new Set<string>();

  // Create groups from label-input associations
  for (const association of associations) {
    const input = association.inputElement;
    const label = association.labelElement;

    if (usedInputIds.has(input.nodeId)) continue;

    usedInputIds.add(input.nodeId);
    usedLabelIds.add(label.nodeId);

    // Find helper text and error messages near this input
    const helperText = findNearbyElement(input, elements, "helper-text");
    const errorMessage = findNearbyElement(input, elements, "error-message");

    groups.push({
      id: `field-${input.nodeId}`,
      label,
      input,
      helperText,
      errorMessage,
      isRequired: input.isRequired || false,
      fieldName: deriveFieldName(label?.textContent || input.nodeName),
    });
  }

  // Create groups for inputs without labels
  const inputs = elements.filter((el) => isInputElement(el.elementType));
  for (const input of inputs) {
    if (usedInputIds.has(input.nodeId)) continue;

    usedInputIds.add(input.nodeId);

    const helperText = findNearbyElement(input, elements, "helper-text");
    const errorMessage = findNearbyElement(input, elements, "error-message");

    groups.push({
      id: `field-${input.nodeId}`,
      input,
      helperText,
      errorMessage,
      isRequired: input.isRequired || false,
      fieldName: deriveFieldName(input.nodeName),
    });
  }

  // Sort groups by vertical position
  groups.sort((a, b) => {
    const aY = a.label?.bounds.y ?? a.input.bounds.y;
    const bY = b.label?.bounds.y ?? b.input.bounds.y;
    return aY - bY;
  });

  return groups;
}

/**
 * Find nearby element of a specific type
 */
function findNearbyElement(
  reference: DetectedFormElement,
  elements: DetectedFormElement[],
  targetType: FormElementType
): DetectedFormElement | undefined {
  const candidates = elements.filter((el) => el.elementType === targetType);
  let bestMatch: DetectedFormElement | undefined;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = calculateDistance(reference.bounds, candidate.bounds);
    if (distance < bestDistance && distance < FORM_THRESHOLDS.FIELD_GROUP_MAX_GAP) {
      // Check if candidate is below the input (most common for helper/error)
      if (candidate.bounds.y >= reference.bounds.y) {
        bestDistance = distance;
        bestMatch = candidate;
      }
    }
  }

  return bestMatch;
}

// ============================================================================
// Fieldset Detection
// ============================================================================

/**
 * Detect fieldset groupings from field groups
 */
function detectFieldsets(
  fieldGroups: FormFieldGroup[],
  elements: DetectedFormElement[]
): FieldsetGroup[] {
  const fieldsets: FieldsetGroup[] = [];
  const legends = elements.filter((el) => el.elementType === "fieldset-legend");

  // Group fields by proximity and visual grouping
  const clusters = clusterFieldGroups(fieldGroups);

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (cluster.length === 0) continue;

    // Find legend for this cluster
    const clusterBounds = calculateClusterBounds(cluster);
    const legend = findLegendForCluster(legends, clusterBounds);

    fieldsets.push({
      id: `fieldset-${i}`,
      legend,
      fields: cluster,
      bounds: clusterBounds,
      suggestedName: legend?.textContent || `section-${i + 1}`,
    });
  }

  return fieldsets;
}

/**
 * Cluster field groups by proximity
 */
function clusterFieldGroups(fieldGroups: FormFieldGroup[]): FormFieldGroup[][] {
  if (fieldGroups.length === 0) return [];
  if (fieldGroups.length === 1) return [fieldGroups];

  const clusters: FormFieldGroup[][] = [];
  let currentCluster: FormFieldGroup[] = [fieldGroups[0]];

  for (let i = 1; i < fieldGroups.length; i++) {
    const current = fieldGroups[i];
    const previous = fieldGroups[i - 1];

    const currentTop = current.label?.bounds.y ?? current.input.bounds.y;
    const previousBottom =
      (previous.input.bounds.y + previous.input.bounds.height);

    const gap = currentTop - previousBottom;

    // Large gap indicates new fieldset
    if (gap > FORM_THRESHOLDS.FIELD_GROUP_MAX_GAP * 1.5) {
      clusters.push(currentCluster);
      currentCluster = [current];
    } else {
      currentCluster.push(current);
    }
  }

  clusters.push(currentCluster);
  return clusters;
}

/**
 * Calculate bounding box for a cluster of fields
 */
function calculateClusterBounds(cluster: FormFieldGroup[]): BoundingBox {
  const allBounds = cluster.flatMap((group) => [
    group.label?.bounds,
    group.input.bounds,
    group.helperText?.bounds,
    group.errorMessage?.bounds,
  ].filter(Boolean) as BoundingBox[]);

  return {
    x: Math.min(...allBounds.map((b) => b.x)),
    y: Math.min(...allBounds.map((b) => b.y)),
    width: Math.max(...allBounds.map((b) => b.x + b.width)) - Math.min(...allBounds.map((b) => b.x)),
    height: Math.max(...allBounds.map((b) => b.y + b.height)) - Math.min(...allBounds.map((b) => b.y)),
  };
}

/**
 * Find legend element for a fieldset cluster
 */
function findLegendForCluster(
  legends: DetectedFormElement[],
  clusterBounds: BoundingBox
): DetectedFormElement | undefined {
  for (const legend of legends) {
    // Legend should be above or at the top of the cluster
    if (
      legend.bounds.y <= clusterBounds.y &&
      legend.bounds.y + legend.bounds.height >= clusterBounds.y - 50 &&
      hasHorizontalOverlap(legend.bounds, clusterBounds)
    ) {
      return legend;
    }
  }
  return undefined;
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate form code from analysis results
 */
function generateFormCode(
  fieldGroups: FormFieldGroup[],
  fieldsets: FieldsetGroup[],
  formTitle?: DetectedFormElement,
  submitButton?: DetectedFormElement
): FormCodeSuggestion {
  const jsx = generateJSX(fieldGroups, fieldsets, formTitle, submitButton);
  const zodSchema = generateZodSchema(fieldGroups);
  const tailwindClasses = generateTailwindClasses(fieldGroups);
  const ariaAttributes = generateAriaAttributes(fieldGroups);

  return {
    jsx,
    zodSchema,
    tailwindClasses,
    ariaAttributes,
  };
}

/**
 * Generate JSX code for the form
 */
function generateJSX(
  fieldGroups: FormFieldGroup[],
  fieldsets: FieldsetGroup[],
  formTitle?: DetectedFormElement,
  submitButton?: DetectedFormElement
): string {
  const lines: string[] = [];
  const indent = "  ";

  lines.push('<Form {...form}>');
  lines.push(`${indent}<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">`);

  // Add form title if present
  if (formTitle) {
    lines.push(`${indent}${indent}<h2 className="text-2xl font-semibold">${formTitle.textContent || "Form"}</h2>`);
  }

  // Generate fields within fieldsets or directly
  if (fieldsets.length > 1) {
    for (const fieldset of fieldsets) {
      lines.push(`${indent}${indent}<fieldset className="space-y-4 p-4 border rounded-lg">`);
      if (fieldset.legend) {
        lines.push(`${indent}${indent}${indent}<legend className="text-lg font-medium px-2">${fieldset.legend.textContent || fieldset.suggestedName}</legend>`);
      }
      for (const field of fieldset.fields) {
        lines.push(generateFieldJSX(field, 3));
      }
      lines.push(`${indent}${indent}</fieldset>`);
    }
  } else {
    // No fieldsets, just render fields
    for (const field of fieldGroups) {
      lines.push(generateFieldJSX(field, 2));
    }
  }

  // Add submit button
  const buttonText = submitButton?.textContent || "Submit";
  lines.push(`${indent}${indent}<Button type="submit" className="w-full">${buttonText}</Button>`);

  lines.push(`${indent}</form>`);
  lines.push('</Form>');

  return lines.join("\n");
}

/**
 * Generate JSX for a single form field
 */
function generateFieldJSX(field: FormFieldGroup, indentLevel: number): string {
  const indent = "  ".repeat(indentLevel);
  const lines: string[] = [];
  const fieldName = field.fieldName;

  lines.push(`${indent}<FormField`);
  lines.push(`${indent}  control={form.control}`);
  lines.push(`${indent}  name="${fieldName}"`);
  lines.push(`${indent}  render={({ field }) => (`);
  lines.push(`${indent}    <FormItem>`);

  // Label
  if (field.label) {
    const labelText = field.label.textContent || fieldName;
    const requiredMark = field.isRequired ? ' <span className="text-destructive">*</span>' : "";
    lines.push(`${indent}      <FormLabel>${labelText}${requiredMark}</FormLabel>`);
  }

  // Input control based on type
  lines.push(`${indent}      <FormControl>`);
  lines.push(generateInputJSX(field.input, indentLevel + 4));
  lines.push(`${indent}      </FormControl>`);

  // Helper text
  if (field.helperText) {
    lines.push(`${indent}      <FormDescription>${field.helperText.textContent || ""}</FormDescription>`);
  }

  // Error message placeholder
  lines.push(`${indent}      <FormMessage />`);

  lines.push(`${indent}    </FormItem>`);
  lines.push(`${indent}  )}`);
  lines.push(`${indent}/>`);

  return lines.join("\n");
}

/**
 * Generate JSX for input element
 */
function generateInputJSX(input: DetectedFormElement, indentLevel: number): string {
  const indent = "  ".repeat(indentLevel);

  switch (input.elementType) {
    case "textarea":
      return `${indent}<Textarea placeholder="${input.placeholder || ""}" {...field} />`;

    case "select":
      return `${indent}<Select onValueChange={field.onChange} defaultValue={field.value}>
${indent}  <SelectTrigger>
${indent}    <SelectValue placeholder="${input.placeholder || "Select..."}" />
${indent}  </SelectTrigger>
${indent}  <SelectContent>
${indent}    {/* Add SelectItem options */}
${indent}  </SelectContent>
${indent}</Select>`;

    case "checkbox":
      return `${indent}<Checkbox checked={field.value} onCheckedChange={field.onChange} />`;

    case "toggle":
      return `${indent}<Switch checked={field.value} onCheckedChange={field.onChange} />`;

    default:
      const inputType = input.inputType || "text";
      return `${indent}<Input type="${inputType}" placeholder="${input.placeholder || ""}" {...field} />`;
  }
}

/**
 * Generate Zod validation schema
 */
function generateZodSchema(fieldGroups: FormFieldGroup[]): string {
  const lines: string[] = [];
  lines.push("const formSchema = z.object({");

  for (const field of fieldGroups) {
    const fieldName = field.fieldName;
    const validation = getZodValidation(field);
    lines.push(`  ${fieldName}: ${validation},`);
  }

  lines.push("});");
  return lines.join("\n");
}

/**
 * Get Zod validation for a field
 */
function getZodValidation(field: FormFieldGroup): string {
  const input = field.input;
  let validation = "z.string()";

  switch (input.elementType) {
    case "email-input":
      validation = "z.string().email()";
      break;
    case "password-input":
      validation = "z.string().min(8)";
      break;
    case "url-input":
      validation = "z.string().url()";
      break;
    case "number-input":
      validation = "z.number()";
      break;
    case "checkbox":
    case "toggle":
      validation = "z.boolean()";
      break;
    case "date-input":
      validation = "z.date()";
      break;
  }

  if (!field.isRequired && input.elementType !== "checkbox" && input.elementType !== "toggle") {
    validation += ".optional()";
  }

  return validation;
}

/**
 * Generate Tailwind classes for form styling
 */
function generateTailwindClasses(fieldGroups: FormFieldGroup[]): string[] {
  return [
    "space-y-6",
    "max-w-md",
    "mx-auto",
    "p-6",
  ];
}

/**
 * Generate ARIA attributes for accessibility
 */
function generateAriaAttributes(fieldGroups: FormFieldGroup[]): Record<string, string> {
  const attrs: Record<string, string> = {};

  for (const field of fieldGroups) {
    if (field.isRequired) {
      attrs[`${field.fieldName}-aria-required`] = "true";
    }
    if (field.helperText) {
      attrs[`${field.fieldName}-aria-describedby`] = `${field.fieldName}-description`;
    }
  }

  return attrs;
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractBounds(node: FigmaNode): BoundingBox {
  const bbox = node.absoluteBoundingBox;
  if (!bbox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
  };
}

function matchesKeywords(name: string, keywords: string[]): boolean {
  const lowerName = name.toLowerCase();
  return keywords.some((keyword) => lowerName.includes(keyword));
}

function isInputElement(type: FormElementType): boolean {
  const inputTypes: FormElementType[] = [
    "text-input",
    "email-input",
    "password-input",
    "number-input",
    "tel-input",
    "url-input",
    "search-input",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "toggle",
    "date-input",
    "time-input",
    "file-input",
  ];
  return inputTypes.includes(type);
}

function extractTextContent(node: FigmaNode): string | undefined {
  // For text nodes, the name often contains the text content
  // In a real implementation, we'd access node.characters
  if (node.type === "TEXT") {
    return node.name;
  }
  return undefined;
}

function deriveFieldName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_") || "field";
}

function calculateFormConfidence(elements: DetectedFormElement[]): number {
  const inputCount = elements.filter((el) => isInputElement(el.elementType)).length;
  const labelCount = elements.filter((el) => el.elementType === "label").length;
  const hasSubmit = elements.some((el) => el.elementType === "submit-button");

  let confidence = 0;
  confidence += Math.min(inputCount * 0.2, 0.6);
  confidence += Math.min(labelCount * 0.1, 0.2);
  confidence += hasSubmit ? 0.2 : 0;

  return Math.min(confidence, 1);
}

function detectRequiredField(node: FigmaNode, name: string): boolean {
  return name.includes("required") || name.includes("*") || name.includes("mandatory");
}

function extractPlaceholder(node: FigmaNode): string | undefined {
  const name = node.name.toLowerCase();
  if (name.includes("placeholder")) {
    return node.name.replace(/placeholder[:\s-]*/i, "");
  }
  return undefined;
}

function isLikelyLabel(node: FigmaNode, bounds: BoundingBox): boolean {
  // Labels are typically short text with small height
  return bounds.height < 30 && bounds.width < 300;
}

function hasErrorStyling(node: FigmaNode): boolean {
  // Check for red color in fills
  if (node.fills && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      const f = fill as { color?: { r: number; g: number; b: number } };
      if (f.color && f.color.r > 0.8 && f.color.g < 0.3 && f.color.b < 0.3) {
        return true;
      }
    }
  }
  return false;
}

function isLikelyHelperText(node: FigmaNode, bounds: BoundingBox): boolean {
  // Helper text is typically small and gray
  return bounds.height < 25;
}

function isLikelyFormTitle(node: FigmaNode, bounds: BoundingBox): boolean {
  // Form titles are typically larger text
  return bounds.height > 25 && bounds.height < 60;
}

function isLikelyToggle(node: FigmaNode, bounds: BoundingBox): boolean {
  const aspectRatio = bounds.width / bounds.height;
  // Toggles are typically wide and short (pill shape)
  return aspectRatio >= 1.5 && aspectRatio <= 3 && bounds.height <= 40;
}

function hasDropdownIndicator(node: FigmaNode): boolean {
  // Check if node has children that look like dropdown arrow
  if (node.children) {
    for (const child of node.children) {
      const name = child.name.toLowerCase();
      if (name.includes("arrow") || name.includes("chevron") || name.includes("dropdown") || name.includes("caret")) {
        return true;
      }
    }
  }
  return false;
}

function looksLikeInputField(node: FigmaNode, bounds: BoundingBox): boolean {
  // Check for rounded corners (typical for inputs)
  if (node.cornerRadius && node.cornerRadius >= 2 && node.cornerRadius <= 12) {
    return true;
  }
  // Check for border
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    return true;
  }
  return false;
}

function hasHorizontalOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

function hasVerticalOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.y < b.y + b.height && a.y + a.height > b.y;
}

function calculateHorizontalOverlap(a: BoundingBox, b: BoundingBox): number {
  const overlapStart = Math.max(a.x, b.x);
  const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
  const overlap = Math.max(0, overlapEnd - overlapStart);
  const minWidth = Math.min(a.width, b.width);
  return minWidth > 0 ? overlap / minWidth : 0;
}

function calculateVerticalOverlap(a: BoundingBox, b: BoundingBox): number {
  const overlapStart = Math.max(a.y, b.y);
  const overlapEnd = Math.min(a.y + a.height, b.y + b.height);
  const overlap = Math.max(0, overlapEnd - overlapStart);
  const minHeight = Math.min(a.height, b.height);
  return minHeight > 0 ? overlap / minHeight : 0;
}

function isInsideBounds(inner: BoundingBox, outer: BoundingBox): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function calculateDistance(a: BoundingBox, b: BoundingBox): number {
  const aCenterX = a.x + a.width / 2;
  const aCenterY = a.y + a.height / 2;
  const bCenterX = b.x + b.width / 2;
  const bCenterY = b.y + b.height / 2;
  return Math.sqrt(Math.pow(aCenterX - bCenterX, 2) + Math.pow(aCenterY - bCenterY, 2));
}

