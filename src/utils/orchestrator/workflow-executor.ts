/**
 * Workflow Executor
 *
 * Orchestrates the execution of tasks in a workflow:
 * - Respects dependency ordering
 * - Executes independent tasks in parallel
 * - Handles checkpoints for human-in-the-loop
 * - Manages retries and error handling
 * - Emits events for real-time updates
 */

import { TaskGraph } from "./task-graph";
import type {
  TaskDefinition,
  TaskId,
  TaskStatus,
  TaskResult,
  TaskError,
  TaskTiming,
  TaskContext,
  TaskProgress,
  WorkflowDefinition,
  WorkflowContext,
  WorkflowStatus,
  WorkflowResult,
  WorkflowStats,
  WorkflowError,
  WorkflowEvent,
  ExecutionOptions,
  ApprovalRequest,
  ApprovalResponse,
  CheckpointHandler,
  InputMapping,
  InputMappingSource,
} from "./types";

// ============================================================================
// Executor Errors
// ============================================================================

export class WorkflowExecutorError extends Error {
  constructor(
    message: string,
    public readonly code: WorkflowExecutorErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "WorkflowExecutorError";
  }
}

export type WorkflowExecutorErrorCode =
  | "ALREADY_RUNNING"
  | "WORKFLOW_CANCELLED"
  | "WORKFLOW_TIMEOUT"
  | "CHECKPOINT_REJECTED"
  | "ALL_TASKS_FAILED"
  | "EXECUTION_ERROR";

// ============================================================================
// Default Checkpoint Handler
// ============================================================================

/**
 * Default checkpoint handler that auto-approves all checkpoints
 * Used when no checkpoint handler is provided
 */
const defaultCheckpointHandler: CheckpointHandler = {
  requestApproval: async (request: ApprovalRequest): Promise<ApprovalResponse> => {
    console.warn(
      `Checkpoint '${request.checkpointId}' auto-approved (no handler provided)`
    );
    return {
      approved: true,
      approvedAt: new Date(),
    };
  },
};

// ============================================================================
// Workflow Executor
// ============================================================================

/**
 * Executes workflows with parallel task execution and checkpoint support
 */
export class WorkflowExecutor {
  private graph: TaskGraph;
  private workflow: WorkflowDefinition;
  private workflowContext: WorkflowContext;
  private options: Required<ExecutionOptions>;
  private abortController: AbortController;

  // Execution state
  private status: WorkflowStatus = "pending";
  private completedTasks: Set<TaskId> = new Set();
  private runningTasks: Map<TaskId, Promise<TaskResult>> = new Map();
  private failedTasks: Set<TaskId> = new Set();
  private skippedTasks: Set<TaskId> = new Set();
  private taskResults: Map<TaskId, TaskResult> = new Map();
  private taskTimings: Map<TaskId, TaskTiming> = new Map();
  private retryCounts: Map<TaskId, number> = new Map();

  // Timing
  private startedAt: Date | null = null;
  private completedAt: Date | null = null;

  // Stats
  private checkpointsPassed = 0;
  private checkpointsRejected = 0;
  private maxParallelismReached = 0;

  constructor(
    workflow: WorkflowDefinition,
    options: ExecutionOptions = {}
  ) {
    this.workflow = workflow;
    this.graph = TaskGraph.fromWorkflow(workflow);
    this.abortController = new AbortController();

    // Merge options with defaults
    this.options = {
      maxParallelism: options.maxParallelism ?? workflow.maxParallelism ?? 5,
      timeoutMs: options.timeoutMs ?? workflow.timeoutMs ?? 0,
      signal: options.signal ?? this.abortController.signal,
      onEvent: options.onEvent ?? (() => {}),
      checkpointHandler: options.checkpointHandler ?? defaultCheckpointHandler,
      continueOnFailure: options.continueOnFailure ?? false,
      dryRun: options.dryRun ?? false,
    };

    // Initialize workflow context
    this.workflowContext = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      initialInput: workflow.initialInput ?? {},
      sharedState: new Map(),
      metadata: workflow.metadata ?? {},
      startedAt: new Date(),
    };

    // Link external abort signal
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        this.cancel("External abort signal received");
      });
    }
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<WorkflowResult> {
    if (this.status === "running") {
      throw new WorkflowExecutorError(
        "Workflow is already running",
        "ALREADY_RUNNING"
      );
    }

    this.status = "running";
    this.startedAt = new Date();
    this.workflowContext.startedAt = this.startedAt;

    this.emitEvent({
      type: "workflow_started",
      workflowId: this.workflow.id,
      timestamp: this.startedAt,
    });

    // Set up workflow timeout
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (this.options.timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        this.cancel("Workflow timeout exceeded");
      }, this.options.timeoutMs);
    }

    try {
      await this.executeLoop();

      this.completedAt = new Date();
      const result = this.buildResult();

      this.emitEvent({
        type: "workflow_completed",
        workflowId: this.workflow.id,
        result,
      });

      return result;
    } catch (error) {
      this.completedAt = new Date();
      const workflowError = this.buildWorkflowError(error);

      this.status = "failed";

      this.emitEvent({
        type: "workflow_failed",
        workflowId: this.workflow.id,
        error: workflowError,
      });

      return this.buildResult(workflowError);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Main execution loop
   */
  private async executeLoop(): Promise<void> {
    while (true) {
      // Check for cancellation
      if (this.options.signal.aborted) {
        throw new WorkflowExecutorError(
          "Workflow was cancelled",
          "WORKFLOW_CANCELLED"
        );
      }

      // Get tasks ready to execute
      const readyTasks = this.graph.getReadyTasks(
        this.completedTasks,
        new Set(this.runningTasks.keys()),
        this.options.continueOnFailure ? new Set() : this.failedTasks
      );

      // Check if we're done
      if (readyTasks.length === 0 && this.runningTasks.size === 0) {
        // All tasks completed or no more can run
        if (this.completedTasks.size === this.graph.size) {
          this.status = "completed";
        } else if (this.failedTasks.size > 0) {
          this.status = "failed";
        }
        break;
      }

      // If no ready tasks but some are running, wait for them
      if (readyTasks.length === 0 && this.runningTasks.size > 0) {
        await this.waitForAnyTask();
        continue;
      }

      // Calculate how many more tasks we can run
      const availableSlots = this.options.maxParallelism - this.runningTasks.size;
      const tasksToStart = readyTasks.slice(0, availableSlots);

      // Start new tasks
      for (const task of tasksToStart) {
        this.startTask(task);
      }

      // Track max parallelism
      if (this.runningTasks.size > this.maxParallelismReached) {
        this.maxParallelismReached = this.runningTasks.size;
      }

      // Wait for at least one task to complete before continuing
      if (this.runningTasks.size >= this.options.maxParallelism) {
        await this.waitForAnyTask();
      }
    }
  }

  /**
   * Start executing a task
   */
  private startTask(task: TaskDefinition): void {
    const timing: TaskTiming = {
      queuedAt: new Date(),
      startedAt: new Date(),
    };
    this.taskTimings.set(task.id, timing);

    this.emitEvent({
      type: "task_started",
      taskId: task.id,
      timestamp: timing.startedAt!,
    });

    const promise = this.executeTask(task, timing);
    this.runningTasks.set(task.id, promise);

    // Handle completion
    promise.then((result) => {
      this.runningTasks.delete(task.id);
      this.taskResults.set(task.id, result);
      this.graph.setTaskResult(task.id, result);

      if (result.status === "completed") {
        this.completedTasks.add(task.id);
        this.emitEvent({
          type: "task_completed",
          taskId: task.id,
          result,
        });
      } else if (result.status === "failed") {
        this.failedTasks.add(task.id);
        this.emitEvent({
          type: "task_failed",
          taskId: task.id,
          error: result.error!,
          willRetry: false,
        });
      } else if (result.status === "skipped") {
        this.skippedTasks.add(task.id);
        this.completedTasks.add(task.id); // Treat as completed for dependency purposes
      }
    });
  }

  /**
   * Execute a single task with retry support
   */
  private async executeTask(
    task: TaskDefinition,
    timing: TaskTiming
  ): Promise<TaskResult> {
    const maxRetries = task.retries ?? 0;
    let lastError: TaskError | undefined;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        // Check skip condition
        const context = this.buildTaskContext(task);
        if (task.skipCondition?.(context)) {
          timing.completedAt = new Date();
          timing.durationMs = timing.completedAt.getTime() - timing.startedAt!.getTime();

          return {
            taskId: task.id,
            status: "skipped",
            timing,
            retryCount,
          };
        }

        // Handle checkpoint
        if (task.isCheckpoint && task.checkpointConfig) {
          const approval = await this.handleCheckpoint(task, context);

          if (!approval.approved) {
            this.checkpointsRejected++;
            throw new WorkflowExecutorError(
              `Checkpoint rejected: ${approval.rejectionReason}`,
              "CHECKPOINT_REJECTED",
              { taskId: task.id }
            );
          }

          this.checkpointsPassed++;

          timing.completedAt = new Date();
          timing.durationMs = timing.completedAt.getTime() - timing.startedAt!.getTime();

          return {
            taskId: task.id,
            status: "completed",
            output: { checkpointApproval: approval },
            timing,
            retryCount,
            approval,
          };
        }

        // Execute the task
        if (this.options.dryRun) {
          timing.completedAt = new Date();
          timing.durationMs = timing.completedAt.getTime() - timing.startedAt!.getTime();

          return {
            taskId: task.id,
            status: "completed",
            output: { dryRun: true },
            timing,
            retryCount,
          };
        }

        // Set up task timeout
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const taskTimeout = task.timeout ?? 60000;

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Task timeout after ${taskTimeout}ms`));
          }, taskTimeout);
        });

        const output = await Promise.race([
          task.executor(context),
          timeoutPromise,
        ]);

        if (timeoutId) clearTimeout(timeoutId);

        timing.completedAt = new Date();
        timing.durationMs = timing.completedAt.getTime() - timing.startedAt!.getTime();

        return {
          taskId: task.id,
          status: "completed",
          output,
          timing,
          retryCount,
        };
      } catch (error) {
        lastError = this.buildTaskError(error);

        // Check if we should retry
        if (retryCount < maxRetries && lastError.retryable) {
          retryCount++;
          this.retryCounts.set(task.id, retryCount);

          this.emitEvent({
            type: "task_failed",
            taskId: task.id,
            error: lastError,
            willRetry: true,
          });

          // Exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
          await this.sleep(backoffMs);

          continue;
        }

        break;
      }
    }

    timing.completedAt = new Date();
    timing.durationMs = timing.completedAt.getTime() - timing.startedAt!.getTime();

    return {
      taskId: task.id,
      status: "failed",
      error: lastError,
      timing,
      retryCount,
    };
  }

  /**
   * Build task context for execution
   */
  private buildTaskContext<TInput>(task: TaskDefinition<TInput>): TaskContext<TInput> {
    // Build input from dependency results and mappings
    const input = this.buildTaskInput(task as TaskDefinition) as TInput;

    // Collect dependency results
    const dependencyResults = new Map<TaskId, TaskResult>();
    for (const depId of task.dependencies) {
      const result = this.taskResults.get(depId);
      if (result) {
        dependencyResults.set(depId, result);
      }
    }

    return {
      taskId: task.id,
      input,
      dependencyResults,
      workflowContext: this.workflowContext,
      signal: this.options.signal,
      emitProgress: (progress: TaskProgress) => {
        this.emitEvent({
          type: "task_progress",
          taskId: task.id,
          progress,
        });
      },
      requestApproval: async (request: ApprovalRequest) => {
        return this.options.checkpointHandler.requestApproval(request);
      },
    };
  }

  /**
   * Build task input from mappings and dependency outputs
   */
  private buildTaskInput(task: TaskDefinition): Record<string, unknown> {
    const input: Record<string, unknown> = {};

    if (!task.inputMapping) {
      // Default: merge all dependency outputs
      for (const depId of task.dependencies) {
        const result = this.taskResults.get(depId);
        if (result?.output && typeof result.output === "object") {
          Object.assign(input, result.output);
        }
      }
      return input;
    }

    // Use explicit input mapping
    for (const [inputKey, source] of Object.entries(task.inputMapping)) {
      input[inputKey] = this.resolveInputSource(source);
    }

    return input;
  }

  /**
   * Resolve an input mapping source to a value
   */
  private resolveInputSource(source: InputMappingSource): unknown {
    switch (source.type) {
      case "static":
        return source.value;

      case "workflow":
        return this.workflowContext.sharedState.get(source.contextKey) ??
          this.workflowContext.initialInput[source.contextKey];

      case "dependency": {
        const result = this.taskResults.get(source.taskId);
        if (!result?.output || typeof result.output !== "object") {
          return undefined;
        }
        return (result.output as Record<string, unknown>)[source.outputKey];
      }

      default:
        return undefined;
    }
  }

  /**
   * Handle a checkpoint task
   */
  private async handleCheckpoint(
    task: TaskDefinition,
    context: TaskContext<unknown>
  ): Promise<ApprovalResponse> {
    const config = task.checkpointConfig!;

    // Build review data if configured
    const reviewData = config.reviewData?.(context);

    const request: ApprovalRequest = {
      checkpointId: `${this.workflow.id}_${task.id}`,
      config,
      context: {
        taskId: task.id,
        taskName: task.name,
        workflowId: this.workflow.id,
        reviewData,
      },
      timestamp: new Date(),
    };

    this.status = "paused";
    this.emitEvent({
      type: "workflow_paused",
      workflowId: this.workflow.id,
      checkpointId: request.checkpointId,
    });

    this.emitEvent({
      type: "checkpoint_waiting",
      taskId: task.id,
      request,
    });

    // Wait for approval with optional timeout
    let response: ApprovalResponse;

    if (config.timeoutMs && config.timeoutMs > 0) {
      const timeoutPromise = new Promise<ApprovalResponse>((resolve) => {
        setTimeout(() => {
          resolve({
            approved: config.timeoutAction !== "reject",
            rejectionReason:
              config.timeoutAction === "reject" ? "Checkpoint timed out" : undefined,
            approvedAt: new Date(),
          });
        }, config.timeoutMs);
      });

      response = await Promise.race([
        this.options.checkpointHandler.requestApproval(request),
        timeoutPromise,
      ]);
    } else {
      response = await this.options.checkpointHandler.requestApproval(request);
    }

    this.status = "running";
    this.emitEvent({
      type: "workflow_resumed",
      workflowId: this.workflow.id,
    });

    this.emitEvent({
      type: "checkpoint_resolved",
      taskId: task.id,
      response,
    });

    return response;
  }

  /**
   * Wait for any running task to complete
   */
  private async waitForAnyTask(): Promise<void> {
    if (this.runningTasks.size === 0) return;

    await Promise.race(Array.from(this.runningTasks.values()));
  }

  /**
   * Cancel the workflow
   */
  cancel(reason: string): void {
    this.abortController.abort();
    this.status = "cancelled";

    this.emitEvent({
      type: "workflow_cancelled",
      workflowId: this.workflow.id,
      reason,
    });
  }

  /**
   * Build the final workflow result
   */
  private buildResult(error?: WorkflowError): WorkflowResult {
    // Collect final output from terminal tasks
    const terminalTasks = this.graph.getTerminalTasks();
    const finalOutput: Record<string, unknown> = {};

    for (const task of terminalTasks) {
      const result = this.taskResults.get(task.id);
      if (result?.output && typeof result.output === "object") {
        Object.assign(finalOutput, result.output);
      }
    }

    // Calculate total retries
    let totalRetries = 0;
    for (const count of this.retryCounts.values()) {
      totalRetries += count;
    }

    const stats: WorkflowStats = {
      totalTasks: this.graph.size,
      completedTasks: this.completedTasks.size,
      failedTasks: this.failedTasks.size,
      skippedTasks: this.skippedTasks.size,
      checkpointsPassed: this.checkpointsPassed,
      checkpointsRejected: this.checkpointsRejected,
      totalRetries,
      maxParallelism: this.maxParallelismReached,
    };

    return {
      workflowId: this.workflow.id,
      status: this.status,
      taskResults: this.taskResults,
      finalOutput: Object.keys(finalOutput).length > 0 ? finalOutput : undefined,
      timing: {
        startedAt: this.startedAt!,
        completedAt: this.completedAt ?? undefined,
        totalDurationMs: this.completedAt
          ? this.completedAt.getTime() - this.startedAt!.getTime()
          : undefined,
      },
      stats,
      error,
    };
  }

  /**
   * Build a workflow error from an exception
   */
  private buildWorkflowError(error: unknown): WorkflowError {
    if (error instanceof WorkflowExecutorError) {
      return {
        message: error.message,
        failedTaskId: (error.details?.taskId as TaskId) ?? undefined,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: String(error),
    };
  }

  /**
   * Build a task error from an exception
   */
  private buildTaskError(error: unknown): TaskError {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        retryable: this.isRetryableError(error),
        cause: error,
      };
    }

    return {
      message: String(error),
      retryable: false,
      cause: error,
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Don't retry explicit rejections
    if (error instanceof WorkflowExecutorError) {
      return false;
    }

    // Retry network-like errors
    const retryableMessages = [
      "timeout",
      "network",
      "ECONNRESET",
      "ETIMEDOUT",
      "rate limit",
      "503",
      "502",
      "429",
    ];

    const message = error.message.toLowerCase();
    return retryableMessages.some((m) => message.includes(m.toLowerCase()));
  }

  /**
   * Emit a workflow event
   */
  private emitEvent(event: WorkflowEvent): void {
    try {
      this.options.onEvent(event);
    } catch (e) {
      console.error("Error in event handler:", e);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current execution status
   */
  getStatus(): WorkflowStatus {
    return this.status;
  }

  /**
   * Get the task graph
   */
  getGraph(): TaskGraph {
    return this.graph;
  }

  /**
   * Get current progress
   */
  getProgress(): {
    completed: number;
    failed: number;
    running: number;
    pending: number;
    total: number;
  } {
    const running = this.runningTasks.size;
    const completed = this.completedTasks.size;
    const failed = this.failedTasks.size;
    const total = this.graph.size;
    const pending = total - completed - failed - running;

    return { completed, failed, running, pending, total };
  }
}

/**
 * Execute a workflow with the default executor
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  options?: ExecutionOptions
): Promise<WorkflowResult> {
  const executor = new WorkflowExecutor(workflow, options);
  return executor.execute();
}
