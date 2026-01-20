import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectConfigurationFn,
  updateProjectConfigurationFn,
  deleteProjectConfigurationFn,
  setDefaultProjectConfigurationFn,
  duplicateProjectConfigurationFn,
} from "~/fn/project-configurations";
import {
  getProjectConfigurationsQuery,
  getProjectConfigurationQuery,
  getDefaultProjectConfigurationQuery,
  getTemplateConfigurationsQuery,
  getSharedConfigurationsQuery,
} from "~/queries/project-configurations";
import { authClient } from "~/lib/auth-client";
import type { CSSFramework, JSFramework, CSSFrameworkOptions } from "~/types/css-frameworks";
import type { CodeStyle, ComponentStructure } from "~/db/schema";

// Input types for create/update operations
export interface CreateConfigurationInput {
  name: string;
  description?: string;
  jsFramework: JSFramework;
  cssFramework: CSSFramework;
  cssOptions: CSSFrameworkOptions;
  codeStyle?: CodeStyle;
  componentNaming?: CodeStyle;
  fileNaming?: CodeStyle;
  componentStructure?: ComponentStructure;
  additionalOptions?: Record<string, unknown>;
  isShared?: boolean;
  sharedWithTeam?: string;
}

export interface UpdateConfigurationInput {
  id: string;
  name?: string;
  description?: string | null;
  jsFramework?: JSFramework;
  cssFramework?: CSSFramework;
  cssOptions?: CSSFrameworkOptions;
  codeStyle?: CodeStyle;
  componentNaming?: CodeStyle;
  fileNaming?: CodeStyle;
  componentStructure?: ComponentStructure;
  additionalOptions?: Record<string, unknown> | null;
  isShared?: boolean;
  sharedWithTeam?: string | null;
}

/**
 * Hook to get all project configurations for the current user
 */
export function useProjectConfigurations() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getProjectConfigurationsQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get a single project configuration
 */
export function useProjectConfiguration(id: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getProjectConfigurationQuery(id),
    enabled: !!session?.user && !!id,
  });
}

/**
 * Hook to get the default project configuration
 */
export function useDefaultProjectConfiguration() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getDefaultProjectConfigurationQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get template configurations
 */
export function useTemplateConfigurations() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getTemplateConfigurationsQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to get shared configurations
 */
export function useSharedConfigurations(teamId?: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getSharedConfigurationsQuery(teamId),
    enabled: !!session?.user,
  });
}

/**
 * Hook to create a new project configuration
 */
export function useCreateProjectConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConfigurationInput) =>
      createProjectConfigurationFn({
        data: {
          name: input.name,
          description: input.description,
          jsFramework: input.jsFramework,
          cssFramework: input.cssFramework,
          cssOptions: JSON.stringify(input.cssOptions),
          codeStyle: input.codeStyle,
          componentNaming: input.componentNaming,
          fileNaming: input.fileNaming,
          componentStructure: input.componentStructure,
          additionalOptions: input.additionalOptions
            ? JSON.stringify(input.additionalOptions)
            : undefined,
          isShared: input.isShared,
          sharedWithTeam: input.sharedWithTeam,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-configurations"] });
      toast.success("Configuration saved");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save configuration");
    },
  });
}

/**
 * Hook to update a project configuration
 */
export function useUpdateProjectConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateConfigurationInput) =>
      updateProjectConfigurationFn({
        data: {
          id: input.id,
          name: input.name,
          description: input.description,
          jsFramework: input.jsFramework,
          cssFramework: input.cssFramework,
          cssOptions: input.cssOptions ? JSON.stringify(input.cssOptions) : undefined,
          codeStyle: input.codeStyle,
          componentNaming: input.componentNaming,
          fileNaming: input.fileNaming,
          componentStructure: input.componentStructure,
          additionalOptions:
            input.additionalOptions === null
              ? null
              : input.additionalOptions
              ? JSON.stringify(input.additionalOptions)
              : undefined,
          isShared: input.isShared,
          sharedWithTeam: input.sharedWithTeam,
        },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-configurations"] });
      queryClient.invalidateQueries({
        queryKey: ["project-configuration", variables.id],
      });
      toast.success("Configuration updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update configuration");
    },
  });
}

/**
 * Hook to delete a project configuration
 */
export function useDeleteProjectConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProjectConfigurationFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-configurations"] });
      toast.success("Configuration deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete configuration");
    },
  });
}

/**
 * Hook to set a configuration as default
 */
export function useSetDefaultProjectConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultProjectConfigurationFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-configurations"] });
      toast.success("Default configuration updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to set default configuration"
      );
    },
  });
}

/**
 * Hook to duplicate a configuration
 */
export function useDuplicateProjectConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, name }: { sourceId: string; name: string }) =>
      duplicateProjectConfigurationFn({ data: { sourceId, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-configurations"] });
      toast.success("Configuration duplicated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate configuration"
      );
    },
  });
}
