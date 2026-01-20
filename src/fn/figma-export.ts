import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findFigmaAccountById,
  findDefaultFigmaAccount,
  findFigmaAccountsByUserId,
  updateFigmaAccount,
} from "~/data-access/figma-accounts";
import {
  createFigmaExport,
  createFigmaExportSet,
  findFigmaExportsByNodeId,
  updateFigmaExportStatus,
  updateFigmaExportSet,
  findFigmaExportSetWithExports,
} from "~/data-access/figma-exports";
import { findFigmaFrameById } from "~/data-access/figma-files";
import { FigmaApiClient, type FigmaImageFormat } from "~/utils/figma-api";
import {
  downloadImage,
  processImage,
  FORMAT_MIME_TYPES,
} from "~/utils/image-processing";
import { getStorage } from "~/utils/storage";
import { generateSrcsetMarkup, type SrcsetEntry } from "~/utils/srcset";
import type {
  FigmaExportFormat,
  FigmaExport,
  FigmaExportSet,
} from "~/db/schema";

// ============================================
// Types
// ============================================

export interface ExportResult {
  exportId: string;
  storageKey: string;
  format: FigmaExportFormat;
  scale: number;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface ExportSetResult {
  exportSetId: string;
  nodeName: string;
  format: FigmaExportFormat;
  exports: ExportResult[];
  srcsetMarkup?: string;
}

// ============================================
// Helper: Get valid Figma access token
// ============================================

async function getValidFigmaToken(
  accountId: string,
  userId: string
): Promise<{ accessToken: string; account: Awaited<ReturnType<typeof findFigmaAccountById>> }> {
  const account = await findFigmaAccountById(accountId);

  if (!account || account.userId !== userId) {
    throw new Error("Figma account not found or unauthorized");
  }

  let accessToken = account.accessToken;

  // Refresh token if expired
  if (new Date() >= account.accessTokenExpiresAt) {
    const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
    accessToken = refreshed.accessToken;

    await updateFigmaAccount(account.id, {
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    });
  }

  return { accessToken, account };
}

// ============================================
// Export Single Image
// ============================================

export const exportFigmaImageFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      accountId: z.string().optional(),
      fileKey: z.string(),
      nodeId: z.string(),
      nodeName: z.string(),
      format: z.enum(["png", "jpg", "webp"]),
      scale: z.number().min(1).max(4).default(1),
      quality: z.number().min(1).max(100).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ExportResult> => {
    const userId = context!.userId;

    // Get account
    let accountId = data.accountId;
    if (!accountId) {
      const defaultAccount = await findDefaultFigmaAccount(userId);
      if (!defaultAccount) {
        const accounts = await findFigmaAccountsByUserId(userId);
        if (accounts.length === 0) {
          throw new Error("No Figma account connected");
        }
        accountId = accounts[0].id;
      } else {
        accountId = defaultAccount.id;
      }
    }

    const { accessToken, account } = await getValidFigmaToken(accountId, userId);

    // Create export record
    const exportId = crypto.randomUUID();
    const storageKey = `figma-exports/${userId}/${data.fileKey}/${data.nodeId}/${data.scale}x.${data.format}`;

    const exportRecord = await createFigmaExport({
      id: exportId,
      userId,
      figmaAccountId: account!.id,
      fileKey: data.fileKey,
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      format: data.format,
      scale: data.scale,
      quality: data.quality,
      width: 0, // Will be updated after processing
      height: 0,
      storageKey,
      status: "processing",
    });

    try {
      // Get image from Figma API
      const figmaClient = new FigmaApiClient(accessToken);
      const figmaFormat: FigmaImageFormat = data.format === "jpg" ? "jpg" : "png";

      const imagesResponse = await figmaClient.getImages(data.fileKey, {
        ids: [data.nodeId],
        format: figmaFormat,
        scale: data.scale,
      });

      const imageUrl = imagesResponse.images[data.nodeId];
      if (!imageUrl) {
        throw new Error("Failed to export image from Figma");
      }

      // Download and process image
      const imageBuffer = await downloadImage(imageUrl);
      const processed = await processImage(imageBuffer, {
        format: data.format,
        quality: data.quality,
      });

      // Upload to R2
      const { storage } = getStorage();
      await storage.upload(storageKey, processed.buffer, processed.mimeType);

      // Update export record with final data
      await updateFigmaExportStatus(exportId, "completed");
      const updatedExport = await findFigmaExportsByNodeId(data.nodeId, userId);
      const finalExport = updatedExport.find((e) => e.id === exportId);

      if (finalExport) {
        // Update dimensions and size
        await updateFigmaExportStatus(exportId, "completed");
      }

      return {
        exportId,
        storageKey,
        format: data.format,
        scale: data.scale,
        width: processed.width,
        height: processed.height,
        sizeBytes: processed.sizeBytes,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateFigmaExportStatus(exportId, "failed", errorMessage);
      throw error;
    }
  });

// ============================================
// Export Multiple Resolutions (for srcset)
// ============================================

export const exportFigmaImageSetFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      accountId: z.string().optional(),
      fileKey: z.string(),
      nodeId: z.string(),
      nodeName: z.string(),
      format: z.enum(["png", "jpg", "webp"]),
      scales: z.array(z.number().min(1).max(4)).default([1, 2, 3]),
      quality: z.number().min(1).max(100).optional(),
      generateSrcset: z.boolean().default(true),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ExportSetResult> => {
    const userId = context!.userId;

    // Get account
    let accountId = data.accountId;
    if (!accountId) {
      const defaultAccount = await findDefaultFigmaAccount(userId);
      if (!defaultAccount) {
        const accounts = await findFigmaAccountsByUserId(userId);
        if (accounts.length === 0) {
          throw new Error("No Figma account connected");
        }
        accountId = accounts[0].id;
      } else {
        accountId = defaultAccount.id;
      }
    }

    const { accessToken, account } = await getValidFigmaToken(accountId, userId);

    // Create export set record
    const exportSetId = crypto.randomUUID();
    const exportSet = await createFigmaExportSet({
      id: exportSetId,
      userId,
      figmaAccountId: account!.id,
      fileKey: data.fileKey,
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      format: data.format,
      includesSrcset: data.generateSrcset,
      status: "processing",
    });

    try {
      // Get images at all scales from Figma API
      const figmaClient = new FigmaApiClient(accessToken);
      const figmaFormat: FigmaImageFormat = data.format === "jpg" ? "jpg" : "png";

      const scaleImages = await figmaClient.getImagesAtScales(
        data.fileKey,
        [data.nodeId],
        figmaFormat,
        data.scales
      );

      const exports: ExportResult[] = [];
      const srcsetEntries: SrcsetEntry[] = [];
      const { storage } = getStorage();

      // Process each scale
      for (const scale of data.scales) {
        const scaleResult = scaleImages.get(scale);
        const imageUrl = scaleResult?.[data.nodeId];

        if (!imageUrl) {
          console.warn(`Failed to get image at scale ${scale}x`);
          continue;
        }

        const exportId = crypto.randomUUID();
        const storageKey = `figma-exports/${userId}/${data.fileKey}/${data.nodeId}/${scale}x.${data.format}`;

        // Create export record
        await createFigmaExport({
          id: exportId,
          userId,
          figmaAccountId: account!.id,
          fileKey: data.fileKey,
          nodeId: data.nodeId,
          nodeName: data.nodeName,
          format: data.format,
          scale,
          quality: data.quality,
          width: 0,
          height: 0,
          storageKey,
          status: "processing",
        });

        try {
          // Download and process
          const imageBuffer = await downloadImage(imageUrl);
          const processed = await processImage(imageBuffer, {
            format: data.format,
            quality: data.quality,
          });

          // Upload to R2
          await storage.upload(storageKey, processed.buffer, processed.mimeType);

          // Update status
          await updateFigmaExportStatus(exportId, "completed");

          const exportResult: ExportResult = {
            exportId,
            storageKey,
            format: data.format,
            scale,
            width: processed.width,
            height: processed.height,
            sizeBytes: processed.sizeBytes,
          };

          exports.push(exportResult);

          // Add to srcset entries
          srcsetEntries.push({
            url: storageKey, // Will be replaced with presigned URL on client
            width: processed.width,
            scale,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          await updateFigmaExportStatus(exportId, "failed", errorMessage);
        }
      }

      // Generate srcset markup if requested
      let srcsetMarkup: string | undefined;
      if (data.generateSrcset && srcsetEntries.length > 0) {
        srcsetMarkup = generateSrcsetMarkup(srcsetEntries);
      }

      // Update export set
      await updateFigmaExportSet(exportSetId, {
        status: "completed",
        srcsetMarkup,
      });

      return {
        exportSetId,
        nodeName: data.nodeName,
        format: data.format,
        exports,
        srcsetMarkup,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateFigmaExportSet(exportSetId, {
        status: "failed",
      });
      throw error;
    }
  });

// ============================================
// Get Export Download URL
// ============================================

export const getFigmaExportUrlFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      storageKey: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }): Promise<{ downloadUrl: string }> => {
    const { storage } = getStorage();
    const downloadUrl = await storage.getPresignedUrl(data.storageKey);
    return { downloadUrl };
  });

// ============================================
// Get Multiple Export Download URLs
// ============================================

export const getFigmaExportUrlsFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      storageKeys: z.array(z.string()),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }): Promise<{ urls: Record<string, string> }> => {
    const { storage } = getStorage();
    const urls: Record<string, string> = {};

    await Promise.all(
      data.storageKeys.map(async (key) => {
        urls[key] = await storage.getPresignedUrl(key);
      })
    );

    return { urls };
  });

// ============================================
// Get Export Set with URLs
// ============================================

export const getFigmaExportSetWithUrlsFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      exportSetId: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const exportSet = await findFigmaExportSetWithExports(data.exportSetId);

    if (!exportSet || exportSet.userId !== context!.userId) {
      throw new Error("Export set not found or unauthorized");
    }

    const { storage } = getStorage();

    // Get download URLs for all exports
    const exportsWithUrls = await Promise.all(
      exportSet.exports.map(async (exp) => ({
        ...exp,
        downloadUrl: await storage.getPresignedUrl(exp.storageKey),
      }))
    );

    // Generate srcset with actual URLs
    const srcsetEntries: SrcsetEntry[] = exportsWithUrls.map((exp) => ({
      url: exp.downloadUrl!,
      width: exp.width,
      scale: exp.scale,
    }));

    const srcsetMarkup = generateSrcsetMarkup(srcsetEntries);

    return {
      ...exportSet,
      exports: exportsWithUrls,
      srcsetMarkup,
    };
  });

// ============================================
// Get User's Export History
// ============================================

export const getFigmaExportHistoryFn = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    // This would require a more complex query - simplified for now
    // In production, you'd want pagination and filtering
    return { exports: [] };
  });
