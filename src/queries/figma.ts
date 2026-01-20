import { queryOptions } from "@tanstack/react-query";
import { getFigmaTeamsAndProjectsFn } from "~/fn/figma";

// Re-export accounts query for convenience
export { getFigmaAccountsQuery as figmaAccountsQueryOptions } from "~/queries/figma-accounts";

export const figmaTeamsAndProjectsQueryOptions = (
  accountId?: string,
  forceRefresh = false
) =>
  queryOptions({
    queryKey: ["figma-teams-projects", accountId, forceRefresh],
    queryFn: () =>
      getFigmaTeamsAndProjectsFn({
        data: { accountId, forceRefresh },
      }),
    // Cache for 5 minutes before considering stale
    staleTime: 5 * 60 * 1000,
    // Keep cached data for 15 minutes
    gcTime: 15 * 60 * 1000,
  });
