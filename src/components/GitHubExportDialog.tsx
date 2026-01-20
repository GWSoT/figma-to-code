/**
 * GitHub Export Dialog
 *
 * Dialog for exporting generated code directly to a GitHub repository.
 * Supports creating new repos, pushing to existing ones, configuring branches,
 * commit messages, and creating pull requests.
 */

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Github,
  GitBranch,
  GitPullRequest,
  FolderPlus,
  Loader2,
  Check,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";
import type { GeneratedFile } from "~/utils/code-generation-agent/types";
import {
  useGitHubAccounts,
  useGitHubRepositories,
  useGitHubBranches,
  useConnectGitHub,
  useExportToGitHub,
  useCreateGitHubRepository,
  type ExportToGitHubResult,
} from "~/hooks/useGitHub";
import {
  generateExportBranchName,
  generateExportCommitMessage,
} from "~/utils/github-api";

// ============================================================================
// Types
// ============================================================================

interface GitHubExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: GeneratedFile[];
  componentName: string;
}

type ExportMode = "existing" | "new";
type ExportStep = "configure" | "exporting" | "success" | "error";

// ============================================================================
// Component
// ============================================================================

export function GitHubExportDialog({
  open,
  onOpenChange,
  files,
  componentName,
}: GitHubExportDialogProps) {
  // State
  const [step, setStep] = useState<ExportStep>("configure");
  const [exportMode, setExportMode] = useState<ExportMode>("existing");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>("");
  const [selectedBaseBranch, setSelectedBaseBranch] = useState<string>("");

  // New repo options
  const [newRepoName, setNewRepoName] = useState(
    componentName.toLowerCase().replace(/\s+/g, "-")
  );
  const [newRepoDescription, setNewRepoDescription] = useState(
    `${componentName} component from Figma`
  );
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);

  // Branch and commit options
  const [branchName, setBranchName] = useState(
    generateExportBranchName(componentName)
  );
  const [createNewBranch, setCreateNewBranch] = useState(true);
  const [commitMessage, setCommitMessage] = useState(
    generateExportCommitMessage(componentName)
  );

  // PR options
  const [createPR, setCreatePR] = useState(true);
  const [prTitle, setPrTitle] = useState(`Add ${componentName} component from Figma`);

  // Result state
  const [exportResult, setExportResult] = useState<ExportToGitHubResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Queries
  const { data: accounts = [], isLoading: accountsLoading } = useGitHubAccounts();
  const { data: repositories = [], isLoading: reposLoading } = useGitHubRepositories(
    selectedAccountId || undefined
  );

  // Parse selected repo
  const selectedRepo = useMemo(() => {
    if (!selectedRepoFullName) return null;
    const [owner, name] = selectedRepoFullName.split("/");
    return repositories.find((r: { owner: { login: string }; name: string }) => r.owner.login === owner && r.name === name);
  }, [selectedRepoFullName, repositories]);

  const { data: branches = [], isLoading: branchesLoading } = useGitHubBranches(
    selectedAccountId || undefined,
    selectedRepo?.owner.login,
    selectedRepo?.name
  );

  // Mutations
  const connectGitHub = useConnectGitHub();
  const exportToGitHub = useExportToGitHub();
  const createRepository = useCreateGitHubRepository();

  // Handlers
  const handleClose = useCallback(() => {
    setStep("configure");
    setExportResult(null);
    setErrorMessage("");
    onOpenChange(false);
  }, [onOpenChange]);

  const handleExport = useCallback(async () => {
    if (!selectedAccountId) {
      setErrorMessage("Please select a GitHub account");
      return;
    }

    setStep("exporting");
    setErrorMessage("");

    try {
      // Convert GeneratedFile[] to the format expected by the export function
      const exportFiles = files.map((file) => ({
        path: `${componentName}/${file.path}`,
        content: file.content,
      }));

      let repoOwner = selectedRepo?.owner.login || "";
      let repoName = selectedRepo?.name || "";

      // Handle new repo creation
      if (exportMode === "new") {
        repoOwner = accounts.find((a) => a.id === selectedAccountId)?.githubUsername || "";
        repoName = newRepoName;
      }

      const result = await exportToGitHub.mutateAsync({
        accountId: selectedAccountId,
        repositoryOwner: repoOwner,
        repositoryName: repoName,
        isNewRepository: exportMode === "new",
        newRepositoryOptions:
          exportMode === "new"
            ? {
                name: newRepoName,
                description: newRepoDescription,
                isPrivate: newRepoPrivate,
              }
            : undefined,
        branchName: createNewBranch ? branchName : selectedBaseBranch,
        createNewBranch,
        baseBranch: selectedBaseBranch || undefined,
        commitMessage,
        createPullRequest: createPR && createNewBranch,
        pullRequestTitle: prTitle,
        componentName,
        files: exportFiles,
      });

      setExportResult(result as ExportToGitHubResult);
      setStep("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Export failed");
      setStep("error");
    }
  }, [
    selectedAccountId,
    selectedRepo,
    exportMode,
    newRepoName,
    newRepoDescription,
    newRepoPrivate,
    branchName,
    createNewBranch,
    selectedBaseBranch,
    commitMessage,
    createPR,
    prTitle,
    componentName,
    files,
    accounts,
    exportToGitHub,
  ]);

  const handleRetry = useCallback(() => {
    setStep("configure");
    setErrorMessage("");
  }, []);

  // Check if export is ready
  const canExport = useMemo(() => {
    if (!selectedAccountId) return false;
    if (exportMode === "existing" && !selectedRepoFullName) return false;
    if (exportMode === "new" && !newRepoName.trim()) return false;
    if (createNewBranch && !branchName.trim()) return false;
    if (!createNewBranch && !selectedBaseBranch) return false;
    if (!commitMessage.trim()) return false;
    return true;
  }, [
    selectedAccountId,
    exportMode,
    selectedRepoFullName,
    newRepoName,
    createNewBranch,
    branchName,
    selectedBaseBranch,
    commitMessage,
  ]);

  // Render no accounts state
  if (!accountsLoading && accounts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" data-testid="github-export-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="size-5" />
              Connect GitHub
            </DialogTitle>
            <DialogDescription>
              Connect your GitHub account to export code directly to repositories.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Github className="size-6 text-muted-foreground" />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              No GitHub account connected. Connect your account to enable direct
              export to repositories.
            </p>
            <Button
              onClick={() => connectGitHub.mutate()}
              disabled={connectGitHub.isPending}
            >
              {connectGitHub.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Github className="mr-2 size-4" />
              )}
              Connect GitHub Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="github-export-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="size-5" />
            Export to GitHub
          </DialogTitle>
          <DialogDescription>
            Push "{componentName}" directly to a GitHub repository.
          </DialogDescription>
        </DialogHeader>

        {step === "configure" && (
          <div className="space-y-4">
            {/* Account Selection */}
            <div className="space-y-2">
              <Label>GitHub Account</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="flex items-center gap-2">
                        {account.githubAvatarUrl && (
                          <img
                            src={account.githubAvatarUrl}
                            alt=""
                            className="size-4 rounded-full"
                          />
                        )}
                        {account.githubUsername}
                        {account.isDefault && (
                          <span className="text-xs text-muted-foreground">(default)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Mode */}
            <div className="space-y-2">
              <Label>Repository</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportMode === "existing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportMode("existing")}
                  className="flex-1"
                >
                  Existing Repository
                </Button>
                <Button
                  variant={exportMode === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportMode("new")}
                  className="flex-1"
                >
                  <Plus className="mr-1 size-3" />
                  Create New
                </Button>
              </div>
            </div>

            {/* Repository Selection / Creation */}
            {exportMode === "existing" ? (
              <div className="space-y-2">
                <Select
                  value={selectedRepoFullName}
                  onValueChange={(value) => {
                    setSelectedRepoFullName(value);
                    setSelectedBaseBranch("");
                  }}
                  disabled={!selectedAccountId || reposLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        reposLoading ? "Loading repositories..." : "Select repository..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo: { id: number; owner: { login: string }; name: string; full_name: string; private: boolean }) => (
                      <SelectItem
                        key={repo.id}
                        value={`${repo.owner.login}/${repo.name}`}
                      >
                        <span className="flex items-center gap-2">
                          {repo.private ? (
                            <Lock className="size-3 text-muted-foreground" />
                          ) : (
                            <Unlock className="size-3 text-muted-foreground" />
                          )}
                          {repo.full_name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="space-y-1">
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="my-component"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="repo-desc">Description (optional)</Label>
                  <Input
                    id="repo-desc"
                    value={newRepoDescription}
                    onChange={(e) => setNewRepoDescription(e.target.value)}
                    placeholder="Component generated from Figma"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="repo-private"
                    checked={newRepoPrivate}
                    onCheckedChange={(checked) => setNewRepoPrivate(!!checked)}
                  />
                  <Label htmlFor="repo-private" className="cursor-pointer text-sm">
                    Private repository
                  </Label>
                </div>
              </div>
            )}

            {/* Branch Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <GitBranch className="size-4" />
                  Branch
                </Label>
                {exportMode === "existing" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="create-branch"
                      checked={createNewBranch}
                      onCheckedChange={(checked) => setCreateNewBranch(!!checked)}
                    />
                    <Label htmlFor="create-branch" className="cursor-pointer text-sm">
                      Create new branch
                    </Label>
                  </div>
                )}
              </div>

              {createNewBranch || exportMode === "new" ? (
                <div className="space-y-2">
                  <Input
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="figma-export/component-name"
                  />
                  {exportMode === "existing" && selectedRepo && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">
                        Base branch:
                      </Label>
                      <Select
                        value={selectedBaseBranch || selectedRepo.default_branch}
                        onValueChange={setSelectedBaseBranch}
                        disabled={branchesLoading}
                      >
                        <SelectTrigger className="h-7 w-auto text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch: { name: string }) => (
                            <SelectItem key={branch.name} value={branch.name}>
                              {branch.name}
                              {branch.name === selectedRepo.default_branch && " (default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <Select
                  value={selectedBaseBranch}
                  onValueChange={setSelectedBaseBranch}
                  disabled={branchesLoading || !selectedRepo}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        branchesLoading ? "Loading branches..." : "Select branch..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: { name: string }) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Commit Message */}
            <div className="space-y-2">
              <Label htmlFor="commit-msg">Commit Message</Label>
              <Textarea
                id="commit-msg"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                rows={2}
                placeholder="feat: Add component from Figma"
              />
            </div>

            {/* Pull Request Option */}
            {createNewBranch && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="create-pr"
                    checked={createPR}
                    onCheckedChange={(checked) => setCreatePR(!!checked)}
                  />
                  <Label
                    htmlFor="create-pr"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <GitPullRequest className="size-4" />
                    Create Pull Request
                  </Label>
                </div>
                {createPR && (
                  <div className="space-y-1">
                    <Label htmlFor="pr-title" className="text-xs">
                      PR Title
                    </Label>
                    <Input
                      id="pr-title"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      placeholder="Add component from Figma"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Files Preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {files.length} file(s) will be exported to{" "}
                <code className="text-xs">{componentName}/</code>
              </Label>
            </div>
          </div>
        )}

        {step === "exporting" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Exporting to GitHub...</p>
          </div>
        )}

        {step === "success" && exportResult && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-500/10">
                <Check className="size-6 text-green-500" />
              </div>
              <p className="font-medium">Export Complete!</p>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Repository</span>
                <a
                  href={exportResult.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  View
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Branch</span>
                <code className="text-xs">{exportResult.branchName}</code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Commit</span>
                <a
                  href={exportResult.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                >
                  {exportResult.commitSha.slice(0, 7)}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              {exportResult.pullRequest && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pull Request</span>
                  <a
                    href={exportResult.pullRequest.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    #{exportResult.pullRequest.number}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <p className="font-medium">Export Failed</p>
              <p className="text-center text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "configure" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={!canExport || exportToGitHub.isPending}
                data-testid="export-github-button"
              >
                <Github className="mr-2 size-4" />
                Export to GitHub
              </Button>
            </>
          )}

          {step === "success" && (
            <Button onClick={handleClose}>Done</Button>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
