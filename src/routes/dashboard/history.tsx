import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "~/components/Page";
import { AppBreadcrumb } from "~/components/AppBreadcrumb";
import { ConversionHistoryList } from "~/components/ConversionHistoryList";
import { useConversionStats, useCompareConversions } from "~/hooks/useConversionHistory";
import { assertAuthenticatedFn } from "~/fn/guards";
import { Home, History, TrendingUp, Star, Clock, CheckCircle2 } from "lucide-react";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  PanelDescription,
} from "~/components/ui/panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { ConversionHistory } from "~/db/schema";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
  beforeLoad: async () => {
    await assertAuthenticatedFn();
  },
});

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}

function ConversionStats() {
  const { data: stats, isLoading } = useConversionStats();

  if (isLoading || !stats) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistics
          </PanelTitle>
        </PanelHeader>
        <PanelContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </PanelContent>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistics
        </PanelTitle>
        <PanelDescription>
          Overview of your conversion activity
        </PanelDescription>
      </PanelHeader>
      <PanelContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Conversions"
            value={stats.total}
            icon={History}
          />
          <StatsCard
            title="This Week"
            value={stats.thisWeek}
            icon={Clock}
            description={`${stats.thisMonth} this month`}
          />
          <StatsCard
            title="Favorites"
            value={stats.favorites}
            icon={Star}
          />
          <StatsCard
            title="Completed"
            value={stats.byStatus.completed || 0}
            icon={CheckCircle2}
          />
        </div>

        {/* Framework breakdown */}
        {Object.keys(stats.byFramework).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">By Framework</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byFramework).map(([framework, count]) => (
                <Badge key={framework} variant="secondary">
                  {framework}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Type breakdown */}
        {Object.keys(stats.byType).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">By Type</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <Badge key={type} variant="outline">
                  {type.replace("-", " ")}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}

function CodeComparisonDialog({
  conversion1,
  conversion2,
  open,
  onOpenChange,
}: {
  conversion1: ConversionHistory | null;
  conversion2: ConversionHistory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: comparison, isLoading } = useCompareConversions(
    conversion1?.id || "",
    conversion2?.id || ""
  );

  if (!conversion1 || !conversion2) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
          <DialogDescription>
            Comparing version {conversion1.version} with version{" "}
            {conversion2.version}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : comparison ? (
          <div className="flex-1 overflow-hidden">
            {/* Summary */}
            <div className="flex gap-2 mb-4">
              {comparison.diff.settingsChanged && (
                <Badge variant="secondary">Settings Changed</Badge>
              )}
              {comparison.diff.frameworkChanged && (
                <Badge variant="secondary">Framework Changed</Badge>
              )}
              {comparison.diff.codeChanged && (
                <Badge variant="secondary">Code Changed</Badge>
              )}
              {!comparison.diff.settingsChanged &&
                !comparison.diff.frameworkChanged &&
                !comparison.diff.codeChanged && (
                  <Badge variant="outline">No Changes</Badge>
                )}
            </div>

            <Tabs defaultValue="code" className="flex-1">
              <TabsList>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-4 overflow-auto max-h-[50vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Version {conversion1.version}
                    </p>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                      {conversion1.outputCode || "No code available"}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Version {conversion2.version}
                    </p>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                      {conversion2.outputCode || "No code available"}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Version {conversion1.version} Settings
                    </p>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                      {comparison.diff.settings1
                        ? JSON.stringify(comparison.diff.settings1, null, 2)
                        : "No settings snapshot"}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Version {conversion2.version} Settings
                    </p>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                      {comparison.diff.settings2
                        ? JSON.stringify(comparison.diff.settings2, null, 2)
                        : "No settings snapshot"}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CodeViewDialog({
  conversion,
  open,
  onOpenChange,
}: {
  conversion: ConversionHistory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!conversion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{conversion.nodeName}</DialogTitle>
          <DialogDescription>
            Generated code from {conversion.jsFramework || "unknown"} with{" "}
            {conversion.cssFramework || "unknown"}
            {conversion.outputCodeLines && (
              <span className="ml-2">({conversion.outputCodeLines} lines)</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
            {conversion.outputCode || "No code available"}
          </pre>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (conversion.outputCode) {
                navigator.clipboard.writeText(conversion.outputCode);
              }
            }}
          >
            Copy to Clipboard
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryPage() {
  const navigate = useNavigate();
  const [viewCodeConversion, setViewCodeConversion] =
    useState<ConversionHistory | null>(null);
  const [compareConversions, setCompareConversions] = useState<{
    conv1: ConversionHistory | null;
    conv2: ConversionHistory | null;
  }>({ conv1: null, conv2: null });

  const handleViewCode = (conversion: ConversionHistory) => {
    setViewCodeConversion(conversion);
  };

  const handleRerun = (conversion: ConversionHistory) => {
    // Navigate to preview with the conversion details
    // Note: Full re-run support would require extending the preview page's search params
    navigate({
      to: "/dashboard/preview",
      search: {
        fileKey: conversion.fileKey,
        nodeId: conversion.nodeId,
      },
    });
  };

  const handleCompare = (
    conversion1: ConversionHistory,
    conversion2: ConversionHistory
  ) => {
    setCompareConversions({ conv1: conversion1, conv2: conversion2 });
  };

  return (
    <Page>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard", icon: Home },
          { label: "History", icon: History },
        ]}
      />

      <div className="mt-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Conversion History</h1>
          <p className="text-muted-foreground mt-2">
            View all your past design-to-code conversions. Re-run with different
            settings or compare versions.
          </p>
        </div>

        <div className="space-y-6">
          <ConversionStats />
          <ConversionHistoryList
            onViewCode={handleViewCode}
            onRerun={handleRerun}
            onCompare={handleCompare}
          />
        </div>
      </div>

      {/* Code View Dialog */}
      <CodeViewDialog
        conversion={viewCodeConversion}
        open={!!viewCodeConversion}
        onOpenChange={(open) => !open && setViewCodeConversion(null)}
      />

      {/* Comparison Dialog */}
      <CodeComparisonDialog
        conversion1={compareConversions.conv1}
        conversion2={compareConversions.conv2}
        open={!!compareConversions.conv1 && !!compareConversions.conv2}
        onOpenChange={(open) =>
          !open && setCompareConversions({ conv1: null, conv2: null })
        }
      />
    </Page>
  );
}
