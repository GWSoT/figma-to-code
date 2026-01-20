/**
 * GitHub TanStack Query Definitions
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getGitHubAccountsFn,
  getDefaultGitHubAccountFn,
  listGitHubRepositoriesFn,
  listGitHubBranchesFn,
} from "~/fn/github";

// ============================================================================
// Query Keys
// ============================================================================

export const githubKeys = {
  all: ["github"] as const,
  accounts: () => [...githubKeys.all, "accounts"] as const,
  defaultAccount: () => [...githubKeys.all, "default-account"] as const,
  repositories: (accountId: string) =>
    [...githubKeys.all, "repositories", accountId] as const,
  branches: (accountId: string, owner: string, repo: string) =>
    [...githubKeys.all, "branches", accountId, owner, repo] as const,
};

// ============================================================================
// Query Options
// ============================================================================

export const getGitHubAccountsQuery = () =>
  queryOptions({
    queryKey: githubKeys.accounts(),
    queryFn: () => getGitHubAccountsFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const getDefaultGitHubAccountQuery = () =>
  queryOptions({
    queryKey: githubKeys.defaultAccount(),
    queryFn: () => getDefaultGitHubAccountFn(),
    staleTime: 5 * 60 * 1000,
  });

export const getGitHubRepositoriesQuery = (accountId: string) =>
  queryOptions({
    queryKey: githubKeys.repositories(accountId),
    queryFn: () => listGitHubRepositoriesFn({ data: { accountId } }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!accountId,
  });

export const getGitHubBranchesQuery = (
  accountId: string,
  owner: string,
  repo: string
) =>
  queryOptions({
    queryKey: githubKeys.branches(accountId, owner, repo),
    queryFn: () => listGitHubBranchesFn({ data: { accountId, owner, repo } }),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!accountId && !!owner && !!repo,
  });
