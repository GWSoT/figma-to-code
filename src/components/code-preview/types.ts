/**
 * Types for the Side-by-Side Code Preview Feature
 */

import type { GeneratedFile } from "~/utils/code-generation-agent/types";

/**
 * Panel arrangement options
 */
export type PanelArrangement = "side-by-side" | "top-bottom" | "design-only" | "code-only";

/**
 * Element mapping between design and code
 */
export interface ElementMapping {
  /** Unique ID for the element */
  id: string;
  /** Element name from Figma */
  name: string;
  /** Figma node ID */
  figmaNodeId: string;
  /** Bounding box in the design panel (relative coordinates 0-1) */
  designBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Code location */
  codeLocation: {
    file: string;
    startLine: number;
    endLine: number;
  };
  /** Child element IDs */
  children: string[];
  /** Parent element ID */
  parentId?: string;
}

/**
 * Highlighted element state
 */
export interface HighlightState {
  /** Currently hovered element ID */
  hoveredElementId: string | null;
  /** Currently selected element ID */
  selectedElementId: string | null;
  /** Source of the highlight (design panel or code panel) */
  source: "design" | "code" | null;
}

/**
 * Scroll synchronization state
 */
export interface ScrollSyncState {
  /** Whether sync is enabled */
  enabled: boolean;
  /** Currently syncing (to prevent loops) */
  isSyncing: boolean;
  /** Last scroll source */
  lastScrollSource: "design" | "code" | null;
}

/**
 * Design panel props
 */
export interface DesignPanelProps {
  /** Figma file key */
  fileKey: string;
  /** Figma node ID to display */
  nodeId: string;
  /** Account ID for Figma API */
  accountId?: string;
  /** Element mappings for highlighting */
  elementMappings: ElementMapping[];
  /** Current highlight state */
  highlightState: HighlightState;
  /** Callback when element is hovered */
  onElementHover: (elementId: string | null) => void;
  /** Callback when element is clicked */
  onElementClick: (elementId: string | null) => void;
  /** Callback when panel scrolls */
  onScroll: (scrollTop: number, scrollHeight: number) => void;
  /** External scroll position to sync to */
  syncScrollPosition?: number;
}

/**
 * Code panel props
 */
export interface CodePanelProps {
  /** Generated files to display */
  files: GeneratedFile[];
  /** Currently selected file index */
  selectedFileIndex: number;
  /** Callback when file tab is clicked */
  onFileSelect: (index: number) => void;
  /** Element mappings for highlighting */
  elementMappings: ElementMapping[];
  /** Current highlight state */
  highlightState: HighlightState;
  /** Callback when element is hovered (by line) */
  onElementHover: (elementId: string | null) => void;
  /** Callback when element is clicked (by line) */
  onElementClick: (elementId: string | null) => void;
  /** Callback when panel scrolls */
  onScroll: (scrollTop: number, scrollHeight: number) => void;
  /** External scroll position to sync to */
  syncScrollPosition?: number;
  /** Line to scroll to for navigation */
  scrollToLine?: number;
}

/**
 * Split view props
 */
export interface SplitViewProps {
  /** Figma file key */
  fileKey: string;
  /** Figma node ID */
  nodeId: string;
  /** Account ID for Figma API */
  accountId?: string;
  /** Generated code files */
  generatedFiles: GeneratedFile[];
  /** Element mappings between design and code */
  elementMappings: ElementMapping[];
  /** Initial panel arrangement */
  initialArrangement?: PanelArrangement;
  /** Initial split ratio (0-1, represents left/top panel size) */
  initialSplitRatio?: number;
  /** Minimum panel size in pixels */
  minPanelSize?: number;
  /** Whether to enable synchronized scrolling by default */
  enableScrollSync?: boolean;
  /** Callback when arrangement changes */
  onArrangementChange?: (arrangement: PanelArrangement) => void;
}

/**
 * Resize handle props
 */
export interface ResizeHandleProps {
  /** Orientation of the handle */
  orientation: "horizontal" | "vertical";
  /** Callback when resize starts */
  onResizeStart: () => void;
  /** Callback during resize with delta */
  onResize: (delta: number) => void;
  /** Callback when resize ends */
  onResizeEnd: () => void;
}
