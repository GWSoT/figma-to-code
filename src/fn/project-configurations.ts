import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findProjectConfigurationById,
  findProjectConfigurationsByUserId,
  findDefaultProjectConfiguration,
  findTemplateConfigurations,
  findSharedConfigurations,
  createProjectConfiguration,
  updateProjectConfiguration,
  deleteProjectConfiguration,
  setDefaultProjectConfiguration,
  duplicateProjectConfiguration,
} from "~/data-access/project-configurations";
import type { ProjectConfiguration } from "~/db/schema";

// Validation schemas
const codeStyleSchema = z.enum(["camelCase", "kebab-case", "PascalCase", "snake_case"]);
const componentStructureSchema = z.enum(["flat", "folder", "feature-based"]);
const jsFrameworkSchema = z.enum(["react", "vue", "angular", "svelte", "nextjs", "nuxt", "vanilla"]);
const cssFrameworkSchema = z.enum(["vanilla-css", "tailwind", "css-modules", "styled-components", "emotion", "scss"]);

const createConfigurationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  jsFramework: jsFrameworkSchema,
  cssFramework: cssFrameworkSchema,
  cssOptions: z.string(), // JSON string
  codeStyle: codeStyleSchema.optional().default("camelCase"),
  componentNaming: codeStyleSchema.optional().default("PascalCase"),
  fileNaming: codeStyleSchema.optional().default("kebab-case"),
  componentStructure: componentStructureSchema.optional().default("folder"),
  additionalOptions: z.string().optional(), // JSON string
  isShared: z.boolean().optional().default(false),
  sharedWithTeam: z.string().optional(),
});

const updateConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  jsFramework: jsFrameworkSchema.optional(),
  cssFramework: cssFrameworkSchema.optional(),
  cssOptions: z.string().optional(),
  codeStyle: codeStyleSchema.optional(),
  componentNaming: codeStyleSchema.optional(),
  fileNaming: codeStyleSchema.optional(),
  componentStructure: componentStructureSchema.optional(),
  additionalOptions: z.string().optional().nullable(),
  isShared: z.boolean().optional(),
  sharedWithTeam: z.string().optional().nullable(),
});

/**
 * Get all project configurations for the authenticated user
 */
export const getProjectConfigurationsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<ProjectConfiguration[]> => {
    const { userId } = context;
    return await findProjectConfigurationsByUserId(userId);
  });

/**
 * Get a single project configuration by ID
 */
export const getProjectConfigurationFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ProjectConfiguration> => {
    const { userId } = context;
    const { id } = data;

    const config = await findProjectConfigurationById(id);
    if (!config) {
      throw new Error("Configuration not found");
    }

    // Check ownership or if it's shared/template
    if (config.userId !== userId && !config.isShared && !config.isTemplate) {
      throw new Error("Configuration not found");
    }

    return config;
  });

/**
 * Get the default project configuration for the authenticated user
 */
export const getDefaultProjectConfigurationFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<ProjectConfiguration | null> => {
    const { userId } = context;
    return await findDefaultProjectConfiguration(userId);
  });

/**
 * Get all template configurations
 */
export const getTemplateConfigurationsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async (): Promise<ProjectConfiguration[]> => {
    return await findTemplateConfigurations();
  });

/**
 * Get all shared configurations available to the user
 */
export const getSharedConfigurationsFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ teamId: z.string().optional() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ProjectConfiguration[]> => {
    const { userId } = context;
    return await findSharedConfigurations(userId, data.teamId);
  });

/**
 * Create a new project configuration
 */
export const createProjectConfigurationFn = createServerFn({ method: "POST" })
  .inputValidator(createConfigurationSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ProjectConfiguration> => {
    const { userId } = context;

    const newConfig = await createProjectConfiguration({
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      description: data.description || null,
      isDefault: false,
      isTemplate: false,
      jsFramework: data.jsFramework,
      cssFramework: data.cssFramework,
      cssOptions: data.cssOptions,
      codeStyle: data.codeStyle || "camelCase",
      componentNaming: data.componentNaming || "PascalCase",
      fileNaming: data.fileNaming || "kebab-case",
      componentStructure: data.componentStructure || "folder",
      additionalOptions: data.additionalOptions || null,
      isShared: data.isShared || false,
      sharedWithTeam: data.sharedWithTeam || null,
    });

    return newConfig;
  });

/**
 * Update an existing project configuration
 */
export const updateProjectConfigurationFn = createServerFn({ method: "POST" })
  .inputValidator(updateConfigurationSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ProjectConfiguration> => {
    const { userId } = context;
    const { id, ...updateData } = data;

    // Verify ownership
    const config = await findProjectConfigurationById(id);
    if (!config || config.userId !== userId) {
      throw new Error("Configuration not found");
    }

    return await updateProjectConfiguration(id, updateData);
  });

/**
 * Delete a project configuration
 */
export const deleteProjectConfigurationFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<void> => {
    const { userId } = context;
    const { id } = data;

    // Verify ownership
    const config = await findProjectConfigurationById(id);
    if (!config || config.userId !== userId) {
      throw new Error("Configuration not found");
    }

    await deleteProjectConfiguration(id);
  });

/**
 * Set a configuration as the default
 */
export const setDefaultProjectConfigurationFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<void> => {
    const { userId } = context;
    const { id } = data;

    // Verify ownership
    const config = await findProjectConfigurationById(id);
    if (!config || config.userId !== userId) {
      throw new Error("Configuration not found");
    }

    await setDefaultProjectConfiguration(userId, id);
  });

/**
 * Duplicate a configuration (from template or another user's shared config)
 */
export const duplicateProjectConfigurationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sourceId: z.string().uuid(),
      name: z.string().min(1).max(100),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<ProjectConfiguration> => {
    const { userId } = context;
    const { sourceId, name } = data;

    // Verify source exists and is accessible
    const source = await findProjectConfigurationById(sourceId);
    if (!source) {
      throw new Error("Source configuration not found");
    }

    // Allow duplication if:
    // 1. User owns the configuration
    // 2. Configuration is a template
    // 3. Configuration is shared
    if (source.userId !== userId && !source.isTemplate && !source.isShared) {
      throw new Error("Cannot duplicate this configuration");
    }

    return await duplicateProjectConfiguration(sourceId, userId, name);
  });
