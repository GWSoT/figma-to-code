import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fileFramesQueryOptions,
  projectFilesQueryOptions,
  framesByCategoryQueryOptions,
} from "~/queries/figma-files";
import { getFileFramesFn } from "~/fn/figma-files";
import { getErrorMessage } from "~/utils/error";

// ============================================
// Query Hooks
// ============================================

export function useFigmaFileFrames(
  fileKey: string,
  accountId?: string,
  forceRefresh = false,
  enabled = true
) {
  return useQuery({
    ...fileFramesQueryOptions(fileKey, accountId, forceRefresh),
    enabled: enabled && !!fileKey,
  });
}

export function useFigmaProjectFiles(
  projectId: string,
  accountId?: string,
  forceRefresh = false,
  enabled = true
) {
  return useQuery({
    ...projectFilesQueryOptions(projectId, accountId, forceRefresh),
    enabled: enabled && !!projectId,
  });
}

export function useFigmaFramesByCategory(
  fileKey: string,
  category?: "screen" | "component" | "asset" | "unknown",
  enabled = true
) {
  return useQuery({
    ...framesByCategoryQueryOptions(fileKey, category),
    enabled: enabled && !!fileKey,
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useRefreshFileFrames() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { fileKey: string; accountId?: string }) =>
      getFileFramesFn({ data: { ...data, forceRefresh: true } }),
    onSuccess: (result, variables) => {
      const totalFrames = result.pages.reduce(
        (acc, page) => acc + page.frames.length,
        0
      );
      toast.success("File frames refreshed!", {
        description: `Found ${totalFrames} frames in ${result.pages.length} pages.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["figma-file-frames", variables.fileKey],
      });
    },
    onError: (error) => {
      toast.error("Failed to refresh file frames", {
        description: getErrorMessage(error),
      });
    },
  });
}
