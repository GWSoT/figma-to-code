import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
    },
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackStart(),
      nitro(),
      viteReact(),
    ],
    css: {
      modules: {
        // Use camelCase for class names in JS/TS
        localsConvention: "camelCaseOnly",
        // Generate scoped class names with BEM-like naming convention
        // Format: [component]_[class]_[hash]
        generateScopedName:
          mode === "production"
            ? "[hash:base64:8]"
            : "[name]__[local]___[hash:base64:5]",
        // Enable global mode for :global() selectors
        globalModulePaths: [/\.global\.css$/],
      },
    },
  };
});
