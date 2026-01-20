import { queryOptions } from "@tanstack/react-query";
import {
  getProjectConfigurationsFn,
  getProjectConfigurationFn,
  getDefaultProjectConfigurationFn,
  getTemplateConfigurationsFn,
  getSharedConfigurationsFn,
} from "~/fn/project-configurations";

export const getProjectConfigurationsQuery = () =>
  queryOptions({
    queryKey: ["project-configurations"],
    queryFn: () => getProjectConfigurationsFn(),
  });

export const getProjectConfigurationQuery = (id: string) =>
  queryOptions({
    queryKey: ["project-configuration", id],
    queryFn: () => getProjectConfigurationFn({ data: { id } }),
    enabled: !!id,
  });

export const getDefaultProjectConfigurationQuery = () =>
  queryOptions({
    queryKey: ["project-configurations", "default"],
    queryFn: () => getDefaultProjectConfigurationFn(),
  });

export const getTemplateConfigurationsQuery = () =>
  queryOptions({
    queryKey: ["project-configurations", "templates"],
    queryFn: () => getTemplateConfigurationsFn(),
  });

export const getSharedConfigurationsQuery = (teamId?: string) =>
  queryOptions({
    queryKey: ["project-configurations", "shared", teamId],
    queryFn: () => getSharedConfigurationsFn({ data: { teamId } }),
  });
