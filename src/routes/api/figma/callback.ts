import { createFileRoute, redirect } from "@tanstack/react-router";
import { privateEnv } from "~/config/privateEnv";
import { publicEnv } from "~/config/publicEnv";
import { auth } from "~/utils/auth";
import {
  createFigmaAccount,
  updateFigmaAccount,
  findFigmaAccountsByUserId,
} from "~/data-access/figma-accounts";
import { encrypt } from "~/utils/encryption";

const FIGMA_TOKEN_URL = "https://api.figma.com/v1/oauth/token";
const FIGMA_USER_URL = "https://api.figma.com/v1/me";

export const Route = createFileRoute("/api/figma/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        // Handle OAuth errors
        if (error) {
          console.error("Figma OAuth error:", error, errorDescription);
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set("figma_error", errorDescription || error);
          return Response.redirect(errorUrl.toString(), 302);
        }

        if (!code || !state) {
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set("figma_error", "Missing authorization code");
          return Response.redirect(errorUrl.toString(), 302);
        }

        // Verify user session
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return Response.redirect(`${publicEnv.BETTER_AUTH_URL}/sign-in`, 302);
        }

        // Verify state matches user ID (CSRF protection)
        if (state !== session.user.id) {
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set("figma_error", "Invalid state parameter");
          return Response.redirect(errorUrl.toString(), 302);
        }

        try {
          // Exchange code for tokens
          const redirectUri = `${publicEnv.BETTER_AUTH_URL}/api/figma/callback`;
          const tokenResponse = await fetch(FIGMA_TOKEN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: privateEnv.FIGMA_CLIENT_ID,
              client_secret: privateEnv.FIGMA_CLIENT_SECRET,
              redirect_uri: redirectUri,
              code,
              grant_type: "authorization_code",
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("Figma token exchange failed:", errorData);
            throw new Error("Failed to exchange authorization code");
          }

          const tokenData = await tokenResponse.json();
          const { access_token, refresh_token, expires_in } = tokenData;

          // Get Figma user info
          const userResponse = await fetch(FIGMA_USER_URL, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error("Failed to fetch Figma user info");
          }

          const figmaUser = await userResponse.json();

          // Calculate token expiration (expires_in is in seconds)
          const expiresAt = new Date(Date.now() + expires_in * 1000);

          // Encrypt tokens before storage
          const encryptedAccessToken = encrypt(access_token);
          const encryptedRefreshToken = encrypt(refresh_token);

          // Check if this Figma account already exists for this user
          const existingAccounts = await findFigmaAccountsByUserId(session.user.id);
          const existingAccount = existingAccounts.find(
            (acc) => acc.figmaUserId === figmaUser.id
          );

          if (existingAccount) {
            // Update existing account with new tokens
            await updateFigmaAccount(existingAccount.id, {
              figmaEmail: figmaUser.email,
              figmaHandle: figmaUser.handle,
              figmaImgUrl: figmaUser.img_url,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
              accessTokenExpiresAt: expiresAt,
            });
          } else {
            // Create new Figma account
            const isDefault = existingAccounts.length === 0;
            await createFigmaAccount({
              id: crypto.randomUUID(),
              userId: session.user.id,
              figmaUserId: figmaUser.id,
              figmaEmail: figmaUser.email,
              figmaHandle: figmaUser.handle,
              figmaImgUrl: figmaUser.img_url,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
              accessTokenExpiresAt: expiresAt,
              isDefault,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          // Redirect to settings with success message
          const successUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          successUrl.searchParams.set("figma_success", "true");
          return Response.redirect(successUrl.toString(), 302);
        } catch (error) {
          console.error("Figma OAuth callback error:", error);
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set(
            "figma_error",
            error instanceof Error ? error.message : "Failed to connect Figma account"
          );
          return Response.redirect(errorUrl.toString(), 302);
        }
      },
    },
  },
});
