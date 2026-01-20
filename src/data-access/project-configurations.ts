import { eq, and, or, desc } from "drizzle-orm";
import { database } from "~/db";
import {
  projectConfiguration,
  type ProjectConfiguration,
  type CreateProjectConfigurationData,
  type UpdateProjectConfigurationData,
} from "~/db/schema";

// ============================================
// Project Configuration Data Access
// ============================================

/**
 * Find a project configuration by ID
 */
export async function findProjectConfigurationById(
  id: string
): Promise<ProjectConfiguration | null> {
  const [result] = await database
    .select()
    .from(projectConfiguration)
    .where(eq(projectConfiguration.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find all project configurations for a user
 */
export async function findProjectConfigurationsByUserId(
  userId: string
): Promise<ProjectConfiguration[]> {
  return await database
    .select()
    .from(projectConfiguration)
    .where(eq(projectConfiguration.userId, userId))
    .orderBy(desc(projectConfiguration.updatedAt));
}

/**
 * Find the default project configuration for a user
 */
export async function findDefaultProjectConfiguration(
  userId: string
): Promise<ProjectConfiguration | null> {
  const [result] = await database
    .select()
    .from(projectConfiguration)
    .where(
      and(
        eq(projectConfiguration.userId, userId),
        eq(projectConfiguration.isDefault, true)
      )
    )
    .limit(1);

  return result || null;
}

/**
 * Find all template configurations (shared by admins or system templates)
 */
export async function findTemplateConfigurations(): Promise<ProjectConfiguration[]> {
  return await database
    .select()
    .from(projectConfiguration)
    .where(eq(projectConfiguration.isTemplate, true))
    .orderBy(projectConfiguration.name);
}

/**
 * Find configurations shared with a user (either public or shared with their team)
 */
export async function findSharedConfigurations(
  userId: string,
  teamId?: string
): Promise<ProjectConfiguration[]> {
  const conditions = [
    and(
      eq(projectConfiguration.isShared, true),
      eq(projectConfiguration.sharedWithTeam, null as unknown as string) // Publicly shared
    ),
  ];

  if (teamId) {
    conditions.push(
      and(
        eq(projectConfiguration.isShared, true),
        eq(projectConfiguration.sharedWithTeam, teamId)
      )
    );
  }

  return await database
    .select()
    .from(projectConfiguration)
    .where(or(...conditions))
    .orderBy(projectConfiguration.name);
}

/**
 * Create a new project configuration
 */
export async function createProjectConfiguration(
  data: CreateProjectConfigurationData
): Promise<ProjectConfiguration> {
  const [newConfig] = await database
    .insert(projectConfiguration)
    .values(data)
    .returning();

  return newConfig;
}

/**
 * Update a project configuration
 */
export async function updateProjectConfiguration(
  id: string,
  data: UpdateProjectConfigurationData
): Promise<ProjectConfiguration> {
  const [updatedConfig] = await database
    .update(projectConfiguration)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projectConfiguration.id, id))
    .returning();

  return updatedConfig;
}

/**
 * Delete a project configuration
 */
export async function deleteProjectConfiguration(id: string): Promise<void> {
  await database.delete(projectConfiguration).where(eq(projectConfiguration.id, id));
}

/**
 * Set a configuration as the default for a user
 * Unsets any other default configuration
 */
export async function setDefaultProjectConfiguration(
  userId: string,
  configId: string
): Promise<void> {
  // Unset all defaults for this user
  await database
    .update(projectConfiguration)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(projectConfiguration.userId, userId));

  // Set the new default
  await database
    .update(projectConfiguration)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(projectConfiguration.id, configId));
}

/**
 * Duplicate a configuration (for creating from template)
 */
export async function duplicateProjectConfiguration(
  sourceId: string,
  userId: string,
  newName: string
): Promise<ProjectConfiguration> {
  const source = await findProjectConfigurationById(sourceId);
  if (!source) {
    throw new Error("Source configuration not found");
  }

  const newConfig: CreateProjectConfigurationData = {
    id: crypto.randomUUID(),
    userId,
    name: newName,
    description: source.description,
    isDefault: false,
    isTemplate: false,
    jsFramework: source.jsFramework,
    cssFramework: source.cssFramework,
    cssOptions: source.cssOptions,
    codeStyle: source.codeStyle,
    componentNaming: source.componentNaming,
    fileNaming: source.fileNaming,
    componentStructure: source.componentStructure,
    additionalOptions: source.additionalOptions,
    isShared: false,
    sharedWithTeam: null,
  };

  return createProjectConfiguration(newConfig);
}
