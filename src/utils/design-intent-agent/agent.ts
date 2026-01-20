/**
 * Design Intent Agent
 *
 * AI agent specialized in understanding design intent. Analyzes visual hierarchy,
 * information architecture, and user flow. Provides semantic understanding beyond
 * raw structure and supports natural language queries about design.
 */

import { getLLMClient, type LLMResult } from "../llm";
import { analyzeNodeLayout, type NodeLayoutAnalysis } from "../layout-analyzer";
import { analyzeComponentBoundaries } from "../component-boundary-analyzer";
import type { FigmaNode } from "../figma-api";
import {
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
import type {
  DesignIntentAnalysis,
  DesignIntentAgentConfig,
  DesignSource,
  VisualHierarchyAnalysis,
  InformationArchitectureAnalysis,
  UserFlowAnalysis,
  SemanticUnderstanding,
  DesignPattern,
  AccessibilityInsight,
  DesignSummary,
  DesignQuery,
  DesignQueryResponse,
  AnalysisEvent,
  AnalysisPhase,
  DesignType,
  Platform,
  ColorScheme,
  QueryType,
} from "./types";

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<DesignIntentAgentConfig> = {
  model: "claude-3-5-sonnet-20241022",
  temperature: 0.3,
  maxTokens: 4000,
  detailedAnalysis: true,
  streaming: false,
  customPrompts: {},
  focusAreas: [
    "visual-hierarchy",
    "information-architecture",
    "user-flow",
    "accessibility",
    "patterns",
    "semantics",
  ],
};

// ============================================================================
// Design Intent Agent Class
// ============================================================================

/**
 * AI Agent for understanding design intent
 */
export class DesignIntentAgent {
  private config: Required<DesignIntentAgentConfig>;
  private eventListeners: Array<(event: AnalysisEvent) => void> = [];
  private analysisCache: Map<string, DesignIntentAnalysis> = new Map();

  constructor(config: DesignIntentAgentConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Perform comprehensive design intent analysis
   */
  async analyze(rootNode: FigmaNode): Promise<DesignIntentAnalysis> {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.emitEvent({
      type: "analysis-started",
      timestamp: new Date(),
      data: { analysisId, nodeName: rootNode.name },
    });

    try {
      // Step 1: Perform structural analysis
      this.emitProgress("initialization", 0.05, "Analyzing design structure...");
      const layoutAnalysis = analyzeNodeLayout(rootNode);
      const boundaryAnalysis = analyzeComponentBoundaries(rootNode);

      // Step 2: Infer design source metadata
      this.emitProgress("initialization", 0.1, "Detecting design type...");
      const sourceDesign = await this.inferDesignSource(rootNode, layoutAnalysis);

      // Step 3: Create design context for LLM
      const designContext = this.createDesignContext(rootNode, layoutAnalysis, boundaryAnalysis);

      // Step 4: Run parallel analysis (or sequential if detailed)
      const [
        visualHierarchy,
        informationArchitecture,
        userFlow,
        semanticUnderstanding,
        designPatterns,
        accessibilityInsights,
      ] = await this.runAnalyses(designContext);

      // Step 5: Generate summary
      this.emitProgress("summary", 0.9, "Generating summary...");
      const summary = await this.generateSummary(
        designContext,
        visualHierarchy,
        informationArchitecture,
        userFlow
      );

      // Step 6: Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        visualHierarchy,
        informationArchitecture,
        userFlow,
        semanticUnderstanding
      );

      const analysis: DesignIntentAnalysis = {
        analysisId,
        timestamp: new Date(),
        sourceDesign,
        visualHierarchy,
        informationArchitecture,
        userFlow,
        semanticUnderstanding,
        designPatterns,
        accessibilityInsights,
        summary,
        confidence,
      };

      // Cache the analysis
      this.analysisCache.set(analysisId, analysis);

      this.emitProgress("complete", 1.0, "Analysis complete");
      this.emitEvent({
        type: "analysis-completed",
        timestamp: new Date(),
        data: { analysisId, confidence },
      });

      return analysis;
    } catch (error) {
      this.emitEvent({
        type: "analysis-error",
        timestamp: new Date(),
        data: { analysisId, error: error instanceof Error ? error.message : "Unknown error" },
      });
      throw error;
    }
  }

  /**
   * Answer a natural language query about a design
   */
  async query(designQuery: DesignQuery, analysis?: DesignIntentAnalysis): Promise<DesignQueryResponse> {
    this.emitEvent({
      type: "query-started",
      timestamp: new Date(),
      data: { query: designQuery.query },
    });

    try {
      const client = getLLMClient();

      // Get or use provided analysis
      let analysisToUse = analysis;
      if (!analysisToUse && designQuery.context?.analysisId) {
        analysisToUse = this.analysisCache.get(designQuery.context.analysisId);
      }

      // Create context from analysis
      const designContext = analysisToUse
        ? this.createContextFromAnalysis(analysisToUse)
        : "";

      // Create query prompt
      const prompt = createQueryPrompt(
        designQuery.query,
        designContext,
        designQuery.context
          ? {
              queries: designQuery.context.previousQueries,
              responses: designQuery.context.previousResponses,
            }
          : undefined
      );

      // Get LLM response
      const result = await client.complete({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        model: this.config.model,
        params: {
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        },
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get response from LLM");
      }

      // Parse response
      const response = this.parseQueryResponse(result.data.content, designQuery);

      this.emitEvent({
        type: "query-completed",
        timestamp: new Date(),
        data: { query: designQuery.query, confidence: response.confidence },
      });

      return response;
    } catch (error) {
      this.emitEvent({
        type: "query-error",
        timestamp: new Date(),
        data: { query: designQuery.query, error: error instanceof Error ? error.message : "Unknown error" },
      });
      throw error;
    }
  }

  /**
   * Ask a focused question about specific nodes
   */
  async queryNodes(
    question: string,
    nodes: FigmaNode[],
    contextAnalysis?: DesignIntentAnalysis
  ): Promise<DesignQueryResponse> {
    const client = getLLMClient();

    // Extract relevant info from nodes
    const focusNodes = nodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      properties: {
        bounds: node.absoluteBoundingBox,
        children: node.children?.length || 0,
      },
    }));

    // Create focused prompt
    const prompt = createFocusedPrompt(
      question,
      focusNodes,
      contextAnalysis ? this.extractRelevantContext(contextAnalysis, nodes.map(n => n.id)) : undefined
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get response from LLM");
    }

    return this.parseQueryResponse(result.data.content, { query: question });
  }

  /**
   * Compare multiple design elements
   */
  async compareElements(
    elements: Array<{ node: FigmaNode; analysis?: NodeLayoutAnalysis }>,
    aspect: string
  ): Promise<{
    similarities: string[];
    differences: string[];
    recommendation: string;
    details: string;
  }> {
    const client = getLLMClient();

    const elementData = elements.map((el) => ({
      id: el.node.id,
      name: el.node.name,
      analysis: el.analysis || analyzeNodeLayout(el.node),
    }));

    const prompt = createComparisonPrompt(elementData, aspect);

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get comparison from LLM");
    }

    return this.parseJsonResponse(result.data.content);
  }

  /**
   * Get improvement suggestions for a design issue
   */
  async getSuggestions(
    issue: string,
    node: FigmaNode,
    constraints?: string[]
  ): Promise<{
    analysis: string;
    suggestions: Array<{
      title: string;
      description: string;
      implementation: string;
      impact: string;
      tradeoffs: string[];
    }>;
    priorityRecommendation: string;
  }> {
    const client = getLLMClient();
    const analysis = analyzeNodeLayout(node);

    const prompt = createSuggestionPrompt(issue, analysis, constraints);

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: 0.5, // Slightly higher for creativity
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get suggestions from LLM");
    }

    return this.parseJsonResponse(result.data.content);
  }

  /**
   * Get code generation guidance for a component
   */
  async getCodeGuidance(
    node: FigmaNode,
    targetFramework: string,
    requirements?: string[]
  ): Promise<{
    componentName: string;
    structure: { description: string; elements: string[] };
    props: Array<{ name: string; type: string; required: boolean; description: string }>;
    state: Array<{ name: string; type: string; purpose: string }>;
    styling: { approach: string; keyStyles: Record<string, string> };
    accessibility: {
      role: string;
      ariaAttributes: Record<string, string>;
      keyboardHandling: string[];
    };
    responsiveness: {
      breakpoints: string[];
      adaptations: string[];
    };
  }> {
    const client = getLLMClient();
    const analysis = analyzeNodeLayout(node);
    const boundaryAnalysis = analyzeComponentBoundaries(node);

    const componentAnalysis = {
      layout: analysis,
      boundaries: boundaryAnalysis.boundaries,
      patterns: boundaryAnalysis.reusablePatterns,
    };

    const prompt = createCodeGuidancePrompt(componentAnalysis, targetFramework, requirements);

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: 0.3,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get code guidance from LLM");
    }

    return this.parseJsonResponse(result.data.content);
  }

  /**
   * Subscribe to analysis events
   */
  onEvent(listener: (event: AnalysisEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index >= 0) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Clear the analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Get a cached analysis by ID
   */
  getCachedAnalysis(analysisId: string): DesignIntentAnalysis | undefined {
    return this.analysisCache.get(analysisId);
  }

  // ==========================================================================
  // Private Methods - Analysis
  // ==========================================================================

  private async runAnalyses(
    designContext: string
  ): Promise<[
    VisualHierarchyAnalysis,
    InformationArchitectureAnalysis,
    UserFlowAnalysis,
    SemanticUnderstanding,
    DesignPattern[],
    AccessibilityInsight[],
  ]> {
    const focusAreas = this.config.focusAreas;

    // Run analyses based on focus areas
    const analyses: Array<Promise<unknown>> = [];

    // Visual Hierarchy
    if (focusAreas.includes("visual-hierarchy")) {
      this.emitProgress("visual-hierarchy", 0.2, "Analyzing visual hierarchy...");
      analyses.push(this.analyzeVisualHierarchy(designContext));
    } else {
      analyses.push(Promise.resolve(this.getDefaultVisualHierarchy()));
    }

    // Information Architecture
    if (focusAreas.includes("information-architecture")) {
      this.emitProgress("information-architecture", 0.35, "Analyzing information architecture...");
      analyses.push(this.analyzeInformationArchitecture(designContext));
    } else {
      analyses.push(Promise.resolve(this.getDefaultInformationArchitecture()));
    }

    // User Flow
    if (focusAreas.includes("user-flow")) {
      this.emitProgress("user-flow", 0.5, "Analyzing user flow...");
      analyses.push(this.analyzeUserFlow(designContext));
    } else {
      analyses.push(Promise.resolve(this.getDefaultUserFlow()));
    }

    // Semantics
    if (focusAreas.includes("semantics")) {
      this.emitProgress("semantics", 0.65, "Analyzing semantic meaning...");
      analyses.push(this.analyzeSemantics(designContext));
    } else {
      analyses.push(Promise.resolve(this.getDefaultSemantics()));
    }

    // Patterns
    if (focusAreas.includes("patterns")) {
      this.emitProgress("patterns", 0.75, "Detecting design patterns...");
      analyses.push(this.analyzePatterns(designContext));
    } else {
      analyses.push(Promise.resolve([]));
    }

    // Accessibility
    if (focusAreas.includes("accessibility")) {
      this.emitProgress("accessibility", 0.85, "Checking accessibility...");
      analyses.push(this.analyzeAccessibility(designContext));
    } else {
      analyses.push(Promise.resolve([]));
    }

    const results = await Promise.all(analyses);

    return results as [
      VisualHierarchyAnalysis,
      InformationArchitectureAnalysis,
      UserFlowAnalysis,
      SemanticUnderstanding,
      DesignPattern[],
      AccessibilityInsight[],
    ];
  }

  private async analyzeVisualHierarchy(designContext: string): Promise<VisualHierarchyAnalysis> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "visualHierarchy",
      designContext,
      this.config.customPrompts.visualHierarchy
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return this.getDefaultVisualHierarchy();
    }

    try {
      return this.parseJsonResponse(result.data.content);
    } catch {
      return this.getDefaultVisualHierarchy();
    }
  }

  private async analyzeInformationArchitecture(designContext: string): Promise<InformationArchitectureAnalysis> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "informationArchitecture",
      designContext,
      this.config.customPrompts.informationArchitecture
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return this.getDefaultInformationArchitecture();
    }

    try {
      return this.parseJsonResponse(result.data.content);
    } catch {
      return this.getDefaultInformationArchitecture();
    }
  }

  private async analyzeUserFlow(designContext: string): Promise<UserFlowAnalysis> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "userFlow",
      designContext,
      this.config.customPrompts.userFlow
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return this.getDefaultUserFlow();
    }

    try {
      return this.parseJsonResponse(result.data.content);
    } catch {
      return this.getDefaultUserFlow();
    }
  }

  private async analyzeSemantics(designContext: string): Promise<SemanticUnderstanding> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "semanticUnderstanding",
      designContext,
      this.config.customPrompts.semanticUnderstanding
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return this.getDefaultSemantics();
    }

    try {
      return this.parseJsonResponse(result.data.content);
    } catch {
      return this.getDefaultSemantics();
    }
  }

  private async analyzePatterns(designContext: string): Promise<DesignPattern[]> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "designPatterns",
      designContext,
      this.config.customPrompts.designPatterns
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return [];
    }

    try {
      const parsed = this.parseJsonResponse<{ patterns: DesignPattern[] }>(result.data.content);
      return parsed.patterns || [];
    } catch {
      return [];
    }
  }

  private async analyzeAccessibility(designContext: string): Promise<AccessibilityInsight[]> {
    const client = getLLMClient();
    const prompt = createAnalysisPrompt(
      "accessibility",
      designContext,
      this.config.customPrompts.accessibility
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return [];
    }

    try {
      const parsed = this.parseJsonResponse<{ insights: AccessibilityInsight[] }>(result.data.content);
      return parsed.insights || [];
    } catch {
      return [];
    }
  }

  private async generateSummary(
    designContext: string,
    visualHierarchy: VisualHierarchyAnalysis,
    informationArchitecture: InformationArchitectureAnalysis,
    userFlow: UserFlowAnalysis
  ): Promise<DesignSummary> {
    const client = getLLMClient();

    const enrichedContext = `${designContext}

## Analysis Results

### Visual Hierarchy
${JSON.stringify(visualHierarchy, null, 2)}

### Information Architecture
${JSON.stringify(informationArchitecture, null, 2)}

### User Flow
${JSON.stringify(userFlow, null, 2)}
`;

    const prompt = createAnalysisPrompt(
      "summary",
      enrichedContext,
      this.config.customPrompts.summary
    );

    const result = await client.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: this.config.model,
      params: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    if (!result.success || !result.data) {
      return this.getDefaultSummary();
    }

    try {
      return this.parseJsonResponse(result.data.content);
    } catch {
      return this.getDefaultSummary();
    }
  }

  // ==========================================================================
  // Private Methods - Helpers
  // ==========================================================================

  private async inferDesignSource(
    node: FigmaNode,
    layoutAnalysis: NodeLayoutAnalysis
  ): Promise<DesignSource> {
    const bounds = node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };

    return {
      nodeId: node.id,
      name: node.name,
      designType: this.inferDesignType(node, layoutAnalysis),
      dimensions: { width: bounds.width, height: bounds.height },
      platform: this.inferPlatform(bounds.width, bounds.height),
      colorScheme: this.inferColorScheme(node),
    };
  }

  private inferDesignType(node: FigmaNode, analysis: NodeLayoutAnalysis): DesignType {
    const name = node.name.toLowerCase();
    const role = analysis.semanticRole;

    if (name.includes("landing") || name.includes("home")) return "landing";
    if (name.includes("dashboard")) return "dashboard";
    if (name.includes("modal") || name.includes("dialog") || role === "modal") return "modal";
    if (name.includes("form") || name.includes("login") || name.includes("signup") || role === "form") return "form";
    if (name.includes("settings") || name.includes("preferences")) return "settings";
    if (name.includes("profile") || name.includes("account")) return "profile";
    if (name.includes("list") || role === "list") return "list-view";
    if (name.includes("detail") || name.includes("single")) return "detail-view";
    if (name.includes("empty") || name.includes("no-data")) return "empty-state";
    if (name.includes("error") || name.includes("404") || name.includes("500")) return "error-state";
    if (name.includes("onboarding") || name.includes("welcome") || name.includes("intro")) return "onboarding";

    // Check if it looks like a full page vs component
    const bounds = node.absoluteBoundingBox;
    if (bounds && bounds.height > 600) {
      return "page";
    }

    return "component";
  }

  private inferPlatform(width: number, height: number): Platform {
    // Mobile phones
    if (width <= 430 && height >= 700) {
      if (width === 375 || width === 390 || width === 393 || width === 430) {
        return "ios";
      }
      if (width === 360 || width === 412 || width === 393) {
        return "android";
      }
      return "web-mobile";
    }

    // Tablets
    if (width >= 700 && width <= 1100 && height >= 900) {
      return "tablet";
    }

    // Desktop
    if (width >= 1200) {
      return "web-desktop";
    }

    // Desktop app (typical window sizes)
    if (width >= 800 && width <= 1200) {
      return "desktop-app";
    }

    return "unknown";
  }

  private inferColorScheme(node: FigmaNode): ColorScheme {
    // Would need to analyze actual colors - simplified here
    const name = node.name.toLowerCase();
    if (name.includes("dark")) return "dark";
    if (name.includes("light")) return "light";
    return "unknown";
  }

  private createDesignContext(
    node: FigmaNode,
    layoutAnalysis: NodeLayoutAnalysis,
    boundaryAnalysis: ReturnType<typeof analyzeComponentBoundaries>
  ): string {
    // Create a simplified structure for the LLM
    const structure = this.simplifyNodeForLLM(node, 0, 4);

    return createDesignContextPrompt({
      name: node.name,
      type: node.type,
      dimensions: {
        width: node.absoluteBoundingBox?.width || 0,
        height: node.absoluteBoundingBox?.height || 0,
      },
      nodeCount: this.countNodes(node),
      structure,
      layoutAnalysis: {
        role: layoutAnalysis.semanticRole,
        pattern: layoutAnalysis.layoutPattern,
        confidence: layoutAnalysis.confidence,
        children: layoutAnalysis.children?.slice(0, 10).map((c) => ({
          name: c.nodeName,
          role: c.semanticRole,
          pattern: c.layoutPattern,
        })),
      },
      patterns: boundaryAnalysis.reusablePatterns.slice(0, 5).map((p) => ({
        name: p.name,
        category: p.category,
        instances: p.instances.length,
      })),
    });
  }

  private simplifyNodeForLLM(node: FigmaNode, depth: number, maxDepth: number): unknown {
    if (depth > maxDepth) {
      return { name: node.name, type: node.type, children: node.children?.length || 0 };
    }

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: node.absoluteBoundingBox
        ? {
            x: Math.round(node.absoluteBoundingBox.x),
            y: Math.round(node.absoluteBoundingBox.y),
            width: Math.round(node.absoluteBoundingBox.width),
            height: Math.round(node.absoluteBoundingBox.height),
          }
        : undefined,
      children: node.children?.slice(0, 10).map((c) => this.simplifyNodeForLLM(c, depth + 1, maxDepth)),
    };
  }

  private countNodes(node: FigmaNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private createContextFromAnalysis(analysis: DesignIntentAnalysis): string {
    return `
## Design Analysis Context

**Design**: ${analysis.sourceDesign.name}
**Type**: ${analysis.sourceDesign.designType}
**Platform**: ${analysis.sourceDesign.platform}

### Summary
${analysis.summary?.detailed || "Analysis pending"}

### Key Findings
**Strengths**: ${analysis.summary?.strengths?.join(", ") || "None identified"}
**Improvements**: ${analysis.summary?.improvements?.join(", ") || "None identified"}

### Visual Hierarchy
- Focal Points: ${analysis.visualHierarchy.focalPoints?.length || 0}
- Typography Levels: ${analysis.visualHierarchy.typographyHierarchy?.length || 0}

### User Flow
- Entry Points: ${analysis.userFlow.entryPoints?.length || 0}
- Decision Points: ${analysis.userFlow.decisionPoints?.length || 0}
- Friction Points: ${analysis.userFlow.frictionPoints?.length || 0}

### Semantic Understanding
- Purpose: ${analysis.semanticUnderstanding.purpose?.primaryGoal || "Unknown"}
- Target Audience: ${analysis.semanticUnderstanding.targetAudience?.primaryAudience || "Unknown"}
`;
  }

  private extractRelevantContext(
    analysis: DesignIntentAnalysis,
    nodeIds: string[]
  ): unknown {
    // Extract only the analysis relevant to the specified nodes
    return {
      visualHierarchy: analysis.visualHierarchy.importanceRanking
        ?.filter((el) => nodeIds.includes(el.nodeId)),
      userFlow: analysis.userFlow.interactiveElements
        ?.filter((el) => nodeIds.includes(el.nodeId)),
    };
  }

  private parseQueryResponse(content: string, query: DesignQuery): DesignQueryResponse {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let structuredData: Record<string, unknown> | undefined;
    let relevantNodes: DesignQueryResponse["relevantNodes"] = [];
    let followUpQuestions: string[] = [];
    let confidence = 0.7;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        structuredData = parsed;
        relevantNodes = parsed.relevantNodes || [];
        followUpQuestions = parsed.followUpQuestions || [];
        confidence = parsed.confidence || 0.7;
      } catch {
        // JSON parsing failed, continue with defaults
      }
    }

    // Clean the response text
    let responseText = content
      .replace(/```json\s*[\s\S]*?\s*```/g, "")
      .trim();

    return {
      response: responseText,
      confidence,
      relevantNodes,
      followUpQuestions,
      sources: [
        {
          type: "analysis",
          description: "Design structure analysis",
          confidence: 0.9,
        },
        {
          type: "inference",
          description: "LLM reasoning",
          confidence,
        },
      ],
      structuredData,
    };
  }

  private parseJsonResponse<T>(content: string): T {
    // Try to find JSON in the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse the entire content as JSON
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }

    throw new Error("No valid JSON found in response");
  }

  private calculateOverallConfidence(
    visualHierarchy: VisualHierarchyAnalysis,
    informationArchitecture: InformationArchitectureAnalysis,
    userFlow: UserFlowAnalysis,
    semanticUnderstanding: SemanticUnderstanding
  ): number {
    // Calculate confidence based on completeness of analysis
    let score = 0;
    let factors = 0;

    if (visualHierarchy.importanceRanking?.length > 0) {
      score += 0.8;
      factors++;
    }
    if (visualHierarchy.focalPoints?.length > 0) {
      score += 0.9;
      factors++;
    }
    if (informationArchitecture.contentStructure?.length > 0) {
      score += 0.85;
      factors++;
    }
    if (userFlow.primaryFlow?.steps?.length > 0) {
      score += 0.8;
      factors++;
    }
    if (semanticUnderstanding.purpose?.primaryGoal) {
      score += 0.75;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private emitEvent(event: AnalysisEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    }
  }

  private emitProgress(phase: AnalysisPhase, progress: number, message: string): void {
    this.emitEvent({
      type: "analysis-progress",
      timestamp: new Date(),
      data: { phase, progress, message },
    });
  }

  // ==========================================================================
  // Default Values
  // ==========================================================================

  private getDefaultVisualHierarchy(): VisualHierarchyAnalysis {
    return {
      importanceRanking: [],
      focalPoints: [],
      groupings: [],
      attentionFlow: {
        pattern: "f-pattern",
        path: [],
        hotspots: [],
        deadZones: [],
      },
      typographyHierarchy: [],
      colorHierarchy: [],
      spacingAnalysis: {
        spacingScale: [],
        rhythmScore: 0,
        spacingIssues: [],
      },
    };
  }

  private getDefaultInformationArchitecture(): InformationArchitectureAnalysis {
    return {
      contentStructure: [],
      navigationStructure: {
        primaryNav: [],
        secondaryNav: [],
        depth: 0,
        navigationType: "top-bar",
      },
      dataHierarchy: {
        id: "root",
        name: "Root",
        type: "root",
        children: [],
        importance: 1,
      },
      contentTypes: [],
      labelAnalysis: {
        labels: [],
        quality: { clarity: 0, consistency: 0, actionability: 0, overall: 0 },
        issues: [],
        toneOfVoice: "professional",
      },
      informationDensity: {
        overall: "medium",
        score: 0.5,
        perSection: [],
        recommendations: [],
      },
    };
  }

  private getDefaultUserFlow(): UserFlowAnalysis {
    return {
      primaryFlow: {
        id: "default",
        name: "Default Flow",
        steps: [],
        goal: "Unknown",
        likelihood: 0,
        complexity: 0,
      },
      alternativeFlows: [],
      entryPoints: [],
      exitPoints: [],
      decisionPoints: [],
      interactiveElements: [],
      frictionPoints: [],
      estimatedCompletionTime: {
        minimum: 0,
        typical: 0,
        maximum: 0,
        breakdown: [],
      },
    };
  }

  private getDefaultSemantics(): SemanticUnderstanding {
    return {
      purpose: {
        primaryGoal: "Unknown",
        secondaryGoals: [],
        designType: "unknown",
        userValue: "Unknown",
        businessValue: "Unknown",
      },
      targetAudience: {
        primaryAudience: "Unknown",
        secondaryAudiences: [],
        technicalLevel: "mixed",
        characteristics: [],
      },
      businessContext: {
        industry: "Unknown",
        conversionGoals: [],
      },
      keyMessages: [],
      emotionalTone: {
        primary: "professionalism",
        secondary: [],
        intensity: "moderate",
        consistency: 0.5,
      },
      brandAttributes: [],
      domain: {
        primary: "Unknown",
        secondary: [],
        confidence: 0,
      },
      naturalDescription: "Analysis pending.",
    };
  }

  private getDefaultSummary(): DesignSummary {
    return {
      oneLiner: "Design analysis incomplete.",
      detailed: "The design analysis could not be completed. Please try again with a valid design structure.",
      strengths: [],
      improvements: [],
      metrics: {
        hierarchyClarity: 0,
        informationOrganization: 0,
        visualBalance: 0,
        userFlowEfficiency: 0,
        accessibilityScore: 0,
        overall: 0,
      },
      tags: [],
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new Design Intent Agent instance
 */
export function createDesignIntentAgent(config?: DesignIntentAgentConfig): DesignIntentAgent {
  return new DesignIntentAgent(config);
}
