import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  exportFigmaImageFn,
  exportFigmaImageSetFn,
  getFigmaExportUrlFn,
  getFigmaExportUrlsFn,
  getFigmaExportSetWithUrlsFn,
  type ExportResult,
  type ExportSetResult,
} from "~/fn/figma-export";
import {
  getFigmaExportUrlQuery,
  getFigmaExportUrlsQuery,
  getFigmaExportSetQuery,
} from "~/queries/figma-exports";
import type { FigmaExportFormat } from "~/db/schema";

// ============================================
// Types
// ============================================

export interface ExportImageParams {
  accountId?: string;
  fileKey: string;
  nodeId: string;
  nodeName: string;
  format: FigmaExportFormat;
  scale?: number;
  quality?: number;
}

export interface ExportImageSetParams {
  accountId?: string;
  fileKey: string;
  nodeId: string;
  nodeName: string;
  format: FigmaExportFormat;
  scales?: number[];
  quality?: number;
  generateSrcset?: boolean;
}

// ============================================
// Export Single Image Hook
// ============================================

/**
 * Hook to export a single image from Figma at a specific scale
 */
export function useExportFigmaImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ExportImageParams): Promise<ExportResult> => {
      return exportFigmaImageFn({
        data: {
          accountId: params.accountId,
          fileKey: params.fileKey,
          nodeId: params.nodeId,
          nodeName: params.nodeName,
          format: params.format,
          scale: params.scale ?? 1,
          quality: params.quality,
        },
      });
    },
    onSuccess: (result) => {
      // Invalidate any existing URL queries for this storage key
      queryClient.invalidateQueries({
        queryKey: ["figma-export-url", result.storageKey],
      });
      toast.success(`Image exported successfully (${result.scale}x)`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to export image";
      toast.error(message);
    },
  });
}

// ============================================
// Export Multiple Resolutions Hook
// ============================================

/**
 * Hook to export an image at multiple resolutions (1x, 2x, 3x)
 * Generates srcset markup for responsive images
 */
export function useExportFigmaImageSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ExportImageSetParams): Promise<ExportSetResult> => {
      return exportFigmaImageSetFn({
        data: {
          accountId: params.accountId,
          fileKey: params.fileKey,
          nodeId: params.nodeId,
          nodeName: params.nodeName,
          format: params.format,
          scales: params.scales ?? [1, 2, 3],
          quality: params.quality,
          generateSrcset: params.generateSrcset ?? true,
        },
      });
    },
    onSuccess: (result) => {
      // Invalidate queries for all exported images
      result.exports.forEach((exp) => {
        queryClient.invalidateQueries({
          queryKey: ["figma-export-url", exp.storageKey],
        });
      });
      toast.success(
        `Exported ${result.exports.length} images (${result.exports.map((e) => `${e.scale}x`).join(", ")})`
      );
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to export images";
      toast.error(message);
    },
  });
}

// ============================================
// Get Export URL Hook
// ============================================

/**
 * Hook to get the download URL for an exported image
 */
export function useFigmaExportUrl(storageKey: string) {
  return useQuery({
    ...getFigmaExportUrlQuery(storageKey),
    enabled: !!storageKey,
  });
}

/**
 * Hook to get download URLs for multiple exported images
 */
export function useFigmaExportUrls(storageKeys: string[]) {
  return useQuery({
    ...getFigmaExportUrlsQuery(storageKeys),
    enabled: storageKeys.length > 0,
  });
}

// ============================================
// Get Export Set with URLs Hook
// ============================================

/**
 * Hook to get a complete export set with all download URLs
 * Useful for displaying all variants of an exported image
 */
export function useFigmaExportSet(exportSetId: string) {
  return useQuery({
    ...getFigmaExportSetQuery(exportSetId),
    enabled: !!exportSetId,
  });
}

// ============================================
// Convenience Hooks
// ============================================

/**
 * Hook for exporting with common presets
 */
export function useQuickExport() {
  const exportImage = useExportFigmaImage();
  const exportImageSet = useExportFigmaImageSet();

  return {
    /**
     * Export as PNG at 1x only (no srcset)
     */
    exportPng: (params: Omit<ExportImageParams, "format" | "scale">) =>
      exportImage.mutateAsync({ ...params, format: "png", scale: 1 }),

    /**
     * Export as PNG at all resolutions with srcset
     */
    exportPngSet: (params: Omit<ExportImageSetParams, "format">) =>
      exportImageSet.mutateAsync({ ...params, format: "png" }),

    /**
     * Export as JPG at 1x only (no srcset)
     */
    exportJpg: (
      params: Omit<ExportImageParams, "format" | "scale"> & { quality?: number }
    ) => exportImage.mutateAsync({ ...params, format: "jpg", scale: 1 }),

    /**
     * Export as JPG at all resolutions with srcset
     */
    exportJpgSet: (
      params: Omit<ExportImageSetParams, "format"> & { quality?: number }
    ) => exportImageSet.mutateAsync({ ...params, format: "jpg" }),

    /**
     * Export as WebP at 1x only (no srcset)
     */
    exportWebp: (
      params: Omit<ExportImageParams, "format" | "scale"> & { quality?: number }
    ) => exportImage.mutateAsync({ ...params, format: "webp", scale: 1 }),

    /**
     * Export as WebP at all resolutions with srcset
     */
    exportWebpSet: (
      params: Omit<ExportImageSetParams, "format"> & { quality?: number }
    ) => exportImageSet.mutateAsync({ ...params, format: "webp" }),

    /**
     * Check if any export is in progress
     */
    isExporting: exportImage.isPending || exportImageSet.isPending,
  };
}

/**
 * Combined hook for managing export state in a component
 */
export function useFigmaExportManager() {
  const exportImage = useExportFigmaImage();
  const exportImageSet = useExportFigmaImageSet();

  return {
    exportSingle: exportImage.mutateAsync,
    exportMultiple: exportImageSet.mutateAsync,
    isExporting: exportImage.isPending || exportImageSet.isPending,
    lastSingleResult: exportImage.data,
    lastSetResult: exportImageSet.data,
    error: exportImage.error || exportImageSet.error,
    reset: () => {
      exportImage.reset();
      exportImageSet.reset();
    },
  };
}
