import { eq, and, desc } from "drizzle-orm";
import { database } from "~/db";
import {
  responsiveFrameGroup,
  elementViewportMapping,
  elementTransformation,
  breakpointChange,
  type ResponsiveFrameGroup,
  type CreateResponsiveFrameGroupData,
  type UpdateResponsiveFrameGroupData,
  type ElementViewportMapping,
  type CreateElementViewportMappingData,
  type UpdateElementViewportMappingData,
  type ElementTransformation,
  type CreateElementTransformationData,
  type BreakpointChange,
  type CreateBreakpointChangeData,
  type ViewportCategory,
} from "~/db/schema";

// ============================================
// Responsive Frame Group Data Access
// ============================================

/**
 * Find a responsive frame group by ID
 */
export async function findResponsiveFrameGroupById(
  id: string
): Promise<ResponsiveFrameGroup | null> {
  const [result] = await database
    .select()
    .from(responsiveFrameGroup)
    .where(eq(responsiveFrameGroup.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find all responsive frame groups for a user
 */
export async function findResponsiveFrameGroupsByUserId(
  userId: string
): Promise<ResponsiveFrameGroup[]> {
  return await database
    .select()
    .from(responsiveFrameGroup)
    .where(eq(responsiveFrameGroup.userId, userId))
    .orderBy(desc(responsiveFrameGroup.createdAt));
}

/**
 * Find responsive frame groups for a specific Figma file
 */
export async function findResponsiveFrameGroupsByFileKey(
  userId: string,
  fileKey: string
): Promise<ResponsiveFrameGroup[]> {
  return await database
    .select()
    .from(responsiveFrameGroup)
    .where(
      and(
        eq(responsiveFrameGroup.userId, userId),
        eq(responsiveFrameGroup.fileKey, fileKey)
      )
    )
    .orderBy(responsiveFrameGroup.baseName);
}

/**
 * Find a responsive frame group by base name within a file
 */
export async function findResponsiveFrameGroupByBaseName(
  userId: string,
  fileKey: string,
  baseName: string
): Promise<ResponsiveFrameGroup | null> {
  const [result] = await database
    .select()
    .from(responsiveFrameGroup)
    .where(
      and(
        eq(responsiveFrameGroup.userId, userId),
        eq(responsiveFrameGroup.fileKey, fileKey),
        eq(responsiveFrameGroup.baseName, baseName)
      )
    )
    .limit(1);

  return result || null;
}

/**
 * Create a new responsive frame group
 */
export async function createResponsiveFrameGroup(
  data: CreateResponsiveFrameGroupData
): Promise<ResponsiveFrameGroup> {
  const [result] = await database
    .insert(responsiveFrameGroup)
    .values(data)
    .returning();

  return result!;
}

/**
 * Update a responsive frame group
 */
export async function updateResponsiveFrameGroup(
  id: string,
  data: UpdateResponsiveFrameGroupData
): Promise<ResponsiveFrameGroup | null> {
  const [result] = await database
    .update(responsiveFrameGroup)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(responsiveFrameGroup.id, id))
    .returning();

  return result || null;
}

/**
 * Delete a responsive frame group and all related data
 */
export async function deleteResponsiveFrameGroup(id: string): Promise<void> {
  await database
    .delete(responsiveFrameGroup)
    .where(eq(responsiveFrameGroup.id, id));
}

/**
 * Upsert a responsive frame group (create or update based on baseName)
 */
export async function upsertResponsiveFrameGroup(
  data: CreateResponsiveFrameGroupData
): Promise<ResponsiveFrameGroup> {
  const [result] = await database
    .insert(responsiveFrameGroup)
    .values(data)
    .onConflictDoUpdate({
      target: responsiveFrameGroup.id,
      set: {
        baseName: data.baseName,
        confidence: data.confidence,
        mobileFrameId: data.mobileFrameId,
        tabletFrameId: data.tabletFrameId,
        desktopFrameId: data.desktopFrameId,
        generatedCss: data.generatedCss,
        tailwindClasses: data.tailwindClasses,
        status: data.status,
        errorMessage: data.errorMessage,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result!;
}

// ============================================
// Element Viewport Mapping Data Access
// ============================================

/**
 * Find an element mapping by ID
 */
export async function findElementViewportMappingById(
  id: string
): Promise<ElementViewportMapping | null> {
  const [result] = await database
    .select()
    .from(elementViewportMapping)
    .where(eq(elementViewportMapping.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find all element mappings for a frame group
 */
export async function findElementMappingsByGroupId(
  groupId: string
): Promise<ElementViewportMapping[]> {
  return await database
    .select()
    .from(elementViewportMapping)
    .where(eq(elementViewportMapping.groupId, groupId))
    .orderBy(elementViewportMapping.elementPath);
}

/**
 * Find element mappings by element path
 */
export async function findElementMappingsByPath(
  groupId: string,
  elementPath: string
): Promise<ElementViewportMapping | null> {
  const [result] = await database
    .select()
    .from(elementViewportMapping)
    .where(
      and(
        eq(elementViewportMapping.groupId, groupId),
        eq(elementViewportMapping.elementPath, elementPath)
      )
    )
    .limit(1);

  return result || null;
}

/**
 * Create a new element viewport mapping
 */
export async function createElementViewportMapping(
  data: CreateElementViewportMappingData
): Promise<ElementViewportMapping> {
  const [result] = await database
    .insert(elementViewportMapping)
    .values(data)
    .returning();

  return result!;
}

/**
 * Create multiple element viewport mappings
 */
export async function createElementViewportMappings(
  data: CreateElementViewportMappingData[]
): Promise<ElementViewportMapping[]> {
  if (data.length === 0) return [];

  return await database
    .insert(elementViewportMapping)
    .values(data)
    .returning();
}

/**
 * Update an element viewport mapping
 */
export async function updateElementViewportMapping(
  id: string,
  data: UpdateElementViewportMappingData
): Promise<ElementViewportMapping | null> {
  const [result] = await database
    .update(elementViewportMapping)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(elementViewportMapping.id, id))
    .returning();

  return result || null;
}

/**
 * Delete all element mappings for a group
 */
export async function deleteElementMappingsByGroupId(groupId: string): Promise<void> {
  await database
    .delete(elementViewportMapping)
    .where(eq(elementViewportMapping.groupId, groupId));
}

// ============================================
// Element Transformation Data Access
// ============================================

/**
 * Find all transformations for a mapping
 */
export async function findTransformationsByMappingId(
  mappingId: string
): Promise<ElementTransformation[]> {
  return await database
    .select()
    .from(elementTransformation)
    .where(eq(elementTransformation.mappingId, mappingId));
}

/**
 * Find transformations between specific viewports
 */
export async function findTransformationsByViewports(
  mappingId: string,
  fromViewport: ViewportCategory,
  toViewport: ViewportCategory
): Promise<ElementTransformation | null> {
  const [result] = await database
    .select()
    .from(elementTransformation)
    .where(
      and(
        eq(elementTransformation.mappingId, mappingId),
        eq(elementTransformation.fromViewport, fromViewport),
        eq(elementTransformation.toViewport, toViewport)
      )
    )
    .limit(1);

  return result || null;
}

/**
 * Create a new element transformation
 */
export async function createElementTransformation(
  data: CreateElementTransformationData
): Promise<ElementTransformation> {
  const [result] = await database
    .insert(elementTransformation)
    .values(data)
    .returning();

  return result!;
}

/**
 * Create multiple element transformations
 */
export async function createElementTransformations(
  data: CreateElementTransformationData[]
): Promise<ElementTransformation[]> {
  if (data.length === 0) return [];

  return await database
    .insert(elementTransformation)
    .values(data)
    .returning();
}

/**
 * Delete all transformations for a mapping
 */
export async function deleteTransformationsByMappingId(mappingId: string): Promise<void> {
  await database
    .delete(elementTransformation)
    .where(eq(elementTransformation.mappingId, mappingId));
}

// ============================================
// Breakpoint Change Data Access
// ============================================

/**
 * Find all breakpoint changes for a group
 */
export async function findBreakpointChangesByGroupId(
  groupId: string
): Promise<BreakpointChange[]> {
  return await database
    .select()
    .from(breakpointChange)
    .where(eq(breakpointChange.groupId, groupId))
    .orderBy(breakpointChange.atBreakpoint);
}

/**
 * Find breakpoint changes by type
 */
export async function findBreakpointChangesByType(
  groupId: string,
  changeType: "appears" | "disappears"
): Promise<BreakpointChange[]> {
  return await database
    .select()
    .from(breakpointChange)
    .where(
      and(
        eq(breakpointChange.groupId, groupId),
        eq(breakpointChange.changeType, changeType)
      )
    );
}

/**
 * Create a new breakpoint change
 */
export async function createBreakpointChange(
  data: CreateBreakpointChangeData
): Promise<BreakpointChange> {
  const [result] = await database
    .insert(breakpointChange)
    .values(data)
    .returning();

  return result!;
}

/**
 * Create multiple breakpoint changes
 */
export async function createBreakpointChanges(
  data: CreateBreakpointChangeData[]
): Promise<BreakpointChange[]> {
  if (data.length === 0) return [];

  return await database
    .insert(breakpointChange)
    .values(data)
    .returning();
}

/**
 * Delete all breakpoint changes for a group
 */
export async function deleteBreakpointChangesByGroupId(groupId: string): Promise<void> {
  await database
    .delete(breakpointChange)
    .where(eq(breakpointChange.groupId, groupId));
}

// ============================================
// Composite Operations
// ============================================

/**
 * Get a complete responsive frame group with all related data
 */
export async function getResponsiveFrameGroupWithDetails(
  id: string
): Promise<{
  group: ResponsiveFrameGroup;
  mappings: ElementViewportMapping[];
  breakpointChanges: BreakpointChange[];
} | null> {
  const group = await findResponsiveFrameGroupById(id);
  if (!group) return null;

  const [mappings, changes] = await Promise.all([
    findElementMappingsByGroupId(id),
    findBreakpointChangesByGroupId(id),
  ]);

  return {
    group,
    mappings,
    breakpointChanges: changes,
  };
}

/**
 * Get an element mapping with all its transformations
 */
export async function getElementMappingWithTransformations(
  mappingId: string
): Promise<{
  mapping: ElementViewportMapping;
  transformations: ElementTransformation[];
} | null> {
  const mapping = await findElementViewportMappingById(mappingId);
  if (!mapping) return null;

  const transformations = await findTransformationsByMappingId(mappingId);

  return {
    mapping,
    transformations,
  };
}

/**
 * Delete a responsive frame group and all related data (cascade)
 */
export async function deleteResponsiveFrameGroupWithRelations(id: string): Promise<void> {
  // The database schema has cascade deletes set up, so this will clean up related records
  await deleteResponsiveFrameGroup(id);
}

/**
 * Refresh/regenerate mappings for a group
 * Clears existing mappings and related data, returns the group for re-processing
 */
export async function clearGroupMappings(
  groupId: string
): Promise<ResponsiveFrameGroup | null> {
  const group = await findResponsiveFrameGroupById(groupId);
  if (!group) return null;

  // Clear existing breakpoint changes and element mappings (cascade will handle transformations)
  await deleteBreakpointChangesByGroupId(groupId);
  await deleteElementMappingsByGroupId(groupId);

  // Update status to pending for re-processing
  return await updateResponsiveFrameGroup(groupId, {
    status: "pending",
    generatedCss: null,
    tailwindClasses: null,
  });
}
