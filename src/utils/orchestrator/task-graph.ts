/**
 * Task Graph - DAG Management for Workflow Tasks
 *
 * Manages a directed acyclic graph of tasks with:
 * - Dependency tracking and validation
 * - Topological sorting for execution order
 * - Parallel execution grouping
 * - Cycle detection
 */

import type {
  TaskDefinition,
  TaskId,
  TaskNode,
  TaskStatus,
  TaskResult,
  WorkflowDefinition,
} from "./types";

// ============================================================================
// Task Graph Errors
// ============================================================================

export class TaskGraphError extends Error {
  constructor(
    message: string,
    public readonly code: TaskGraphErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "TaskGraphError";
  }
}

export type TaskGraphErrorCode =
  | "CYCLE_DETECTED"
  | "MISSING_DEPENDENCY"
  | "DUPLICATE_TASK"
  | "INVALID_TASK"
  | "EMPTY_GRAPH";

// ============================================================================
// Task Graph Class
// ============================================================================

/**
 * Manages a directed acyclic graph of tasks
 */
export class TaskGraph {
  private nodes: Map<TaskId, TaskNode> = new Map();
  private readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId;
  }

  /**
   * Create a TaskGraph from a workflow definition
   */
  static fromWorkflow(workflow: WorkflowDefinition): TaskGraph {
    const graph = new TaskGraph(workflow.id);

    // Add all tasks
    for (const task of workflow.tasks) {
      graph.addTask(task);
    }

    // Validate the graph
    graph.validate();

    return graph;
  }

  /**
   * Add a task to the graph
   */
  addTask(task: TaskDefinition): void {
    if (this.nodes.has(task.id)) {
      throw new TaskGraphError(
        `Task with id '${task.id}' already exists`,
        "DUPLICATE_TASK",
        { taskId: task.id }
      );
    }

    if (!task.id || !task.name || !task.executor) {
      throw new TaskGraphError(
        `Task is missing required fields`,
        "INVALID_TASK",
        { taskId: task.id }
      );
    }

    const node: TaskNode = {
      task,
      dependsOn: new Set(task.dependencies),
      dependents: new Set(),
      status: "pending",
    };

    this.nodes.set(task.id, node);

    // Update dependents for existing nodes
    for (const depId of task.dependencies) {
      const depNode = this.nodes.get(depId);
      if (depNode) {
        depNode.dependents.add(task.id);
      }
    }

    // Update this node as dependent for already added tasks
    for (const [id, existingNode] of this.nodes) {
      if (existingNode.task.dependencies.includes(task.id)) {
        node.dependents.add(id);
      }
    }
  }

  /**
   * Remove a task from the graph
   */
  removeTask(taskId: TaskId): boolean {
    const node = this.nodes.get(taskId);
    if (!node) {
      return false;
    }

    // Remove from dependents of dependencies
    for (const depId of node.dependsOn) {
      const depNode = this.nodes.get(depId);
      if (depNode) {
        depNode.dependents.delete(taskId);
      }
    }

    // Remove from dependencies of dependents
    for (const dependentId of node.dependents) {
      const dependentNode = this.nodes.get(dependentId);
      if (dependentNode) {
        dependentNode.dependsOn.delete(taskId);
      }
    }

    this.nodes.delete(taskId);
    return true;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: TaskId): TaskDefinition | undefined {
    return this.nodes.get(taskId)?.task;
  }

  /**
   * Get a task node by ID
   */
  getNode(taskId: TaskId): TaskNode | undefined {
    return this.nodes.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): TaskDefinition[] {
    return Array.from(this.nodes.values()).map((node) => node.task);
  }

  /**
   * Get all task nodes
   */
  getAllNodes(): TaskNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get the number of tasks
   */
  get size(): number {
    return this.nodes.size;
  }

  /**
   * Check if the graph is empty
   */
  get isEmpty(): boolean {
    return this.nodes.size === 0;
  }

  /**
   * Get root tasks (tasks with no dependencies)
   */
  getRootTasks(): TaskDefinition[] {
    return Array.from(this.nodes.values())
      .filter((node) => node.dependsOn.size === 0)
      .map((node) => node.task);
  }

  /**
   * Get terminal tasks (tasks with no dependents)
   */
  getTerminalTasks(): TaskDefinition[] {
    return Array.from(this.nodes.values())
      .filter((node) => node.dependents.size === 0)
      .map((node) => node.task);
  }

  /**
   * Get direct dependencies of a task
   */
  getDependencies(taskId: TaskId): TaskDefinition[] {
    const node = this.nodes.get(taskId);
    if (!node) {
      return [];
    }

    return Array.from(node.dependsOn)
      .map((id) => this.nodes.get(id)?.task)
      .filter((task): task is TaskDefinition => task !== undefined);
  }

  /**
   * Get direct dependents of a task
   */
  getDependents(taskId: TaskId): TaskDefinition[] {
    const node = this.nodes.get(taskId);
    if (!node) {
      return [];
    }

    return Array.from(node.dependents)
      .map((id) => this.nodes.get(id)?.task)
      .filter((task): task is TaskDefinition => task !== undefined);
  }

  /**
   * Get all ancestors (transitive dependencies) of a task
   */
  getAncestors(taskId: TaskId): Set<TaskId> {
    const ancestors = new Set<TaskId>();
    const visited = new Set<TaskId>();
    const queue = [...(this.nodes.get(taskId)?.dependsOn ?? [])];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      ancestors.add(id);

      const node = this.nodes.get(id);
      if (node) {
        for (const depId of node.dependsOn) {
          queue.push(depId);
        }
      }
    }

    return ancestors;
  }

  /**
   * Get all descendants (transitive dependents) of a task
   */
  getDescendants(taskId: TaskId): Set<TaskId> {
    const descendants = new Set<TaskId>();
    const visited = new Set<TaskId>();
    const queue = [...(this.nodes.get(taskId)?.dependents ?? [])];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      descendants.add(id);

      const node = this.nodes.get(id);
      if (node) {
        for (const depId of node.dependents) {
          queue.push(depId);
        }
      }
    }

    return descendants;
  }

  /**
   * Check if a task has all dependencies satisfied
   */
  areDependenciesSatisfied(
    taskId: TaskId,
    completedTasks: Set<TaskId>
  ): boolean {
    const node = this.nodes.get(taskId);
    if (!node) {
      return false;
    }

    for (const depId of node.dependsOn) {
      if (!completedTasks.has(depId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get tasks that are ready to execute (all deps satisfied)
   */
  getReadyTasks(
    completedTasks: Set<TaskId>,
    runningTasks: Set<TaskId>,
    failedTasks: Set<TaskId>
  ): TaskDefinition[] {
    const ready: TaskDefinition[] = [];

    for (const [taskId, node] of this.nodes) {
      // Skip if already completed, running, or failed
      if (
        completedTasks.has(taskId) ||
        runningTasks.has(taskId) ||
        failedTasks.has(taskId)
      ) {
        continue;
      }

      // Check if all dependencies are completed
      let allDepsSatisfied = true;
      let hasFailedDep = false;

      for (const depId of node.dependsOn) {
        if (failedTasks.has(depId)) {
          hasFailedDep = true;
          break;
        }
        if (!completedTasks.has(depId)) {
          allDepsSatisfied = false;
          break;
        }
      }

      // Skip tasks with failed dependencies
      if (hasFailedDep) {
        continue;
      }

      if (allDepsSatisfied) {
        ready.push(node.task);
      }
    }

    // Sort by priority
    return ready.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        normal: 2,
        low: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Perform topological sort of tasks
   * Returns tasks in valid execution order
   */
  topologicalSort(): TaskDefinition[] {
    const sorted: TaskDefinition[] = [];
    const visited = new Set<TaskId>();
    const visiting = new Set<TaskId>();

    const visit = (taskId: TaskId): void => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        throw new TaskGraphError(
          `Cycle detected involving task '${taskId}'`,
          "CYCLE_DETECTED",
          { taskId }
        );
      }

      visiting.add(taskId);

      const node = this.nodes.get(taskId);
      if (node) {
        for (const depId of node.dependsOn) {
          visit(depId);
        }
        sorted.push(node.task);
      }

      visiting.delete(taskId);
      visited.add(taskId);
    };

    for (const taskId of this.nodes.keys()) {
      visit(taskId);
    }

    return sorted;
  }

  /**
   * Group tasks into parallel execution levels
   * Each level can be executed in parallel
   */
  getParallelLevels(): TaskDefinition[][] {
    const levels: TaskDefinition[][] = [];
    const assigned = new Set<TaskId>();

    while (assigned.size < this.nodes.size) {
      const level: TaskDefinition[] = [];

      for (const [taskId, node] of this.nodes) {
        if (assigned.has(taskId)) continue;

        // Check if all dependencies are assigned
        let allDepsAssigned = true;
        for (const depId of node.dependsOn) {
          if (!assigned.has(depId)) {
            allDepsAssigned = false;
            break;
          }
        }

        if (allDepsAssigned) {
          level.push(node.task);
        }
      }

      if (level.length === 0) {
        // This shouldn't happen if graph is valid
        throw new TaskGraphError(
          "Failed to assign all tasks to levels - possible cycle",
          "CYCLE_DETECTED"
        );
      }

      // Sort level by priority
      level.sort((a, b) => {
        const priorityOrder: Record<string, number> = {
          critical: 0,
          high: 1,
          normal: 2,
          low: 3,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      levels.push(level);

      for (const task of level) {
        assigned.add(task.id);
      }
    }

    return levels;
  }

  /**
   * Calculate the critical path (longest path through the graph)
   */
  getCriticalPath(): TaskDefinition[] {
    const distances = new Map<TaskId, number>();
    const predecessors = new Map<TaskId, TaskId | null>();

    // Initialize distances
    for (const taskId of this.nodes.keys()) {
      distances.set(taskId, -Infinity);
      predecessors.set(taskId, null);
    }

    // Set root nodes to distance 0
    for (const task of this.getRootTasks()) {
      distances.set(task.id, 0);
    }

    // Process in topological order
    const sorted = this.topologicalSort();
    for (const task of sorted) {
      const node = this.nodes.get(task.id)!;
      const currentDist = distances.get(task.id)!;

      for (const dependentId of node.dependents) {
        const newDist = currentDist + 1;
        if (newDist > distances.get(dependentId)!) {
          distances.set(dependentId, newDist);
          predecessors.set(dependentId, task.id);
        }
      }
    }

    // Find the terminal node with maximum distance
    let maxDist = -Infinity;
    let maxNode: TaskId | null = null;
    for (const task of this.getTerminalTasks()) {
      const dist = distances.get(task.id)!;
      if (dist > maxDist) {
        maxDist = dist;
        maxNode = task.id;
      }
    }

    // Reconstruct path
    const path: TaskDefinition[] = [];
    let current = maxNode;
    while (current !== null) {
      const task = this.nodes.get(current)?.task;
      if (task) {
        path.unshift(task);
      }
      current = predecessors.get(current) ?? null;
    }

    return path;
  }

  /**
   * Validate the graph structure
   */
  validate(): void {
    if (this.isEmpty) {
      throw new TaskGraphError("Graph is empty", "EMPTY_GRAPH");
    }

    // Check for missing dependencies
    for (const [taskId, node] of this.nodes) {
      for (const depId of node.dependsOn) {
        if (!this.nodes.has(depId)) {
          throw new TaskGraphError(
            `Task '${taskId}' has missing dependency '${depId}'`,
            "MISSING_DEPENDENCY",
            { taskId, missingDependency: depId }
          );
        }
      }
    }

    // Check for cycles (topological sort will throw if cycle exists)
    this.topologicalSort();
  }

  /**
   * Update task status
   */
  setTaskStatus(taskId: TaskId, status: TaskStatus): void {
    const node = this.nodes.get(taskId);
    if (node) {
      node.status = status;
    }
  }

  /**
   * Store task result
   */
  setTaskResult(taskId: TaskId, result: TaskResult): void {
    const node = this.nodes.get(taskId);
    if (node) {
      node.result = result;
      node.status = result.status;
    }
  }

  /**
   * Get task result
   */
  getTaskResult(taskId: TaskId): TaskResult | undefined {
    return this.nodes.get(taskId)?.result;
  }

  /**
   * Get all task results
   */
  getAllResults(): Map<TaskId, TaskResult> {
    const results = new Map<TaskId, TaskResult>();
    for (const [taskId, node] of this.nodes) {
      if (node.result) {
        results.set(taskId, node.result);
      }
    }
    return results;
  }

  /**
   * Reset all task statuses to pending
   */
  reset(): void {
    for (const node of this.nodes.values()) {
      node.status = "pending";
      node.result = undefined;
    }
  }

  /**
   * Get graph statistics
   */
  getStats(): TaskGraphStats {
    const nodes = Array.from(this.nodes.values());

    return {
      totalTasks: this.size,
      rootTasks: this.getRootTasks().length,
      terminalTasks: this.getTerminalTasks().length,
      checkpoints: nodes.filter((n) => n.task.isCheckpoint).length,
      maxDepth: this.getParallelLevels().length,
      criticalPathLength: this.getCriticalPath().length,
      statusCounts: {
        pending: nodes.filter((n) => n.status === "pending").length,
        ready: nodes.filter((n) => n.status === "ready").length,
        running: nodes.filter((n) => n.status === "running").length,
        completed: nodes.filter((n) => n.status === "completed").length,
        failed: nodes.filter((n) => n.status === "failed").length,
        skipped: nodes.filter((n) => n.status === "skipped").length,
        waiting_checkpoint: nodes.filter(
          (n) => n.status === "waiting_checkpoint"
        ).length,
      },
    };
  }

  /**
   * Create a subgraph containing only specified tasks and their dependencies
   */
  subgraph(taskIds: TaskId[]): TaskGraph {
    const subgraph = new TaskGraph(this.workflowId + "_subgraph");
    const toInclude = new Set<TaskId>();

    // Include specified tasks and all their ancestors
    for (const taskId of taskIds) {
      toInclude.add(taskId);
      for (const ancestor of this.getAncestors(taskId)) {
        toInclude.add(ancestor);
      }
    }

    // Add tasks in topological order
    for (const task of this.topologicalSort()) {
      if (toInclude.has(task.id)) {
        // Filter dependencies to only include those in subgraph
        const filteredTask: TaskDefinition = {
          ...task,
          dependencies: task.dependencies.filter((id) => toInclude.has(id)),
        };
        subgraph.addTask(filteredTask);
      }
    }

    return subgraph;
  }

  /**
   * Convert to a serializable format
   */
  toJSON(): object {
    return {
      workflowId: this.workflowId,
      tasks: Array.from(this.nodes.values()).map((node) => ({
        id: node.task.id,
        name: node.task.name,
        dependencies: Array.from(node.dependsOn),
        status: node.status,
        isCheckpoint: node.task.isCheckpoint,
      })),
      stats: this.getStats(),
    };
  }
}

/**
 * Statistics about a task graph
 */
export interface TaskGraphStats {
  totalTasks: number;
  rootTasks: number;
  terminalTasks: number;
  checkpoints: number;
  maxDepth: number;
  criticalPathLength: number;
  statusCounts: Record<TaskStatus, number>;
}
