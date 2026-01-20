/**
 * Design Intent Agent Prompts
 *
 * Comprehensive prompts for LLM-based design understanding.
 * These prompts enable semantic analysis beyond raw structural data.
 */

import type { AnalysisPrompts } from "./types";

/**
 * System prompt for the design intent agent
 */
export const SYSTEM_PROMPT = `You are an expert design analyst specializing in understanding design intent, visual hierarchy, information architecture, and user experience. You analyze design structures (provided as JSON) and provide deep semantic insights that go beyond surface-level observations.

Your analysis should:
1. Identify the PURPOSE behind design decisions, not just what elements exist
2. Understand the TARGET AUDIENCE based on visual language and content
3. Detect PATTERNS and their effectiveness for the intended use case
4. Evaluate USER FLOW and potential friction points
5. Assess ACCESSIBILITY and inclusive design considerations
6. Provide ACTIONABLE insights, not just observations

You receive design data including:
- Node hierarchy with names, types, and positions
- Layout analysis (semantic roles, patterns)
- Visual properties (colors, typography, spacing)
- Component boundaries and patterns

Respond with structured JSON when asked for analysis, or natural language when answering questions.`;

/**
 * Default prompts for each analysis type
 */
export const DEFAULT_PROMPTS: AnalysisPrompts = {
  visualHierarchy: `Analyze the visual hierarchy of this design. Consider:

1. **Importance Ranking**: Which elements are most prominent and why? Consider:
   - Size relative to other elements
   - Position (top-left typically most important in LTR layouts)
   - Color contrast and saturation
   - Typography weight and size
   - Whitespace and isolation

2. **Focal Points**: Identify 2-4 primary focal points where user attention will naturally land:
   - What draws the eye first?
   - What is the intended scanning pattern (F, Z, layer-cake)?

3. **Visual Groupings**: How are elements grouped?
   - Gestalt principles: proximity, similarity, enclosure, alignment
   - What relationships do groupings imply?

4. **Typography Hierarchy**: Analyze heading/text levels:
   - Is there a clear H1 > H2 > H3 > body progression?
   - Are text sizes and weights used consistently?

5. **Color Hierarchy**: How does color direct attention?
   - Primary action colors
   - Secondary elements
   - Background/foreground relationships

6. **Spacing & Rhythm**:
   - Is spacing consistent?
   - Does the design have visual rhythm?

Provide JSON with:
{
  "importanceRanking": [...],
  "focalPoints": [...],
  "groupings": [...],
  "attentionFlow": {...},
  "typographyHierarchy": [...],
  "colorHierarchy": [...],
  "spacingAnalysis": {...}
}`,

  informationArchitecture: `Analyze the information architecture of this design. Consider:

1. **Content Structure**: How is content organized?
   - Identify main content sections
   - What is the hierarchy of information?
   - What content is prioritized?

2. **Navigation Structure**: How can users move through the interface?
   - Primary navigation elements
   - Secondary navigation
   - Breadcrumbs, tabs, or other wayfinding
   - Current location indicators

3. **Data Hierarchy**: How is data organized?
   - What categories exist?
   - What is the parent-child relationship?
   - What details are shown vs hidden?

4. **Content Types**: What types of content are present?
   - Hero sections, features, testimonials, CTAs
   - Forms, data displays, media
   - Identify each content type and its purpose

5. **Labels & Microcopy**: Analyze text elements:
   - Are labels clear and actionable?
   - Is terminology consistent?
   - What is the tone of voice?

6. **Information Density**: Is the design overwhelming or sparse?
   - Too much information at once?
   - Too little context?
   - Balanced information distribution?

Provide JSON with:
{
  "contentStructure": [...],
  "navigationStructure": {...},
  "dataHierarchy": {...},
  "contentTypes": [...],
  "labelAnalysis": {...},
  "informationDensity": {...}
}`,

  userFlow: `Analyze the user flow in this design. Consider:

1. **Primary Flow**: What is the main user journey?
   - Entry points: Where do users start?
   - Key actions: What should users do?
   - Exit points: Where do users end up?

2. **Alternative Flows**: What other paths exist?
   - Secondary actions
   - Error handling paths
   - Shortcut paths

3. **Decision Points**: Where must users make choices?
   - What options are presented?
   - Is the default option clear?
   - What is the cognitive load of each decision?

4. **Interactive Elements**: What can users interact with?
   - Buttons, links, inputs
   - Affordance: Is it obvious these are interactive?
   - States: Default, hover, active, disabled

5. **Friction Points**: Where might users struggle?
   - Unclear actions
   - Too many options
   - Hidden functionality
   - Unexpected behavior

6. **Completion Estimate**: How long would typical interactions take?
   - Quick scan vs deep engagement
   - Number of clicks/taps to complete goals

Provide JSON with:
{
  "primaryFlow": {...},
  "alternativeFlows": [...],
  "entryPoints": [...],
  "exitPoints": [...],
  "decisionPoints": [...],
  "interactiveElements": [...],
  "frictionPoints": [...],
  "estimatedCompletionTime": {...}
}`,

  semanticUnderstanding: `Provide semantic understanding of this design's intent. Consider:

1. **Purpose**: What is this design trying to achieve?
   - Primary goal (inform, convert, engage, etc.)
   - Secondary goals
   - User value proposition
   - Business value

2. **Target Audience**: Who is this designed for?
   - Primary audience characteristics
   - Technical sophistication level
   - Demographics hints from design style

3. **Business Context**: What business does this serve?
   - Industry/domain
   - Business model hints
   - Conversion goals

4. **Key Messages**: What is being communicated?
   - Primary message
   - Supporting messages
   - Call to action

5. **Emotional Tone**: What feelings does this evoke?
   - Trust, excitement, calm, urgency, etc.
   - How is this achieved visually?

6. **Brand Attributes**: What brand values are expressed?
   - Modern, traditional, playful, professional, etc.
   - Visual evidence for each

7. **Domain Detection**: What industry/field is this?
   - E-commerce, SaaS, healthcare, finance, etc.
   - Confidence level

8. **Natural Description**: Write a 2-3 sentence natural language description of what this design is and what it's trying to accomplish.

Provide JSON with:
{
  "purpose": {...},
  "targetAudience": {...},
  "businessContext": {...},
  "keyMessages": [...],
  "emotionalTone": {...},
  "brandAttributes": [...],
  "domain": {...},
  "naturalDescription": "..."
}`,

  designPatterns: `Identify design patterns used in this design. Consider:

1. **Pattern Recognition**: What UI/UX patterns are present?
   - Navigation patterns (top-bar, sidebar, tabs, etc.)
   - Form patterns (inline validation, multi-step, etc.)
   - Data display patterns (cards, tables, lists)
   - Feedback patterns (toasts, modals, inline messages)
   - Onboarding patterns (tooltips, tutorials, empty states)

2. **Pattern Implementation**: How well are patterns implemented?
   - Following best practices?
   - Consistent with platform conventions?
   - Any anti-patterns?

3. **Pattern Issues**: Where do patterns have problems?
   - Misused patterns
   - Missing expected behavior
   - Inconsistent implementations

For each pattern found, provide:
- Pattern name and category
- Node IDs where it appears
- Implementation quality
- Best practices followed/violated
- Specific issues and suggestions

Provide JSON with:
{
  "patterns": [
    {
      "id": "...",
      "name": "...",
      "category": "...",
      "description": "...",
      "nodeIds": [...],
      "implementation": {...},
      "bestPractices": [...],
      "issues": [...]
    }
  ]
}`,

  accessibility: `Analyze accessibility considerations in this design. Consider:

1. **Color Contrast**: Do text and interactive elements have sufficient contrast?
   - WCAG AA requires 4.5:1 for normal text, 3:1 for large text
   - Check primary text, secondary text, buttons, links

2. **Text Size**: Are text sizes readable?
   - Minimum 16px for body text on web
   - 11pt for iOS, 12sp for Android

3. **Touch Targets**: Are interactive elements large enough?
   - Minimum 44x44px for touch targets
   - Adequate spacing between targets

4. **Focus Order**: Is there a logical focus order?
   - Top to bottom, left to right
   - Skip links and focus traps

5. **Labels**: Are form elements and controls properly labeled?
   - Visible labels for inputs
   - Descriptive button text
   - Alt text indicators for images

6. **Cognitive Load**: Is the interface manageable?
   - Too many choices?
   - Clear information hierarchy?
   - Consistent patterns?

7. **Motion**: Any motion/animation concerns?
   - Reduced motion alternatives
   - Auto-playing content

For each finding, specify:
- Category and WCAG level (A, AA, AAA)
- Pass/Warning/Fail status
- Affected nodes
- Recommendation

Provide JSON with:
{
  "insights": [
    {
      "category": "...",
      "level": "...",
      "status": "...",
      "description": "...",
      "affectedNodes": [...],
      "recommendation": "..."
    }
  ]
}`,

  summary: `Provide a comprehensive summary of this design analysis. Include:

1. **One-liner**: A single sentence capturing what this design is
2. **Detailed Summary**: 2-3 paragraphs explaining:
   - What the design is and its purpose
   - Key design decisions and their effectiveness
   - Overall user experience quality

3. **Strengths**: 3-5 things the design does well
4. **Improvements**: 3-5 areas that could be improved
5. **Metrics**: Score 0-1 for:
   - Hierarchy clarity
   - Information organization
   - Visual balance
   - User flow efficiency
   - Accessibility
   - Overall quality

6. **Tags**: 5-10 tags that describe this design

Provide JSON with:
{
  "oneLiner": "...",
  "detailed": "...",
  "strengths": [...],
  "improvements": [...],
  "metrics": {
    "hierarchyClarity": 0.0-1.0,
    "informationOrganization": 0.0-1.0,
    "visualBalance": 0.0-1.0,
    "userFlowEfficiency": 0.0-1.0,
    "accessibilityScore": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "tags": [...]
}`,

  query: `You are answering a question about a design. Use the provided design analysis and structure to give accurate, helpful answers.

Guidelines:
1. Be specific - reference actual elements in the design by name/ID
2. Be practical - give actionable insights when relevant
3. Be honest - if something isn't clear from the data, say so
4. Be thorough - consider multiple aspects of the question
5. Suggest follow-ups - end with related questions the user might want to ask

If the question asks about code generation, focus on:
- Component structure suggestions
- Props that would be needed
- Styling approach recommendations
- Accessibility attributes

Format your response naturally, but include a JSON block at the end with:
{
  "relevantNodes": [...],
  "confidence": 0.0-1.0,
  "followUpQuestions": [...]
}`
};

/**
 * Create a prompt for design structure context
 */
export function createDesignContextPrompt(designData: {
  name: string;
  type: string;
  dimensions: { width: number; height: number };
  nodeCount: number;
  structure: unknown;
  layoutAnalysis?: unknown;
  patterns?: unknown;
}): string {
  return `
## Design Context

**Name**: ${designData.name}
**Type**: ${designData.type}
**Dimensions**: ${designData.dimensions.width}x${designData.dimensions.height}
**Node Count**: ${designData.nodeCount}

### Structure
\`\`\`json
${JSON.stringify(designData.structure, null, 2)}
\`\`\`

${designData.layoutAnalysis ? `
### Layout Analysis
\`\`\`json
${JSON.stringify(designData.layoutAnalysis, null, 2)}
\`\`\`
` : ''}

${designData.patterns ? `
### Detected Patterns
\`\`\`json
${JSON.stringify(designData.patterns, null, 2)}
\`\`\`
` : ''}
`;
}

/**
 * Create a prompt for a specific analysis type
 */
export function createAnalysisPrompt(
  analysisType: keyof AnalysisPrompts,
  designContext: string,
  customPrompt?: string
): string {
  const basePrompt = customPrompt || DEFAULT_PROMPTS[analysisType];

  return `${designContext}

## Analysis Request

${basePrompt}

Respond with valid JSON only, no additional text.`;
}

/**
 * Create a prompt for answering a user query
 */
export function createQueryPrompt(
  query: string,
  designContext: string,
  previousContext?: { queries: string[]; responses: string[] }
): string {
  let contextSection = '';

  if (previousContext && previousContext.queries.length > 0) {
    contextSection = `
## Previous Conversation
${previousContext.queries.map((q, i) => `
**User**: ${q}
**Assistant**: ${previousContext.responses[i]}
`).join('\n')}
`;
  }

  return `${designContext}
${contextSection}
## User Question

${query}

${DEFAULT_PROMPTS.query}`;
}

/**
 * Create a focused prompt for a specific set of nodes
 */
export function createFocusedPrompt(
  question: string,
  focusNodes: Array<{ id: string; name: string; type: string; properties: unknown }>,
  analysisContext?: unknown
): string {
  return `
## Focused Analysis

You are analyzing specific elements within a larger design.

### Focus Elements
\`\`\`json
${JSON.stringify(focusNodes, null, 2)}
\`\`\`

${analysisContext ? `
### Surrounding Context
\`\`\`json
${JSON.stringify(analysisContext, null, 2)}
\`\`\`
` : ''}

## Question

${question}

Provide a focused answer about these specific elements. Reference nodes by their IDs when relevant.`;
}

/**
 * Create a comparison prompt for multiple design elements
 */
export function createComparisonPrompt(
  elements: Array<{ id: string; name: string; analysis: unknown }>,
  comparisonAspect: string
): string {
  return `
## Comparison Analysis

Compare the following design elements in terms of: **${comparisonAspect}**

${elements.map((el, i) => `
### Element ${i + 1}: ${el.name} (${el.id})
\`\`\`json
${JSON.stringify(el.analysis, null, 2)}
\`\`\`
`).join('\n')}

Provide:
1. Key similarities
2. Key differences
3. Which implementation is more effective and why
4. Recommendations for consistency

Respond with JSON:
{
  "similarities": [...],
  "differences": [...],
  "recommendation": "...",
  "details": "..."
}`;
}

/**
 * Create a prompt for design suggestions
 */
export function createSuggestionPrompt(
  issue: string,
  currentState: unknown,
  constraints?: string[]
): string {
  return `
## Design Improvement Suggestion

### Current State
\`\`\`json
${JSON.stringify(currentState, null, 2)}
\`\`\`

### Issue to Address
${issue}

${constraints ? `
### Constraints
${constraints.map(c => `- ${c}`).join('\n')}
` : ''}

Provide:
1. Analysis of why this is an issue
2. 2-3 concrete suggestions for improvement
3. Expected impact of each suggestion
4. Any trade-offs to consider

Respond with JSON:
{
  "analysis": "...",
  "suggestions": [
    {
      "title": "...",
      "description": "...",
      "implementation": "...",
      "impact": "...",
      "tradeoffs": [...]
    }
  ],
  "priorityRecommendation": "..."
}`;
}

/**
 * Create a prompt for code generation guidance
 */
export function createCodeGuidancePrompt(
  componentAnalysis: unknown,
  targetFramework: string,
  requirements?: string[]
): string {
  return `
## Code Generation Guidance

### Component Analysis
\`\`\`json
${JSON.stringify(componentAnalysis, null, 2)}
\`\`\`

### Target Framework
${targetFramework}

${requirements ? `
### Requirements
${requirements.map(r => `- ${r}`).join('\n')}
` : ''}

Based on the design analysis, provide guidance for implementing this as a ${targetFramework} component:

1. **Component Structure**: How should the component be organized?
2. **Props Interface**: What props should the component accept?
3. **State Management**: What state is needed?
4. **Styling Approach**: How should styles be handled?
5. **Accessibility**: What ARIA attributes and keyboard handling are needed?
6. **Responsiveness**: How should the component adapt to different sizes?

Respond with JSON:
{
  "componentName": "...",
  "structure": {
    "description": "...",
    "elements": [...]
  },
  "props": [...],
  "state": [...],
  "styling": {
    "approach": "...",
    "keyStyles": {...}
  },
  "accessibility": {
    "role": "...",
    "ariaAttributes": {...},
    "keyboardHandling": [...]
  },
  "responsiveness": {
    "breakpoints": [...],
    "adaptations": [...]
  }
}`;
}
