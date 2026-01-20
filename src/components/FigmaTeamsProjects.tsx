import { useState } from "react";
import {
  useFigmaTeamsAndProjects,
  useFigmaAccounts,
  useRefreshFigmaCache,
  useAddFigmaTeam,
} from "~/hooks/useFigma";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  RefreshCw,
  Users,
  Folder,
  FileText,
  Plus,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { FigmaProject, FigmaPermissionLevel } from "~/db/schema";
import type { FigmaTeamWithProjects } from "~/data-access/figma-accounts";

// ============================================
// Permission Badge Component
// ============================================

function PermissionBadge({ level }: { level: FigmaPermissionLevel | string | null }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    owner: "default",
    admin: "default",
    member: "secondary",
    viewer: "outline",
  };

  return (
    <Badge variant={variants[level || "viewer"] || "outline"} className="text-xs">
      {level || "viewer"}
    </Badge>
  );
}

// ============================================
// Project Card Component
// ============================================

function ProjectCard({ project }: { project: FigmaProject }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Folder className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{project.name}</p>
          <p className="text-xs text-muted-foreground">
            {project.fileCount !== null ? project.fileCount + " files" : "Loading..."}
          </p>
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        {project.projectType || "team"}
      </Badge>
    </div>
  );
}

// ============================================
// Team Card Component
// ============================================

function TeamCard({ team }: { team: FigmaTeamWithProjects }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{team.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {team.memberCount !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {team.memberCount} members
                  </span>
                )}
                {team.memberCount !== null && team.projects.length > 0 && (
                  <span className="mx-2">•</span>
                )}
                {team.projects.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {team.projects.length} projects
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <PermissionBadge level={team.permissionLevel} />
        </div>
      </CardHeader>
      {team.projects.length > 0 && (
        <CardContent className="pt-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{isExpanded ? "Hide" : "Show"} projects</span>
            <ChevronRight
              className={"h-4 w-4 transition-transform " + (isExpanded ? "rotate-90" : "")}
            />
          </button>
          {isExpanded && (
            <div className="space-y-2 mt-2">
              {team.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================
// Add Team Dialog Component
// ============================================

function AddTeamDialog({
  accountId,
  onSuccess,
}: {
  accountId: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState("");
  const addTeam = useAddFigmaTeam();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId.trim()) return;

    addTeam.mutate(
      { accountId, teamId: teamId.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          setTeamId("");
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Figma Team</DialogTitle>
          <DialogDescription>
            Enter the Team ID from your Figma URL. You can find this in your team's URL:
            figma.com/files/team/<strong>TEAM_ID</strong>/...
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                placeholder="Enter team ID (e.g., 1234567890)"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={addTeam.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addTeam.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!teamId.trim() || addTeam.isPending}>
              {addTeam.isPending ? "Adding..." : "Add Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ accountId }: { accountId: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Folder className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No teams added yet</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Add your Figma teams to view and manage your projects. You'll need the team ID from your Figma URL.
        </p>
        <div className="mt-6">
          <AddTeamDialog accountId={accountId} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Loading State Component
// ============================================

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Failed to load teams</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          {error.message}
        </p>
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// No Account Connected State
// ============================================

function NoAccountState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No Figma account connected</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Connect your Figma account to view and manage your teams and projects.
        </p>
        <Button className="mt-6">
          Connect Figma Account
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function FigmaTeamsProjects() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  
  const { data: accounts, isLoading: accountsLoading } = useFigmaAccounts();
  const {
    data: teamsData,
    isLoading: teamsLoading,
    error: teamsError,
    refetch,
  } = useFigmaTeamsAndProjects(selectedAccountId);
  const refreshCache = useRefreshFigmaCache();

  const isLoading = accountsLoading || teamsLoading;
  const currentAccountId = selectedAccountId || teamsData?.account?.id;

  // Handle refresh
  const handleRefresh = () => {
    if (currentAccountId) {
      refreshCache.mutate(currentAccountId);
    }
  };

  // No accounts connected
  if (!accountsLoading && (!accounts || accounts.length === 0)) {
    return <NoAccountState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams & Projects</h2>
          <p className="text-muted-foreground">
            View and manage your Figma teams and projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts && accounts.length > 1 && (
            <Select
              value={selectedAccountId || accounts[0]?.id}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.label || account.figmaEmail}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshCache.isPending || !currentAccountId}
          >
            <RefreshCw
              className={"h-4 w-4 mr-2 " + (refreshCache.isPending ? "animate-spin" : "")}
            />
            Refresh
          </Button>
          {currentAccountId && <AddTeamDialog accountId={currentAccountId} />}
        </div>
      </div>

      {/* Cache Status */}
      {teamsData?.cacheStatus && teamsData.cacheStatus !== "fresh" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          {teamsData.cacheStatus === "stale"
            ? "Some data may be outdated. Click refresh to update."
            : "Data was just refreshed."}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : teamsError ? (
        <ErrorState error={teamsError as Error} onRetry={() => refetch()} />
      ) : teamsData?.teams.length === 0 && teamsData?.personalProjects.length === 0 ? (
        currentAccountId && <EmptyState accountId={currentAccountId} />
      ) : (
        <div className="space-y-6">
          {/* Teams */}
          {teamsData && teamsData.teams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Teams</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamsData.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </div>
          )}

          {/* Personal Projects */}
          {teamsData && teamsData.personalProjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Projects</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teamsData.personalProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
