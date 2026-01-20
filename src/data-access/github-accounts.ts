import { eq, and } from "drizzle-orm";
import { database } from "~/db";
import {
  githubAccount,
  githubExport,
  type GitHubAccount,
  type CreateGitHubAccountData,
  type UpdateGitHubAccountData,
  type GitHubExport,
  type CreateGitHubExportData,
  type UpdateGitHubExportData,
} from "~/db/schema";

// Public representation of a GitHub account (without sensitive tokens)
export type GitHubAccountPublic = Omit<
  GitHubAccount,
  "accessToken" | "refreshToken"
>;

/**
 * Strips sensitive token data from a GitHub account for public response
 */
export function stripSensitiveData(account: GitHubAccount): GitHubAccountPublic {
  const { accessToken, refreshToken, ...publicData } = account;
  return publicData;
}

// ============================================
// GitHub Account Data Access
// ============================================

export async function findGitHubAccountById(
  id: string
): Promise<GitHubAccount | null> {
  const [result] = await database
    .select()
    .from(githubAccount)
    .where(eq(githubAccount.id, id))
    .limit(1);

  return result || null;
}

export async function findGitHubAccountsByUserId(
  userId: string
): Promise<GitHubAccount[]> {
  return await database
    .select()
    .from(githubAccount)
    .where(eq(githubAccount.userId, userId))
    .orderBy(githubAccount.createdAt);
}

export async function findDefaultGitHubAccount(
  userId: string
): Promise<GitHubAccount | null> {
  const [result] = await database
    .select()
    .from(githubAccount)
    .where(
      and(eq(githubAccount.userId, userId), eq(githubAccount.isDefault, true))
    )
    .limit(1);

  return result || null;
}

export async function findGitHubAccountByGitHubUserId(
  userId: string,
  githubUserId: string
): Promise<GitHubAccount | null> {
  const [result] = await database
    .select()
    .from(githubAccount)
    .where(
      and(
        eq(githubAccount.userId, userId),
        eq(githubAccount.githubUserId, githubUserId)
      )
    )
    .limit(1);

  return result || null;
}

export async function createGitHubAccount(
  data: CreateGitHubAccountData
): Promise<GitHubAccount> {
  const [newAccount] = await database
    .insert(githubAccount)
    .values(data)
    .returning();

  return newAccount;
}

export async function updateGitHubAccount(
  id: string,
  data: UpdateGitHubAccountData
): Promise<GitHubAccount> {
  const [updatedAccount] = await database
    .update(githubAccount)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(githubAccount.id, id))
    .returning();

  return updatedAccount;
}

export async function deleteGitHubAccount(id: string): Promise<void> {
  await database.delete(githubAccount).where(eq(githubAccount.id, id));
}

/**
 * Sets a GitHub account as the default for a user.
 * Unsets any other default account.
 */
export async function setDefaultGitHubAccount(
  userId: string,
  accountId: string
): Promise<void> {
  // Unset all defaults for this user
  await database
    .update(githubAccount)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(githubAccount.userId, userId));

  // Set the new default
  await database
    .update(githubAccount)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(githubAccount.id, accountId));
}

export async function updateGitHubAccountLastUsed(id: string): Promise<void> {
  await database
    .update(githubAccount)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(githubAccount.id, id));
}

// ============================================
// GitHub Export Data Access
// ============================================

export async function findGitHubExportById(
  id: string
): Promise<GitHubExport | null> {
  const [result] = await database
    .select()
    .from(githubExport)
    .where(eq(githubExport.id, id))
    .limit(1);

  return result || null;
}

export async function findGitHubExportsByUserId(
  userId: string,
  limit = 50
): Promise<GitHubExport[]> {
  return await database
    .select()
    .from(githubExport)
    .where(eq(githubExport.userId, userId))
    .orderBy(githubExport.createdAt)
    .limit(limit);
}

export async function findGitHubExportsByAccountId(
  githubAccountId: string
): Promise<GitHubExport[]> {
  return await database
    .select()
    .from(githubExport)
    .where(eq(githubExport.githubAccountId, githubAccountId))
    .orderBy(githubExport.createdAt);
}

export async function createGitHubExport(
  data: CreateGitHubExportData
): Promise<GitHubExport> {
  const [newExport] = await database
    .insert(githubExport)
    .values(data)
    .returning();

  return newExport;
}

export async function updateGitHubExport(
  id: string,
  data: UpdateGitHubExportData
): Promise<GitHubExport> {
  const [updatedExport] = await database
    .update(githubExport)
    .set(data)
    .where(eq(githubExport.id, id))
    .returning();

  return updatedExport;
}

export async function deleteGitHubExport(id: string): Promise<void> {
  await database.delete(githubExport).where(eq(githubExport.id, id));
}
