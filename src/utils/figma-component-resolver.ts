/**
 * Figma Component Instance Resolver
 *
 * This module handles resolving component instances to their main components,
 * tracking overrides, handling nested instances, and supporting external
 * library references.
 */

import type { FigmaApiClient } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a Figma component (main component definition)
 */
export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  documentationLinks?: string[];
  remote: boolean; // true if from external library
  componentSetId?: string; // if part of a component set (variants)
}

/**
 * Represents a Figma component set (collection of variants)
 */
export interface FigmaComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks?: string[];
  remote: boolean;
}

/**
 * External library reference
 */
export interface FigmaLibraryReference {
  key: string;
  name: string;
  fileKey: string;
  teamId?: string;
  projectId?: string;
}

/**
 * Override types that can be applied to component instances
 */
export type OverrideType =
  | "TEXT"
  | "FILL"
  | "STROKE"
  | "EFFECT"
  | "VISIBLE"
  | "OPACITY"
  | "CORNER_RADIUS"
  | "BLEND_MODE"
  | "EXPORT_SETTINGS"
  | "CONSTRAINT"
  | "LAYOUT_GROW"
  | "LAYOUT_ALIGN"
  | "LAYOUT_POSITION"
  | "SIZE"
  | "STYLE"
  | "COMPONENT_SWAP";

/**
 * Represents an override applied to a component instance
 */
export interface ComponentOverride {
  /** The node id of the override within the instance */
  id: string;
  /** The path to the node being overridden (for nested instances) */
  overriddenPath: string[];
  /** The type of override */
  type: OverrideType;
  /** The original value before override (if available) */
  originalValue?: unknown;
  /** The new overridden value */
  overriddenValue: unknown;
  /** Whether this override was inherited from a parent instance */
  inherited: boolean;
  /** The instance id that introduced this override (for tracking inheritance) */
  sourceInstanceId?: string;
}

/**
 * Enhanced Figma node with component instance properties
 */
export interface FigmaInstanceNode {
  id: string;
  name: string;
  type: "INSTANCE";
  componentId: string;
  componentProperties?: Record<
    string,
    {
      value: string | boolean | number;
      type: "TEXT" | "BOOLEAN" | "INSTANCE_SWAP" | "VARIANT";
      preferredValues?: Array<{ type: string; key: string }>;
    }
  >;
  overrides?: ComponentOverride[];
  children?: FigmaNodeWithInstance[];
  isExternalInstance?: boolean;
  mainComponent?: ResolvedComponent;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relativeTransform?: [[number, number, number], [number, number, number]];
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  fills?: unknown[];
  strokes?: unknown[];
  effects?: unknown[];
  opacity?: number;
  visible?: boolean;
  exportSettings?: unknown[];
  blendMode?: string;
}

/**
 * Union type for any Figma node that might be or contain instances
 */
export interface FigmaNodeWithInstance {
  id: string;
  name: string;
  type: string;
  children?: FigmaNodeWithInstance[];
  componentId?: string;
  componentProperties?: Record<string, unknown>;
  overrides?: ComponentOverride[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  [key: string]: unknown;
}

/**
 * A fully resolved component with all metadata
 */
export interface ResolvedComponent {
  /** Component key */
  key: string;
  /** Component name */
  name: string;
  /** Component description */
  description: string;
  /** Whether the component is from an external library */
  isExternal: boolean;
  /** External library info if applicable */
  library?: FigmaLibraryReference;
  /** If part of a component set (variants) */
  componentSet?: {
    key: string;
    name: string;
    variantProperties?: Record<string, string[]>;
  };
  /** The file key where the component is defined */
  sourceFileKey: string;
  /** The node id of the component in its source file */
  sourceNodeId: string;
}

/**
 * Represents a resolved instance with its main component and overrides
 */
export interface ResolvedInstance {
  /** The instance node */
  instance: FigmaInstanceNode;
  /** The resolved main component */
  mainComponent: ResolvedComponent;
  /** All overrides (both direct and inherited) */
  overrides: ComponentOverride[];
  /** Nested instances within this instance (already resolved) */
  nestedInstances: ResolvedInstance[];
  /** The resolution path (for debugging/tracing) */
  resolutionPath: string[];
  /** Properties that are overridden vs inherited */
  propertyStatus: {
    overridden: string[];
    inherited: string[];
  };
}

/**
 * Component resolution context for tracking during resolution
 */
interface ResolutionContext {
  /** Map of component key to resolved component */
  resolvedComponents: Map<string, ResolvedComponent>;
  /** Map of instance id to resolved instance */
  resolvedInstances: Map<string, ResolvedInstance>;
  /** External components that need to be fetched */
  pendingExternalComponents: Set<string>;
  /** Current resolution depth (for nested instances) */
  depth: number;
  /** Maximum resolution depth to prevent infinite loops */
  maxDepth: number;
  /** The current file key being processed */
  currentFileKey: string;
  /** Path of instance ids for tracking inheritance */
  instancePath: string[];
}

/**
 * Result of a component resolution operation
 */
export interface ComponentResolutionResult {
  /** All resolved instances */
  instances: ResolvedInstance[];
  /** All components (local and external) */
  components: Map<string, ResolvedComponent>;
  /** External libraries referenced */
  externalLibraries: Map<string, FigmaLibraryReference>;
  /** Any errors that occurred during resolution */
  errors: ComponentResolutionError[];
  /** Statistics about the resolution */
  stats: {
    totalInstances: number;
    localInstances: number;
    externalInstances: number;
    nestedInstances: number;
    overrideCount: number;
  };
}

/**
 * Error that occurred during component resolution
 */
export interface ComponentResolutionError {
  type: "COMPONENT_NOT_FOUND" | "EXTERNAL_FETCH_FAILED" | "MAX_DEPTH_EXCEEDED";
  instanceId: string;
  componentKey?: string;
  message: string;
}

// ============================================================================
// Component Resolver Class
// ============================================================================

/**
 * Resolves Figma component instances to their main components
 */
export class FigmaComponentResolver {
  private apiClient: FigmaApiClient;
  private componentCache: Map<string, ResolvedComponent>;
  private externalLibraryCache: Map<string, FigmaLibraryReference>;

  constructor(apiClient: FigmaApiClient) {
    this.apiClient = apiClient;
    this.componentCache = new Map();
    this.externalLibraryCache = new Map();
  }

  /**
   * Resolves all component instances in a Figma file response
   */
  async resolveFileComponents(
    fileKey: string,
    fileResponse: {
      document: FigmaNodeWithInstance;
      components?: Record<string, FigmaComponent>;
      componentSets?: Record<string, FigmaComponentSet>;
    },
    options: {
      maxDepth?: number;
      includeExternalComponents?: boolean;
    } = {}
  ): Promise<ComponentResolutionResult> {
    const { maxDepth = 10, includeExternalComponents = true } = options;

    const context: ResolutionContext = {
      resolvedComponents: new Map(),
      resolvedInstances: new Map(),
      pendingExternalComponents: new Set(),
      depth: 0,
      maxDepth,
      currentFileKey: fileKey,
      instancePath: [],
    };

    const errors: ComponentResolutionError[] = [];
    const instances: ResolvedInstance[] = [];

    // First, cache all local components from the file
    if (fileResponse.components) {
      for (const [key, component] of Object.entries(fileResponse.components)) {
        const resolved: ResolvedComponent = {
          key,
          name: component.name,
          description: component.description,
          isExternal: component.remote,
          sourceFileKey: fileKey,
          sourceNodeId: key,
          componentSet: component.componentSetId
            ? this.resolveComponentSet(
                component.componentSetId,
                fileResponse.componentSets
              )
            : undefined,
        };
        context.resolvedComponents.set(key, resolved);
        this.componentCache.set(key, resolved);
      }
    }

    // Recursively find and resolve all instances
    await this.traverseAndResolve(
      fileResponse.document,
      context,
      errors,
      instances
    );

    // Fetch external components if needed
    if (includeExternalComponents && context.pendingExternalComponents.size > 0) {
      await this.resolveExternalComponents(context, errors);
    }

    // Calculate statistics
    const stats = this.calculateStats(instances);

    return {
      instances,
      components: context.resolvedComponents,
      externalLibraries: this.externalLibraryCache,
      errors,
      stats,
    };
  }

  /**
   * Resolves a single component instance
   */
  async resolveInstance(
    instance: FigmaInstanceNode,
    fileKey: string,
    fileComponents?: Record<string, FigmaComponent>,
    fileComponentSets?: Record<string, FigmaComponentSet>
  ): Promise<ResolvedInstance | null> {
    const context: ResolutionContext = {
      resolvedComponents: new Map(),
      resolvedInstances: new Map(),
      pendingExternalComponents: new Set(),
      depth: 0,
      maxDepth: 10,
      currentFileKey: fileKey,
      instancePath: [],
    };

    // Cache local components
    if (fileComponents) {
      for (const [key, component] of Object.entries(fileComponents)) {
        const resolved: ResolvedComponent = {
          key,
          name: component.name,
          description: component.description,
          isExternal: component.remote,
          sourceFileKey: fileKey,
          sourceNodeId: key,
          componentSet: component.componentSetId
            ? this.resolveComponentSet(component.componentSetId, fileComponentSets)
            : undefined,
        };
        context.resolvedComponents.set(key, resolved);
      }
    }

    return this.resolveInstanceInternal(instance, context, []);
  }

  /**
   * Internal method to resolve an instance
   */
  private async resolveInstanceInternal(
    instance: FigmaInstanceNode,
    context: ResolutionContext,
    errors: ComponentResolutionError[]
  ): Promise<ResolvedInstance | null> {
    const { componentId } = instance;

    if (!componentId) {
      return null;
    }

    // Check depth limit
    if (context.depth >= context.maxDepth) {
      errors.push({
        type: "MAX_DEPTH_EXCEEDED",
        instanceId: instance.id,
        componentKey: componentId,
        message: `Maximum resolution depth (${context.maxDepth}) exceeded for instance ${instance.id}`,
      });
      return null;
    }

    // Try to find the component
    let mainComponent = context.resolvedComponents.get(componentId);

    if (!mainComponent) {
      mainComponent = this.componentCache.get(componentId);
    }

    if (!mainComponent) {
      // Mark as external for later fetching
      context.pendingExternalComponents.add(componentId);

      // Create a placeholder for now
      mainComponent = {
        key: componentId,
        name: "External Component",
        description: "",
        isExternal: true,
        sourceFileKey: "unknown",
        sourceNodeId: componentId,
      };
      context.resolvedComponents.set(componentId, mainComponent);
    }

    // Resolve nested instances
    const nestedInstances: ResolvedInstance[] = [];
    if (instance.children) {
      context.depth++;
      context.instancePath.push(instance.id);

      for (const child of instance.children) {
        if (child.type === "INSTANCE" && child.componentId) {
          const nestedResolved = await this.resolveInstanceInternal(
            child as FigmaInstanceNode,
            context,
            errors
          );
          if (nestedResolved) {
            nestedInstances.push(nestedResolved);
          }
        } else if (child.children) {
          // Recurse into non-instance children to find nested instances
          const childInstances = await this.findAndResolveNestedInstances(
            child,
            context,
            errors
          );
          nestedInstances.push(...childInstances);
        }
      }

      context.instancePath.pop();
      context.depth--;
    }

    // Process overrides
    const overrides = this.processOverrides(instance, context);
    const propertyStatus = this.calculatePropertyStatus(instance, overrides);

    const resolved: ResolvedInstance = {
      instance,
      mainComponent,
      overrides,
      nestedInstances,
      resolutionPath: [...context.instancePath, instance.id],
      propertyStatus,
    };

    context.resolvedInstances.set(instance.id, resolved);
    return resolved;
  }

  /**
   * Traverse the node tree and resolve all instances
   */
  private async traverseAndResolve(
    node: FigmaNodeWithInstance,
    context: ResolutionContext,
    errors: ComponentResolutionError[],
    instances: ResolvedInstance[]
  ): Promise<void> {
    if (node.type === "INSTANCE" && node.componentId) {
      const resolved = await this.resolveInstanceInternal(
        node as FigmaInstanceNode,
        context,
        errors
      );
      if (resolved) {
        instances.push(resolved);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        await this.traverseAndResolve(child, context, errors, instances);
      }
    }
  }

  /**
   * Find and resolve nested instances within a node
   */
  private async findAndResolveNestedInstances(
    node: FigmaNodeWithInstance,
    context: ResolutionContext,
    errors: ComponentResolutionError[]
  ): Promise<ResolvedInstance[]> {
    const instances: ResolvedInstance[] = [];

    if (node.type === "INSTANCE" && node.componentId) {
      const resolved = await this.resolveInstanceInternal(
        node as FigmaInstanceNode,
        context,
        errors
      );
      if (resolved) {
        instances.push(resolved);
      }
    } else if (node.children) {
      for (const child of node.children) {
        const childInstances = await this.findAndResolveNestedInstances(
          child,
          context,
          errors
        );
        instances.push(...childInstances);
      }
    }

    return instances;
  }

  /**
   * Process overrides for an instance, tracking inheritance
   */
  private processOverrides(
    instance: FigmaInstanceNode,
    context: ResolutionContext
  ): ComponentOverride[] {
    const overrides: ComponentOverride[] = [];

    if (instance.overrides) {
      for (const override of instance.overrides) {
        overrides.push({
          ...override,
          inherited: context.instancePath.length > 0,
          sourceInstanceId:
            context.instancePath.length > 0
              ? context.instancePath[context.instancePath.length - 1]
              : instance.id,
        });
      }
    }

    // Check component properties for overrides
    if (instance.componentProperties) {
      for (const [propName, propValue] of Object.entries(
        instance.componentProperties
      )) {
        overrides.push({
          id: `${instance.id}:${propName}`,
          overriddenPath: [...context.instancePath, instance.id],
          type: this.mapPropertyTypeToOverrideType(propValue.type),
          overriddenValue: propValue.value,
          inherited: context.instancePath.length > 0,
          sourceInstanceId: instance.id,
        });
      }
    }

    return overrides;
  }

  /**
   * Map component property type to override type
   */
  private mapPropertyTypeToOverrideType(
    propType: string
  ): OverrideType {
    switch (propType) {
      case "TEXT":
        return "TEXT";
      case "BOOLEAN":
        return "VISIBLE";
      case "INSTANCE_SWAP":
        return "COMPONENT_SWAP";
      case "VARIANT":
        return "STYLE";
      default:
        return "STYLE";
    }
  }

  /**
   * Calculate which properties are overridden vs inherited
   */
  private calculatePropertyStatus(
    instance: FigmaInstanceNode,
    overrides: ComponentOverride[]
  ): { overridden: string[]; inherited: string[] } {
    const overridden: string[] = [];
    const inherited: string[] = [];

    for (const override of overrides) {
      const propName = override.type;
      if (override.inherited) {
        inherited.push(propName);
      } else {
        overridden.push(propName);
      }
    }

    // Add component properties
    if (instance.componentProperties) {
      for (const propName of Object.keys(instance.componentProperties)) {
        overridden.push(propName);
      }
    }

    return { overridden, inherited };
  }

  /**
   * Resolve component set information
   */
  private resolveComponentSet(
    componentSetId: string,
    componentSets?: Record<string, FigmaComponentSet>
  ): { key: string; name: string; variantProperties?: Record<string, string[]> } | undefined {
    if (!componentSets || !componentSets[componentSetId]) {
      return { key: componentSetId, name: "Unknown Component Set" };
    }

    const set = componentSets[componentSetId];
    return {
      key: componentSetId,
      name: set.name,
    };
  }

  /**
   * Fetch and resolve external components
   */
  private async resolveExternalComponents(
    context: ResolutionContext,
    errors: ComponentResolutionError[]
  ): Promise<void> {
    // Group external components by their likely source files
    // In a real implementation, this would need to call the Figma API
    // to get component metadata for external components

    for (const componentKey of context.pendingExternalComponents) {
      try {
        // Try to get component info from the API
        const componentInfo = await this.fetchExternalComponentInfo(componentKey);
        if (componentInfo) {
          context.resolvedComponents.set(componentKey, componentInfo);
          this.componentCache.set(componentKey, componentInfo);

          if (componentInfo.library) {
            this.externalLibraryCache.set(
              componentInfo.library.key,
              componentInfo.library
            );
          }
        }
      } catch (error) {
        errors.push({
          type: "EXTERNAL_FETCH_FAILED",
          instanceId: "",
          componentKey,
          message: `Failed to fetch external component ${componentKey}: ${error}`,
        });
      }
    }
  }

  /**
   * Fetch external component info from Figma API
   */
  private async fetchExternalComponentInfo(
    componentKey: string
  ): Promise<ResolvedComponent | null> {
    // Check cache first
    if (this.componentCache.has(componentKey)) {
      return this.componentCache.get(componentKey)!;
    }

    // The Figma API doesn't have a direct endpoint for component lookup by key
    // In practice, you would need to:
    // 1. Know which library files contain the component
    // 2. Fetch those files and extract component metadata
    // 3. Or use the Figma REST API's team library endpoints if available

    // For now, return a placeholder that can be enriched later
    return {
      key: componentKey,
      name: "External Component",
      description: "",
      isExternal: true,
      sourceFileKey: "external",
      sourceNodeId: componentKey,
    };
  }

  /**
   * Calculate resolution statistics
   */
  private calculateStats(instances: ResolvedInstance[]): {
    totalInstances: number;
    localInstances: number;
    externalInstances: number;
    nestedInstances: number;
    overrideCount: number;
  } {
    let totalInstances = 0;
    let localInstances = 0;
    let externalInstances = 0;
    let nestedInstances = 0;
    let overrideCount = 0;

    const countInstances = (resolvedInstances: ResolvedInstance[], isNested = false) => {
      for (const instance of resolvedInstances) {
        totalInstances++;
        if (isNested) nestedInstances++;
        if (instance.mainComponent.isExternal) {
          externalInstances++;
        } else {
          localInstances++;
        }
        overrideCount += instance.overrides.length;

        if (instance.nestedInstances.length > 0) {
          countInstances(instance.nestedInstances, true);
        }
      }
    };

    countInstances(instances);

    return {
      totalInstances,
      localInstances,
      externalInstances,
      nestedInstances,
      overrideCount,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.componentCache.clear();
    this.externalLibraryCache.clear();
  }

  /**
   * Get cached component by key
   */
  getCachedComponent(key: string): ResolvedComponent | undefined {
    return this.componentCache.get(key);
  }

  /**
   * Get all cached external libraries
   */
  getCachedLibraries(): Map<string, FigmaLibraryReference> {
    return new Map(this.externalLibraryCache);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a node is a component instance
 */
export function isComponentInstance(node: FigmaNodeWithInstance): boolean {
  return node.type === "INSTANCE" && typeof node.componentId === "string";
}

/**
 * Type guard that asserts a node is an instance (returns the node typed correctly if true)
 */
export function asComponentInstance(node: FigmaNodeWithInstance): FigmaInstanceNode | null {
  if (node.type === "INSTANCE" && typeof node.componentId === "string") {
    return node as unknown as FigmaInstanceNode;
  }
  return null;
}

/**
 * Finds all component instances in a node tree
 */
export function findAllInstances(node: FigmaNodeWithInstance): FigmaInstanceNode[] {
  const instances: FigmaInstanceNode[] = [];

  const instance = asComponentInstance(node);
  if (instance) {
    instances.push(instance);
  }

  if (node.children) {
    for (const child of node.children) {
      instances.push(...findAllInstances(child));
    }
  }

  return instances;
}

/**
 * Gets the full override path for an instance
 */
export function getOverridePath(
  instance: ResolvedInstance
): string {
  return instance.resolutionPath.join(" > ");
}

/**
 * Checks if an override is inherited from a parent instance
 */
export function isInheritedOverride(override: ComponentOverride): boolean {
  return override.inherited;
}

/**
 * Groups overrides by type
 */
export function groupOverridesByType(
  overrides: ComponentOverride[]
): Map<OverrideType, ComponentOverride[]> {
  const grouped = new Map<OverrideType, ComponentOverride[]>();

  for (const override of overrides) {
    const existing = grouped.get(override.type) || [];
    existing.push(override);
    grouped.set(override.type, existing);
  }

  return grouped;
}

/**
 * Creates a summary of component usage
 */
export function createComponentUsageSummary(
  result: ComponentResolutionResult
): Map<string, { component: ResolvedComponent; usageCount: number; instances: string[] }> {
  const summary = new Map<string, { component: ResolvedComponent; usageCount: number; instances: string[] }>();

  const processInstances = (instances: ResolvedInstance[]) => {
    for (const instance of instances) {
      const key = instance.mainComponent.key;
      const existing = summary.get(key) || {
        component: instance.mainComponent,
        usageCount: 0,
        instances: [],
      };
      existing.usageCount++;
      existing.instances.push(instance.instance.id);
      summary.set(key, existing);

      if (instance.nestedInstances.length > 0) {
        processInstances(instance.nestedInstances);
      }
    }
  };

  processInstances(result.instances);

  return summary;
}
