import { queryOptions } from "@tanstack/react-query";
import {
  getConversionHistoryFn,
  getConversionByIdFn,
  getConversionsByFileKeyFn,
  getConversionsByNodeIdFn,
  searchConversionHistoryFn,
  getFavoriteConversionsFn,
  getConversionVersionsFn,
  getConversionStatsFn,
  getConversionCountFn,
  compareConversionsFn,
  type ConversionComparisonResult,
} from "~/fn/conversion-history";
import type { ConversionType, ConversionStatus } from "~/db/schema";

export const getConversionHistoryQuery = (options?: {
  limit?: number;
  offset?: number;
  orderBy?: "newest" | "oldest";
}) =>
  queryOptions({
    queryKey: ["conversion-history", options],
    queryFn: () =>
      getConversionHistoryFn({
        data: {
          limit: options?.limit ?? 50,
          offset: options?.offset ?? 0,
          orderBy: options?.orderBy ?? "newest",
        },
      }),
  });

export const getConversionByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["conversion-history", "detail", id],
    queryFn: () => getConversionByIdFn({ data: { id } }),
    enabled: !!id,
  });

export const getConversionsByFileKeyQuery = (fileKey: string) =>
  queryOptions({
    queryKey: ["conversion-history", "file", fileKey],
    queryFn: () => getConversionsByFileKeyFn({ data: { fileKey } }),
    enabled: !!fileKey,
  });

export const getConversionsByNodeIdQuery = (fileKey: string, nodeId: string) =>
  queryOptions({
    queryKey: ["conversion-history", "node", fileKey, nodeId],
    queryFn: () => getConversionsByNodeIdFn({ data: { fileKey, nodeId } }),
    enabled: !!fileKey && !!nodeId,
  });

export const searchConversionHistoryQuery = (filters: {
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
}) =>
  queryOptions({
    queryKey: ["conversion-history", "search", filters],
    queryFn: () =>
      searchConversionHistoryFn({
        data: {
          ...filters,
          limit: filters.limit ?? 50,
          offset: filters.offset ?? 0,
        },
      }),
  });

export const getFavoriteConversionsQuery = () =>
  queryOptions({
    queryKey: ["conversion-history", "favorites"],
    queryFn: () => getFavoriteConversionsFn(),
  });

export const getConversionVersionsQuery = (conversionId: string) =>
  queryOptions({
    queryKey: ["conversion-history", "versions", conversionId],
    queryFn: () => getConversionVersionsFn({ data: { conversionId } }),
    enabled: !!conversionId,
  });

export const getConversionStatsQuery = () =>
  queryOptions({
    queryKey: ["conversion-history", "stats"],
    queryFn: () => getConversionStatsFn(),
  });

export const getConversionCountQuery = () =>
  queryOptions({
    queryKey: ["conversion-history", "count"],
    queryFn: () => getConversionCountFn(),
  });

export const compareConversionsQuery = (
  conversionId1: string,
  conversionId2: string
) =>
  queryOptions({
    queryKey: ["conversion-history", "compare", conversionId1, conversionId2],
    queryFn: async (): Promise<ConversionComparisonResult> =>
      compareConversionsFn({ data: { conversionId1, conversionId2 } }) as Promise<ConversionComparisonResult>,
    enabled: !!conversionId1 && !!conversionId2,
  });
