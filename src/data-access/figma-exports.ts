import { eq, and, inArray, lt } from "drizzle-orm";
import { database } from "~/db";
import {
  figmaExport,
  figmaExportSet,
  type FigmaExport,
  type CreateFigmaExportData,
  type UpdateFigmaExportData,
  type FigmaExportSet,
  type CreateFigmaExportSetData,
  type UpdateFigmaExportSetData,
  type FigmaExportFormat,
  type FigmaExportStatus,
} from "~/db/schema";

// ============================================
// Figma Export Data Access
// ============================================

export async function findFigmaExportById(id: string): Promise<FigmaExport | null> {
  const [result] = await database
    .select()
    .from(figmaExport)
    .where(eq(figmaExport.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaExportsByUserId(userId: string): Promise<FigmaExport[]> {
  return await database
    .select()
    .from(figmaExport)
    .where(eq(figmaExport.userId, userId))
    .orderBy(figmaExport.createdAt);
}

export async function findFigmaExportsByNodeId(
  nodeId: string,
  userId: string
): Promise<FigmaExport[]> {
  return await database
    .select()
    .from(figmaExport)
    .where(and(eq(figmaExport.nodeId, nodeId), eq(figmaExport.userId, userId)))
    .orderBy(figmaExport.scale);
}

export async function findFigmaExportsByFileKey(
  fileKey: string,
  userId: string
): Promise<FigmaExport[]> {
  return await database
    .select()
    .from(figmaExport)
    .where(and(eq(figmaExport.fileKey, fileKey), eq(figmaExport.userId, userId)))
    .orderBy(figmaExport.createdAt);
}

export async function findFigmaExportByNodeAndScale(
  nodeId: string,
  scale: number,
  format: FigmaExportFormat,
  userId: string
): Promise<FigmaExport | null> {
  const [result] = await database
    .select()
    .from(figmaExport)
    .where(
      and(
        eq(figmaExport.nodeId, nodeId),
        eq(figmaExport.scale, scale),
        eq(figmaExport.format, format),
        eq(figmaExport.userId, userId)
      )
    )
    .limit(1);

  return result || null;
}

export async function createFigmaExport(data: CreateFigmaExportData): Promise<FigmaExport> {
  const [result] = await database.insert(figmaExport).values(data).returning();
  return result;
}

export async function createFigmaExports(
  exports: CreateFigmaExportData[]
): Promise<FigmaExport[]> {
  if (exports.length === 0) return [];
  return await database.insert(figmaExport).values(exports).returning();
}

export async function updateFigmaExport(
  id: string,
  data: UpdateFigmaExportData
): Promise<FigmaExport | null> {
  const [result] = await database
    .update(figmaExport)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(figmaExport.id, id))
    .returning();

  return result || null;
}

export async function updateFigmaExportStatus(
  id: string,
  status: FigmaExportStatus,
  errorMessage?: string
): Promise<FigmaExport | null> {
  const updateData: UpdateFigmaExportData = {
    status,
    updatedAt: new Date(),
  };

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  const [result] = await database
    .update(figmaExport)
    .set(updateData)
    .where(eq(figmaExport.id, id))
    .returning();

  return result || null;
}

export async function deleteFigmaExport(id: string): Promise<void> {
  await database.delete(figmaExport).where(eq(figmaExport.id, id));
}

export async function deleteFigmaExportsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await database.delete(figmaExport).where(inArray(figmaExport.id, ids));
}

export async function deleteFigmaExportsByUserId(userId: string): Promise<void> {
  await database.delete(figmaExport).where(eq(figmaExport.userId, userId));
}

export async function deleteExpiredFigmaExports(): Promise<FigmaExport[]> {
  const now = new Date();
  const expired = await database
    .delete(figmaExport)
    .where(lt(figmaExport.expiresAt, now))
    .returning();

  return expired;
}

// ============================================
// Figma Export Set Data Access
// ============================================

export async function findFigmaExportSetById(id: string): Promise<FigmaExportSet | null> {
  const [result] = await database
    .select()
    .from(figmaExportSet)
    .where(eq(figmaExportSet.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaExportSetsByUserId(
  userId: string
): Promise<FigmaExportSet[]> {
  return await database
    .select()
    .from(figmaExportSet)
    .where(eq(figmaExportSet.userId, userId))
    .orderBy(figmaExportSet.createdAt);
}

export async function findFigmaExportSetByNodeId(
  nodeId: string,
  format: FigmaExportFormat,
  userId: string
): Promise<FigmaExportSet | null> {
  const [result] = await database
    .select()
    .from(figmaExportSet)
    .where(
      and(
        eq(figmaExportSet.nodeId, nodeId),
        eq(figmaExportSet.format, format),
        eq(figmaExportSet.userId, userId)
      )
    )
    .limit(1);

  return result || null;
}

export async function createFigmaExportSet(
  data: CreateFigmaExportSetData
): Promise<FigmaExportSet> {
  const [result] = await database.insert(figmaExportSet).values(data).returning();
  return result;
}

export async function updateFigmaExportSet(
  id: string,
  data: UpdateFigmaExportSetData
): Promise<FigmaExportSet | null> {
  const [result] = await database
    .update(figmaExportSet)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(figmaExportSet.id, id))
    .returning();

  return result || null;
}

export async function deleteFigmaExportSet(id: string): Promise<void> {
  await database.delete(figmaExportSet).where(eq(figmaExportSet.id, id));
}

export async function deleteFigmaExportSetsByUserId(userId: string): Promise<void> {
  await database.delete(figmaExportSet).where(eq(figmaExportSet.userId, userId));
}

// ============================================
// Combined Queries
// ============================================

export type FigmaExportWithUrls = FigmaExport & {
  downloadUrl?: string;
};

export type FigmaExportSetWithExports = FigmaExportSet & {
  exports: FigmaExportWithUrls[];
};

export async function findFigmaExportSetWithExports(
  setId: string
): Promise<FigmaExportSetWithExports | null> {
  const exportSet = await findFigmaExportSetById(setId);
  if (!exportSet) return null;

  const exports = await findFigmaExportsByNodeId(exportSet.nodeId, exportSet.userId);

  // Filter exports by format and return
  const filteredExports = exports.filter(
    (exp) => exp.format === exportSet.format
  );

  return {
    ...exportSet,
    exports: filteredExports,
  };
}

export async function findExportsByNodeWithAllFormats(
  nodeId: string,
  userId: string
): Promise<Record<FigmaExportFormat, FigmaExport[]>> {
  const exports = await findFigmaExportsByNodeId(nodeId, userId);

  return {
    png: exports.filter((e) => e.format === "png"),
    jpg: exports.filter((e) => e.format === "jpg"),
    webp: exports.filter((e) => e.format === "webp"),
  };
}
