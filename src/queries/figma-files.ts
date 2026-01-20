import { queryOptions } from "@tanstack/react-query";
import { getFileFramesFn, getProjectFilesFn, getFramesByCategoryFn } from "~/fn/figma-files";

export const fileFramesQueryOptions = (
  fileKey: string,
  accountId?: string,
  forceRefresh = false
) =>
  queryOptions({
    queryKey: ["figma-file-frames", fileKey, accountId, forceRefresh],
    queryFn: () =>
      getFileFramesFn({
        data: { fileKey, accountId, forceRefresh },
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!fileKey,
  });

export const projectFilesQueryOptions = (
  projectId: string,
  accountId?: string,
  forceRefresh = false
) =>
  queryOptions({
    queryKey: ["figma-project-files", projectId, accountId, forceRefresh],
    queryFn: () =>
      getProjectFilesFn({
        data: { projectId, accountId, forceRefresh },
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!projectId,
  });

export const framesByCategoryQueryOptions = (
  fileKey: string,
  category?: "screen" | "component" | "asset" | "unknown"
) =>
  queryOptions({
    queryKey: ["figma-frames-by-category", fileKey, category],
    queryFn: () =>
      getFramesByCategoryFn({
        data: { fileKey, category },
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!fileKey,
  });
