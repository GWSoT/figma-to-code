/**
 * Agentic Task Orchestrator
 *
 * Orchestrates multi-step agentic workflows for complex conversions.
 * Features:
 * - Task graphs with dependencies (DAG)
 * - Parallel execution where possible
 * - Human-in-the-loop checkpoints
 * - Retry and error handling
 * - Real-time event streaming
 *
 * @example
 * ```typescript
 * import { workflow, executeWorkflow } from '~/utils/orchestrator';
 *
 * const myWorkflow = workflow('example')
 *   .name('Example Workflow')
 *   .task('analyze')
 *     .name('Analyze Input')
 *     .executor(async (ctx) => {
 *       return { analyzed: true };
 *     })
 *   .task('generate')
 *     .name('Generate Code')
 *     .dependsOn('analyze')
 *     .executor(async (ctx) => {
 *       return { code: '...' };
 *     })
 *   .task('review')
 *     .name('Review Generated Code')
 *     .dependsOn('generate')
 *     .requireApproval('Code Review', 'Please review the generated code')
 *     .executor(async () => ({}))
 *   .build();
 *
 * const result = await executeWorkflow(myWorkflow, {
 *   onEvent: (event) => console.log(event),
 *   checkpointHandler: {
 *     requestApproval: async (request) => {
 *       // Show UI, wait for user input
 *       return { approved: true, approvedAt: new Date() };
 *     }
 *   }
 * });
 * ```
 */

// Types
export type {
  // Core task types
  TaskId,
  TaskStatus,
  TaskPriority,
  TaskIO,
  TaskContext,
  TaskExecutor,
  TaskProgress,
  TaskDefinition,
  TaskResult,
  TaskError,
  TaskTiming,
  TaskNode,

  // Input mapping
  InputMapping,
  InputMappingSource,

  // Checkpoint types
  CheckpointConfig,
  CheckpointOption,
  CheckpointInputField,
  ApprovalRequest,
  ApprovalResponse,
  CheckpointHandler,

  // Workflow types
  WorkflowDefinition,
  WorkflowContext,
  WorkflowStatus,
  WorkflowResult,
  WorkflowStats,
  WorkflowError,
  WorkflowRetryPolicy,

  // Event types
  WorkflowEvent,
  WorkflowEventListener,

  // Execution options
  ExecutionOptions,

  // Serialization
  SerializableWorkflowState,
} from "./types";

// Task Graph
export { TaskGraph, TaskGraphError } from "./task-graph";
export type { TaskGraphErrorCode, TaskGraphStats } from "./task-graph";

// Workflow Executor
export {
  WorkflowExecutor,
  WorkflowExecutorError,
  executeWorkflow,
} from "./workflow-executor";
export type { WorkflowExecutorErrorCode } from "./workflow-executor";

// Workflow Builder
export {
  WorkflowBuilder,
  TaskBuilder,
  LinkedTaskBuilder,
  workflow,
  task,
  simpleTask,
  checkpointTask,
  conditionalTask,
  pipeline,
  mapReduce,
  withRetries,
} from "./workflow-builder";
