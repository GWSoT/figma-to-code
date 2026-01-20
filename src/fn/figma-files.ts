import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findFigmaAccountById,
  findDefaultFigmaAccount,
  findFigmaAccountsByUserId,
  updateFigmaAccountLastUsed,
} from "~/data-access/figma-accounts";
import {
  findFigmaFileById,
  findFigmaFilesByProjectId,
  findFigmaFileWithPages,
  findFramesByCategory,
  getFrameCategoryCounts,
  upsertFigmaFile,
  upsertFigmaPage,
  upsertFigmaFrame,
  deleteFigmaFramesByFileId,
  deleteFigmaPagesByFileId,
  type FigmaFileWithPages,
  type FramesByCategoryResult,
} from "~/data-access/figma-files";
import { updateFigmaAccount } from "~/data-access/figma-accounts";
import {
  FigmaApiClient,
  categorizeFrame,
  findMatchingDevice,
  type FigmaPage,
  type FigmaNode,
} from "~/utils/figma-api";
import type { FigmaAccount, FigmaFrameCategory, FigmaFrameRecord } from "~/db/schema";

// ============================================
// Types for API responses
// ============================================

export interface FileFramesResponse {
  file: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    lastModified: Date | null;
  };
  pages: Array<{
    id: string;
    name: string;
    frameCount: number;
    frames: FigmaFrameRecord[];
  }>;
  categoryCounts: Record<FigmaFrameCategory, number>;
  cacheStatus: "fresh" | "stale" | "refreshed";
}

export interface FrameSelectionResult {
  selectedFrames: FigmaFrameRecord[];
  totalCount: number;
}

// ============================================
// Helper: Get access token with refresh
// ============================================

async function getValidAccessToken(account: FigmaAccount): Promise<string> {
  let accessToken = account.accessToken;

  if (new Date() >= account.accessTokenExpiresAt) {
    const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
    accessToken = refreshed.accessToken;

    await updateFigmaAccount(account.id, {
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
  }

  return accessToken;
}

// ============================================
// Get File with Pages and Frames
// ============================================

export const getFileFramesFn = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      fileKey: z.string().min(1),
      accountId: z.string().optional(),
      forceRefresh: z.boolean().optional().default(false),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<FileFramesResponse> => {
    // Get the account
    let account: FigmaAccount | null;

    if (data.accountId) {
      account = await findFigmaAccountById(data.accountId);
      if (!account || account.userId !== context.userId) {
        throw new Error("Figma account not found or unauthorized");
      }
    } else {
      account = await findDefaultFigmaAccount(context.userId);
      if (!account) {
        const accounts = await findFigmaAccountsByUserId(context.userId);
        account = accounts[0] || null;
      }
    }

    if (!account) {
      throw new Error("No Figma account connected. Please connect your Figma account first.");
    }

    // Check cache first
    const cachedFile = await findFigmaFileWithPages(data.fileKey);
    const needsRefresh =
      data.forceRefresh || !cachedFile || !cachedFile.pages.length;

    let cacheStatus: "fresh" | "stale" | "refreshed" = "fresh";

    if (needsRefresh) {
      try {
        const accessToken = await getValidAccessToken(account);
        const client = new FigmaApiClient(accessToken);

        // Fetch file from Figma API (depth=2 gets pages and their children)
        const fileData = await client.getFile(data.fileKey, 2);

        // Upsert the file
        const file = await upsertFigmaFile({
          id: data.fileKey,
          figmaAccountId: account.id,
          name: fileData.name,
          thumbnailUrl: fileData.thumbnailUrl,
          lastModified: new Date(fileData.lastModified),
          version: fileData.version,
        });

        // Clear existing pages and frames for this file
        await deleteFigmaFramesByFileId(data.fileKey);
        await deleteFigmaPagesByFileId(data.fileKey);

        // Process pages and frames
        for (const pageNode of fileData.document.children) {
          if (pageNode.type !== "CANVAS") continue;

          const frames: FigmaNode[] = [];

          // Collect top-level frames
          if (pageNode.children) {
            for (const child of pageNode.children) {
              if (
                child.type === "FRAME" ||
                child.type === "COMPONENT" ||
                child.type === "COMPONENT_SET"
              ) {
                frames.push(child);
              }
            }
          }

          // Upsert page
          await upsertFigmaPage({
            id: pageNode.id,
            fileId: data.fileKey,
            name: pageNode.name,
            frameCount: frames.length,
          });

          // Upsert frames
          for (const frame of frames) {
            const bbox = frame.absoluteBoundingBox;
            if (!bbox) continue;

            const category = categorizeFrame(frame, true);
            const matchedDevice = findMatchingDevice(bbox.width, bbox.height);

            await upsertFigmaFrame({
              id: frame.id,
              pageId: pageNode.id,
              fileId: data.fileKey,
              name: frame.name,
              width: Math.round(bbox.width),
              height: Math.round(bbox.height),
              category,
              matchedDevice: matchedDevice || null,
            });
          }
        }

        await updateFigmaAccountLastUsed(account.id);
        cacheStatus = "refreshed";
      } catch (error) {
        console.error("Failed to refresh file data:", error);
        if (!cachedFile) {
          throw error;
        }
        cacheStatus = "stale";
      }
    }

    // Get updated cached data
    const fileWithPages = await findFigmaFileWithPages(data.fileKey);

    if (!fileWithPages) {
      throw new Error("Failed to load file data");
    }

    const categoryCounts = await getFrameCategoryCounts(data.fileKey);

    return {
      file: {
        id: fileWithPages.id,
        name: fileWithPages.name,
        thumbnailUrl: fileWithPages.thumbnailUrl,
        lastModified: fileWithPages.lastModified,
      },
      pages: fileWithPages.pages.map((page) => ({
        id: page.id,
        name: page.name,
        frameCount: page.frameCount || 0,
        frames: page.frames,
      })),
      categoryCounts,
      cacheStatus,
    };
  });

// ============================================
// Get Frames by Category
// ============================================

export const getFramesByCategoryFn = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      fileKey: z.string().min(1),
      category: z.enum(["screen", "component", "asset", "unknown"]).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }): Promise<FramesByCategoryResult> => {
    return await findFramesByCategory(data.fileKey);
  });

// ============================================
// Get Project Files
// ============================================

export const getProjectFilesFn = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      projectId: z.string().min(1),
      accountId: z.string().optional(),
      forceRefresh: z.boolean().optional().default(false),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    // Get the account
    let account: FigmaAccount | null;

    if (data.accountId) {
      account = await findFigmaAccountById(data.accountId);
      if (!account || account.userId !== context.userId) {
        throw new Error("Figma account not found or unauthorized");
      }
    } else {
      account = await findDefaultFigmaAccount(context.userId);
      if (!account) {
        const accounts = await findFigmaAccountsByUserId(context.userId);
        account = accounts[0] || null;
      }
    }

    if (!account) {
      throw new Error("No Figma account connected");
    }

    // Check cache first
    const cachedFiles = await findFigmaFilesByProjectId(data.projectId);

    if (!data.forceRefresh && cachedFiles.length > 0) {
      return {
        files: cachedFiles,
        cacheStatus: "fresh" as const,
      };
    }

    try {
      const accessToken = await getValidAccessToken(account);
      const client = new FigmaApiClient(accessToken);

      const filesResponse = await client.getProjectFiles(data.projectId);

      const files = [];
      for (const file of filesResponse.files) {
        const upserted = await upsertFigmaFile({
          id: file.key,
          figmaAccountId: account.id,
          projectId: data.projectId,
          name: file.name,
          thumbnailUrl: file.thumbnail_url,
          lastModified: new Date(file.last_modified),
        });
        files.push(upserted);
      }

      await updateFigmaAccountLastUsed(account.id);

      return {
        files,
        cacheStatus: "refreshed" as const,
      };
    } catch (error) {
      console.error("Failed to fetch project files:", error);
      if (cachedFiles.length > 0) {
        return {
          files: cachedFiles,
          cacheStatus: "stale" as const,
        };
      }
      throw error;
    }
  });
