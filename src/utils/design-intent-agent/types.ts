/**
 * Design Intent Agent Types
 *
 * Type definitions for the AI agent specialized in understanding design intent.
 * Supports visual hierarchy analysis, information architecture, user flow,
 * and natural language queries about design.
 */

import type { BoundingBox, SemanticRole, LayoutPattern } from "../layout-analyzer";

// ============================================================================
// Core Analysis Types
// ============================================================================

/**
 * Result of comprehensive design intent analysis
 */
export interface DesignIntentAnalysis {
  /** Unique ID for this analysis */
  analysisId: string;
  /** Timestamp of analysis */
  timestamp: Date;
  /** Source design information */
  sourceDesign: DesignSource;
  /** Visual hierarchy analysis */
  visualHierarchy: VisualHierarchyAnalysis;
  /** Information architecture analysis */
  informationArchitecture: InformationArchitectureAnalysis;
  /** User flow analysis */
  userFlow: UserFlowAnalysis;
  /** Semantic understanding of the design */
  semanticUnderstanding: SemanticUnderstanding;
  /** Design patterns detected */
  designPatterns: DesignPattern[];
  /** Accessibility considerations */
  accessibilityInsights: AccessibilityInsight[];
  /** Overall design summary */
  summary: DesignSummary;
  /** Confidence score for the analysis (0-1) */
  confidence: number;
}

/**
 * Source design information
 */
export interface DesignSource {
  /** Node ID of the analyzed design */
  nodeId: string;
  /** Name of the design */
  name: string;
  /** Type of design (page, screen, component, etc.) */
  designType: DesignType;
  /** Dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Platform inference (web, mobile, tablet, desktop app) */
  platform: Platform;
  /** Dark mode / light mode detection */
  colorScheme: ColorScheme;
}

export type DesignType =
  | "page"
  | "screen"
  | "component"
  | "modal"
  | "form"
  | "dashboard"
  | "landing"
  | "settings"
  | "profile"
  | "list-view"
  | "detail-view"
  | "empty-state"
  | "error-state"
  | "onboarding"
  | "unknown";

export type Platform =
  | "web-desktop"
  | "web-mobile"
  | "ios"
  | "android"
  | "tablet"
  | "desktop-app"
  | "unknown";

export type ColorScheme = "light" | "dark" | "mixed" | "unknown";

// ============================================================================
// Visual Hierarchy Types
// ============================================================================

/**
 * Analysis of visual hierarchy in the design
 */
export interface VisualHierarchyAnalysis {
  /** Elements ordered by visual importance */
  importanceRanking: VisualElement[];
  /** Primary focal points */
  focalPoints: FocalPoint[];
  /** Visual groupings detected */
  groupings: VisualGroup[];
  /** Flow of visual attention */
  attentionFlow: AttentionFlow;
  /** Typography hierarchy */
  typographyHierarchy: TypographyLevel[];
  /** Color hierarchy and usage */
  colorHierarchy: ColorUsage[];
  /** Spacing and rhythm analysis */
  spacingAnalysis: SpacingAnalysis;
}

/**
 * A visual element with importance scoring
 */
export interface VisualElement {
  /** Node ID */
  nodeId: string;
  /** Node name */
  name: string;
  /** Bounding box */
  bounds: BoundingBox;
  /** Importance score (0-1, higher = more important) */
  importanceScore: number;
  /** Factors contributing to importance */
  importanceFactors: ImportanceFactor[];
  /** Visual weight (size, color, contrast) */
  visualWeight: number;
  /** Type of element */
  elementType: ElementType;
  /** Semantic role */
  semanticRole: SemanticRole;
}

/**
 * Factors that contribute to visual importance
 */
export interface ImportanceFactor {
  factor: ImportanceFactorType;
  score: number;
  description: string;
}

export type ImportanceFactorType =
  | "size"
  | "position"
  | "color-contrast"
  | "typography-weight"
  | "isolation"
  | "animation"
  | "iconography"
  | "whitespace";

export type ElementType =
  | "heading"
  | "subheading"
  | "body-text"
  | "cta-button"
  | "secondary-button"
  | "link"
  | "icon"
  | "image"
  | "illustration"
  | "input"
  | "card"
  | "navigation"
  | "badge"
  | "avatar"
  | "divider"
  | "container"
  | "unknown";

/**
 * A primary focal point in the design
 */
export interface FocalPoint {
  /** Node ID */
  nodeId: string;
  /** Position */
  position: { x: number; y: number };
  /** Strength of focal point (0-1) */
  strength: number;
  /** Why this is a focal point */
  reason: string;
  /** Order in visual scanning (1 = first noticed) */
  scanOrder: number;
}

/**
 * A visual grouping of elements
 */
export interface VisualGroup {
  /** Group ID */
  id: string;
  /** Group name (inferred) */
  name: string;
  /** Node IDs in this group */
  nodeIds: string[];
  /** Grouping type */
  groupingType: GroupingType;
  /** Bounding box of the group */
  bounds: BoundingBox;
  /** Purpose of this grouping */
  purpose: string;
  /** Relationship between elements in the group */
  relationship: ElementRelationship;
}

export type GroupingType =
  | "proximity"
  | "similarity"
  | "enclosure"
  | "alignment"
  | "connection"
  | "common-region";

export type ElementRelationship =
  | "equals"
  | "parent-child"
  | "siblings"
  | "sequence"
  | "comparison"
  | "complementary"
  | "independent";

/**
 * Flow of visual attention through the design
 */
export interface AttentionFlow {
  /** Scanning pattern detected */
  pattern: ScanPattern;
  /** Ordered path of attention */
  path: AttentionPathPoint[];
  /** Areas of high attention density */
  hotspots: Hotspot[];
  /** Dead zones (areas likely to be overlooked) */
  deadZones: DeadZone[];
}

export type ScanPattern =
  | "f-pattern"
  | "z-pattern"
  | "layer-cake"
  | "spotted"
  | "commitment"
  | "exhaustive"
  | "bypassing";

export interface AttentionPathPoint {
  order: number;
  nodeId: string;
  position: { x: number; y: number };
  dwellTime: "short" | "medium" | "long";
}

export interface Hotspot {
  bounds: BoundingBox;
  intensity: number;
  reason: string;
}

export interface DeadZone {
  bounds: BoundingBox;
  reason: string;
  suggestion: string;
}

/**
 * Typography hierarchy level
 */
export interface TypographyLevel {
  level: number;
  role: "display" | "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "label" | "button";
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  color: string;
  usage: string;
  nodeIds: string[];
}

/**
 * Color usage in the design
 */
export interface ColorUsage {
  color: string;
  role: ColorRole;
  frequency: number;
  usage: string[];
  nodeIds: string[];
}

export type ColorRole =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "surface"
  | "text-primary"
  | "text-secondary"
  | "border"
  | "error"
  | "success"
  | "warning"
  | "info";

/**
 * Spacing and rhythm analysis
 */
export interface SpacingAnalysis {
  /** Consistent spacing values used */
  spacingScale: number[];
  /** Rhythm quality score (0-1) */
  rhythmScore: number;
  /** Issues with spacing */
  spacingIssues: SpacingIssue[];
  /** Grid system detected */
  gridSystem?: GridSystem;
}

export interface SpacingIssue {
  type: "inconsistent" | "too-tight" | "too-loose" | "unbalanced";
  nodeIds: string[];
  description: string;
  suggestion: string;
}

export interface GridSystem {
  type: "column" | "modular" | "baseline" | "custom";
  columns?: number;
  gutter?: number;
  margin?: number;
}

// ============================================================================
// Information Architecture Types
// ============================================================================

/**
 * Information architecture analysis
 */
export interface InformationArchitectureAnalysis {
  /** Content structure */
  contentStructure: ContentSection[];
  /** Navigation structure */
  navigationStructure: NavigationAnalysis;
  /** Data hierarchy */
  dataHierarchy: DataHierarchyNode;
  /** Content types detected */
  contentTypes: ContentType[];
  /** Labels and microcopy analysis */
  labelAnalysis: LabelAnalysis;
  /** Information density assessment */
  informationDensity: InformationDensity;
}

/**
 * A section of content in the design
 */
export interface ContentSection {
  /** Section ID */
  id: string;
  /** Section name (inferred) */
  name: string;
  /** Node IDs in this section */
  nodeIds: string[];
  /** Purpose of this section */
  purpose: string;
  /** Priority (1 = highest) */
  priority: number;
  /** Content type */
  contentType: ContentTypeEnum;
  /** Sub-sections */
  subSections: ContentSection[];
  /** Relationship to other sections */
  relationships: SectionRelationship[];
}

export type ContentTypeEnum =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "faq"
  | "form"
  | "navigation"
  | "footer"
  | "sidebar"
  | "content"
  | "media"
  | "social-proof"
  | "data-display"
  | "actions"
  | "metadata"
  | "unknown";

export interface SectionRelationship {
  targetSectionId: string;
  relationshipType: "precedes" | "follows" | "contains" | "references" | "complements";
}

/**
 * Navigation structure analysis
 */
export interface NavigationAnalysis {
  /** Primary navigation elements */
  primaryNav: NavigationItem[];
  /** Secondary navigation elements */
  secondaryNav: NavigationItem[];
  /** Breadcrumbs detected */
  breadcrumbs?: NavigationItem[];
  /** Tab navigation */
  tabs?: NavigationItem[];
  /** Navigation depth */
  depth: number;
  /** Navigation type */
  navigationType: NavigationType;
  /** Current location indicator */
  currentLocation?: NavigationItem;
}

export interface NavigationItem {
  nodeId: string;
  label: string;
  level: number;
  isActive: boolean;
  hasChildren: boolean;
  children: NavigationItem[];
  destination?: string;
}

export type NavigationType =
  | "top-bar"
  | "sidebar"
  | "bottom-bar"
  | "hamburger"
  | "tabs"
  | "breadcrumb"
  | "pagination"
  | "mixed";

/**
 * Data hierarchy representation
 */
export interface DataHierarchyNode {
  id: string;
  name: string;
  type: "root" | "category" | "item" | "detail" | "action";
  children: DataHierarchyNode[];
  importance: number;
  metadata?: Record<string, unknown>;
}

/**
 * Content type detected in the design
 */
export interface ContentType {
  type: ContentTypeEnum;
  instances: string[];
  confidence: number;
}

/**
 * Label and microcopy analysis
 */
export interface LabelAnalysis {
  /** All labels found */
  labels: LabelInfo[];
  /** Quality assessment */
  quality: LabelQuality;
  /** Issues found */
  issues: LabelIssue[];
  /** Tone of voice */
  toneOfVoice: ToneOfVoice;
}

export interface LabelInfo {
  nodeId: string;
  text: string;
  type: LabelType;
  context: string;
}

export type LabelType =
  | "heading"
  | "button"
  | "link"
  | "input-label"
  | "placeholder"
  | "helper-text"
  | "error-message"
  | "tooltip"
  | "badge"
  | "navigation"
  | "other";

export interface LabelQuality {
  clarity: number;
  consistency: number;
  actionability: number;
  overall: number;
}

export interface LabelIssue {
  nodeId: string;
  issue: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
}

export type ToneOfVoice =
  | "formal"
  | "casual"
  | "friendly"
  | "professional"
  | "playful"
  | "technical"
  | "minimal"
  | "mixed";

/**
 * Information density assessment
 */
export interface InformationDensity {
  overall: "low" | "medium" | "high" | "very-high";
  score: number;
  perSection: Array<{
    sectionId: string;
    density: number;
  }>;
  recommendations: string[];
}

// ============================================================================
// User Flow Types
// ============================================================================

/**
 * User flow analysis
 */
export interface UserFlowAnalysis {
  /** Primary user journey through the design */
  primaryFlow: UserFlowPath;
  /** Alternative flows */
  alternativeFlows: UserFlowPath[];
  /** Entry points */
  entryPoints: FlowPoint[];
  /** Exit points */
  exitPoints: FlowPoint[];
  /** Decision points */
  decisionPoints: DecisionPoint[];
  /** Interactive elements */
  interactiveElements: InteractiveElement[];
  /** Flow friction points */
  frictionPoints: FrictionPoint[];
  /** Estimated completion time */
  estimatedCompletionTime: TimeEstimate;
}

/**
 * A user flow path through the design
 */
export interface UserFlowPath {
  /** Path ID */
  id: string;
  /** Path name */
  name: string;
  /** Steps in the flow */
  steps: FlowStep[];
  /** Flow goal */
  goal: string;
  /** Likelihood this flow is taken (0-1) */
  likelihood: number;
  /** Complexity score (0-1) */
  complexity: number;
}

/**
 * A step in a user flow
 */
export interface FlowStep {
  order: number;
  nodeId: string;
  action: UserAction;
  description: string;
  nextSteps: string[];
  isOptional: boolean;
}

export type UserAction =
  | "view"
  | "click"
  | "tap"
  | "scroll"
  | "type"
  | "select"
  | "drag"
  | "hover"
  | "swipe"
  | "wait"
  | "read"
  | "decide";

/**
 * An entry or exit point in the flow
 */
export interface FlowPoint {
  nodeId: string;
  type: "entry" | "exit";
  description: string;
  prominence: "primary" | "secondary" | "hidden";
}

/**
 * A decision point in the user flow
 */
export interface DecisionPoint {
  nodeId: string;
  question: string;
  options: DecisionOption[];
  defaultOption?: string;
  cognitiveLoad: "low" | "medium" | "high";
}

export interface DecisionOption {
  nodeId: string;
  label: string;
  outcome: string;
  isRecommended: boolean;
}

/**
 * An interactive element in the design
 */
export interface InteractiveElement {
  nodeId: string;
  name: string;
  type: InteractiveType;
  action: string;
  affordance: AffordanceLevel;
  states: ElementState[];
  feedbackType: FeedbackType;
}

export type InteractiveType =
  | "button"
  | "link"
  | "input"
  | "toggle"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "slider"
  | "tab"
  | "menu-item"
  | "card"
  | "list-item"
  | "icon-button"
  | "fab"
  | "chip";

export type AffordanceLevel = "obvious" | "discoverable" | "hidden" | "misleading";

export type ElementState = "default" | "hover" | "active" | "focused" | "disabled" | "loading" | "error" | "success";

export type FeedbackType = "visual" | "haptic" | "audio" | "none" | "multiple";

/**
 * A friction point in the user flow
 */
export interface FrictionPoint {
  nodeId: string;
  type: FrictionType;
  severity: "low" | "medium" | "high";
  description: string;
  impact: string;
  suggestion: string;
}

export type FrictionType =
  | "cognitive-overload"
  | "unclear-action"
  | "too-many-options"
  | "hidden-action"
  | "unexpected-behavior"
  | "slow-feedback"
  | "error-prone"
  | "accessibility-barrier";

/**
 * Time estimate for completing the flow
 */
export interface TimeEstimate {
  minimum: number; // seconds
  typical: number;
  maximum: number;
  breakdown: Array<{
    stepId: string;
    time: number;
  }>;
}

// ============================================================================
// Semantic Understanding Types
// ============================================================================

/**
 * Semantic understanding of the design
 */
export interface SemanticUnderstanding {
  /** Overall purpose of the design */
  purpose: DesignPurpose;
  /** Target audience */
  targetAudience: AudienceProfile;
  /** Business context */
  businessContext: BusinessContext;
  /** Key messages conveyed */
  keyMessages: KeyMessage[];
  /** Emotional tone */
  emotionalTone: EmotionalTone;
  /** Brand attributes detected */
  brandAttributes: BrandAttribute[];
  /** Domain/industry detection */
  domain: Domain;
  /** Natural language description */
  naturalDescription: string;
}

/**
 * Design purpose analysis
 */
export interface DesignPurpose {
  primaryGoal: string;
  secondaryGoals: string[];
  designType: DesignType;
  userValue: string;
  businessValue: string;
}

/**
 * Target audience profile
 */
export interface AudienceProfile {
  primaryAudience: string;
  secondaryAudiences: string[];
  technicalLevel: "novice" | "intermediate" | "expert" | "mixed";
  ageRange?: string;
  characteristics: string[];
}

/**
 * Business context
 */
export interface BusinessContext {
  industry: string;
  businessModel?: string;
  conversionGoals: string[];
  competitors?: string[];
}

/**
 * Key message in the design
 */
export interface KeyMessage {
  message: string;
  prominence: "primary" | "secondary" | "tertiary";
  nodeIds: string[];
  confidence: number;
}

/**
 * Emotional tone analysis
 */
export interface EmotionalTone {
  primary: Emotion;
  secondary: Emotion[];
  intensity: "subtle" | "moderate" | "strong";
  consistency: number;
}

export type Emotion =
  | "trust"
  | "excitement"
  | "calm"
  | "urgency"
  | "professionalism"
  | "playfulness"
  | "luxury"
  | "simplicity"
  | "innovation"
  | "warmth"
  | "authority"
  | "creativity";

/**
 * Brand attribute detected
 */
export interface BrandAttribute {
  attribute: string;
  evidence: string[];
  strength: number;
}

/**
 * Domain/industry classification
 */
export interface Domain {
  primary: string;
  secondary: string[];
  confidence: number;
}

// ============================================================================
// Design Patterns Types
// ============================================================================

/**
 * A design pattern detected in the design
 */
export interface DesignPattern {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  nodeIds: string[];
  implementation: PatternImplementation;
  bestPractices: BestPractice[];
  issues: PatternIssue[];
}

export type PatternCategory =
  | "navigation"
  | "forms"
  | "data-display"
  | "feedback"
  | "onboarding"
  | "social"
  | "e-commerce"
  | "content"
  | "mobile"
  | "layout";

export interface PatternImplementation {
  quality: "excellent" | "good" | "acceptable" | "poor";
  adherence: number;
  notes: string;
}

export interface BestPractice {
  practice: string;
  isFollowed: boolean;
  evidence: string;
}

export interface PatternIssue {
  issue: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
}

// ============================================================================
// Accessibility Types
// ============================================================================

/**
 * Accessibility insight
 */
export interface AccessibilityInsight {
  category: AccessibilityCategory;
  level: "A" | "AA" | "AAA";
  status: "pass" | "warning" | "fail" | "needs-review";
  description: string;
  affectedNodes: string[];
  recommendation?: string;
}

export type AccessibilityCategory =
  | "color-contrast"
  | "text-size"
  | "touch-target"
  | "focus-order"
  | "labels"
  | "alt-text"
  | "keyboard-access"
  | "motion"
  | "cognitive-load";

// ============================================================================
// Summary Types
// ============================================================================

/**
 * Overall design summary
 */
export interface DesignSummary {
  /** One-line summary */
  oneLiner: string;
  /** Detailed summary (2-3 paragraphs) */
  detailed: string;
  /** Strengths of the design */
  strengths: string[];
  /** Areas for improvement */
  improvements: string[];
  /** Key metrics */
  metrics: DesignMetrics;
  /** Tags for categorization */
  tags: string[];
}

export interface DesignMetrics {
  hierarchyClarity: number;
  informationOrganization: number;
  visualBalance: number;
  userFlowEfficiency: number;
  accessibilityScore: number;
  overall: number;
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * Natural language query about the design
 */
export interface DesignQuery {
  /** The query text */
  query: string;
  /** Query type for optimization */
  queryType?: QueryType;
  /** Context from previous queries */
  context?: QueryContext;
  /** Specific nodes to focus on */
  focusNodes?: string[];
}

export type QueryType =
  | "general"
  | "hierarchy"
  | "flow"
  | "accessibility"
  | "comparison"
  | "suggestion"
  | "explanation"
  | "code-generation";

export interface QueryContext {
  previousQueries: string[];
  previousResponses: string[];
  analysisId?: string;
}

/**
 * Response to a design query
 */
export interface DesignQueryResponse {
  /** The response text */
  response: string;
  /** Confidence in the response (0-1) */
  confidence: number;
  /** Relevant nodes referenced in the response */
  relevantNodes: RelevantNode[];
  /** Follow-up questions user might ask */
  followUpQuestions: string[];
  /** Sources used for the response */
  sources: ResponseSource[];
  /** Structured data if applicable */
  structuredData?: Record<string, unknown>;
}

export interface RelevantNode {
  nodeId: string;
  nodeName: string;
  relevance: number;
  context: string;
}

export interface ResponseSource {
  type: "analysis" | "pattern" | "best-practice" | "inference";
  description: string;
  confidence: number;
}

// ============================================================================
// Agent Configuration Types
// ============================================================================

/**
 * Configuration for the design intent agent
 */
export interface DesignIntentAgentConfig {
  /** LLM model to use */
  model?: string;
  /** Temperature for LLM responses */
  temperature?: number;
  /** Maximum tokens for responses */
  maxTokens?: number;
  /** Enable detailed analysis (slower but more comprehensive) */
  detailedAnalysis?: boolean;
  /** Enable streaming responses */
  streaming?: boolean;
  /** Custom prompts for specific analysis types */
  customPrompts?: Partial<AnalysisPrompts>;
  /** Analysis focus areas */
  focusAreas?: AnalysisFocusArea[];
}

export type AnalysisFocusArea =
  | "visual-hierarchy"
  | "information-architecture"
  | "user-flow"
  | "accessibility"
  | "patterns"
  | "semantics";

export interface AnalysisPrompts {
  visualHierarchy: string;
  informationArchitecture: string;
  userFlow: string;
  semanticUnderstanding: string;
  designPatterns: string;
  accessibility: string;
  summary: string;
  query: string;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Events emitted during analysis
 */
export interface AnalysisEvent {
  type: AnalysisEventType;
  timestamp: Date;
  data: unknown;
}

export type AnalysisEventType =
  | "analysis-started"
  | "analysis-progress"
  | "analysis-completed"
  | "analysis-error"
  | "query-started"
  | "query-completed"
  | "query-error"
  | "streaming-chunk";

export interface AnalysisProgress {
  phase: AnalysisPhase;
  progress: number;
  message: string;
}

export type AnalysisPhase =
  | "initialization"
  | "visual-hierarchy"
  | "information-architecture"
  | "user-flow"
  | "patterns"
  | "accessibility"
  | "semantics"
  | "summary"
  | "complete";
