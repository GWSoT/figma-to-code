import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FrameExplorer } from "~/components/FrameExplorer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FileSearch, ArrowRight } from "lucide-react";

interface FramesSearchParams {
  fileKey?: string;
  accountId?: string;
}

export const Route = createFileRoute("/dashboard/frames")({
  validateSearch: (search: Record<string, unknown>): FramesSearchParams => {
    return {
      fileKey: (search.fileKey as string) || "",
      accountId: (search.accountId as string) || undefined,
    };
  },
  component: FramesPage,
});

function FramesPage() {
  const search = Route.useSearch() as FramesSearchParams;
  const fileKey = search.fileKey || "";
  const accountId = search.accountId;
  const navigate = Route.useNavigate();
  const [inputFileKey, setInputFileKey] = useState(fileKey || "");

  const handleExplore = () => {
    if (inputFileKey.trim()) {
      // Extract file key from Figma URL if a full URL is provided
      const extractedKey = extractFileKeyFromUrl(inputFileKey.trim());
      navigate({
        search: { fileKey: extractedKey, accountId } as FramesSearchParams,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExplore();
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* File Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Explore Figma File
          </CardTitle>
          <CardDescription>
            Enter a Figma file key or URL to explore its frames. You can find the file key in
            the Figma URL: figma.com/design/<strong>FILE_KEY</strong>/...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter file key or Figma URL..."
              value={inputFileKey}
              onChange={(e) => setInputFileKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleExplore} disabled={!inputFileKey.trim()}>
              Explore
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example URL: https://www.figma.com/design/abc123xyz/MyFile
          </p>
        </CardContent>
      </Card>

      {/* Frame Explorer */}
      {fileKey ? (
        <FrameExplorer fileKey={fileKey} accountId={accountId} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileSearch className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No file selected</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              Enter a Figma file key or URL above to explore its pages and frames.
              Frames will be automatically categorized as screens, components, or assets
              based on their dimensions.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm font-medium">What you can do:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all top-level frames in a file</li>
                <li>• Filter by category (screens, components, assets)</li>
                <li>• See which frames match common device sizes</li>
                <li>• Select frames individually or in bulk</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Extracts the file key from a Figma URL or returns the input if it's already a file key
 */
function extractFileKeyFromUrl(input: string): string {
  // If it doesn't look like a URL, assume it's already a file key
  if (!input.includes("figma.com")) {
    return input;
  }

  // Try to extract from different Figma URL formats
  // Format 1: https://www.figma.com/design/FILE_KEY/...
  // Format 2: https://www.figma.com/file/FILE_KEY/...
  // Format 3: https://figma.com/design/FILE_KEY/...
  const patterns = [
    /figma\.com\/design\/([^/?]+)/,
    /figma\.com\/file\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matches, return the original input
  return input;
}
