import { createFileRoute } from "@tanstack/react-router";
import { privateEnv } from "~/config/privateEnv";
import { publicEnv } from "~/config/publicEnv";
import { auth } from "~/utils/auth";
import {
  createGitHubAccount,
  updateGitHubAccount,
  findGitHubAccountsByUserId,
} from "~/data-access/github-accounts";
import { encrypt } from "~/utils/encryption";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

export const Route = createFileRoute("/api/github/callback")({
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
          console.error("GitHub OAuth error:", error, errorDescription);
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set("github_error", errorDescription || error);
          return Response.redirect(errorUrl.toString(), 302);
        }

        if (!code || !state) {
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set("github_error", "Missing authorization code");
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
          errorUrl.searchParams.set("github_error", "Invalid state parameter");
          return Response.redirect(errorUrl.toString(), 302);
        }

        try {
          // Exchange code for tokens
          const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: privateEnv.GITHUB_CLIENT_ID,
              client_secret: privateEnv.GITHUB_CLIENT_SECRET,
              code,
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("GitHub token exchange failed:", errorData);
            throw new Error("Failed to exchange authorization code");
          }

          const tokenData = await tokenResponse.json();

          if (tokenData.error) {
            console.error("GitHub token error:", tokenData.error_description);
            throw new Error(tokenData.error_description || "Failed to get access token");
          }

          const { access_token, refresh_token, expires_in, scope } = tokenData;

          // Get GitHub user info
          const userResponse = await fetch(GITHUB_USER_URL, {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "Figma-to-Code-App",
            },
          });

          if (!userResponse.ok) {
            throw new Error("Failed to fetch GitHub user info");
          }

          const githubUser = await userResponse.json();

          // Calculate token expiration (if provided)
          const expiresAt = expires_in
            ? new Date(Date.now() + expires_in * 1000)
            : undefined;

          // Encrypt tokens before storage
          const encryptedAccessToken = encrypt(access_token);
          const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;

          // Check if this GitHub account already exists for this user
          const existingAccounts = await findGitHubAccountsByUserId(session.user.id);
          const existingAccount = existingAccounts.find(
            (acc) => acc.githubUserId === String(githubUser.id)
          );

          if (existingAccount) {
            // Update existing account with new tokens
            await updateGitHubAccount(existingAccount.id, {
              githubUsername: githubUser.login,
              githubEmail: githubUser.email,
              githubAvatarUrl: githubUser.avatar_url,
              githubName: githubUser.name,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
              accessTokenExpiresAt: expiresAt,
              scopes: scope || null,
              status: "active",
            });
          } else {
            // Create new GitHub account
            const isDefault = existingAccounts.length === 0;
            await createGitHubAccount({
              id: crypto.randomUUID(),
              userId: session.user.id,
              githubUserId: String(githubUser.id),
              githubUsername: githubUser.login,
              githubEmail: githubUser.email,
              githubAvatarUrl: githubUser.avatar_url,
              githubName: githubUser.name,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
              accessTokenExpiresAt: expiresAt,
              scopes: scope || null,
              isDefault,
              status: "active",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          // Redirect to settings with success message
          const successUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          successUrl.searchParams.set("github_success", "true");
          return Response.redirect(successUrl.toString(), 302);
        } catch (error) {
          console.error("GitHub OAuth callback error:", error);
          const errorUrl = new URL("/dashboard/settings", publicEnv.BETTER_AUTH_URL);
          errorUrl.searchParams.set(
            "github_error",
            error instanceof Error ? error.message : "Failed to connect GitHub account"
          );
          return Response.redirect(errorUrl.toString(), 302);
        }
      },
    },
  },
});
