/**
 * Workflow Builder
 *
 * Fluent API for constructing workflows with type-safe task definitions.
 * Makes it easy to define complex task graphs with clear dependency relationships.
 */

import type {
  TaskDefinition,
  TaskId,
  TaskExecutor,
  TaskPriority,
  CheckpointConfig,
  InputMapping,
  WorkflowDefinition,
  WorkflowRetryPolicy,
  TaskContext,
  CheckpointOption,
  CheckpointInputField,
} from "./types";

// ============================================================================
// Task Builder (Standalone)
// ============================================================================

/**
 * Builder for individual tasks (standalone use)
 */
export class TaskBuilder<TInput = unknown, TOutput = unknown> {
  private taskDef: Partial<TaskDefinition<TInput, TOutput>> = {
    dependencies: [],
    priority: "normal",
  };

  constructor(id: TaskId) {
    this.taskDef.id = id;
  }

  name(name: string): this {
    this.taskDef.name = name;
    return this;
  }

  description(description: string): this {
    this.taskDef.description = description;
    return this;
  }

  executor(executor: TaskExecutor<TInput, TOutput>): this {
    this.taskDef.executor = executor;
    return this;
  }

  dependsOn(...taskIds: TaskId[]): this {
    this.taskDef.dependencies = [
      ...(this.taskDef.dependencies ?? []),
      ...taskIds,
    ];
    return this;
  }

  priority(priority: TaskPriority): this {
    this.taskDef.priority = priority;
    return this;
  }

  timeout(ms: number): this {
    this.taskDef.timeout = ms;
    return this;
  }

  retries(count: number): this {
    this.taskDef.retries = count;
    return this;
  }

  tags(...tags: string[]): this {
    this.taskDef.tags = [...(this.taskDef.tags ?? []), ...tags];
    return this;
  }

  inputMapping(mapping: InputMapping): this {
    this.taskDef.inputMapping = mapping;
    return this;
  }

  mapInput(
    inputKey: string,
    source:
      | { from: TaskId; key: string }
      | { static: unknown }
      | { workflow: string }
  ): this {
    if (!this.taskDef.inputMapping) {
      this.taskDef.inputMapping = {};
    }

    if ("from" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "dependency",
        taskId: source.from,
        outputKey: source.key,
      };
    } else if ("static" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "static",
        value: source.static,
      };
    } else if ("workflow" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "workflow",
        contextKey: source.workflow,
      };
    }

    return this;
  }

  skipWhen(condition: (context: TaskContext<TInput>) => boolean): this {
    this.taskDef.skipCondition = condition;
    return this;
  }

  checkpoint(config: CheckpointConfig): this {
    this.taskDef.isCheckpoint = true;
    this.taskDef.checkpointConfig = config;
    return this;
  }

  requireApproval(title: string, description: string): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "approve_reject",
    });
  }

  selectOption(
    title: string,
    description: string,
    options: CheckpointOption[]
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "select_option",
      options,
    });
  }

  requestInput(
    title: string,
    description: string,
    fields: CheckpointInputField[]
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "provide_input",
      inputFields: fields,
    });
  }

  reviewModify(
    title: string,
    description: string,
    reviewData: (context: TaskContext<unknown>) => unknown
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "review_modify",
      reviewData,
    });
  }

  build(): TaskDefinition<TInput, TOutput> {
    if (!this.taskDef.id) {
      throw new Error("Task must have an id");
    }
    if (!this.taskDef.executor) {
      throw new Error(`Task '${this.taskDef.id}' must have an executor`);
    }
    if (!this.taskDef.name) {
      this.taskDef.name = this.taskDef.id;
    }
    if (!this.taskDef.description) {
      this.taskDef.description = `Task: ${this.taskDef.name}`;
    }

    return this.taskDef as TaskDefinition<TInput, TOutput>;
  }
}

// ============================================================================
// Linked Task Builder (for chaining back to workflow)
// ============================================================================

/**
 * Task builder that links back to the workflow builder for fluent chaining
 */
export class LinkedTaskBuilder<TInput = unknown, TOutput = unknown> {
  private taskDef: Partial<TaskDefinition<TInput, TOutput>> = {
    dependencies: [],
    priority: "normal",
  };

  constructor(
    id: TaskId,
    private readonly workflowBuilder: WorkflowBuilder
  ) {
    this.taskDef.id = id;
  }

  name(name: string): this {
    this.taskDef.name = name;
    return this;
  }

  description(description: string): this {
    this.taskDef.description = description;
    return this;
  }

  executor(executor: TaskExecutor<TInput, TOutput>): WorkflowBuilder {
    this.taskDef.executor = executor;
    this.finalize();
    return this.workflowBuilder;
  }

  dependsOn(...taskIds: TaskId[]): this {
    this.taskDef.dependencies = [
      ...(this.taskDef.dependencies ?? []),
      ...taskIds,
    ];
    return this;
  }

  priority(priority: TaskPriority): this {
    this.taskDef.priority = priority;
    return this;
  }

  timeout(ms: number): this {
    this.taskDef.timeout = ms;
    return this;
  }

  retries(count: number): this {
    this.taskDef.retries = count;
    return this;
  }

  tags(...tags: string[]): this {
    this.taskDef.tags = [...(this.taskDef.tags ?? []), ...tags];
    return this;
  }

  inputMapping(mapping: InputMapping): this {
    this.taskDef.inputMapping = mapping;
    return this;
  }

  mapInput(
    inputKey: string,
    source:
      | { from: TaskId; key: string }
      | { static: unknown }
      | { workflow: string }
  ): this {
    if (!this.taskDef.inputMapping) {
      this.taskDef.inputMapping = {};
    }

    if ("from" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "dependency",
        taskId: source.from,
        outputKey: source.key,
      };
    } else if ("static" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "static",
        value: source.static,
      };
    } else if ("workflow" in source) {
      this.taskDef.inputMapping[inputKey] = {
        type: "workflow",
        contextKey: source.workflow,
      };
    }

    return this;
  }

  skipWhen(condition: (context: TaskContext<TInput>) => boolean): this {
    this.taskDef.skipCondition = condition;
    return this;
  }

  checkpoint(config: CheckpointConfig): this {
    this.taskDef.isCheckpoint = true;
    this.taskDef.checkpointConfig = config;
    return this;
  }

  requireApproval(title: string, description: string): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "approve_reject",
    });
  }

  selectOption(
    title: string,
    description: string,
    options: CheckpointOption[]
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "select_option",
      options,
    });
  }

  requestInput(
    title: string,
    description: string,
    fields: CheckpointInputField[]
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "provide_input",
      inputFields: fields,
    });
  }

  reviewModify(
    title: string,
    description: string,
    reviewData: (context: TaskContext<unknown>) => unknown
  ): this {
    return this.checkpoint({
      title,
      description,
      approvalType: "review_modify",
      reviewData,
    });
  }

  private finalize(): void {
    if (!this.taskDef.id) {
      throw new Error("Task must have an id");
    }
    if (!this.taskDef.name) {
      this.taskDef.name = this.taskDef.id;
    }
    if (!this.taskDef.description) {
      this.taskDef.description = `Task: ${this.taskDef.name}`;
    }

    this.workflowBuilder.addTask(this.taskDef as TaskDefinition);
  }
}

// ============================================================================
// Workflow Builder
// ============================================================================

/**
 * Builder for workflows
 */
export class WorkflowBuilder {
  private workflowDef: Partial<WorkflowDefinition> = {
    tasks: [],
  };

  constructor(id: string) {
    this.workflowDef.id = id;
  }

  name(name: string): this {
    this.workflowDef.name = name;
    return this;
  }

  description(description: string): this {
    this.workflowDef.description = description;
    return this;
  }

  input(input: Record<string, unknown>): this {
    this.workflowDef.initialInput = input;
    return this;
  }

  timeout(ms: number): this {
    this.workflowDef.timeoutMs = ms;
    return this;
  }

  maxParallelism(max: number): this {
    this.workflowDef.maxParallelism = max;
    return this;
  }

  retryPolicy(policy: WorkflowRetryPolicy): this {
    this.workflowDef.retryPolicy = policy;
    return this;
  }

  metadata(metadata: Record<string, unknown>): this {
    this.workflowDef.metadata = metadata;
    return this;
  }

  /**
   * Start defining a task (returns linked builder for chaining)
   */
  task<TInput = unknown, TOutput = unknown>(
    id: TaskId
  ): LinkedTaskBuilder<TInput, TOutput> {
    return new LinkedTaskBuilder<TInput, TOutput>(id, this);
  }

  /**
   * Add a pre-built task definition
   */
  addTask(task: TaskDefinition): this {
    this.workflowDef.tasks = [...(this.workflowDef.tasks ?? []), task];
    return this;
  }

  /**
   * Add multiple task definitions
   */
  addTasks(tasks: TaskDefinition[]): this {
    this.workflowDef.tasks = [...(this.workflowDef.tasks ?? []), ...tasks];
    return this;
  }

  /**
   * Build the workflow definition
   */
  build(): WorkflowDefinition {
    if (!this.workflowDef.id) {
      throw new Error("Workflow must have an id");
    }
    if (!this.workflowDef.name) {
      this.workflowDef.name = this.workflowDef.id;
    }
    if (!this.workflowDef.description) {
      this.workflowDef.description = `Workflow: ${this.workflowDef.name}`;
    }
    if (!this.workflowDef.tasks || this.workflowDef.tasks.length === 0) {
      throw new Error("Workflow must have at least one task");
    }

    return this.workflowDef as WorkflowDefinition;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new workflow builder
 */
export function workflow(id: string): WorkflowBuilder {
  return new WorkflowBuilder(id);
}

/**
 * Create a new task builder (standalone)
 */
export function task<TInput = unknown, TOutput = unknown>(
  id: TaskId
): TaskBuilder<TInput, TOutput> {
  return new TaskBuilder<TInput, TOutput>(id);
}

/**
 * Create a simple task from a function
 */
export function simpleTask<TInput = unknown, TOutput = unknown>(
  id: TaskId,
  name: string,
  executor: TaskExecutor<TInput, TOutput>,
  dependencies: TaskId[] = []
): TaskDefinition<TInput, TOutput> {
  return task<TInput, TOutput>(id)
    .name(name)
    .executor(executor)
    .dependsOn(...dependencies)
    .build();
}

/**
 * Create a checkpoint task
 */
export function checkpointTask(
  id: TaskId,
  name: string,
  config: CheckpointConfig,
  dependencies: TaskId[] = []
): TaskDefinition {
  return task(id)
    .name(name)
    .checkpoint(config)
    .executor(async () => ({}))
    .dependsOn(...dependencies)
    .build();
}

/**
 * Create a conditional task that skips based on input
 */
export function conditionalTask<TInput, TOutput>(
  id: TaskId,
  name: string,
  condition: (context: TaskContext<TInput>) => boolean,
  executor: TaskExecutor<TInput, TOutput>,
  dependencies: TaskId[] = []
): TaskDefinition<TInput, TOutput> {
  return task<TInput, TOutput>(id)
    .name(name)
    .executor(executor)
    .skipWhen((ctx) => !condition(ctx))
    .dependsOn(...dependencies)
    .build();
}

// ============================================================================
// Common Workflow Patterns
// ============================================================================

/**
 * Create a simple linear pipeline workflow
 */
export function pipeline(
  id: string,
  name: string,
  steps: Array<{
    id: TaskId;
    name: string;
    executor: TaskExecutor;
  }>
): WorkflowDefinition {
  const tasks: TaskDefinition[] = [];
  let previousId: TaskId | null = null;

  for (const step of steps) {
    const taskDef: TaskDefinition = {
      id: step.id,
      name: step.name,
      description: `Pipeline step: ${step.name}`,
      executor: step.executor,
      dependencies: previousId ? [previousId] : [],
      priority: "normal",
    };
    tasks.push(taskDef);
    previousId = step.id;
  }

  return {
    id,
    name,
    description: `Pipeline: ${name}`,
    tasks,
  };
}

/**
 * Create a map-reduce style workflow
 */
export function mapReduce<TItem, TResult>(
  id: string,
  name: string,
  options: {
    items: TItem[];
    mapper: (item: TItem, index: number) => TaskExecutor;
    reducer: TaskExecutor<{ results: unknown[] }, TResult>;
    checkpointBeforeReduce?: boolean;
  }
): WorkflowDefinition {
  const tasks: TaskDefinition[] = [];
  const mapTaskIds: TaskId[] = [];

  // Create map tasks
  for (let i = 0; i < options.items.length; i++) {
    const mapId = `map_${i}`;
    mapTaskIds.push(mapId);

    tasks.push({
      id: mapId,
      name: `Map item ${i}`,
      description: `Map phase for item ${i}`,
      executor: options.mapper(options.items[i], i),
      dependencies: [],
      priority: "normal",
    });
  }

  // Optional checkpoint before reduce
  if (options.checkpointBeforeReduce) {
    tasks.push({
      id: "checkpoint_before_reduce",
      name: "Review map results",
      description: "Review the map phase results before reducing",
      executor: async () => ({}),
      dependencies: mapTaskIds,
      priority: "normal",
      isCheckpoint: true,
      checkpointConfig: {
        title: "Review Results",
        description: "Review the map phase results before reducing",
        approvalType: "approve_reject",
      },
    });
  }

  // Create reduce task
  const reduceDeps = options.checkpointBeforeReduce
    ? ["checkpoint_before_reduce"]
    : mapTaskIds;

  tasks.push({
    id: "reduce",
    name: "Reduce results",
    description: "Reduce phase",
    executor: options.reducer as TaskExecutor,
    dependencies: reduceDeps,
    priority: "normal",
  });

  return {
    id,
    name,
    description: `MapReduce: ${name}`,
    tasks,
  };
}

/**
 * Create a workflow with retry wrapper
 */
export function withRetries<TInput, TOutput>(
  taskDef: TaskDefinition<TInput, TOutput>,
  retries: number
): TaskDefinition<TInput, TOutput> {
  return {
    ...taskDef,
    retries,
  };
}
