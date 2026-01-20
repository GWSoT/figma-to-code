/**
 * GitHub Server Functions
 *
 * Server functions for GitHub OAuth and export operations.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import { publicEnv } from "~/config/publicEnv";
import { privateEnv } from "~/config/privateEnv";
import {
  findGitHubAccountsByUserId,
  findGitHubAccountById,
  findDefaultGitHubAccount,
  deleteGitHubAccount,
  setDefaultGitHubAccount,
  updateGitHubAccountLastUsed,
  createGitHubExport,
  updateGitHubExport,
  stripSensitiveData,
  type GitHubAccountPublic,
} from "~/data-access/github-accounts";
import {
  createGitHubClient,
  getGitHubAuthUrl,
  generateExportBranchName,
  generateExportCommitMessage,
  generatePullRequestContent,
  type GitHubRepository,
  type GitHubBranch,
} from "~/utils/github-api";

// ============================================================================
// OAuth Functions
// ============================================================================

/**
 * Get the GitHub OAuth authorization URL
 */
export const getGitHubOAuthUrlFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;
    const redirectUri = `${publicEnv.BETTER_AUTH_URL}/api/github/callback`;
    const authUrl = getGitHubAuthUrl(privateEnv.GITHUB_CLIENT_ID, redirectUri, userId);
    return { url: authUrl };
  });

// ============================================================================
// Account Management Functions
// ============================================================================

/**
 * Get all connected GitHub accounts for the current user
 */
export const getGitHubAccountsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;
    const accounts = await findGitHubAccountsByUserId(userId);
    return accounts.map(stripSensitiveData);
  });

/**
 * Get the default GitHub account for the current user
 */
export const getDefaultGitHubAccountFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;
    const account = await findDefaultGitHubAccount(userId);
    return account ? stripSensitiveData(account) : null;
  });

/**
 * Set a GitHub account as default
 */
export const setDefaultGitHubAccountFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accountId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: { accountId: string } }) => {
    const { userId } = context;
    const { accountId } = data;

    // Verify the account belongs to the user
    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    await setDefaultGitHubAccount(userId, accountId);
    return { success: true };
  });

/**
 * Disconnect a GitHub account
 */
export const disconnectGitHubAccountFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accountId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: { accountId: string } }) => {
    const { userId } = context;
    const { accountId } = data;

    // Verify the account belongs to the user
    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    await deleteGitHubAccount(accountId);
    return { success: true };
  });

// ============================================================================
// Repository Functions
// ============================================================================

/**
 * List repositories for a GitHub account
 */
export const listGitHubRepositoriesFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ accountId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: { accountId: string } }) => {
    const { userId } = context;
    const { accountId } = data;

    // Get the account with tokens
    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    const client = createGitHubClient(account.accessToken);
    const repositories = await client.listUserRepositories({
      sort: "updated",
      per_page: 100,
    });

    await updateGitHubAccountLastUsed(accountId);

    return repositories;
  });

/**
 * List branches for a repository
 */
export const listGitHubBranchesFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      accountId: z.string(),
      owner: z.string(),
      repo: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: { accountId: string; owner: string; repo: string } }) => {
    const { userId } = context;
    const { accountId, owner, repo } = data;

    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    const client = createGitHubClient(account.accessToken);
    return client.listBranches(owner, repo);
  });

/**
 * Create a new GitHub repository
 */
export const createGitHubRepositoryFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accountId: z.string(),
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      isPrivate: z.boolean().default(false),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: { accountId: string; name: string; description?: string; isPrivate: boolean } }) => {
    const { userId } = context;
    const { accountId, name, description, isPrivate } = data;

    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    const client = createGitHubClient(account.accessToken);
    const repository = await client.createRepository({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    });

    await updateGitHubAccountLastUsed(accountId);

    return repository;
  });

// ============================================================================
// Export Functions
// ============================================================================

// Schema for export to GitHub
const exportToGitHubSchema = z.object({
  accountId: z.string(),
  // Repository target
  repositoryOwner: z.string(),
  repositoryName: z.string(),
  isNewRepository: z.boolean().default(false),
  newRepositoryOptions: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      isPrivate: z.boolean().default(false),
    })
    .optional(),
  // Branch configuration
  branchName: z.string().optional(),
  createNewBranch: z.boolean().default(true),
  baseBranch: z.string().optional(),
  // Commit configuration
  commitMessage: z.string().optional(),
  // PR configuration
  createPullRequest: z.boolean().default(true),
  pullRequestTitle: z.string().optional(),
  pullRequestBody: z.string().optional(),
  // Files to export
  componentName: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
  // Optional reference to conversion history
  conversionHistoryId: z.string().optional(),
});

type ExportToGitHubInput = z.infer<typeof exportToGitHubSchema>;

/**
 * Export generated code to a GitHub repository
 */
export const exportToGitHubFn = createServerFn({ method: "POST" })
  .inputValidator(exportToGitHubSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }: { context: { userId: string }; data: ExportToGitHubInput }) => {
    const { userId } = context;
    const {
      accountId,
      repositoryOwner,
      repositoryName,
      isNewRepository,
      newRepositoryOptions,
      branchName,
      createNewBranch,
      baseBranch,
      commitMessage,
      createPullRequest,
      pullRequestTitle,
      pullRequestBody,
      componentName,
      files,
      conversionHistoryId,
    } = data;

    // Get the GitHub account
    const account = await findGitHubAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("GitHub account not found");
    }

    const client = createGitHubClient(account.accessToken);

    // Create export record
    const exportId = crypto.randomUUID();
    let exportRecord = await createGitHubExport({
      id: exportId,
      userId,
      githubAccountId: accountId,
      repositoryOwner,
      repositoryName,
      repositoryUrl: `https://github.com/${repositoryOwner}/${repositoryName}`,
      isNewRepository,
      branchName: branchName || generateExportBranchName(componentName),
      commitMessage: commitMessage || generateExportCommitMessage(componentName),
      componentName,
      filesExported: files.length,
      totalSizeBytes: files.reduce((sum, f) => sum + f.content.length, 0),
      conversionHistoryId,
      status: "in_progress",
    });

    try {
      let targetOwner = repositoryOwner;
      let targetRepo = repositoryName;
      let repoInfo: GitHubRepository;

      // Step 1: Create repository if needed
      if (isNewRepository && newRepositoryOptions) {
        const newRepo = await client.createRepository({
          name: newRepositoryOptions.name,
          description: newRepositoryOptions.description,
          private: newRepositoryOptions.isPrivate,
          auto_init: true,
        });
        targetOwner = newRepo.owner.login;
        targetRepo = newRepo.name;
        repoInfo = newRepo;

        // Update export record with actual repository info
        await updateGitHubExport(exportId, {
          repositoryOwner: targetOwner,
          repositoryName: targetRepo,
          repositoryUrl: newRepo.html_url,
        });
      } else {
        repoInfo = await client.getRepository(targetOwner, targetRepo);
      }

      // Step 2: Determine target branch
      const targetBranch = branchName || generateExportBranchName(componentName);
      const sourceBaseBranch = baseBranch || repoInfo.default_branch;

      // Step 3: Create new branch if needed
      if (createNewBranch) {
        await client.createBranch({
          owner: targetOwner,
          repo: targetRepo,
          branchName: targetBranch,
          fromBranch: sourceBaseBranch,
        });
      }

      // Step 4: Create commit with files
      const finalCommitMessage =
        commitMessage || generateExportCommitMessage(componentName);
      const commitResult = await client.createCommit({
        owner: targetOwner,
        repo: targetRepo,
        branch: targetBranch,
        message: finalCommitMessage,
        files,
      });

      // Update export record with commit info
      await updateGitHubExport(exportId, {
        commitSha: commitResult.sha,
        branchName: targetBranch,
      });

      // Step 5: Create pull request if requested
      let prResult: { number: number; html_url: string } | null = null;
      if (createPullRequest && createNewBranch) {
        const prContent = generatePullRequestContent(componentName, files.length);
        const pr = await client.createPullRequest({
          owner: targetOwner,
          repo: targetRepo,
          title: pullRequestTitle || prContent.title,
          body: pullRequestBody || prContent.body,
          head: targetBranch,
          base: sourceBaseBranch,
        });
        prResult = { number: pr.number, html_url: pr.html_url };

        // Update export record with PR info
        await updateGitHubExport(exportId, {
          pullRequestUrl: pr.html_url,
          pullRequestNumber: pr.number,
          pullRequestTitle: pullRequestTitle || prContent.title,
        });
      }

      // Mark export as complete
      await updateGitHubExport(exportId, {
        status: "completed",
        completedAt: new Date(),
      });

      await updateGitHubAccountLastUsed(accountId);

      return {
        success: true,
        exportId,
        repositoryUrl: `https://github.com/${targetOwner}/${targetRepo}`,
        branchName: targetBranch,
        commitSha: commitResult.sha,
        commitUrl: commitResult.html_url,
        pullRequest: prResult,
      };
    } catch (error) {
      // Update export record with error
      await updateGitHubExport(exportId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Export failed",
      });

      throw error;
    }
  });

// ============================================================================
// Type Exports for Client
// ============================================================================

export type { GitHubAccountPublic, GitHubRepository, GitHubBranch };
