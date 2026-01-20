import { privateEnv } from "~/config/privateEnv";
import {
  findFigmaAccountById,
  findDefaultFigmaAccount,
  updateFigmaAccount,
  updateFigmaAccountLastUsed,
} from "~/data-access/figma-accounts";
import { decrypt, encrypt } from "~/utils/encryption";
import type { FigmaAccount } from "~/db/schema";

const FIGMA_TOKEN_URL = "https://api.figma.com/v1/oauth/refresh";
// Refresh tokens 5 minutes before expiration
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export interface FigmaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface FigmaApiConfig {
  accessToken: string;
  accountId: string;
}

/**
 * Refreshes a Figma access token using the refresh token.
 * Returns the new token data.
 */
export async function refreshFigmaToken(
  refreshToken: string
): Promise<FigmaTokens> {
  const response = await fetch(FIGMA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: privateEnv.FIGMA_CLIENT_ID,
      client_secret: privateEnv.FIGMA_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Figma token refresh failed:", errorText);
    throw new Error("Failed to refresh Figma access token");
  }

  const data = await response.json();
  const { access_token, refresh_token, expires_in } = data;

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: new Date(Date.now() + expires_in * 1000),
  };
}

/**
 * Checks if a token is expired or about to expire
 */
function isTokenExpired(expiresAt: Date): boolean {
  return Date.now() + TOKEN_EXPIRY_BUFFER_MS >= expiresAt.getTime();
}

/**
 * Gets decrypted tokens from an account
 */
function getDecryptedTokens(account: FigmaAccount): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: decrypt(account.accessToken),
    refreshToken: decrypt(account.refreshToken),
  };
}

/**
 * Gets a valid access token for a Figma account, refreshing if necessary.
 * This is the main function to use when making Figma API calls.
 */
export async function getValidFigmaToken(
  accountId: string
): Promise<FigmaApiConfig | null> {
  const account = await findFigmaAccountById(accountId);
  if (!account) {
    return null;
  }

  const tokens = getDecryptedTokens(account);

  // Check if token needs refresh
  if (isTokenExpired(account.accessTokenExpiresAt)) {
    try {
      const newTokens = await refreshFigmaToken(tokens.refreshToken);

      // Encrypt new tokens before storing
      const encryptedAccessToken = encrypt(newTokens.accessToken);
      const encryptedRefreshToken = encrypt(newTokens.refreshToken);

      // Update tokens in database
      await updateFigmaAccount(accountId, {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        accessTokenExpiresAt: newTokens.expiresAt,
      });

      // Update last used timestamp
      await updateFigmaAccountLastUsed(accountId);

      return {
        accessToken: newTokens.accessToken,
        accountId,
      };
    } catch (error) {
      console.error("Failed to refresh Figma token:", error);
      // Token refresh failed - the account may need to be re-linked
      throw new Error(
        "Figma token expired and refresh failed. Please reconnect your Figma account."
      );
    }
  }

  // Token is still valid
  await updateFigmaAccountLastUsed(accountId);
  return {
    accessToken: tokens.accessToken,
    accountId,
  };
}

/**
 * Gets a valid access token for a user's default Figma account.
 * Useful when you don't have a specific account selected.
 */
export async function getDefaultFigmaToken(
  userId: string
): Promise<FigmaApiConfig | null> {
  const account = await findDefaultFigmaAccount(userId);
  if (!account) {
    return null;
  }

  return getValidFigmaToken(account.id);
}

/**
 * Makes an authenticated request to the Figma API with automatic token refresh.
 */
export async function figmaFetch(
  accountId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = await getValidFigmaToken(accountId);
  if (!config) {
    throw new Error("Figma account not found or invalid");
  }

  const response = await fetch(`https://api.figma.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${config.accessToken}`,
    },
  });

  // If we get a 401, the token may have been revoked
  if (response.status === 401) {
    throw new Error(
      "Figma authorization failed. Please reconnect your Figma account."
    );
  }

  return response;
}
