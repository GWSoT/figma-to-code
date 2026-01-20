/**
 * Agentic Task Orchestrator - Type Definitions
 *
 * Defines types for multi-step agentic workflows with:
 * - Task graphs with dependencies (DAG)
 * - Parallel execution where possible
 * - Human-in-the-loop checkpoints
 */

// ============================================================================
// Core Task Types
// ============================================================================

/**
 * Unique identifier for a task
 */
export type TaskId = string;

/**
 * Task execution status
 */
export type TaskStatus =
  | "pending"
  | "ready" // All dependencies satisfied
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "waiting_checkpoint"; // Paused at human-in-the-loop checkpoint

/**
 * Priority level for task execution
 */
export type TaskPriority = "low" | "normal" | "high" | "critical";

/**
 * Task input/output types for type safety
 */
export interface TaskIO {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

/**
 * Context passed to task executors
 */
export interface TaskContext<TInput = Record<string, unknown>> {
  /** Unique task ID */
  taskId: TaskId;
  /** Input data for this task */
  input: TInput;
  /** Results from dependent tasks */
  dependencyResults: Map<TaskId, TaskResult<unknown>>;
  /** Shared workflow context */
  workflowContext: WorkflowContext;
  /** Signal for cancellation */
  signal: AbortSignal;
  /** Emit progress updates */
  emitProgress: (progress: TaskProgress) => void;
  /** Request human approval (for checkpoint tasks) */
  requestApproval: (request: ApprovalRequest) => Promise<ApprovalResponse>;
}

/**
 * Task executor function type
 */
export type TaskExecutor<TInput = unknown, TOutput = unknown> = (
  context: TaskContext<TInput>
) => Promise<TOutput>;

/**
 * Progress update from a task
 */
export interface TaskProgress {
  taskId: TaskId;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Current step description */
  message: string;
  /** Optional detailed data */
  details?: Record<string, unknown>;
}

/**
 * Task definition
 */
export interface TaskDefinition<TInput = unknown, TOutput = unknown> {
  /** Unique task identifier */
  id: TaskId;
  /** Human-readable task name */
  name: string;
  /** Task description */
  description: string;
  /** Task executor function */
  executor: TaskExecutor<TInput, TOutput>;
  /** IDs of tasks that must complete before this task */
  dependencies: TaskId[];
  /** Task priority */
  priority: TaskPriority;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts on failure */
  retries?: number;
  /** Whether this task is a checkpoint requiring human approval */
  isCheckpoint?: boolean;
  /** Checkpoint configuration if isCheckpoint is true */
  checkpointConfig?: CheckpointConfig;
  /** Input mapping from dependency outputs */
  inputMapping?: InputMapping;
  /** Whether to skip this task on certain conditions */
  skipCondition?: (context: TaskContext<TInput>) => boolean;
  /** Tags for filtering and grouping */
  tags?: string[];
}

// ============================================================================
// Dependency and Input Mapping
// ============================================================================

/**
 * Maps outputs from dependencies to this task's inputs
 */
export interface InputMapping {
  /** Map of inputKey -> { taskId, outputKey } or static value */
  [inputKey: string]: InputMappingSource;
}

/**
 * Source for an input mapping
 */
export type InputMappingSource =
  | { type: "dependency"; taskId: TaskId; outputKey: string }
  | { type: "static"; value: unknown }
  | { type: "workflow"; contextKey: string };

// ============================================================================
// Checkpoint Types (Human-in-the-loop)
// ============================================================================

/**
 * Configuration for checkpoint tasks
 */
export interface CheckpointConfig {
  /** Title for the checkpoint UI */
  title: string;
  /** Description of what needs approval */
  description: string;
  /** Type of approval needed */
  approvalType: "approve_reject" | "select_option" | "provide_input" | "review_modify";
  /** Options if approvalType is 'select_option' */
  options?: CheckpointOption[];
  /** Fields if approvalType is 'provide_input' */
  inputFields?: CheckpointInputField[];
  /** Data to display for review */
  reviewData?: (context: TaskContext<unknown>) => unknown;
  /** Timeout before auto-proceeding (0 = wait indefinitely) */
  timeoutMs?: number;
  /** Default action on timeout */
  timeoutAction?: "approve" | "reject" | "skip";
}

/**
 * Option for select_option checkpoints
 */
export interface CheckpointOption {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * Input field for provide_input checkpoints
 */
export interface CheckpointInputField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "multiline";
  required: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  validation?: (value: unknown) => string | null;
}

/**
 * Request for human approval
 */
export interface ApprovalRequest {
  checkpointId: string;
  config: CheckpointConfig;
  context: {
    taskId: TaskId;
    taskName: string;
    workflowId: string;
    reviewData?: unknown;
  };
  timestamp: Date;
}

/**
 * Response from human approval
 */
export interface ApprovalResponse {
  approved: boolean;
  /** Selected option if approvalType was 'select_option' */
  selectedOption?: string;
  /** Provided input if approvalType was 'provide_input' */
  providedInput?: Record<string, unknown>;
  /** Modified data if approvalType was 'review_modify' */
  modifiedData?: unknown;
  /** Rejection reason if not approved */
  rejectionReason?: string;
  /** Who approved (for audit) */
  approvedBy?: string;
  /** When approved */
  approvedAt: Date;
}

// ============================================================================
// Execution Result Types
// ============================================================================

/**
 * Result of a task execution
 */
export interface TaskResult<TOutput = unknown> {
  taskId: TaskId;
  status: TaskStatus;
  /** Output data if successful */
  output?: TOutput;
  /** Error if failed */
  error?: TaskError;
  /** Execution timing */
  timing: TaskTiming;
  /** Number of retries attempted */
  retryCount: number;
  /** Approval response if this was a checkpoint */
  approval?: ApprovalResponse;
}

/**
 * Task execution timing information
 */
export interface TaskTiming {
  /** When the task was queued */
  queuedAt: Date;
  /** When the task started executing */
  startedAt?: Date;
  /** When the task completed (success or failure) */
  completedAt?: Date;
  /** Total execution duration in ms */
  durationMs?: number;
  /** Time spent waiting for dependencies */
  waitingMs?: number;
}

/**
 * Task error information
 */
export interface TaskError {
  message: string;
  code?: string;
  stack?: string;
  retryable: boolean;
  /** Original error if wrapped */
  cause?: unknown;
}

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * Workflow definition (collection of tasks forming a DAG)
 */
export interface WorkflowDefinition {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Workflow description */
  description: string;
  /** Tasks in this workflow */
  tasks: TaskDefinition[];
  /** Initial input for the workflow */
  initialInput?: Record<string, unknown>;
  /** Global timeout for entire workflow */
  timeoutMs?: number;
  /** Maximum parallel tasks */
  maxParallelism?: number;
  /** Workflow-level retry policy */
  retryPolicy?: WorkflowRetryPolicy;
  /** Metadata for tracking */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow retry policy
 */
export interface WorkflowRetryPolicy {
  maxRetries: number;
  retryableStatuses: TaskStatus[];
  backoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

/**
 * Shared context available to all tasks in a workflow
 */
export interface WorkflowContext {
  /** Workflow ID */
  workflowId: string;
  /** Workflow name */
  workflowName: string;
  /** Initial workflow input */
  initialInput: Record<string, unknown>;
  /** Shared state that tasks can read/write */
  sharedState: Map<string, unknown>;
  /** Workflow metadata */
  metadata: Record<string, unknown>;
  /** Start time */
  startedAt: Date;
}

/**
 * Workflow execution status
 */
export type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused"; // Waiting for checkpoint

/**
 * Complete workflow execution result
 */
export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  /** Results for each task */
  taskResults: Map<TaskId, TaskResult>;
  /** Final output (from terminal tasks) */
  finalOutput?: Record<string, unknown>;
  /** Overall timing */
  timing: {
    startedAt: Date;
    completedAt?: Date;
    totalDurationMs?: number;
  };
  /** Execution statistics */
  stats: WorkflowStats;
  /** Error if workflow failed */
  error?: WorkflowError;
}

/**
 * Workflow execution statistics
 */
export interface WorkflowStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  checkpointsPassed: number;
  checkpointsRejected: number;
  totalRetries: number;
  maxParallelism: number;
}

/**
 * Workflow-level error
 */
export interface WorkflowError {
  message: string;
  failedTaskId?: TaskId;
  cause?: TaskError;
}

// ============================================================================
// Event Types (for real-time updates)
// ============================================================================

/**
 * Events emitted during workflow execution
 */
export type WorkflowEvent =
  | { type: "workflow_started"; workflowId: string; timestamp: Date }
  | { type: "workflow_completed"; workflowId: string; result: WorkflowResult }
  | { type: "workflow_failed"; workflowId: string; error: WorkflowError }
  | { type: "workflow_cancelled"; workflowId: string; reason: string }
  | { type: "workflow_paused"; workflowId: string; checkpointId: string }
  | { type: "workflow_resumed"; workflowId: string }
  | { type: "task_started"; taskId: TaskId; timestamp: Date }
  | { type: "task_completed"; taskId: TaskId; result: TaskResult }
  | { type: "task_failed"; taskId: TaskId; error: TaskError; willRetry: boolean }
  | { type: "task_progress"; taskId: TaskId; progress: TaskProgress }
  | { type: "checkpoint_waiting"; taskId: TaskId; request: ApprovalRequest }
  | { type: "checkpoint_resolved"; taskId: TaskId; response: ApprovalResponse };

/**
 * Event listener for workflow events
 */
export type WorkflowEventListener = (event: WorkflowEvent) => void;

// ============================================================================
// Execution Options
// ============================================================================

/**
 * Options for workflow execution
 */
export interface ExecutionOptions {
  /** Maximum parallel tasks (overrides workflow definition) */
  maxParallelism?: number;
  /** Global timeout (overrides workflow definition) */
  timeoutMs?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Event listener for real-time updates */
  onEvent?: WorkflowEventListener;
  /** Checkpoint handler for human-in-the-loop */
  checkpointHandler?: CheckpointHandler;
  /** Whether to continue on task failure */
  continueOnFailure?: boolean;
  /** Dry run mode (don't actually execute tasks) */
  dryRun?: boolean;
}

/**
 * Handler for checkpoint approvals
 */
export interface CheckpointHandler {
  /** Request approval for a checkpoint */
  requestApproval: (request: ApprovalRequest) => Promise<ApprovalResponse>;
  /** Called when a checkpoint is cancelled */
  onCancel?: (checkpointId: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Task graph node for internal use
 */
export interface TaskNode {
  task: TaskDefinition;
  dependsOn: Set<TaskId>;
  dependents: Set<TaskId>;
  status: TaskStatus;
  result?: TaskResult;
}

/**
 * Serializable workflow state for persistence
 */
export interface SerializableWorkflowState {
  workflowId: string;
  status: WorkflowStatus;
  taskStates: Array<{
    taskId: TaskId;
    status: TaskStatus;
    result?: TaskResult;
  }>;
  sharedState: Record<string, unknown>;
  currentCheckpoint?: string;
  savedAt: Date;
}
