export const publicEnv = {
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL,
  STRIPE_BASIC_PRICE_ID: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
  STRIPE_PRO_PRICE_ID: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
  R2_ENDPOINT: import.meta.env.VITE_R2_ENDPOINT!,
  R2_BUCKET: import.meta.env.VITE_R2_BUCKET!,
  // Figma OAuth - only client ID is public
  FIGMA_CLIENT_ID: import.meta.env.VITE_FIGMA_CLIENT_ID,
};
