import { queryOptions } from "@tanstack/react-query";
import {
  getFigmaExportUrlFn,
  getFigmaExportUrlsFn,
  getFigmaExportSetWithUrlsFn,
} from "~/fn/figma-export";

export const getFigmaExportUrlQuery = (storageKey: string) =>
  queryOptions({
    queryKey: ["figma-export-url", storageKey],
    queryFn: () => getFigmaExportUrlFn({ data: { storageKey } }),
    staleTime: 1000 * 60 * 30, // URLs are valid for 1 hour, refresh after 30 minutes
  });

export const getFigmaExportUrlsQuery = (storageKeys: string[]) =>
  queryOptions({
    queryKey: ["figma-export-urls", storageKeys],
    queryFn: () => getFigmaExportUrlsFn({ data: { storageKeys } }),
    staleTime: 1000 * 60 * 30,
    enabled: storageKeys.length > 0,
  });

export const getFigmaExportSetQuery = (exportSetId: string) =>
  queryOptions({
    queryKey: ["figma-export-set", exportSetId],
    queryFn: () => getFigmaExportSetWithUrlsFn({ data: { exportSetId } }),
    enabled: !!exportSetId,
  });
