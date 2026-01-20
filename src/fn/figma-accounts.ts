import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import { privateEnv } from "~/config/privateEnv";
import { publicEnv } from "~/config/publicEnv";
import {
  findFigmaAccountsByUserId,
  findFigmaAccountById,
  updateFigmaAccount,
  setDefaultFigmaAccount,
  deleteFigmaAccount,
  type FigmaAccountPublic,
} from "~/data-access/figma-accounts";
import type { FigmaAccount } from "~/db/schema";

const FIGMA_AUTH_URL = "https://www.figma.com/oauth";
const FIGMA_SCOPES = ["files:read", "file_variables:read", "file_dev_resources:read"];

/**
 * Strips sensitive token data from a Figma account for public response
 */
function toPublicAccount(account: FigmaAccount): FigmaAccountPublic {
  const { accessToken, refreshToken, ...publicData } = account;
  return publicData;
}

/**
 * Generates the Figma OAuth authorization URL
 */
export const getFigmaAuthUrlFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;

    const redirectUri = `${publicEnv.BETTER_AUTH_URL}/api/figma/callback`;

    const params = new URLSearchParams({
      client_id: privateEnv.FIGMA_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: FIGMA_SCOPES.join(","),
      state: userId, // Use userId as state for CSRF protection
      response_type: "code",
    });

    return { url: `${FIGMA_AUTH_URL}?${params.toString()}` };
  });

/**
 * Gets all Figma accounts for the authenticated user
 */
export const getFigmaAccountsFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<FigmaAccountPublic[]> => {
    const { userId } = context;
    const accounts = await findFigmaAccountsByUserId(userId);
    return accounts.map(toPublicAccount);
  });

/**
 * Updates a Figma account's label
 */
export const updateFigmaAccountLabelFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accountId: z.string().uuid(),
      label: z.string().max(50).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<FigmaAccountPublic> => {
    const { userId } = context;
    const { accountId, label } = data;

    // Verify ownership
    const account = await findFigmaAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Figma account not found");
    }

    const updated = await updateFigmaAccount(accountId, { label });
    return toPublicAccount(updated);
  });

/**
 * Sets a Figma account as the default
 */
export const setDefaultFigmaAccountFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accountId: z.string().uuid(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<void> => {
    const { userId } = context;
    const { accountId } = data;

    // Verify ownership
    const account = await findFigmaAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Figma account not found");
    }

    await setDefaultFigmaAccount(userId, accountId);
  });

/**
 * Disconnects (deletes) a Figma account
 */
export const disconnectFigmaAccountFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accountId: z.string().uuid(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }): Promise<void> => {
    const { userId } = context;
    const { accountId } = data;

    // Verify ownership
    const account = await findFigmaAccountById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Figma account not found");
    }

    await deleteFigmaAccount(accountId);

    // If this was the default account, set a new default
    if (account.isDefault) {
      const remainingAccounts = await findFigmaAccountsByUserId(userId);
      if (remainingAccounts.length > 0) {
        await setDefaultFigmaAccount(userId, remainingAccounts[0].id);
      }
    }
  });
