export const privateEnv = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Better Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,

  // Figma OAuth
  FIGMA_CLIENT_ID: process.env.FIGMA_CLIENT_ID!,
  FIGMA_CLIENT_SECRET: process.env.FIGMA_CLIENT_SECRET!,
  // Encryption key for storing OAuth tokens (32 bytes hex-encoded = 64 chars)
  TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY!,
} as const;
