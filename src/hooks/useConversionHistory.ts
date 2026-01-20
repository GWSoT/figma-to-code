import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  recordConversionFn,
  rerunConversionFn,
  toggleConversionFavoriteFn,
  updateConversionNotesFn,
  updateConversionTagsFn,
  deleteConversionFn,
} from "~/fn/conversion-history";
import {
  getConversionHistoryQuery,
  getConversionByIdQuery,
  getConversionsByFileKeyQuery,
  getConversionsByNodeIdQuery,
  searchConversionHistoryQuery,
  getFavoriteConversionsQuery,
  getConversionVersionsQuery,
  getConversionStatsQuery,
  getConversionCountQuery,
  compareConversionsQuery,
} from "~/queries/conversion-history";
import { authClient } from "~/lib/auth-client";
import type { ConversionType, ConversionStatus } from "~/db/schema";

// Input types for mutations
export interface RecordConversionInput {
  figmaAccountId?: string;
  fileKey: string;
  fileName?: string;
  nodeId: string;
  nodeName: string;
  nodeType?: string;
  conversionType: ConversionType;
  configurationId?: string;
  jsFramework?: string;
  cssFramework?: string;
  outputCode?: string;
  outputFormat?: string;
  exportedAssetsCount?: number;
  exportedAssetsJson?: string;
  durationMs?: number;
  status?: ConversionStatus;
  errorMessage?: string;
  parentConversionId?: string;
  tags?: string[];
  notes?: string;
}

export interface RerunConversionInput {
  originalConversionId: string;
  configurationId?: string;
  jsFramework?: string;
  cssFramework?: string;
}

export interface SearchFilters {
  conversionType?: ConversionType;
  status?: ConversionStatus;
  jsFramework?: string;
  cssFramework?: string;
  isFavorite?: boolean;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to get all conversion history for the current user
 */
export function useConversionHistory(options?: {
  limit?: number;
  offset?: number;
  orderBy?: "newest" | "oldest";
}) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionHistoryQuery(options),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get a single conversion by ID
 */
export function useConversionById(id: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionByIdQuery(id),
    enabled: !!session?.user && !!id,
  });
}

/**
 * Hook to get conversions by file key
 */
export function useConversionsByFileKey(fileKey: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionsByFileKeyQuery(fileKey),
    enabled: !!session?.user && !!fileKey,
  });
}

/**
 * Hook to get conversions by node ID
 */
export function useConversionsByNodeId(fileKey: string, nodeId: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionsByNodeIdQuery(fileKey, nodeId),
    enabled: !!session?.user && !!fileKey && !!nodeId,
  });
}

/**
 * Hook to search and filter conversions
 */
export function useSearchConversionHistory(filters: SearchFilters) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...searchConversionHistoryQuery(filters),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get favorite conversions
 */
export function useFavoriteConversions() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getFavoriteConversionsQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get all versions of a conversion
 */
export function useConversionVersions(conversionId: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionVersionsQuery(conversionId),
    enabled: !!session?.user && !!conversionId,
  });
}

/**
 * Hook to get conversion statistics
 */
export function useConversionStats() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionStatsQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get total conversion count
 */
export function useConversionCount() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getConversionCountQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to compare two conversions
 */
export function useCompareConversions(
  conversionId1: string,
  conversionId2: string
) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...compareConversionsQuery(conversionId1, conversionId2),
    enabled: !!session?.user && !!conversionId1 && !!conversionId2,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to record a new conversion
 */
export function useRecordConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordConversionInput) =>
      recordConversionFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
    },
    onError: (error) => {
      console.error("Failed to record conversion:", error);
    },
  });
}

/**
 * Hook to re-run a conversion with updated settings
 */
export function useRerunConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RerunConversionInput) =>
      rerunConversionFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
      toast.success("Re-run initiated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to re-run conversion"
      );
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleConversionFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleConversionFavoriteFn({ data: { id } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
      toast.success(
        data.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update favorite"
      );
    },
  });
}

/**
 * Hook to update conversion notes
 */
export function useUpdateConversionNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateConversionNotesFn({ data: { id, notes } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
      queryClient.invalidateQueries({
        queryKey: ["conversion-history", "detail", variables.id],
      });
      toast.success("Notes updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update notes"
      );
    },
  });
}

/**
 * Hook to update conversion tags
 */
export function useUpdateConversionTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      updateConversionTagsFn({ data: { id, tags } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
      queryClient.invalidateQueries({
        queryKey: ["conversion-history", "detail", variables.id],
      });
      toast.success("Tags updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update tags"
      );
    },
  });
}

/**
 * Hook to delete a conversion
 */
export function useDeleteConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversionFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversion-history"] });
      toast.success("Conversion deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete conversion"
      );
    },
  });
}
