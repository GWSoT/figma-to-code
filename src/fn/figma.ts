import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findFigmaAccountsByUserId,
  findFigmaAccountById,
  findDefaultFigmaAccount,
  findFigmaTeamsByAccountId,
  findFigmaProjectsByAccountId,
  findFigmaTeamsWithProjects,
  findPersonalProjects,
  upsertFigmaTeam,
  upsertFigmaProject,
  isCacheStale,
  updateFigmaAccountLastUsed,
  updateFigmaAccount,
  type FigmaTeamWithProjects,
} from "~/data-access/figma-accounts";
import {
  FigmaApiClient,
  getPermissionLevel,
  getProjectType,
} from "~/utils/figma-api";
import type { FigmaAccount, FigmaTeam, FigmaProject } from "~/db/schema";

// ============================================
// Types for API responses
// ============================================

export interface FigmaTeamsAndProjectsResponse {
  account: Pick<FigmaAccount, "id" | "figmaEmail" | "figmaHandle" | "figmaImgUrl" | "label">;
  teams: FigmaTeamWithProjects[];
  personalProjects: FigmaProject[];
  cacheStatus: "fresh" | "stale" | "refreshed";
}

// Note: getFigmaAccountsFn is defined in fn/figma-accounts.ts

// ============================================
// Get Teams and Projects for an Account
// ============================================

export const getFigmaTeamsAndProjectsFn = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      accountId: z.string().optional(),
      forceRefresh: z.boolean().optional().default(false),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<FigmaTeamsAndProjectsResponse> => {
    // Get the account - either specified or default
    let account: FigmaAccount | null;
    
    if (data.accountId) {
      account = await findFigmaAccountById(data.accountId);
      if (!account || account.userId !== context.userId) {
        throw new Error("Figma account not found or unauthorized");
      }
    } else {
      account = await findDefaultFigmaAccount(context.userId);
      if (!account) {
        // Try to get any account
        const accounts = await findFigmaAccountsByUserId(context.userId);
        account = accounts[0] || null;
      }
    }

    if (!account) {
      throw new Error("No Figma account connected. Please connect your Figma account first.");
    }

    // Check if we need to refresh the cache
    const teams = await findFigmaTeamsByAccountId(account.id);
    const needsRefresh = data.forceRefresh || 
      teams.length === 0 || 
      teams.some((t) => isCacheStale(t.cachedAt));

    let cacheStatus: "fresh" | "stale" | "refreshed" = "fresh";

    if (needsRefresh) {
      try {
        // Refresh token if needed
        let accessToken = account.accessToken;
        if (new Date() >= account.accessTokenExpiresAt) {
          const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
          accessToken = refreshed.accessToken;
          
          // Update the stored token
          await updateFigmaAccount(account.id, {
            accessToken: refreshed.accessToken,
            accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
          });
        }

        // Fetch fresh data from Figma API
        const client = new FigmaApiClient(accessToken);
        
        // Get user info to find their teams
        // Note: Figma's API doesn't have a direct "get my teams" endpoint
        // Users typically know their team IDs or we need to store them during OAuth
        // For now, we'll work with cached data or require team IDs
        
        // Update last used timestamp
        await updateFigmaAccountLastUsed(account.id);
        
        cacheStatus = "refreshed";
      } catch (error) {
        console.error("Failed to refresh Figma data:", error);
        cacheStatus = "stale";
      }
    }

    // Get cached data
    const teamsWithProjects = await findFigmaTeamsWithProjects(account.id);
    const personalProjects = await findPersonalProjects(account.id);

    return {
      account: {
        id: account.id,
        figmaEmail: account.figmaEmail,
        figmaHandle: account.figmaHandle,
        figmaImgUrl: account.figmaImgUrl,
        label: account.label,
      },
      teams: teamsWithProjects,
      personalProjects,
      cacheStatus,
    };
  });

// ============================================
// Sync Team Data from Figma
// ============================================

export const syncFigmaTeamFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      accountId: z.string(),
      teamId: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const account = await findFigmaAccountById(data.accountId);
    if (!account || account.userId !== context.userId) {
      throw new Error("Figma account not found or unauthorized");
    }

    // Refresh token if needed
    let accessToken = account.accessToken;
    if (new Date() >= account.accessTokenExpiresAt) {
      const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
      accessToken = refreshed.accessToken;
      
      await updateFigmaAccount(account.id, {
        accessToken: refreshed.accessToken,
        accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      });
    }

    const client = new FigmaApiClient(accessToken);

    // Fetch team info
    const teamInfo = await client.getTeam(data.teamId);
    
    // Fetch team members to get member count and user's permission
    const members = await client.getTeamMembers(data.teamId);
    const currentUserMember = members.members.find(
      (m) => m.user.id === account.figmaUserId
    );

    // Upsert team
    const team = await upsertFigmaTeam({
      id: data.teamId,
      figmaAccountId: account.id,
      name: teamInfo.name,
      memberCount: members.members.length,
      permissionLevel: currentUserMember 
        ? getPermissionLevel(currentUserMember.role)
        : "viewer",
    });

    // Fetch and sync projects
    const projectsResponse = await client.getTeamProjects(data.teamId);
    const projects: FigmaProject[] = [];

    for (const project of projectsResponse.projects) {
      // Fetch file count for each project
      const files = await client.getProjectFiles(project.id);
      
      const syncedProject = await upsertFigmaProject({
        id: project.id,
        figmaAccountId: account.id,
        teamId: data.teamId,
        name: project.name,
        fileCount: files.files.length,
        projectType: "team",
      });
      
      projects.push(syncedProject);
    }

    // Update last used timestamp
    await updateFigmaAccountLastUsed(account.id);

    return {
      team,
      projects,
    };
  });

// ============================================
// Add Team by ID
// ============================================

export const addFigmaTeamFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      accountId: z.string(),
      teamId: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const account = await findFigmaAccountById(data.accountId);
    if (!account || account.userId !== context.userId) {
      throw new Error("Figma account not found or unauthorized");
    }

    // Refresh token if needed
    let accessToken = account.accessToken;
    if (new Date() >= account.accessTokenExpiresAt) {
      const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
      accessToken = refreshed.accessToken;
      
      await updateFigmaAccount(account.id, {
        accessToken: refreshed.accessToken,
        accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      });
    }

    const client = new FigmaApiClient(accessToken);

    try {
      // Fetch team info to verify access
      const teamInfo = await client.getTeam(data.teamId);
      
      // Fetch team members
      const members = await client.getTeamMembers(data.teamId);
      const currentUserMember = members.members.find(
        (m) => m.user.id === account.figmaUserId
      );

      // Upsert team
      const team = await upsertFigmaTeam({
        id: data.teamId,
        figmaAccountId: account.id,
        name: teamInfo.name,
        memberCount: members.members.length,
        permissionLevel: currentUserMember 
          ? getPermissionLevel(currentUserMember.role)
          : "viewer",
      });

      // Fetch and sync projects
      const projectsResponse = await client.getTeamProjects(data.teamId);
      const projects: FigmaProject[] = [];

      for (const project of projectsResponse.projects) {
        const files = await client.getProjectFiles(project.id);
        
        const syncedProject = await upsertFigmaProject({
          id: project.id,
          figmaAccountId: account.id,
          teamId: data.teamId,
          name: project.name,
          fileCount: files.files.length,
          projectType: "team",
        });
        
        projects.push(syncedProject);
      }

      return {
        success: true,
        team,
        projects,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("403")) {
        throw new Error("You don't have access to this team. Please check the team ID and your permissions.");
      }
      throw error;
    }
  });

// ============================================
// Refresh All Cached Data
// ============================================

export const refreshFigmaCacheFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      accountId: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const account = await findFigmaAccountById(data.accountId);
    if (!account || account.userId !== context.userId) {
      throw new Error("Figma account not found or unauthorized");
    }

    // Get all cached teams
    const teams = await findFigmaTeamsByAccountId(account.id);
    
    // Refresh each team
    for (const team of teams) {
      try {
        // Use the sync function logic
        let accessToken = account.accessToken;
        if (new Date() >= account.accessTokenExpiresAt) {
          const refreshed = await FigmaApiClient.refreshAccessToken(account.refreshToken);
          accessToken = refreshed.accessToken;
          
          await updateFigmaAccount(account.id, {
            accessToken: refreshed.accessToken,
            accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
          });
        }

        const client = new FigmaApiClient(accessToken);
        
        const teamInfo = await client.getTeam(team.id);
        const members = await client.getTeamMembers(team.id);
        const currentUserMember = members.members.find(
          (m) => m.user.id === account.figmaUserId
        );

        await upsertFigmaTeam({
          id: team.id,
          figmaAccountId: account.id,
          name: teamInfo.name,
          memberCount: members.members.length,
          permissionLevel: currentUserMember 
            ? getPermissionLevel(currentUserMember.role)
            : team.permissionLevel,
        });

        // Refresh projects
        const projectsResponse = await client.getTeamProjects(team.id);
        for (const project of projectsResponse.projects) {
          const files = await client.getProjectFiles(project.id);
          
          await upsertFigmaProject({
            id: project.id,
            figmaAccountId: account.id,
            teamId: team.id,
            name: project.name,
            fileCount: files.files.length,
            projectType: "team",
          });
        }
      } catch (error) {
        console.error(`Failed to refresh team ${team.id}:`, error);
        // Continue with other teams even if one fails
      }
    }

    // Update last used timestamp
    await updateFigmaAccountLastUsed(account.id);

    return { success: true };
  });
