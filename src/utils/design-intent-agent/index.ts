/**
 * Design Intent Agent Module
 *
 * AI agent specialized in understanding design intent. Analyzes visual hierarchy,
 * information architecture, and user flow. Provides semantic understanding beyond
 * raw structure and supports natural language queries about design.
 *
 * @example
 * ```typescript
 * import { createDesignIntentAgent } from "~/utils/design-intent-agent";
 *
 * // Create an agent
 * const agent = createDesignIntentAgent();
 *
 * // Perform comprehensive analysis
 * const analysis = await agent.analyze(figmaNode);
 *
 * // Query the design
 * const response = await agent.query({
 *   query: "What is the primary call-to-action in this design?",
 *   context: { analysisId: analysis.analysisId }
 * });
 *
 * // Get code generation guidance
 * const guidance = await agent.getCodeGuidance(figmaNode, "react");
 * ```
 */

// Export agent class and factory
export { DesignIntentAgent, createDesignIntentAgent } from "./agent";

// Export types
export type {
  // Core Analysis Types
  DesignIntentAnalysis,
  DesignSource,
  DesignType,
  Platform,
  ColorScheme,

  // Visual Hierarchy Types
  VisualHierarchyAnalysis,
  VisualElement,
  FocalPoint,
  VisualGroup,
  AttentionFlow,
  TypographyLevel,
  ColorUsage,
  SpacingAnalysis,
  ImportanceFactor,
  ImportanceFactorType,
  ElementType,
  GroupingType,
  ElementRelationship,
  ScanPattern,
  AttentionPathPoint,
  Hotspot,
  DeadZone,
  ColorRole,
  SpacingIssue,
  GridSystem,

  // Information Architecture Types
  InformationArchitectureAnalysis,
  ContentSection,
  NavigationAnalysis,
  DataHierarchyNode,
  ContentType,
  LabelAnalysis,
  InformationDensity,
  ContentTypeEnum,
  SectionRelationship,
  NavigationItem,
  NavigationType,
  LabelInfo,
  LabelType,
  LabelQuality,
  LabelIssue,
  ToneOfVoice,

  // User Flow Types
  UserFlowAnalysis,
  UserFlowPath,
  FlowStep,
  FlowPoint,
  DecisionPoint,
  DecisionOption,
  InteractiveElement,
  FrictionPoint,
  TimeEstimate,
  UserAction,
  InteractiveType,
  AffordanceLevel,
  ElementState,
  FeedbackType,
  FrictionType,

  // Semantic Understanding Types
  SemanticUnderstanding,
  DesignPurpose,
  AudienceProfile,
  BusinessContext,
  KeyMessage,
  EmotionalTone,
  BrandAttribute,
  Domain,
  Emotion,

  // Design Patterns Types
  DesignPattern,
  PatternCategory,
  PatternImplementation,
  BestPractice,
  PatternIssue,

  // Accessibility Types
  AccessibilityInsight,
  AccessibilityCategory,

  // Summary Types
  DesignSummary,
  DesignMetrics,

  // Query Types
  DesignQuery,
  DesignQueryResponse,
  QueryType,
  QueryContext,
  RelevantNode,
  ResponseSource,

  // Configuration Types
  DesignIntentAgentConfig,
  AnalysisFocusArea,
  AnalysisPrompts,

  // Event Types
  AnalysisEvent,
  AnalysisEventType,
  AnalysisProgress,
  AnalysisPhase,
} from "./types";

// Export prompts for customization
export {
  SYSTEM_PROMPT,
  DEFAULT_PROMPTS,
  createDesignContextPrompt,
  createAnalysisPrompt,
  createQueryPrompt,
  createFocusedPrompt,
  createComparisonPrompt,
  createSuggestionPrompt,
  createCodeGuidancePrompt,
} from "./prompts";
