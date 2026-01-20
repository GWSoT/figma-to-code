/**
 * Code Export Utility
 *
 * Generates downloadable ZIP files containing generated code components,
 * styles, assets, and configuration files with proper directory structure.
 */

import JSZip from "jszip";
import type {
  GeneratedFile,
  FrameworkType,
  StylingType,
  CodeGenerationConfig,
} from "./code-generation-agent/types";

// ============================================================================
// Types
// ============================================================================

export interface CodeExportOptions {
  /** Component name for the export */
  componentName: string;
  /** Target framework */
  framework: FrameworkType;
  /** Styling approach */
  styling: StylingType;
  /** Include setup instructions README */
  includeReadme: boolean;
  /** Include configuration files */
  includeConfig: boolean;
  /** Design tokens to include */
  designTokens?: DesignTokenExport[];
  /** Assets to include (URLs with names) */
  assets?: AssetExport[];
}

export interface DesignTokenExport {
  name: string;
  value: string;
  type: "color" | "fontSize" | "spacing" | "borderRadius" | "boxShadow" | "fontFamily" | "fontWeight" | "lineHeight";
}

export interface AssetExport {
  name: string;
  url: string;
  type: "image" | "icon" | "font";
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  fileCount: number;
  totalSize: number;
}

// ============================================================================
// README Templates
// ============================================================================

const getReadmeTemplate = (
  componentName: string,
  framework: FrameworkType,
  styling: StylingType,
  files: GeneratedFile[]
): string => {
  const frameworkInfo = getFrameworkInfo(framework);
  const stylingInfo = getStylingInfo(styling);

  const fileList = files
    .map((f) => `- \`${f.path}\` - ${getFileDescription(f)}`)
    .join("\n");

  return `# ${componentName}

Generated component exported from Figma to Code.

## Project Structure

\`\`\`
${componentName}/
${files.map((f) => `├── ${f.path}`).join("\n")}
${hasConfig(framework, styling) ? "├── package.json\n" : ""}└── README.md
\`\`\`

## Files Included

${fileList}

## Setup Instructions

### Prerequisites

${frameworkInfo.prerequisites}

### Installation

1. Copy the component files to your project:

\`\`\`bash
cp -r ${componentName}/* your-project/src/components/
\`\`\`

2. Install required dependencies:

\`\`\`bash
${frameworkInfo.installCommand}
${stylingInfo.installCommand}
\`\`\`

### Usage

${getUsageExample(componentName, framework, styling)}

## Customization

### Design Tokens

The component uses design tokens that can be customized:

- Colors: Update color values in your theme or CSS variables
- Typography: Adjust font sizes and families as needed
- Spacing: Modify padding and margin values

### Styling

${stylingInfo.customizationGuide}

## Framework-Specific Notes

${frameworkInfo.notes}

## Dependencies

${frameworkInfo.dependencies}

---

Generated with [Figma to Code](https://figma-to-code.dev)
`;
};

const getFrameworkInfo = (framework: FrameworkType) => {
  const info: Record<FrameworkType, {
    prerequisites: string;
    installCommand: string;
    notes: string;
    dependencies: string;
  }> = {
    react: {
      prerequisites: "- Node.js 18+\n- React 18+",
      installCommand: "npm install react react-dom",
      notes: "This component is built with React functional components and hooks. It supports TypeScript out of the box.",
      dependencies: "- react: ^18.0.0\n- react-dom: ^18.0.0",
    },
    vue: {
      prerequisites: "- Node.js 18+\n- Vue 3.x",
      installCommand: "npm install vue",
      notes: "This component uses the Vue 3 Composition API with <script setup> syntax for optimal developer experience.",
      dependencies: "- vue: ^3.0.0",
    },
    svelte: {
      prerequisites: "- Node.js 18+\n- Svelte 4.x or 5.x",
      installCommand: "npm install svelte",
      notes: "This component is built with Svelte's reactive declarations. It supports Svelte 5 runes if you're using the latest version.",
      dependencies: "- svelte: ^4.0.0 or ^5.0.0",
    },
    html: {
      prerequisites: "- Any modern web browser\n- No build tools required",
      installCommand: "# No installation needed for vanilla HTML/CSS/JS",
      notes: "This is a vanilla HTML/CSS/JavaScript component. It can be used directly in any web page without a build step.",
      dependencies: "- None (vanilla HTML/CSS/JS)",
    },
  };
  return info[framework];
};

const getStylingInfo = (styling: StylingType) => {
  const info: Record<StylingType, {
    installCommand: string;
    customizationGuide: string;
  }> = {
    tailwind: {
      installCommand: "npm install tailwindcss @tailwindcss/postcss postcss",
      customizationGuide: "Update your `tailwind.config.js` to extend the theme with custom colors, spacing, or typography. The component uses standard Tailwind utility classes.",
    },
    "styled-components": {
      installCommand: "npm install styled-components",
      customizationGuide: "Styled components are defined inline. Modify the template literals in the styled() functions to customize appearance. Consider using a ThemeProvider for centralized theming.",
    },
    "css-modules": {
      installCommand: "# CSS Modules are typically built-in with bundlers like Vite or webpack",
      customizationGuide: "Edit the `.module.css` file to customize styles. Class names are automatically scoped to prevent conflicts.",
    },
    inline: {
      installCommand: "# No additional styling dependencies needed",
      customizationGuide: "Styles are defined as JavaScript objects. Modify the style objects directly in the component to customize appearance.",
    },
    scss: {
      installCommand: "npm install sass",
      customizationGuide: "Edit the `.scss` file to customize styles. You can use SCSS features like variables, nesting, and mixins.",
    },
  };
  return info[styling];
};

const getUsageExample = (
  componentName: string,
  framework: FrameworkType,
  _styling: StylingType
): string => {
  switch (framework) {
    case "react":
      return `\`\`\`tsx
import { ${componentName} } from './components/${componentName}';

function App() {
  return (
    <${componentName}
      // Add your props here
    />
  );
}
\`\`\``;
    case "vue":
      return `\`\`\`vue
<script setup>
import ${componentName} from './components/${componentName}.vue';
</script>

<template>
  <${componentName} />
</template>
\`\`\``;
    case "svelte":
      return `\`\`\`svelte
<script>
  import ${componentName} from './components/${componentName}.svelte';
</script>

<${componentName} />
\`\`\``;
    case "html":
      return `\`\`\`html
<!-- Include the CSS -->
<link rel="stylesheet" href="styles.css">

<!-- Use the component HTML structure -->
<div class="${componentName.toLowerCase()}">
  <!-- Component content -->
</div>

<!-- Include the JavaScript if needed -->
<script src="script.js"></script>
\`\`\``;
  }
};

const getFileDescription = (file: GeneratedFile): string => {
  const descriptions: Record<GeneratedFile["type"], string> = {
    component: "Main component file",
    styles: "Component styles",
    types: "TypeScript type definitions",
    test: "Component tests",
    story: "Storybook stories",
    index: "Barrel export file",
  };
  return descriptions[file.type] || "Additional file";
};

const hasConfig = (framework: FrameworkType, _styling: StylingType): boolean => {
  return framework !== "html";
};

// ============================================================================
// Configuration Templates
// ============================================================================

const getPackageJson = (
  componentName: string,
  framework: FrameworkType,
  styling: StylingType
): string => {
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  // Framework dependencies
  switch (framework) {
    case "react":
      deps["react"] = "^18.0.0";
      deps["react-dom"] = "^18.0.0";
      devDeps["@types/react"] = "^18.0.0";
      devDeps["@types/react-dom"] = "^18.0.0";
      devDeps["typescript"] = "^5.0.0";
      break;
    case "vue":
      deps["vue"] = "^3.0.0";
      devDeps["typescript"] = "^5.0.0";
      break;
    case "svelte":
      deps["svelte"] = "^4.0.0";
      devDeps["typescript"] = "^5.0.0";
      break;
  }

  // Styling dependencies
  switch (styling) {
    case "tailwind":
      devDeps["tailwindcss"] = "^4.0.0";
      devDeps["@tailwindcss/postcss"] = "^4.0.0";
      devDeps["postcss"] = "^8.0.0";
      break;
    case "styled-components":
      deps["styled-components"] = "^6.0.0";
      devDeps["@types/styled-components"] = "^5.1.0";
      break;
    case "scss":
      devDeps["sass"] = "^1.0.0";
      break;
  }

  return JSON.stringify(
    {
      name: componentName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      private: true,
      type: "module",
      dependencies: Object.keys(deps).length > 0 ? deps : undefined,
      devDependencies: Object.keys(devDeps).length > 0 ? devDeps : undefined,
    },
    null,
    2
  );
};

const getTailwindConfig = (): string => {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.{js,ts,jsx,tsx,vue,svelte,html}",
  ],
  theme: {
    extend: {
      // Add your custom theme extensions here
    },
  },
  plugins: [],
}
`;
};

const getDesignTokensCss = (tokens: DesignTokenExport[]): string => {
  const colorTokens = tokens.filter((t) => t.type === "color");
  const spacingTokens = tokens.filter((t) => t.type === "spacing");
  const radiusTokens = tokens.filter((t) => t.type === "borderRadius");
  const fontSizeTokens = tokens.filter((t) => t.type === "fontSize");
  const fontFamilyTokens = tokens.filter((t) => t.type === "fontFamily");
  const fontWeightTokens = tokens.filter((t) => t.type === "fontWeight");
  const shadowTokens = tokens.filter((t) => t.type === "boxShadow");

  let css = `/**
 * Design Tokens
 *
 * CSS custom properties extracted from Figma design.
 * Use these variables throughout your stylesheets for consistency.
 */

:root {
`;

  if (colorTokens.length > 0) {
    css += `  /* Colors */\n`;
    colorTokens.forEach((t) => {
      css += `  --color-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (fontSizeTokens.length > 0) {
    css += `  /* Font Sizes */\n`;
    fontSizeTokens.forEach((t) => {
      css += `  --font-size-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (fontFamilyTokens.length > 0) {
    css += `  /* Font Families */\n`;
    fontFamilyTokens.forEach((t) => {
      css += `  --font-family-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (fontWeightTokens.length > 0) {
    css += `  /* Font Weights */\n`;
    fontWeightTokens.forEach((t) => {
      css += `  --font-weight-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (spacingTokens.length > 0) {
    css += `  /* Spacing */\n`;
    spacingTokens.forEach((t) => {
      css += `  --spacing-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (radiusTokens.length > 0) {
    css += `  /* Border Radius */\n`;
    radiusTokens.forEach((t) => {
      css += `  --radius-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  if (shadowTokens.length > 0) {
    css += `  /* Box Shadows */\n`;
    shadowTokens.forEach((t) => {
      css += `  --shadow-${t.name}: ${t.value};\n`;
    });
    css += "\n";
  }

  css += "}\n";

  return css;
};

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Generate a ZIP file containing all generated code files
 */
export async function generateCodeExport(
  files: GeneratedFile[],
  options: CodeExportOptions
): Promise<ExportResult> {
  const zip = new JSZip();
  const { componentName, framework, styling, includeReadme, includeConfig } = options;

  // Create component folder
  const folder = zip.folder(componentName);
  if (!folder) {
    throw new Error("Failed to create ZIP folder");
  }

  // Add all generated files
  for (const file of files) {
    folder.file(file.path, file.content);
  }

  // Add design tokens if provided
  if (options.designTokens && options.designTokens.length > 0) {
    const tokensCss = getDesignTokensCss(options.designTokens);
    folder.file("tokens.css", tokensCss);
  }

  // Add configuration files
  if (includeConfig && framework !== "html") {
    folder.file("package.json", getPackageJson(componentName, framework, styling));

    if (styling === "tailwind") {
      folder.file("tailwind.config.js", getTailwindConfig());
    }
  }

  // Add README
  if (includeReadme) {
    const readme = getReadmeTemplate(componentName, framework, styling, files);
    folder.file("README.md", readme);
  }

  // Download assets if provided
  if (options.assets && options.assets.length > 0) {
    const assetsFolder = folder.folder("assets");
    if (assetsFolder) {
      for (const asset of options.assets) {
        try {
          const response = await fetch(asset.url);
          if (response.ok) {
            const blob = await response.blob();
            assetsFolder.file(asset.name, blob);
          }
        } catch (error) {
          console.warn(`Failed to download asset: ${asset.name}`, error);
        }
      }
    }
  }

  // Generate the ZIP
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Calculate file count
  let fileCount = files.length;
  if (includeReadme) fileCount++;
  if (includeConfig && framework !== "html") {
    fileCount++; // package.json
    if (styling === "tailwind") fileCount++; // tailwind.config.js
  }
  if (options.designTokens && options.designTokens.length > 0) fileCount++;
  if (options.assets) fileCount += options.assets.length;

  return {
    blob,
    filename: `${componentName}.zip`,
    fileCount,
    totalSize: blob.size,
  };
}

/**
 * Trigger download of a ZIP blob
 */
export function downloadZip(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
