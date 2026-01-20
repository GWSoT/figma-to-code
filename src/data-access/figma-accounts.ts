import { eq, and, isNull } from "drizzle-orm";
import { database } from "~/db";
import {
  figmaAccount,
  figmaTeam,
  figmaProject,
  type FigmaAccount,
  type CreateFigmaAccountData,
  type UpdateFigmaAccountData,
  type FigmaTeam,
  type CreateFigmaTeamData,
  type UpdateFigmaTeamData,
  type FigmaProject,
  type CreateFigmaProjectData,
  type UpdateFigmaProjectData,
} from "~/db/schema";

// Public representation of a Figma account (without sensitive tokens)
export type FigmaAccountPublic = Omit<
  FigmaAccount,
  "accessToken" | "refreshToken"
>;

/**
 * Strips sensitive token data from a Figma account for public response
 */
function stripSensitiveData(account: FigmaAccount): FigmaAccountPublic {
  const { accessToken, refreshToken, ...publicData } = account;
  return publicData;
}

// ============================================
// Figma Account Data Access
// ============================================

export async function findFigmaAccountById(
  id: string
): Promise<FigmaAccount | null> {
  const [result] = await database
    .select()
    .from(figmaAccount)
    .where(eq(figmaAccount.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaAccountsByUserId(
  userId: string
): Promise<FigmaAccount[]> {
  return await database
    .select()
    .from(figmaAccount)
    .where(eq(figmaAccount.userId, userId))
    .orderBy(figmaAccount.createdAt);
}

export async function findDefaultFigmaAccount(
  userId: string
): Promise<FigmaAccount | null> {
  const [result] = await database
    .select()
    .from(figmaAccount)
    .where(
      and(eq(figmaAccount.userId, userId), eq(figmaAccount.isDefault, true))
    )
    .limit(1);

  return result || null;
}

export async function createFigmaAccount(
  data: CreateFigmaAccountData
): Promise<FigmaAccount> {
  const [newAccount] = await database
    .insert(figmaAccount)
    .values(data)
    .returning();

  return newAccount;
}

export async function updateFigmaAccount(
  id: string,
  data: UpdateFigmaAccountData
): Promise<FigmaAccount> {
  const [updatedAccount] = await database
    .update(figmaAccount)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(figmaAccount.id, id))
    .returning();

  return updatedAccount;
}

export async function deleteFigmaAccount(id: string): Promise<void> {
  await database.delete(figmaAccount).where(eq(figmaAccount.id, id));
}

/**
 * Sets a Figma account as the default for a user.
 * Unsets any other default account.
 */
export async function setDefaultFigmaAccount(
  userId: string,
  accountId: string
): Promise<void> {
  // Unset all defaults for this user
  await database
    .update(figmaAccount)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(figmaAccount.userId, userId));

  // Set the new default
  await database
    .update(figmaAccount)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(figmaAccount.id, accountId));
}

export async function updateFigmaAccountLastUsed(id: string): Promise<void> {
  await database
    .update(figmaAccount)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(figmaAccount.id, id));
}

// ============================================
// Figma Team Data Access
// ============================================

export async function findFigmaTeamById(id: string): Promise<FigmaTeam | null> {
  const [result] = await database
    .select()
    .from(figmaTeam)
    .where(eq(figmaTeam.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaTeamsByAccountId(
  figmaAccountId: string
): Promise<FigmaTeam[]> {
  return await database
    .select()
    .from(figmaTeam)
    .where(eq(figmaTeam.figmaAccountId, figmaAccountId))
    .orderBy(figmaTeam.name);
}

export async function upsertFigmaTeam(
  data: CreateFigmaTeamData
): Promise<FigmaTeam> {
  const [result] = await database
    .insert(figmaTeam)
    .values(data)
    .onConflictDoUpdate({
      target: figmaTeam.id,
      set: {
        name: data.name,
        memberCount: data.memberCount,
        permissionLevel: data.permissionLevel,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function deleteFigmaTeam(id: string): Promise<void> {
  await database.delete(figmaTeam).where(eq(figmaTeam.id, id));
}

export async function deleteFigmaTeamsByAccountId(
  figmaAccountId: string
): Promise<void> {
  await database
    .delete(figmaTeam)
    .where(eq(figmaTeam.figmaAccountId, figmaAccountId));
}

// ============================================
// Figma Project Data Access
// ============================================

export async function findFigmaProjectById(
  id: string
): Promise<FigmaProject | null> {
  const [result] = await database
    .select()
    .from(figmaProject)
    .where(eq(figmaProject.id, id))
    .limit(1);

  return result || null;
}

export async function findFigmaProjectsByAccountId(
  figmaAccountId: string
): Promise<FigmaProject[]> {
  return await database
    .select()
    .from(figmaProject)
    .where(eq(figmaProject.figmaAccountId, figmaAccountId))
    .orderBy(figmaProject.name);
}

export async function findFigmaProjectsByTeamId(
  teamId: string
): Promise<FigmaProject[]> {
  return await database
    .select()
    .from(figmaProject)
    .where(eq(figmaProject.teamId, teamId))
    .orderBy(figmaProject.name);
}

export async function upsertFigmaProject(
  data: CreateFigmaProjectData
): Promise<FigmaProject> {
  const [result] = await database
    .insert(figmaProject)
    .values(data)
    .onConflictDoUpdate({
      target: figmaProject.id,
      set: {
        name: data.name,
        teamId: data.teamId,
        fileCount: data.fileCount,
        projectType: data.projectType,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

export async function deleteFigmaProject(id: string): Promise<void> {
  await database.delete(figmaProject).where(eq(figmaProject.id, id));
}

export async function deleteFigmaProjectsByAccountId(
  figmaAccountId: string
): Promise<void> {
  await database
    .delete(figmaProject)
    .where(eq(figmaProject.figmaAccountId, figmaAccountId));
}

export async function deleteFigmaProjectsByTeamId(
  teamId: string
): Promise<void> {
  await database.delete(figmaProject).where(eq(figmaProject.teamId, teamId));
}

// ============================================
// Combined Team/Project Queries
// ============================================

export type FigmaTeamWithProjects = FigmaTeam & {
  projects: FigmaProject[];
};

export async function findFigmaTeamsWithProjects(
  figmaAccountId: string
): Promise<FigmaTeamWithProjects[]> {
  const teams = await findFigmaTeamsByAccountId(figmaAccountId);
  const projects = await findFigmaProjectsByAccountId(figmaAccountId);

  return teams.map((team) => ({
    ...team,
    projects: projects.filter((p) => p.teamId === team.id),
  }));
}

// Get all personal projects (projects without a team)
export async function findPersonalProjects(
  figmaAccountId: string
): Promise<FigmaProject[]> {
  return await database
    .select()
    .from(figmaProject)
    .where(
      and(
        eq(figmaProject.figmaAccountId, figmaAccountId),
        isNull(figmaProject.teamId)
      )
    )
    .orderBy(figmaProject.name);
}

// Check if cache is stale (older than specified minutes)
const CACHE_TTL_MINUTES = 15;

export function isCacheStale(cachedAt: Date): boolean {
  const now = new Date();
  const ageInMinutes = (now.getTime() - cachedAt.getTime()) / (1000 * 60);
  return ageInMinutes > CACHE_TTL_MINUTES;
}
