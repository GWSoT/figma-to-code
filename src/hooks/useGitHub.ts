/**
 * GitHub Custom Hooks
 *
 * Provides React hooks for GitHub integration including:
 * - Account management
 * - Repository operations
 * - Export to GitHub
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGitHubAccountsQuery,
  getDefaultGitHubAccountQuery,
  getGitHubRepositoriesQuery,
  getGitHubBranchesQuery,
  githubKeys,
} from "~/queries/github";
import {
  getGitHubOAuthUrlFn,
  setDefaultGitHubAccountFn,
  disconnectGitHubAccountFn,
  createGitHubRepositoryFn,
  exportToGitHubFn,
} from "~/fn/github";

// ============================================================================
// Account Hooks
// ============================================================================

/**
 * Hook to get all connected GitHub accounts
 */
export function useGitHubAccounts() {
  return useQuery(getGitHubAccountsQuery());
}

/**
 * Hook to get the default GitHub account
 */
export function useDefaultGitHubAccount() {
  return useQuery(getDefaultGitHubAccountQuery());
}

/**
 * Hook to connect a new GitHub account (get OAuth URL)
 */
export function useConnectGitHub() {
  return useMutation({
    mutationFn: () => getGitHubOAuthUrlFn(),
    onSuccess: (data) => {
      // Redirect to GitHub OAuth
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to connect GitHub");
    },
  });
}

/**
 * Hook to set a GitHub account as default
 */
export function useSetDefaultGitHubAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      setDefaultGitHubAccountFn({ data: { accountId } }),
    onSuccess: () => {
      toast.success("Default GitHub account updated");
      queryClient.invalidateQueries({ queryKey: githubKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: githubKeys.defaultAccount() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update default account");
    },
  });
}

/**
 * Hook to disconnect a GitHub account
 */
export function useDisconnectGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      disconnectGitHubAccountFn({ data: { accountId } }),
    onSuccess: () => {
      toast.success("GitHub account disconnected");
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect account");
    },
  });
}

// ============================================================================
// Repository Hooks
// ============================================================================

/**
 * Hook to list repositories for a GitHub account
 */
export function useGitHubRepositories(accountId: string | undefined) {
  return useQuery({
    ...getGitHubRepositoriesQuery(accountId || ""),
    enabled: !!accountId,
  });
}

/**
 * Hook to list branches for a repository
 */
export function useGitHubBranches(
  accountId: string | undefined,
  owner: string | undefined,
  repo: string | undefined
) {
  return useQuery({
    ...getGitHubBranchesQuery(accountId || "", owner || "", repo || ""),
    enabled: !!accountId && !!owner && !!repo,
  });
}

/**
 * Hook to create a new GitHub repository
 */
export function useCreateGitHubRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      accountId: string;
      name: string;
      description?: string;
      isPrivate?: boolean;
    }) => createGitHubRepositoryFn({ data }),
    onSuccess: (repo, variables) => {
      toast.success(`Repository "${repo.name}" created`);
      queryClient.invalidateQueries({
        queryKey: githubKeys.repositories(variables.accountId),
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create repository");
    },
  });
}

// ============================================================================
// Export Hook
// ============================================================================

export interface ExportToGitHubOptions {
  accountId: string;
  // Repository target
  repositoryOwner: string;
  repositoryName: string;
  isNewRepository?: boolean;
  newRepositoryOptions?: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  };
  // Branch configuration
  branchName?: string;
  createNewBranch?: boolean;
  baseBranch?: string;
  // Commit configuration
  commitMessage?: string;
  // PR configuration
  createPullRequest?: boolean;
  pullRequestTitle?: string;
  pullRequestBody?: string;
  // Files to export
  componentName: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  // Optional reference
  conversionHistoryId?: string;
}

export interface ExportToGitHubResult {
  success: boolean;
  exportId: string;
  repositoryUrl: string;
  branchName: string;
  commitSha: string;
  commitUrl: string;
  pullRequest: {
    number: number;
    html_url: string;
  } | null;
}

/**
 * Hook to export generated code to GitHub
 */
export function useExportToGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: ExportToGitHubOptions) =>
      exportToGitHubFn({ data: options }),
    onSuccess: (result) => {
      if (result.pullRequest) {
        toast.success("Code exported and pull request created!", {
          action: {
            label: "View PR",
            onClick: () => window.open(result.pullRequest?.html_url, "_blank"),
          },
        });
      } else {
        toast.success("Code exported to GitHub!", {
          action: {
            label: "View Commit",
            onClick: () => window.open(result.commitUrl, "_blank"),
          },
        });
      }
      // Invalidate repositories in case a new one was created
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to export to GitHub");
    },
  });
}
