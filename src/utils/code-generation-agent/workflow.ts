/**
 * AI Code Generation Workflow
 *
 * Orchestrates the code generation process using the workflow builder.
 * Provides a structured, trackable flow with human-in-the-loop checkpoints.
 */

import { workflow } from "../orchestrator/workflow-builder";
import type {
  WorkflowDefinition,
  WorkflowResult,
  ExecutionOptions,
  CheckpointHandler,
} from "../orchestrator/types";
import type { LLMClient } from "../llm/client";
import type {
  CodeGenerationConfig,
  CodeGenerationResult,
  DesignContext,
  RefinementFeedback,
  ValidationResult,
} from "./types";
import { DEFAULT_CODE_GENERATION_CONFIG } from "./types";
import { CodeGenerationAgent, createCodeGenerationAgent } from "./agent";

// ============================================================================
// Workflow Input/Output Types
// ============================================================================

/**
 * Input for the code generation workflow
 */
export interface CodeGenerationWorkflowInput {
  /** Design context from Figma */
  designContext: DesignContext;
  /** Generation configuration */
  config?: Partial<CodeGenerationConfig>;
  /** LLM client for generation */
  llmClient: LLMClient;
  /** Maximum refinement iterations */
  maxRefinements?: number;
  /** Whether to require human approval at checkpoints */
  requireApproval?: boolean;
}

/**
 * Output from the code generation workflow
 */
export interface CodeGenerationWorkflowOutput {
  /** Final generation result */
  result: CodeGenerationResult;
  /** Whether the workflow completed successfully */
  success: boolean;
  /** Human feedback collected during the workflow */
  humanFeedback?: RefinementFeedback[];
  /** Number of refinement iterations */
  refinementIterations: number;
}

// ============================================================================
// Workflow Task Definitions
// ============================================================================

/**
 * Create the code generation workflow
 */
export function createCodeGenerationWorkflow(
  input: CodeGenerationWorkflowInput
): WorkflowDefinition {
  const agent = createCodeGenerationAgent(input.llmClient);
  const config: CodeGenerationConfig = {
    ...DEFAULT_CODE_GENERATION_CONFIG,
    ...input.config,
  };

  return workflow("code-generation")
    .name("Code Generation Workflow")
    .description(
      "Generate production-ready code from design context with validation and refinement"
    )
    .input({
      designContext: input.designContext,
      config,
      maxRefinements: input.maxRefinements ?? 3,
      requireApproval: input.requireApproval ?? true,
    })
    .maxParallelism(1) // Sequential for this workflow

    // Task 1: Analyze Design
    .task("analyze-design")
    .name("Analyze Design Context")
    .description("Analyze the Figma design to understand component structure")
    .priority("high")
    .executor(async (ctx) => {
      const { designContext } = ctx.workflowContext.initialInput as {
        designContext: DesignContext;
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 50,
        message: "Analyzing design structure...",
      });

      // Design context is already analyzed, just validate
      const analysis = {
        componentName: designContext.componentName,
        semanticType: designContext.semanticType,
        hasInteractiveStates: designContext.interactiveStates.length > 0,
        childCount: designContext.children.length,
        hasResponsive: designContext.responsive.breakpoints.length > 0,
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 100,
        message: "Design analysis complete",
      });

      return { analysis, designContext };
    })

    // Task 2: Generate Initial Code
    .task("generate-code")
    .name("Generate Component Code")
    .description("Generate initial code from design context")
    .dependsOn("analyze-design")
    .priority("high")
    .timeout(60000) // 1 minute timeout
    .executor(async (ctx) => {
      const { designContext, config } = ctx.workflowContext.initialInput as {
        designContext: DesignContext;
        config: CodeGenerationConfig;
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 10,
        message: "Starting code generation...",
      });

      const result = await agent.generate(designContext, config, {
        onEvent: (event) => {
          if (event.type === "file_generated") {
            ctx.emitProgress({
              taskId: ctx.taskId,
              percentage: 50,
              message: `Generated: ${event.file.path}`,
            });
          }
        },
      });

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 100,
        message: "Code generation complete",
      });

      return { result, agent };
    })

    // Task 3: Validate Generated Code
    .task("validate-code")
    .name("Validate Generated Code")
    .description("Validate the generated code for errors and best practices")
    .dependsOn("generate-code")
    .priority("normal")
    .executor(async (ctx) => {
      const generateResult = ctx.dependencyResults.get("generate-code");
      const { result } = generateResult?.output as {
        result: CodeGenerationResult;
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 50,
        message: "Validating generated code...",
      });

      // Already validated during generation
      const validation: ValidationResult = {
        valid: result.errors.length === 0,
        errors: result.errors.map((msg) => ({
          type: "syntax" as const,
          severity: "error" as const,
          message: msg,
        })),
        warnings: result.warnings.map((msg) => ({
          type: "style" as const,
          severity: "warning" as const,
          message: msg,
        })),
        suggestions: [],
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 100,
        message: `Validation complete: ${result.errors.length} errors, ${result.warnings.length} warnings`,
      });

      return { validation, result };
    })

    // Task 4: Human Review Checkpoint (optional)
    .task("review-checkpoint")
    .name("Review Generated Code")
    .description("Human review checkpoint for the generated code")
    .dependsOn("validate-code")
    .requireApproval(
      "Code Review",
      "Please review the generated code and provide feedback or approve"
    )
    .skipWhen((ctx) => {
      const { requireApproval } = ctx.workflowContext.initialInput as {
        requireApproval: boolean;
      };
      return !requireApproval;
    })
    .executor(async (ctx) => {
      const validateResult = ctx.dependencyResults.get("validate-code");
      const { result } = validateResult?.output as {
        result: CodeGenerationResult;
        validation: ValidationResult;
      };

      // If checkpoint was approved, continue
      if (ctx.input && (ctx.input as any).approval?.approved) {
        const approval = (ctx.input as any).approval;

        // Convert any provided feedback
        const humanFeedback: RefinementFeedback[] = [];

        if (approval.providedInput?.feedback) {
          humanFeedback.push({
            type: "enhancement",
            description: approval.providedInput.feedback,
            priority: "medium",
            source: "human",
          });
        }

        return {
          approved: true,
          result,
          humanFeedback,
        };
      }

      return {
        approved: true,
        result,
        humanFeedback: [],
      };
    })

    // Task 5: Apply Refinements (if needed)
    .task("refine-code")
    .name("Refine Code Based on Feedback")
    .description("Apply refinements based on validation and human feedback")
    .dependsOn("review-checkpoint")
    .skipWhen((ctx) => {
      const checkpointResult = ctx.dependencyResults.get("review-checkpoint");
      if (!checkpointResult?.output) return true;

      const { result, humanFeedback } = checkpointResult.output as {
        result: CodeGenerationResult;
        humanFeedback: RefinementFeedback[];
      };

      // Skip if no errors, no warnings, and no human feedback
      return (
        result.errors.length === 0 &&
        result.warnings.length === 0 &&
        humanFeedback.length === 0
      );
    })
    .retries(2)
    .executor(async (ctx) => {
      const generateResult = ctx.dependencyResults.get("generate-code");
      const checkpointResult = ctx.dependencyResults.get("review-checkpoint");

      const { agent } = generateResult?.output as { agent: CodeGenerationAgent };
      const { result, humanFeedback } = checkpointResult?.output as {
        result: CodeGenerationResult;
        humanFeedback: RefinementFeedback[];
      };

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 20,
        message: "Preparing refinement feedback...",
      });

      // Build feedback from errors, warnings, and human input
      const allFeedback: RefinementFeedback[] = [
        ...result.errors.map((msg) => ({
          type: "correction" as const,
          description: msg,
          priority: "critical" as const,
          source: "typecheck" as const,
        })),
        ...result.warnings.map((msg) => ({
          type: "style" as const,
          description: msg,
          priority: "medium" as const,
          source: "lint" as const,
        })),
        ...humanFeedback,
      ];

      if (allFeedback.length === 0) {
        return { refinedResult: result, refinementApplied: false };
      }

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 50,
        message: `Applying ${allFeedback.length} refinements...`,
      });

      const refinedResult = await agent.refine(result, allFeedback);

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 100,
        message: "Refinement complete",
      });

      return { refinedResult, refinementApplied: true };
    })

    // Task 6: Finalize Output
    .task("finalize")
    .name("Finalize Generation")
    .description("Prepare final output with all generated files")
    .dependsOn("refine-code")
    .priority("normal")
    .executor(async (ctx) => {
      const refineResult = ctx.dependencyResults.get("refine-code");
      const checkpointResult = ctx.dependencyResults.get("review-checkpoint");

      let finalResult: CodeGenerationResult;
      let refinementIterations = 0;

      if (refineResult?.output) {
        const { refinedResult, refinementApplied } = refineResult.output as {
          refinedResult: CodeGenerationResult;
          refinementApplied: boolean;
        };
        finalResult = refinedResult;
        refinementIterations = refinementApplied ? 1 : 0;
      } else if (checkpointResult?.output) {
        finalResult = (checkpointResult.output as { result: CodeGenerationResult })
          .result;
      } else {
        const validateResult = ctx.dependencyResults.get("validate-code");
        finalResult = (validateResult?.output as { result: CodeGenerationResult })
          .result;
      }

      ctx.emitProgress({
        taskId: ctx.taskId,
        percentage: 100,
        message: `Generation complete: ${finalResult.files.length} files`,
      });

      const humanFeedback =
        (checkpointResult?.output as { humanFeedback?: RefinementFeedback[] })
          ?.humanFeedback ?? [];

      return {
        result: finalResult,
        success: finalResult.success,
        humanFeedback,
        refinementIterations,
      } as CodeGenerationWorkflowOutput;
    })
    .build();
}

// ============================================================================
// Workflow Execution Helpers
// ============================================================================

/**
 * Execute the code generation workflow with default checkpoint handler
 */
export async function executeCodeGenerationWorkflow(
  input: CodeGenerationWorkflowInput,
  options?: Partial<ExecutionOptions>
): Promise<WorkflowResult> {
  // Import workflow executor dynamically to avoid circular deps
  const { executeWorkflow } = await import("../orchestrator/workflow-executor");

  const workflow = createCodeGenerationWorkflow(input);

  // Default checkpoint handler that auto-approves
  const defaultCheckpointHandler: CheckpointHandler = {
    requestApproval: async (request) => ({
      approved: true,
      approvedAt: new Date(),
    }),
  };

  return executeWorkflow(workflow, {
    ...options,
    checkpointHandler: options?.checkpointHandler ?? defaultCheckpointHandler,
  });
}

/**
 * Create a simple code generation function without workflow orchestration
 * Useful for single-shot generation without checkpoints
 */
export async function generateCode(
  designContext: DesignContext,
  config: Partial<CodeGenerationConfig>,
  llmClient: LLMClient
): Promise<CodeGenerationResult> {
  const agent = createCodeGenerationAgent(llmClient);
  return agent.generate(designContext, config);
}

/**
 * Create a refinement function for iterative improvement
 */
export async function refineCode(
  currentResult: CodeGenerationResult,
  feedback: RefinementFeedback[],
  llmClient: LLMClient
): Promise<CodeGenerationResult> {
  const agent = createCodeGenerationAgent(llmClient);

  // We need to set up the agent state first with a mock generation
  // This is a simplified version for direct refinement calls
  return agent.refine(currentResult, feedback);
}
