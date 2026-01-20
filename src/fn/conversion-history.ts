import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findConversionHistoryById,
  findConversionHistoryByUserId,
  findConversionHistoryByFileKey,
  findConversionHistoryByNodeId,
  findConversionHistoryWithFilters,
  findFavoriteConversions,
  findConversionVersions,
  getNextVersionNumber,
  createConversionHistory,
  updateConversionHistory,
  deleteConversionHistory,
  toggleConversionFavorite,
  updateConversionNotes,
  updateConversionTags,
  getConversionStats,
  countConversionsForUser,
} from "~/data-access/conversion-history";
import { findProjectConfigurationById } from "~/data-access/project-configurations";
import type { ConversionHistory, CreateConversionHistoryData } from "~/db/schema";

// ============================================
// Validation Schemas
// ============================================

const conversionTypeSchema = z.enum([
  "code-generation",
  "image-export",
  "full-export",
  "preview",
]);

const conversionStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

const recordConversionSchema = z.object({
  figmaAccountId: z.string().optional(),
  fileKey: z.string().min(1),
  fileName: z.string().optional(),
  nodeId: z.string().min(1),
  nodeName: z.string().min(1),
  nodeType: z.string().optional(),
  conversionType: conversionTypeSchema,
  configurationId: z.string().uuid().optional(),
  jsFramework: z.string().optional(),
  cssFramework: z.string().optional(),
  outputCode: z.string().optional(),
  outputFormat: z.string().optional(),
  exportedAssetsCount: z.number().optional(),
  exportedAssetsJson: z.string().optional(),
  durationMs: z.number().optional(),
  status: conversionStatusSchema.optional().default("completed"),
  errorMessage: z.string().optional(),
  parentConversionId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const filtersSchema = z.object({
  conversionType: conversionTypeSchema.optional(),
  status: conversionStatusSchema.optional(),
  jsFramework: z.string().optional(),
  cssFramework: z.string().optional(),
  isFavorite: z.boolean().optional(),
  searchQuery: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// ============================================
// Server Functions
// ============================================

/**
 * Get all conversion history for the authenticated user
 */
export const getConversionHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      orderBy: z.enum(["newest", "oldest"]).optional().default("newest"),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory[]> => {
    const { userId } = context;
    return await findConversionHistoryByUserId(userId, {
      limit: data.limit,
      offset: data.offset,
      orderBy: data.orderBy,
    });
  });

/**
 * Get a single conversion history record by ID
 */
export const getConversionByIdFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;
    const { id } = data;

    const conversion = await findConversionHistoryById(id);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    return conversion;
  });

/**
 * Get conversion history by file key
 */
export const getConversionsByFileKeyFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ fileKey: z.string().min(1) }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory[]> => {
    const { userId } = context;
    return await findConversionHistoryByFileKey(userId, data.fileKey);
  });

/**
 * Get conversion history by node ID
 */
export const getConversionsByNodeIdFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      fileKey: z.string().min(1),
      nodeId: z.string().min(1),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory[]> => {
    const { userId } = context;
    return await findConversionHistoryByNodeId(userId, data.fileKey, data.nodeId);
  });

/**
 * Search and filter conversion history
 */
export const searchConversionHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(filtersSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory[]> => {
    const { userId } = context;
    return await findConversionHistoryWithFilters(userId, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  });

/**
 * Get favorite conversions
 */
export const getFavoriteConversionsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<ConversionHistory[]> => {
    const { userId } = context;
    return await findFavoriteConversions(userId);
  });

/**
 * Get all versions of a conversion (for comparison)
 */
export const getConversionVersionsFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ conversionId: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory[]> => {
    const { userId } = context;

    // Verify user owns the conversion
    const conversion = await findConversionHistoryById(data.conversionId);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    return await findConversionVersions(data.conversionId);
  });

/**
 * Record a new conversion
 */
export const recordConversionFn = createServerFn({ method: "POST" })
  .inputValidator(recordConversionSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;

    // Get configuration snapshot if configurationId is provided
    let configurationSnapshot: string | undefined;
    if (data.configurationId) {
      const config = await findProjectConfigurationById(data.configurationId);
      if (config && config.userId === userId) {
        configurationSnapshot = JSON.stringify({
          name: config.name,
          jsFramework: config.jsFramework,
          cssFramework: config.cssFramework,
          cssOptions: config.cssOptions,
          codeStyle: config.codeStyle,
          componentNaming: config.componentNaming,
          fileNaming: config.fileNaming,
          componentStructure: config.componentStructure,
          additionalOptions: config.additionalOptions,
        });
      }
    }

    // Calculate version if this is a re-run
    let version = 1;
    if (data.parentConversionId) {
      version = await getNextVersionNumber(data.parentConversionId);
    }

    // Calculate output code lines
    const outputCodeLines = data.outputCode
      ? data.outputCode.split("\n").length
      : undefined;

    const conversionData: CreateConversionHistoryData = {
      id: crypto.randomUUID(),
      userId,
      figmaAccountId: data.figmaAccountId || null,
      fileKey: data.fileKey,
      fileName: data.fileName || null,
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      nodeType: data.nodeType || null,
      conversionType: data.conversionType,
      configurationId: data.configurationId || null,
      configurationSnapshot: configurationSnapshot || null,
      jsFramework: data.jsFramework || null,
      cssFramework: data.cssFramework || null,
      outputCode: data.outputCode || null,
      outputCodeLines: outputCodeLines || null,
      outputFormat: data.outputFormat || null,
      exportedAssetsCount: data.exportedAssetsCount || null,
      exportedAssetsJson: data.exportedAssetsJson || null,
      durationMs: data.durationMs || null,
      status: data.status || "completed",
      errorMessage: data.errorMessage || null,
      version,
      parentConversionId: data.parentConversionId || null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      notes: data.notes || null,
      isFavorite: false,
      completedAt: data.status === "completed" ? new Date() : null,
    };

    return await createConversionHistory(conversionData);
  });

/**
 * Re-run a conversion with updated settings
 */
export const rerunConversionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      originalConversionId: z.string().uuid(),
      configurationId: z.string().uuid().optional(),
      jsFramework: z.string().optional(),
      cssFramework: z.string().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;

    // Get the original conversion
    const original = await findConversionHistoryById(data.originalConversionId);
    if (!original || original.userId !== userId) {
      throw new Error("Original conversion not found");
    }

    // Get the root parent ID
    const parentConversionId = original.parentConversionId || original.id;

    // Create a new conversion with updated settings
    // Note: The actual code generation should be triggered by the calling code
    // This just creates the history record
    const newConversionData: CreateConversionHistoryData = {
      id: crypto.randomUUID(),
      userId,
      figmaAccountId: original.figmaAccountId,
      fileKey: original.fileKey,
      fileName: original.fileName,
      nodeId: original.nodeId,
      nodeName: original.nodeName,
      nodeType: original.nodeType,
      conversionType: original.conversionType,
      configurationId: data.configurationId || original.configurationId,
      configurationSnapshot: null, // Will be set when actual conversion happens
      jsFramework: data.jsFramework || original.jsFramework,
      cssFramework: data.cssFramework || original.cssFramework,
      outputCode: null, // Will be set when actual conversion happens
      outputCodeLines: null,
      outputFormat: original.outputFormat,
      exportedAssetsCount: null,
      exportedAssetsJson: null,
      durationMs: null,
      status: "pending",
      errorMessage: null,
      version: await getNextVersionNumber(parentConversionId),
      parentConversionId,
      tags: original.tags,
      notes: null,
      isFavorite: false,
      completedAt: null,
    };

    return await createConversionHistory(newConversionData);
  });

/**
 * Toggle favorite status on a conversion
 */
export const toggleConversionFavoriteFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;

    // Verify ownership
    const conversion = await findConversionHistoryById(data.id);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    return await toggleConversionFavorite(data.id);
  });

/**
 * Update notes on a conversion
 */
export const updateConversionNotesFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      notes: z.string().max(5000),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;

    // Verify ownership
    const conversion = await findConversionHistoryById(data.id);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    return await updateConversionNotes(data.id, data.notes);
  });

/**
 * Update tags on a conversion
 */
export const updateConversionTagsFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      tags: z.array(z.string().max(50)).max(10),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ConversionHistory> => {
    const { userId } = context;

    // Verify ownership
    const conversion = await findConversionHistoryById(data.id);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    return await updateConversionTags(data.id, data.tags);
  });

/**
 * Delete a conversion
 */
export const deleteConversionFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<void> => {
    const { userId } = context;

    // Verify ownership
    const conversion = await findConversionHistoryById(data.id);
    if (!conversion || conversion.userId !== userId) {
      throw new Error("Conversion not found");
    }

    await deleteConversionHistory(data.id);
  });

/**
 * Get conversion statistics for the user
 */
export const getConversionStatsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(
    async ({
      context,
    }): Promise<{
      total: number;
      byType: Record<string, number>;
      byFramework: Record<string, number>;
      byStatus: Record<string, number>;
      favorites: number;
      thisWeek: number;
      thisMonth: number;
    }> => {
      const { userId } = context;
      return await getConversionStats(userId);
    }
  );

/**
 * Get the total count of conversions for pagination
 */
export const getConversionCountFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<number> => {
    const { userId } = context;
    return await countConversionsForUser(userId);
  });

// Type for comparison diff
export interface ConversionComparisonDiff {
  settingsChanged: boolean;
  codeChanged: boolean;
  frameworkChanged: boolean;
  settings1: Record<string, unknown> | null;
  settings2: Record<string, unknown> | null;
}

// Type for comparison result
export interface ConversionComparisonResult {
  conversion1: ConversionHistory;
  conversion2: ConversionHistory;
  diff: ConversionComparisonDiff;
}

/**
 * Compare two conversion versions - helper function
 */
async function performComparison(
  userId: string,
  conversionId1: string,
  conversionId2: string
): Promise<ConversionComparisonResult> {
  const [conv1, conv2] = await Promise.all([
    findConversionHistoryById(conversionId1),
    findConversionHistoryById(conversionId2),
  ]);

  if (!conv1 || conv1.userId !== userId) {
    throw new Error("First conversion not found");
  }
  if (!conv2 || conv2.userId !== userId) {
    throw new Error("Second conversion not found");
  }

  // Parse configuration snapshots
  const settings1 = conv1.configurationSnapshot
    ? (JSON.parse(conv1.configurationSnapshot) as Record<string, unknown>)
    : null;
  const settings2 = conv2.configurationSnapshot
    ? (JSON.parse(conv2.configurationSnapshot) as Record<string, unknown>)
    : null;

  const settingsChanged =
    JSON.stringify(settings1) !== JSON.stringify(settings2);
  const codeChanged = conv1.outputCode !== conv2.outputCode;
  const frameworkChanged =
    conv1.jsFramework !== conv2.jsFramework ||
    conv1.cssFramework !== conv2.cssFramework;

  return {
    conversion1: conv1,
    conversion2: conv2,
    diff: {
      settingsChanged,
      codeChanged,
      frameworkChanged,
      settings1,
      settings2,
    },
  };
}

const compareInputSchema = z.object({
  conversionId1: z.string().uuid(),
  conversionId2: z.string().uuid(),
});

/**
 * Compare two conversion versions
 */
export const compareConversionsFn = createServerFn({ method: "GET" })
  .inputValidator(compareInputSchema)
  .middleware([authenticatedMiddleware])
  // @ts-expect-error - TanStack Start type inference issue with complex return types
  .handler(async ({ data, context }) => {
    const { userId } = context;
    return performComparison(userId, data.conversionId1, data.conversionId2);
  });
