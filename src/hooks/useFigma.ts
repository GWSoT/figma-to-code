import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { figmaTeamsAndProjectsQueryOptions } from "~/queries/figma";
import {
  syncFigmaTeamFn,
  addFigmaTeamFn,
  refreshFigmaCacheFn,
} from "~/fn/figma";
import { getErrorMessage } from "~/utils/error";

// Re-export the useFigmaAccounts hook from the accounts module
// to avoid duplication
export { useFigmaAccounts } from "~/hooks/useFigmaAccounts";

// ============================================
// Query Hooks
// ============================================

export function useFigmaTeamsAndProjects(
  accountId?: string,
  forceRefresh = false,
  enabled = true
) {
  return useQuery({
    ...figmaTeamsAndProjectsQueryOptions(accountId, forceRefresh),
    enabled,
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useSyncFigmaTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { accountId: string; teamId: string }) =>
      syncFigmaTeamFn({ data }),
    onSuccess: (_, variables) => {
      toast.success("Team synced successfully!", {
        description: "Team and project data has been updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["figma-teams-projects", variables.accountId],
      });
    },
    onError: (error) => {
      toast.error("Failed to sync team", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useAddFigmaTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { accountId: string; teamId: string }) =>
      addFigmaTeamFn({ data }),
    onSuccess: (result, variables) => {
      toast.success("Team added successfully!", {
        description: `"${result.team.name}" has been added with ${result.projects.length} projects.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["figma-teams-projects", variables.accountId],
      });
    },
    onError: (error) => {
      toast.error("Failed to add team", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useRefreshFigmaCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      refreshFigmaCacheFn({ data: { accountId } }),
    onSuccess: (_, accountId) => {
      toast.success("Cache refreshed!", {
        description: "All team and project data has been updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["figma-teams-projects", accountId],
      });
    },
    onError: (error) => {
      toast.error("Failed to refresh cache", {
        description: getErrorMessage(error),
      });
    },
  });
}
