/**
 * GitHub API Utilities
 *
 * Provides functions for interacting with GitHub API to:
 * - List user repositories
 * - Create new repositories
 * - Create branches
 * - Push commits with files
 * - Create pull requests
 */

import { decrypt } from "./encryption";

const GITHUB_API_BASE = "https://api.github.com";

// ============================================================================
// Types
// ============================================================================

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export interface CreateRepoOptions {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export interface CreateBranchOptions {
  owner: string;
  repo: string;
  branchName: string;
  fromBranch?: string; // Defaults to default branch
}

export interface CommitFileContent {
  path: string;
  content: string; // Plain text content
}

export interface CreateCommitOptions {
  owner: string;
  repo: string;
  branch: string;
  message: string;
  files: CommitFileContent[];
}

export interface CreatePullRequestOptions {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string; // Branch with changes
  base: string; // Branch to merge into
}

export interface PullRequest {
  number: number;
  html_url: string;
  title: string;
  state: string;
}

export interface CommitResult {
  sha: string;
  html_url: string;
}

// ============================================================================
// API Client
// ============================================================================

class GitHubAPIClient {
  private accessToken: string;

  constructor(encryptedToken: string) {
    this.accessToken = decrypt(encryptedToken);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${GITHUB_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${this.accessToken}`,
        "User-Agent": "Figma-to-Code-App",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `GitHub API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // =========================================================================
  // User Operations
  // =========================================================================

  async getCurrentUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("/user");
  }

  // =========================================================================
  // Repository Operations
  // =========================================================================

  async listUserRepositories(options?: {
    sort?: "created" | "updated" | "pushed" | "full_name";
    per_page?: number;
  }): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();
    if (options?.sort) params.set("sort", options.sort);
    if (options?.per_page) params.set("per_page", String(options.per_page));

    return this.request<GitHubRepository[]>(`/user/repos?${params.toString()}`);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  async createRepository(options: CreateRepoOptions): Promise<GitHubRepository> {
    return this.request<GitHubRepository>("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: options.name,
        description: options.description || "Created by Figma to Code",
        private: options.private ?? false,
        auto_init: options.auto_init ?? true,
      }),
    });
  }

  // =========================================================================
  // Branch Operations
  // =========================================================================

  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`);
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<GitHubBranch> {
    return this.request<GitHubBranch>(`/repos/${owner}/${repo}/branches/${branch}`);
  }

  async createBranch(options: CreateBranchOptions): Promise<void> {
    const { owner, repo, branchName, fromBranch } = options;

    // Get the SHA of the source branch
    const repoInfo = await this.getRepository(owner, repo);
    const sourceBranch = fromBranch || repoInfo.default_branch;
    const sourceRef = await this.request<{ object: { sha: string } }>(
      `/repos/${owner}/${repo}/git/ref/heads/${sourceBranch}`
    );

    // Create the new branch
    await this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: sourceRef.object.sha,
      }),
    });
  }

  // =========================================================================
  // Commit Operations
  // =========================================================================

  /**
   * Creates a commit with multiple files using the Git Data API.
   * This is the proper way to commit multiple files atomically.
   */
  async createCommit(options: CreateCommitOptions): Promise<CommitResult> {
    const { owner, repo, branch, message, files } = options;

    // 1. Get the current commit SHA for the branch
    const refData = await this.request<{ object: { sha: string } }>(
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`
    );
    const latestCommitSha = refData.object.sha;

    // 2. Get the tree SHA from the latest commit
    const commitData = await this.request<{ tree: { sha: string } }>(
      `/repos/${owner}/${repo}/git/commits/${latestCommitSha}`
    );
    const baseTreeSha = commitData.tree.sha;

    // 3. Create blobs for each file
    const treeItems = await Promise.all(
      files.map(async (file) => {
        const blobData = await this.request<{ sha: string }>(
          `/repos/${owner}/${repo}/git/blobs`,
          {
            method: "POST",
            body: JSON.stringify({
              content: file.content,
              encoding: "utf-8",
            }),
          }
        );

        return {
          path: file.path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blobData.sha,
        };
      })
    );

    // 4. Create a new tree with the new files
    const newTree = await this.request<{ sha: string }>(
      `/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems,
        }),
      }
    );

    // 5. Create a new commit pointing to the new tree
    const newCommit = await this.request<{ sha: string; html_url: string }>(
      `/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
          tree: newTree.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    // 6. Update the branch reference to point to the new commit
    await this.request(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({
        sha: newCommit.sha,
      }),
    });

    return {
      sha: newCommit.sha,
      html_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    };
  }

  // =========================================================================
  // Pull Request Operations
  // =========================================================================

  async createPullRequest(options: CreatePullRequestOptions): Promise<PullRequest> {
    const { owner, repo, title, body, head, base } = options;

    return this.request<PullRequest>(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });
  }

  async listPullRequests(
    owner: string,
    repo: string,
    options?: { state?: "open" | "closed" | "all" }
  ): Promise<PullRequest[]> {
    const params = new URLSearchParams();
    if (options?.state) params.set("state", options.state);

    return this.request<PullRequest[]>(
      `/repos/${owner}/${repo}/pulls?${params.toString()}`
    );
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a GitHub API client with the given encrypted access token.
 */
export function createGitHubClient(encryptedToken: string): GitHubAPIClient {
  return new GitHubAPIClient(encryptedToken);
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Generates the OAuth authorization URL for GitHub.
 */
export function getGitHubAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const scopes = ["repo", "read:user", "user:email"];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Sanitizes a branch name to be valid for Git.
 */
export function sanitizeBranchName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Generates a default branch name for exporting a component.
 */
export function generateExportBranchName(componentName: string): string {
  const sanitized = sanitizeBranchName(componentName);
  const timestamp = Date.now().toString(36);
  return `figma-export/${sanitized}-${timestamp}`;
}

/**
 * Generates a default commit message for exporting a component.
 */
export function generateExportCommitMessage(componentName: string): string {
  return `feat: Add ${componentName} component from Figma

Generated by Figma to Code`;
}

/**
 * Generates a default PR title and body for an export.
 */
export function generatePullRequestContent(
  componentName: string,
  fileCount: number
): { title: string; body: string } {
  return {
    title: `Add ${componentName} component from Figma`,
    body: `## Summary

This PR adds the \`${componentName}\` component, automatically generated from Figma.

### Files Added
- ${fileCount} file(s) generated

### Generated by
[Figma to Code](https://figma-to-code.dev)

---
*This PR was automatically created by Figma to Code.*`,
  };
}
