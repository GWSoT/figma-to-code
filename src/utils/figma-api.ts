import { privateEnv } from "~/config/privateEnv";

const FIGMA_API_BASE = "https://api.figma.com/v1";

// Figma API Response Types
export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export interface FigmaTeamMember {
  user: {
    id: string;
    handle: string;
    img_url: string;
  };
  role: "owner" | "admin" | "member" | "viewer";
}

export interface FigmaTeamResponse {
  name: string;
}

export interface FigmaTeamProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export interface FigmaTeamMembersResponse {
  members: FigmaTeamMember[];
}

export interface FigmaProjectFilesResponse {
  files: Array<{
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
  }>;
}

// Figma File/Document Types
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: FigmaColor;
  // Component instance properties
  componentId?: string;
  componentProperties?: Record<
    string,
    {
      value: string | boolean | number;
      type: "TEXT" | "BOOLEAN" | "INSTANCE_SWAP" | "VARIANT";
      preferredValues?: Array<{ type: string; key: string }>;
    }
  >;
  // Override properties for instances
  overrides?: Array<{
    id: string;
    overriddenFields: string[];
  }>;
  // Additional properties common to design nodes
  fills?: unknown[];
  strokes?: unknown[];
  effects?: unknown[];
  opacity?: number;
  visible?: boolean;
  blendMode?: string;
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  relativeTransform?: [[number, number, number], [number, number, number]];
  // Corner radius properties
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  cornerSmoothing?: number;
}

// Component metadata from file response
export interface FigmaComponentMeta {
  key: string;
  name: string;
  description: string;
  documentationLinks?: string[];
  remote: boolean;
  componentSetId?: string;
}

// Component set metadata from file response
export interface FigmaComponentSetMeta {
  key: string;
  name: string;
  description: string;
  documentationLinks?: string[];
  remote: boolean;
}

// Style metadata from file response
export interface FigmaStyleMeta {
  key: string;
  name: string;
  styleType: "FILL" | "TEXT" | "EFFECT" | "GRID";
  description: string;
  remote: boolean;
}

// Published component metadata (from team/file endpoints)
export interface FigmaPublishedComponent {
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  containing_frame?: {
    name: string;
    nodeId: string;
    pageId: string;
    pageName: string;
  };
  user?: {
    id: string;
    handle: string;
    img_url: string;
  };
}

// Published component set metadata
export interface FigmaPublishedComponentSet {
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  containing_frame?: {
    name: string;
    nodeId: string;
    pageId: string;
    pageName: string;
  };
  user?: {
    id: string;
    handle: string;
    img_url: string;
  };
}

// Response types for component API endpoints
export interface FigmaTeamComponentsResponse {
  status?: number;
  error?: boolean;
  meta: {
    components: FigmaPublishedComponent[];
    cursor?: {
      before: string;
      after: string;
    };
  };
}

export interface FigmaTeamComponentSetsResponse {
  status?: number;
  error?: boolean;
  meta: {
    component_sets: FigmaPublishedComponentSet[];
    cursor?: {
      before: string;
      after: string;
    };
  };
}

export interface FigmaFileComponentsResponse {
  status?: number;
  error?: boolean;
  meta: {
    components: FigmaPublishedComponent[];
  };
}

export interface FigmaFileComponentSetsResponse {
  status?: number;
  error?: boolean;
  meta: {
    component_sets: FigmaPublishedComponentSet[];
  };
}

export interface FigmaComponentResponse {
  status?: number;
  error?: boolean;
  meta: FigmaPublishedComponent;
}

export interface FigmaComponentSetResponse {
  status?: number;
  error?: boolean;
  meta: FigmaPublishedComponentSet;
}

export interface FigmaPage extends FigmaNode {
  type: "CANVAS";
  children: FigmaNode[];
}

export interface FigmaDocument {
  id: string;
  name: string;
  type: "DOCUMENT";
  children: FigmaPage[];
}

export interface FigmaFileResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaDocument;
  components?: Record<string, FigmaComponentMeta>;
  componentSets?: Record<string, FigmaComponentSetMeta>;
  styles?: Record<string, FigmaStyleMeta>;
  mainFileKey?: string;
}

// Common device sizes for frame categorization
export const COMMON_DEVICE_SIZES: Record<string, { width: number; height: number }> = {
  // Mobile
  "iPhone SE": { width: 375, height: 667 },
  "iPhone 14": { width: 390, height: 844 },
  "iPhone 14 Pro Max": { width: 430, height: 932 },
  "iPhone 15": { width: 393, height: 852 },
  "iPhone 15 Pro Max": { width: 430, height: 932 },
  "Android Small": { width: 360, height: 640 },
  "Android Large": { width: 412, height: 915 },
  "Pixel 7": { width: 412, height: 915 },
  "Samsung Galaxy S21": { width: 360, height: 800 },

  // Tablet
  "iPad Mini": { width: 744, height: 1133 },
  "iPad": { width: 810, height: 1080 },
  "iPad Pro 11\"": { width: 834, height: 1194 },
  "iPad Pro 12.9\"": { width: 1024, height: 1366 },
  "Surface Pro 8": { width: 1440, height: 960 },

  // Desktop
  "MacBook Air": { width: 1280, height: 832 },
  "MacBook Pro 14\"": { width: 1512, height: 982 },
  "MacBook Pro 16\"": { width: 1728, height: 1117 },
  "Desktop HD": { width: 1440, height: 900 },
  "Desktop": { width: 1920, height: 1080 },
  "Desktop Large": { width: 2560, height: 1440 },

  // Component sizes (common)
  "Component 24x24": { width: 24, height: 24 },
  "Component 32x32": { width: 32, height: 32 },
  "Component 48x48": { width: 48, height: 48 },
  "Component 64x64": { width: 64, height: 64 },
};

// Frame type categorization
export type FrameCategory = "screen" | "component" | "asset" | "unknown";

// Image export format types
export type FigmaImageFormat = "jpg" | "png" | "svg" | "pdf";

// Image export response
export interface FigmaImagesResponse {
  err: string | null;
  images: Record<string, string | null>; // nodeId -> URL or null if export failed
  status?: number;
}

// Image export options
export interface FigmaImageExportOptions {
  ids: string[]; // Node IDs to export
  format?: FigmaImageFormat; // Default: "png"
  scale?: number; // Scale factor (0.01 to 4), default: 1
  svg_include_id?: boolean; // Whether to include id attributes in SVG
  svg_simplify_stroke?: boolean; // Whether to simplify strokes in SVG
  use_absolute_bounds?: boolean; // Use absolute bounds for rendering
  version?: string; // Specific file version
}

export interface CategorizedFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  category: FrameCategory;
  matchedDevice?: string;
  isTopLevel: boolean;
}

// User's teams from the /me endpoint
export interface FigmaMeResponse {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

// Teams the user belongs to
export interface FigmaTeamInfo {
  id: string;
  name: string;
}

export interface FigmaUserTeamsResponse {
  teams: FigmaTeamInfo[];
}

export class FigmaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "FigmaApiError";
  }
}

export class FigmaApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new FigmaApiError(
        `Figma API error: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    return response.json();
  }

  // Get current user info
  async getMe(): Promise<FigmaMeResponse> {
    return this.fetch<FigmaMeResponse>("/me");
  }

  // Get team info by ID
  async getTeam(teamId: string): Promise<FigmaTeamResponse> {
    return this.fetch<FigmaTeamResponse>(`/teams/${teamId}`);
  }

  // Get all projects in a team
  async getTeamProjects(teamId: string): Promise<FigmaTeamProjectsResponse> {
    return this.fetch<FigmaTeamProjectsResponse>(`/teams/${teamId}/projects`);
  }

  // Get team members
  async getTeamMembers(teamId: string): Promise<FigmaTeamMembersResponse> {
    return this.fetch<FigmaTeamMembersResponse>(`/teams/${teamId}/members`);
  }

  // Get files in a project
  async getProjectFiles(projectId: string): Promise<FigmaProjectFilesResponse> {
    return this.fetch<FigmaProjectFilesResponse>(`/projects/${projectId}/files`);
  }

  // Get file details including document structure with pages and frames
  async getFile(fileKey: string, depth?: number): Promise<FigmaFileResponse> {
    const params = depth !== undefined ? `?depth=${depth}` : "";
    return this.fetch<FigmaFileResponse>(`/files/${fileKey}${params}`);
  }

  // Get specific nodes from a file
  async getFileNodes(
    fileKey: string,
    nodeIds: string[]
  ): Promise<{ nodes: Record<string, { document: FigmaNode }> }> {
    const ids = nodeIds.join(",");
    return this.fetch(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
  }

  // Get file with full component metadata
  async getFileWithComponents(
    fileKey: string,
    options: {
      depth?: number;
      geometry?: "paths" | "bounds";
      plugin_data?: string;
    } = {}
  ): Promise<FigmaFileResponse> {
    const params = new URLSearchParams();
    if (options.depth !== undefined) params.set("depth", String(options.depth));
    if (options.geometry) params.set("geometry", options.geometry);
    if (options.plugin_data) params.set("plugin_data", options.plugin_data);

    const queryString = params.toString();
    const url = `/files/${fileKey}${queryString ? `?${queryString}` : ""}`;
    return this.fetch<FigmaFileResponse>(url);
  }

  // Get team library components (published components from team libraries)
  async getTeamComponents(
    teamId: string,
    options: {
      page_size?: number;
      after?: string;
    } = {}
  ): Promise<FigmaTeamComponentsResponse> {
    const params = new URLSearchParams();
    if (options.page_size) params.set("page_size", String(options.page_size));
    if (options.after) params.set("after", options.after);

    const queryString = params.toString();
    const url = `/teams/${teamId}/components${queryString ? `?${queryString}` : ""}`;
    return this.fetch<FigmaTeamComponentsResponse>(url);
  }

  // Get team component sets (published component sets/variants from team libraries)
  async getTeamComponentSets(
    teamId: string,
    options: {
      page_size?: number;
      after?: string;
    } = {}
  ): Promise<FigmaTeamComponentSetsResponse> {
    const params = new URLSearchParams();
    if (options.page_size) params.set("page_size", String(options.page_size));
    if (options.after) params.set("after", options.after);

    const queryString = params.toString();
    const url = `/teams/${teamId}/component_sets${queryString ? `?${queryString}` : ""}`;
    return this.fetch<FigmaTeamComponentSetsResponse>(url);
  }

  // Get file component metadata
  async getFileComponents(
    fileKey: string
  ): Promise<FigmaFileComponentsResponse> {
    return this.fetch<FigmaFileComponentsResponse>(`/files/${fileKey}/components`);
  }

  // Get file component sets
  async getFileComponentSets(
    fileKey: string
  ): Promise<FigmaFileComponentSetsResponse> {
    return this.fetch<FigmaFileComponentSetsResponse>(`/files/${fileKey}/component_sets`);
  }

  // Get a specific component by key
  async getComponent(componentKey: string): Promise<FigmaComponentResponse> {
    return this.fetch<FigmaComponentResponse>(`/components/${componentKey}`);
  }

  // Get a specific component set by key
  async getComponentSet(componentSetKey: string): Promise<FigmaComponentSetResponse> {
    return this.fetch<FigmaComponentSetResponse>(`/component_sets/${componentSetKey}`);
  }

  // Export images from a file
  // Returns a map of node IDs to image URLs (CDN links valid for 14 days)
  async getImages(
    fileKey: string,
    options: FigmaImageExportOptions
  ): Promise<FigmaImagesResponse> {
    const params = new URLSearchParams();
    params.set("ids", options.ids.join(","));

    if (options.format) params.set("format", options.format);
    if (options.scale !== undefined) params.set("scale", String(options.scale));
    if (options.svg_include_id !== undefined)
      params.set("svg_include_id", String(options.svg_include_id));
    if (options.svg_simplify_stroke !== undefined)
      params.set("svg_simplify_stroke", String(options.svg_simplify_stroke));
    if (options.use_absolute_bounds !== undefined)
      params.set("use_absolute_bounds", String(options.use_absolute_bounds));
    if (options.version) params.set("version", options.version);

    return this.fetch<FigmaImagesResponse>(`/images/${fileKey}?${params.toString()}`);
  }

  // Export images at multiple scales (for srcset generation)
  // Returns a map of scale -> nodeId -> URL
  async getImagesAtScales(
    fileKey: string,
    nodeIds: string[],
    format: FigmaImageFormat = "png",
    scales: number[] = [1, 2, 3]
  ): Promise<Map<number, Record<string, string | null>>> {
    const results = new Map<number, Record<string, string | null>>();

    // Fetch all scales in parallel
    const promises = scales.map(async (scale) => {
      const response = await this.getImages(fileKey, {
        ids: nodeIds,
        format,
        scale,
      });
      return { scale, images: response.images };
    });

    const responses = await Promise.all(promises);

    for (const { scale, images } of responses) {
      results.set(scale, images);
    }

    return results;
  }

  // Refresh access token if needed
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch("https://api.figma.com/v1/oauth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: privateEnv.FIGMA_CLIENT_ID,
        client_secret: privateEnv.FIGMA_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new FigmaApiError(
        "Failed to refresh Figma access token",
        response.status,
        response.statusText
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }
}

// Helper to determine permission level from role
export function getPermissionLevel(
  role: string
): "owner" | "admin" | "member" | "viewer" {
  switch (role) {
    case "owner":
      return "owner";
    case "admin":
      return "admin";
    case "member":
      return "member";
    default:
      return "viewer";
  }
}

// Helper to get project type based on context
export function getProjectType(
  hasTeam: boolean,
  isOrganization?: boolean
): "team" | "personal" | "organization" {
  if (isOrganization) return "organization";
  return hasTeam ? "team" : "personal";
}

// Helper to find matching device size for a frame
export function findMatchingDevice(
  width: number,
  height: number,
  tolerance: number = 10
): string | undefined {
  for (const [deviceName, size] of Object.entries(COMMON_DEVICE_SIZES)) {
    // Check both orientations (portrait and landscape)
    const matchesPortrait =
      Math.abs(width - size.width) <= tolerance &&
      Math.abs(height - size.height) <= tolerance;
    const matchesLandscape =
      Math.abs(width - size.height) <= tolerance &&
      Math.abs(height - size.width) <= tolerance;

    if (matchesPortrait || matchesLandscape) {
      return deviceName + (matchesLandscape && size.width !== size.height ? " (Landscape)" : "");
    }
  }
  return undefined;
}

// Helper to categorize a frame based on its dimensions and name
export function categorizeFrame(
  node: FigmaNode,
  isTopLevel: boolean
): FrameCategory {
  const { absoluteBoundingBox, name, type } = node;

  if (!absoluteBoundingBox) {
    return "unknown";
  }

  const { width, height } = absoluteBoundingBox;
  const lowerName = name.toLowerCase();

  // Check if it's an asset (icon, image, illustration)
  const assetKeywords = ["icon", "logo", "image", "illustration", "asset", "svg", "img"];
  if (assetKeywords.some((keyword) => lowerName.includes(keyword))) {
    return "asset";
  }

  // Small frames are likely components or assets
  if (width <= 100 && height <= 100) {
    return "asset";
  }

  // Check for component naming conventions
  const componentKeywords = [
    "button",
    "input",
    "card",
    "modal",
    "dialog",
    "dropdown",
    "menu",
    "nav",
    "header",
    "footer",
    "sidebar",
    "tab",
    "badge",
    "avatar",
    "chip",
    "toast",
    "alert",
    "tooltip",
    "component",
  ];
  if (componentKeywords.some((keyword) => lowerName.includes(keyword))) {
    // Small to medium sized are components
    if (width <= 500 && height <= 500) {
      return "component";
    }
  }

  // Check if matches common device sizes (likely a screen)
  const matchedDevice = findMatchingDevice(width, height);
  if (matchedDevice) {
    return "screen";
  }

  // Large frames at top level are likely screens
  if (isTopLevel && (width >= 320 || height >= 480)) {
    return "screen";
  }

  // Medium-sized non-top-level frames are likely components
  if (!isTopLevel && width <= 800 && height <= 800) {
    return "component";
  }

  // Default to screen for large frames
  if (width >= 320 && height >= 480) {
    return "screen";
  }

  return "component";
}

// Helper to extract and categorize top-level frames from pages
export function extractTopLevelFrames(pages: FigmaPage[]): CategorizedFrame[] {
  const frames: CategorizedFrame[] = [];

  for (const page of pages) {
    if (!page.children) continue;

    for (const node of page.children) {
      // Only include frames and components at the top level
      if (node.type !== "FRAME" && node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
        continue;
      }

      const bbox = node.absoluteBoundingBox;
      if (!bbox) continue;

      const category = categorizeFrame(node, true);
      const matchedDevice = findMatchingDevice(bbox.width, bbox.height);

      frames.push({
        id: node.id,
        name: node.name,
        width: Math.round(bbox.width),
        height: Math.round(bbox.height),
        category,
        matchedDevice,
        isTopLevel: true,
      });
    }
  }

  return frames;
}

// Helper to get frames grouped by page
export function getFramesByPage(
  pages: FigmaPage[]
): Map<string, { pageName: string; frames: CategorizedFrame[] }> {
  const pageFrames = new Map<string, { pageName: string; frames: CategorizedFrame[] }>();

  for (const page of pages) {
    const frames: CategorizedFrame[] = [];

    if (page.children) {
      for (const node of page.children) {
        if (node.type !== "FRAME" && node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
          continue;
        }

        const bbox = node.absoluteBoundingBox;
        if (!bbox) continue;

        const category = categorizeFrame(node, true);
        const matchedDevice = findMatchingDevice(bbox.width, bbox.height);

        frames.push({
          id: node.id,
          name: node.name,
          width: Math.round(bbox.width),
          height: Math.round(bbox.height),
          category,
          matchedDevice,
          isTopLevel: true,
        });
      }
    }

    pageFrames.set(page.id, { pageName: page.name, frames });
  }

  return pageFrames;
}
