import { eq, and, desc, gte, lte, like, or, sql } from "drizzle-orm";
import { database } from "~/db";
import {
  conversionHistory,
  type ConversionHistory,
  type CreateConversionHistoryData,
  type UpdateConversionHistoryData,
  type ConversionType,
  type ConversionStatus,
} from "~/db/schema";

// ============================================
// Conversion History Data Access
// ============================================

/**
 * Find a conversion history record by ID
 */
export async function findConversionHistoryById(
  id: string
): Promise<ConversionHistory | null> {
  const [result] = await database
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find all conversion history records for a user
 */
export async function findConversionHistoryByUserId(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: "newest" | "oldest";
  } = {}
): Promise<ConversionHistory[]> {
  const { limit = 50, offset = 0, orderBy = "newest" } = options;

  return await database
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.userId, userId))
    .orderBy(orderBy === "newest" ? desc(conversionHistory.createdAt) : conversionHistory.createdAt)
    .limit(limit)
    .offset(offset);
}

/**
 * Find conversion history by file key
 */
export async function findConversionHistoryByFileKey(
  userId: string,
  fileKey: string
): Promise<ConversionHistory[]> {
  return await database
    .select()
    .from(conversionHistory)
    .where(
      and(
        eq(conversionHistory.userId, userId),
        eq(conversionHistory.fileKey, fileKey)
      )
    )
    .orderBy(desc(conversionHistory.createdAt));
}

/**
 * Find conversion history by node ID
 */
export async function findConversionHistoryByNodeId(
  userId: string,
  fileKey: string,
  nodeId: string
): Promise<ConversionHistory[]> {
  return await database
    .select()
    .from(conversionHistory)
    .where(
      and(
        eq(conversionHistory.userId, userId),
        eq(conversionHistory.fileKey, fileKey),
        eq(conversionHistory.nodeId, nodeId)
      )
    )
    .orderBy(desc(conversionHistory.createdAt));
}

/**
 * Find conversion history with filters
 */
export async function findConversionHistoryWithFilters(
  userId: string,
  filters: {
    conversionType?: ConversionType;
    status?: ConversionStatus;
    jsFramework?: string;
    cssFramework?: string;
    isFavorite?: boolean;
    searchQuery?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<ConversionHistory[]> {
  const {
    conversionType,
    status,
    jsFramework,
    cssFramework,
    isFavorite,
    searchQuery,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [eq(conversionHistory.userId, userId)];

  if (conversionType) {
    conditions.push(eq(conversionHistory.conversionType, conversionType));
  }

  if (status) {
    conditions.push(eq(conversionHistory.status, status));
  }

  if (jsFramework) {
    conditions.push(eq(conversionHistory.jsFramework, jsFramework));
  }

  if (cssFramework) {
    conditions.push(eq(conversionHistory.cssFramework, cssFramework));
  }

  if (isFavorite !== undefined) {
    conditions.push(eq(conversionHistory.isFavorite, isFavorite));
  }

  if (searchQuery) {
    conditions.push(
      or(
        like(conversionHistory.nodeName, `%${searchQuery}%`),
        like(conversionHistory.fileName, `%${searchQuery}%`),
        like(conversionHistory.notes, `%${searchQuery}%`)
      )!
    );
  }

  if (startDate) {
    conditions.push(gte(conversionHistory.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(conversionHistory.createdAt, endDate));
  }

  return await database
    .select()
    .from(conversionHistory)
    .where(and(...conditions))
    .orderBy(desc(conversionHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Find favorite conversions for a user
 */
export async function findFavoriteConversions(
  userId: string
): Promise<ConversionHistory[]> {
  return await database
    .select()
    .from(conversionHistory)
    .where(
      and(
        eq(conversionHistory.userId, userId),
        eq(conversionHistory.isFavorite, true)
      )
    )
    .orderBy(desc(conversionHistory.createdAt));
}

/**
 * Find versions of a conversion (re-runs)
 */
export async function findConversionVersions(
  originalConversionId: string
): Promise<ConversionHistory[]> {
  // Find all conversions with this parent, plus the original
  const [original] = await database
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.id, originalConversionId))
    .limit(1);

  if (!original) {
    return [];
  }

  // Find the root parent if this is a child
  const rootId = original.parentConversionId || original.id;

  return await database
    .select()
    .from(conversionHistory)
    .where(
      or(
        eq(conversionHistory.id, rootId),
        eq(conversionHistory.parentConversionId, rootId)
      )
    )
    .orderBy(conversionHistory.version);
}

/**
 * Get the next version number for a conversion
 */
export async function getNextVersionNumber(
  parentConversionId: string
): Promise<number> {
  const versions = await findConversionVersions(parentConversionId);
  if (versions.length === 0) {
    return 2; // First re-run is version 2
  }
  const maxVersion = Math.max(...versions.map((v) => v.version));
  return maxVersion + 1;
}

/**
 * Create a new conversion history record
 */
export async function createConversionHistory(
  data: CreateConversionHistoryData
): Promise<ConversionHistory> {
  const [newRecord] = await database
    .insert(conversionHistory)
    .values({
      ...data,
      id: data.id || crypto.randomUUID(),
    })
    .returning();

  return newRecord;
}

/**
 * Update a conversion history record
 */
export async function updateConversionHistory(
  id: string,
  data: UpdateConversionHistoryData
): Promise<ConversionHistory> {
  const [updatedRecord] = await database
    .update(conversionHistory)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversionHistory.id, id))
    .returning();

  return updatedRecord;
}

/**
 * Delete a conversion history record
 */
export async function deleteConversionHistory(id: string): Promise<void> {
  await database.delete(conversionHistory).where(eq(conversionHistory.id, id));
}

/**
 * Delete all conversion history for a user
 */
export async function deleteAllConversionHistoryForUser(
  userId: string
): Promise<void> {
  await database
    .delete(conversionHistory)
    .where(eq(conversionHistory.userId, userId));
}

/**
 * Toggle favorite status on a conversion
 */
export async function toggleConversionFavorite(
  id: string
): Promise<ConversionHistory> {
  const current = await findConversionHistoryById(id);
  if (!current) {
    throw new Error("Conversion not found");
  }

  return await updateConversionHistory(id, {
    isFavorite: !current.isFavorite,
  });
}

/**
 * Update conversion status (for tracking async operations)
 */
export async function updateConversionStatus(
  id: string,
  status: ConversionStatus,
  errorMessage?: string
): Promise<ConversionHistory> {
  const updates: UpdateConversionHistoryData = {
    status,
    errorMessage: errorMessage || null,
  };

  if (status === "completed") {
    updates.completedAt = new Date();
  }

  return await updateConversionHistory(id, updates);
}

/**
 * Add notes to a conversion
 */
export async function updateConversionNotes(
  id: string,
  notes: string
): Promise<ConversionHistory> {
  return await updateConversionHistory(id, { notes });
}

/**
 * Add tags to a conversion
 */
export async function updateConversionTags(
  id: string,
  tags: string[]
): Promise<ConversionHistory> {
  return await updateConversionHistory(id, { tags: JSON.stringify(tags) });
}

/**
 * Get conversion statistics for a user
 */
export async function getConversionStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  byFramework: Record<string, number>;
  byStatus: Record<string, number>;
  favorites: number;
  thisWeek: number;
  thisMonth: number;
}> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const allConversions = await database
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.userId, userId));

  const byType: Record<string, number> = {};
  const byFramework: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let favorites = 0;
  let thisWeek = 0;
  let thisMonth = 0;

  for (const conversion of allConversions) {
    // Count by type
    const type = conversion.conversionType;
    byType[type] = (byType[type] || 0) + 1;

    // Count by framework
    if (conversion.jsFramework) {
      byFramework[conversion.jsFramework] = (byFramework[conversion.jsFramework] || 0) + 1;
    }

    // Count by status
    const status = conversion.status;
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Count favorites
    if (conversion.isFavorite) {
      favorites++;
    }

    // Count recent
    if (conversion.createdAt >= weekAgo) {
      thisWeek++;
    }
    if (conversion.createdAt >= monthAgo) {
      thisMonth++;
    }
  }

  return {
    total: allConversions.length,
    byType,
    byFramework,
    byStatus,
    favorites,
    thisWeek,
    thisMonth,
  };
}

/**
 * Count total conversions for a user
 */
export async function countConversionsForUser(userId: string): Promise<number> {
  const result = await database
    .select({ count: sql<number>`count(*)` })
    .from(conversionHistory)
    .where(eq(conversionHistory.userId, userId));

  return Number(result[0]?.count || 0);
}
