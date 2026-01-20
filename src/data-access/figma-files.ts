import { eq, and, inArray } from "drizzle-orm";
import { database } from "~/db";
import {
  figmaFile,
  figmaPage,
  figmaFrame,
  type FigmaFile,
  type CreateFigmaFileData,
  type UpdateFigmaFileData,
  type FigmaPageRecord,
  type CreateFigmaPageData,
  type UpdateFigmaPageData,
  type FigmaFrameRecord,
  type CreateFigmaFrameData,
  type UpdateFigmaFrameData,
  type FigmaFrameCategory,
} from "~/db/schema";

// ============================================
// Figma File Data Access
// ============================================

export async function findFigmaFileById(id: string): Promise<FigmaFile | null> {
  const [result] = await database
    .select()
    .from(figmaFile)
    .where(eq(figmaFile.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaFilesByAccountId(
  figmaAccountId: string
): Promise<FigmaFile[]> {
  return await database
    .select()
    .from(figmaFile)
    .where(eq(figmaFile.figmaAccountId, figmaAccountId))
    .orderBy(figmaFile.name);
}

export async function findFigmaFilesByProjectId(
  projectId: string
): Promise<FigmaFile[]> {
  return await database
    .select()
    .from(figmaFile)
    .where(eq(figmaFile.projectId, projectId))
    .orderBy(figmaFile.name);
}

export async function upsertFigmaFile(data: CreateFigmaFileData): Promise<FigmaFile> {
  const [result] = await database
    .insert(figmaFile)
    .values(data)
    .onConflictDoUpdate({
      target: figmaFile.id,
      set: {
        name: data.name,
        projectId: data.projectId,
        thumbnailUrl: data.thumbnailUrl,
        lastModified: data.lastModified,
        version: data.version,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function deleteFigmaFile(id: string): Promise<void> {
  await database.delete(figmaFile).where(eq(figmaFile.id, id));
}

export async function deleteFigmaFilesByAccountId(
  figmaAccountId: string
): Promise<void> {
  await database
    .delete(figmaFile)
    .where(eq(figmaFile.figmaAccountId, figmaAccountId));
}

// ============================================
// Figma Page Data Access
// ============================================

export async function findFigmaPageById(id: string): Promise<FigmaPageRecord | null> {
  const [result] = await database
    .select()
    .from(figmaPage)
    .where(eq(figmaPage.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaPagesByFileId(
  fileId: string
): Promise<FigmaPageRecord[]> {
  return await database
    .select()
    .from(figmaPage)
    .where(eq(figmaPage.fileId, fileId))
    .orderBy(figmaPage.name);
}

export async function upsertFigmaPage(data: CreateFigmaPageData): Promise<FigmaPageRecord> {
  const [result] = await database
    .insert(figmaPage)
    .values(data)
    .onConflictDoUpdate({
      target: figmaPage.id,
      set: {
        name: data.name,
        frameCount: data.frameCount,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function deleteFigmaPage(id: string): Promise<void> {
  await database.delete(figmaPage).where(eq(figmaPage.id, id));
}

export async function deleteFigmaPagesByFileId(fileId: string): Promise<void> {
  await database.delete(figmaPage).where(eq(figmaPage.fileId, fileId));
}

// ============================================
// Figma Frame Data Access
// ============================================

export async function findFigmaFrameById(id: string): Promise<FigmaFrameRecord | null> {
  const [result] = await database
    .select()
    .from(figmaFrame)
    .where(eq(figmaFrame.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaFramesByPageId(
  pageId: string
): Promise<FigmaFrameRecord[]> {
  return await database
    .select()
    .from(figmaFrame)
    .where(eq(figmaFrame.pageId, pageId))
    .orderBy(figmaFrame.name);
}

export async function findFigmaFramesByFileId(
  fileId: string
): Promise<FigmaFrameRecord[]> {
  return await database
    .select()
    .from(figmaFrame)
    .where(eq(figmaFrame.fileId, fileId))
    .orderBy(figmaFrame.name);
}

export async function findFigmaFramesByCategory(
  fileId: string,
  category: FigmaFrameCategory
): Promise<FigmaFrameRecord[]> {
  return await database
    .select()
    .from(figmaFrame)
    .where(and(eq(figmaFrame.fileId, fileId), eq(figmaFrame.category, category)))
    .orderBy(figmaFrame.name);
}

export async function findFigmaFramesByIds(
  frameIds: string[]
): Promise<FigmaFrameRecord[]> {
  if (frameIds.length === 0) return [];

  return await database
    .select()
    .from(figmaFrame)
    .where(inArray(figmaFrame.id, frameIds))
    .orderBy(figmaFrame.name);
}

export async function upsertFigmaFrame(
  data: CreateFigmaFrameData
): Promise<FigmaFrameRecord> {
  const [result] = await database
    .insert(figmaFrame)
    .values(data)
    .onConflictDoUpdate({
      target: figmaFrame.id,
      set: {
        name: data.name,
        width: data.width,
        height: data.height,
        category: data.category,
        matchedDevice: data.matchedDevice,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function upsertFigmaFrames(
  frames: CreateFigmaFrameData[]
): Promise<FigmaFrameRecord[]> {
  if (frames.length === 0) return [];

  const results: FigmaFrameRecord[] = [];
  for (const frame of frames) {
    const result = await upsertFigmaFrame(frame);
    results.push(result);
  }
  return results;
}

export async function deleteFigmaFrame(id: string): Promise<void> {
  await database.delete(figmaFrame).where(eq(figmaFrame.id, id));
}

export async function deleteFigmaFramesByPageId(pageId: string): Promise<void> {
  await database.delete(figmaFrame).where(eq(figmaFrame.pageId, pageId));
}

export async function deleteFigmaFramesByFileId(fileId: string): Promise<void> {
  await database.delete(figmaFrame).where(eq(figmaFrame.fileId, fileId));
}

// ============================================
// Combined File/Page/Frame Queries
// ============================================

export type FigmaPageWithFrames = FigmaPageRecord & {
  frames: FigmaFrameRecord[];
};

export type FigmaFileWithPages = FigmaFile & {
  pages: FigmaPageWithFrames[];
};

export type FramesByCategoryResult = {
  screens: FigmaFrameRecord[];
  components: FigmaFrameRecord[];
  assets: FigmaFrameRecord[];
  unknown: FigmaFrameRecord[];
};

export async function findFigmaFileWithPages(
  fileId: string
): Promise<FigmaFileWithPages | null> {
  const file = await findFigmaFileById(fileId);
  if (!file) return null;

  const pages = await findFigmaPagesByFileId(fileId);
  const frames = await findFigmaFramesByFileId(fileId);

  const pagesWithFrames: FigmaPageWithFrames[] = pages.map((page) => ({
    ...page,
    frames: frames.filter((f) => f.pageId === page.id),
  }));

  return {
    ...file,
    pages: pagesWithFrames,
  };
}

export async function findFramesByCategory(
  fileId: string
): Promise<FramesByCategoryResult> {
  const frames = await findFigmaFramesByFileId(fileId);

  return {
    screens: frames.filter((f) => f.category === "screen"),
    components: frames.filter((f) => f.category === "component"),
    assets: frames.filter((f) => f.category === "asset"),
    unknown: frames.filter((f) => f.category === "unknown"),
  };
}

// Get frame counts by category for a file
export async function getFrameCategoryCounts(
  fileId: string
): Promise<Record<FigmaFrameCategory, number>> {
  const frames = await findFigmaFramesByFileId(fileId);

  const counts: Record<FigmaFrameCategory, number> = {
    screen: 0,
    component: 0,
    asset: 0,
    unknown: 0,
  };

  for (const frame of frames) {
    const category = frame.category as FigmaFrameCategory;
    counts[category]++;
  }

  return counts;
}
