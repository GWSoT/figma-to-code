export interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: string;
  children?: FigmaFrame[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: FigmaColor;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  characters?: string;
  style?: FigmaTextStyle;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaFill {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientStops?: Array<{
    position: number;
    color: FigmaColor;
  }>;
  imageRef?: string;
}

export interface FigmaStroke {
  type: string;
  color?: FigmaColor;
}

export interface FigmaEffect {
  type: string;
  visible?: boolean;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  lineHeightPx?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
}

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaTeam {
  id: string;
  name: string;
}

export interface GenerationOptions {
  framework: 'react' | 'vue' | 'svelte' | 'html';
  styling: 'tailwind' | 'css' | 'styled-components' | 'css-modules';
  componentName?: string;
  outputPath?: string;
  includeImages?: boolean;
  responsive?: boolean;
}

export interface GeneratedCode {
  componentCode: string;
  styleCode?: string;
  fileName: string;
  styleFileName?: string;
  assets: GeneratedAsset[];
}

export interface GeneratedAsset {
  name: string;
  url: string;
  localPath?: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  figmaFileKey: string;
  figmaNodeId: string;
  nodeName: string;
  framework: string;
  styling: string;
  outputPath: string;
  success: boolean;
  error?: string;
}

export interface SyncMapping {
  figmaFileKey: string;
  figmaNodeId: string;
  localFilePath: string;
  lastSyncedAt: number;
  checksum: string;
}

export interface FigmaApiResponse<T> {
  status: number;
  data: T;
  error?: string;
}
