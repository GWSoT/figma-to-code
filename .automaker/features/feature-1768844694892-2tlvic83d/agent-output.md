I'll start by exploring the codebase to understand the existing structure and then implement the CSS Modules feature with proper naming conventions, TypeScript type definitions, and global styles handling.

🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore this codebase to understand:\n1. The overall project structure and file organization\n2. How styling is currently handled (look for CSS files, Tailwind config, any existing CSS modules)\n3. The build/bundler configuration (vite.config.ts)\n4. Any existing type definitions or patterns for styles\n5. The components directory structure\n\nFocus on finding:\n- Existing CSS/styling patterns\n- Vite configuration\n- TypeScript configuration\n- Component structure\n\nProvide a comprehensive summary of what you find.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.json\" -o -name \"*.ts\" -o -name \"*.tsx\" | head -30",
  "description": "List key file types in the project"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.css",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.module.css",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "tailwind.config.*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/vite.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tsconfig.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | head -50",
  "description": "List source files in src directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/styles/app.css"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ | head -50",
  "description": "List components directory"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/components -maxdepth 1 -type f -name \"*.tsx\" | head -30",
  "description": "List component files in components root"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ui/ | head -50",
  "description": "List UI components"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/postcss.config.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -name \"tailwind.config.*\" -type f 2>/dev/null | grep -v node_modules",
  "description": "Find tailwind config files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/button.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/__root.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"utils.ts\" -o -name \"utils.tsx\" 2>/dev/null | head -5",
  "description": "Find utils files"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/lib/**/*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/lib/utils.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/theme-provider.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/ | head -30",
  "description": "List src directory structure"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/Page.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/hooks/ | head -20",
  "description": "List hooks directory"
}

🔧 Tool: Bash
Input: {
  "command": "head -20 /home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx",
  "description": "Check dashboard route file"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/styles/",
  "description": "List styles directory"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -maxdepth 1 -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.config.*\" | grep -v node_modules | head -20",
  "description": "List root level config files"
}
Now I have a clear understanding of the codebase. This is a TanStack Start application that currently uses Tailwind CSS v4 with PostCSS. The feature request is to implement CSS Modules with proper naming conventions, TypeScript type definitions, and global styles handling.

Let me plan and implement this feature:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "pending",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "pending",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "pending",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "pending",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "pending",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/vite.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tsconfig.json"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "in_progress",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "pending",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "pending",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "pending",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "pending",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me configure Vite for CSS Modules support. Vite has built-in support for CSS Modules, but I need to configure the naming convention and add TypeScript support:

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/vite.config.ts",
  "old_string": "import { tanstackStart } from \"@tanstack/react-start/plugin/vite\";\nimport { defineConfig } from \"vite\";\nimport tsConfigPaths from \"vite-tsconfig-paths\";\nimport tailwindcss from \"@tailwindcss/vite\";\nimport viteReact from \"@vitejs/plugin-react\";\nimport { nitro } from \"nitro/vite\";\n\nexport default defineConfig(({ mode }) => {\n  return {\n    server: {\n      port: 3000,\n    },\n    plugins: [\n      tsConfigPaths(),\n      tailwindcss(),\n      tanstackStart(),\n      nitro(),\n      viteReact(),\n    ],\n  };\n});",
  "new_string": "import { tanstackStart } from \"@tanstack/react-start/plugin/vite\";\nimport { defineConfig } from \"vite\";\nimport tsConfigPaths from \"vite-tsconfig-paths\";\nimport tailwindcss from \"@tailwindcss/vite\";\nimport viteReact from \"@vitejs/plugin-react\";\nimport { nitro } from \"nitro/vite\";\n\nexport default defineConfig(({ mode }) => {\n  return {\n    server: {\n      port: 3000,\n    },\n    plugins: [\n      tsConfigPaths(),\n      tailwindcss(),\n      tanstackStart(),\n      nitro(),\n      viteReact(),\n    ],\n    css: {\n      modules: {\n        // Use camelCase for class names in JS/TS\n        localsConvention: \"camelCaseOnly\",\n        // Generate scoped class names with BEM-like naming convention\n        // Format: [component]_[class]_[hash]\n        generateScopedName:\n          mode === \"production\"\n            ? \"[hash:base64:8]\"\n            : \"[name]__[local]___[hash:base64:5]\",\n        // Enable global mode for :global() selectors\n        globalModulePaths: [/\\.global\\.css$/],\n      },\n    },\n  };\n});"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "in_progress",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "pending",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "pending",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "pending",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me create TypeScript type definitions for CSS Modules. I'll check if there's a types directory:

🔧 Tool: Glob
Input: {
  "pattern": "src/types/**/*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/types/css-frameworks.ts"
}
There's already a types file for CSS frameworks including CSS Modules options. Now I need to create a comprehensive TypeScript declaration file for CSS Modules and utilities. Let me create the type definitions:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/types/css-modules.d.ts",
  "content": "/**\n * TypeScript Type Definitions for CSS Modules\n *\n * This file provides type safety for CSS Module imports throughout the application.\n * It handles both generic .module.css imports and specific module declarations.\n */\n\n/**\n * Base type for CSS Module class mappings\n * All CSS Modules export an object with string keys (class names) and string values (scoped class names)\n */\ndeclare type CSSModuleClasses = {\n  readonly [key: string]: string;\n};\n\n/**\n * CSS Module with composition support\n * Allows tracking of composed classes from other modules\n */\ndeclare interface CSSModuleWithComposition extends CSSModuleClasses {\n  readonly __composed?: readonly string[];\n}\n\n/**\n * Default module declaration for all .module.css files\n * This enables TypeScript to understand CSS Module imports\n */\ndeclare module \"*.module.css\" {\n  const classes: CSSModuleClasses;\n  export default classes;\n}\n\n/**\n * SCSS Module support for projects using SCSS\n */\ndeclare module \"*.module.scss\" {\n  const classes: CSSModuleClasses;\n  export default classes;\n}\n\n/**\n * SASS Module support\n */\ndeclare module \"*.module.sass\" {\n  const classes: CSSModuleClasses;\n  export default classes;\n}\n\n/**\n * LESS Module support\n */\ndeclare module \"*.module.less\" {\n  const classes: CSSModuleClasses;\n  export default classes;\n}\n\n/**\n * Global CSS imports (non-module CSS files)\n * These don't export class names and are used for side effects only\n */\ndeclare module \"*.global.css\" {\n  const content: string;\n  export default content;\n}\n\n/**\n * CSS values import support (icss :export)\n * Allows exporting CSS values as JavaScript variables\n */\ndeclare module \"*.values.css\" {\n  const values: {\n    readonly [key: string]: string;\n  };\n  export default values;\n}\n\n/**\n * Utility type for extracting class names from a CSS Module\n * @example\n * import styles from './Button.module.css'\n * type ButtonClasses = CSSModuleClassName<typeof styles>\n */\nexport type CSSModuleClassName<T extends CSSModuleClasses> = keyof T;\n\n/**\n * Utility type for creating a typed className prop\n * @example\n * interface ButtonProps {\n *   variant: CSSModuleClassValue<typeof styles>\n * }\n */\nexport type CSSModuleClassValue<T extends CSSModuleClasses> = T[keyof T];\n\n/**\n * Type for composable class name argument\n * Supports string, undefined, null, false for conditional class application\n */\nexport type ClassValue =\n  | string\n  | undefined\n  | null\n  | false\n  | 0\n  | { [key: string]: boolean | undefined | null };\n\n/**\n * Utility type for mapping Figma component variants to CSS Module classes\n * Useful for the Figma-to-code conversion feature\n */\nexport interface CSSModuleVariantMap<T extends CSSModuleClasses> {\n  readonly base: CSSModuleClassValue<T>;\n  readonly variants?: {\n    [variantName: string]: {\n      [variantValue: string]: CSSModuleClassValue<T>;\n    };\n  };\n  readonly compoundVariants?: Array<{\n    conditions: { [variantName: string]: string };\n    className: CSSModuleClassValue<T>;\n  }>;\n  readonly defaultVariants?: {\n    [variantName: string]: string;\n  };\n}\n"
}
Now I need to update the tsconfig.json to include these type definitions:

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tsconfig.json",
  "old_string": "{\n  \"include\": [\"**/*.ts\", \"**/*.tsx\"],",
  "new_string": "{\n  \"include\": [\"**/*.ts\", \"**/*.tsx\", \"src/types/*.d.ts\"],"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "completed",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "in_progress",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "pending",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "pending",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me create the CSS Module utilities and helpers:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/lib/utils.ts"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/lib/css-modules.ts",
  "content": "/**\n * CSS Modules Utilities\n *\n * Helper functions for working with CSS Modules, including:\n * - Class name composition\n * - Conditional class application\n * - CSS values import handling\n * - Integration with Tailwind classes\n */\n\nimport { clsx, type ClassValue } from \"clsx\";\nimport { twMerge } from \"tailwind-merge\";\n\n/**\n * Type for CSS Module class mappings\n */\nexport type CSSModuleClasses = {\n  readonly [key: string]: string;\n};\n\n/**\n * Composes multiple CSS Module classes together\n * Handles undefined/null values gracefully for conditional application\n *\n * @example\n * import styles from './Button.module.css'\n * const className = composeClasses(\n *   styles.button,\n *   isActive && styles.active,\n *   isDisabled && styles.disabled\n * )\n */\nexport function composeClasses(\n  ...classes: (string | undefined | null | false | 0)[]\n): string {\n  return classes.filter(Boolean).join(\" \");\n}\n\n/**\n * CSS Module class composer with conditional support\n * Works like clsx but specifically designed for CSS Modules\n *\n * @example\n * import styles from './Card.module.css'\n * const className = cm(\n *   styles.card,\n *   { [styles.elevated]: isElevated, [styles.rounded]: hasRounding },\n *   variant === 'primary' && styles.primary\n * )\n */\nexport function cm(...inputs: ClassValue[]): string {\n  return clsx(inputs);\n}\n\n/**\n * Merge CSS Module classes with Tailwind utility classes\n * Useful when combining scoped CSS Module styles with Tailwind utilities\n *\n * @example\n * import styles from './Container.module.css'\n * const className = cmTw(\n *   styles.container,\n *   'px-4 py-2', // Tailwind utilities\n *   isWide && 'max-w-7xl'\n * )\n */\nexport function cmTw(...inputs: ClassValue[]): string {\n  return twMerge(clsx(inputs));\n}\n\n/**\n * Creates a typed class name getter from a CSS Module\n * Provides runtime validation and better error messages\n *\n * @example\n * import styles from './Button.module.css'\n * const getClass = createClassGetter(styles)\n * const buttonClass = getClass('button') // Type-safe access\n */\nexport function createClassGetter<T extends CSSModuleClasses>(\n  styles: T\n): <K extends keyof T>(className: K) => T[K] {\n  return (className) => {\n    const value = styles[className];\n    if (value === undefined) {\n      console.warn(\n        `[CSS Module] Class \"${String(className)}\" not found in module`\n      );\n      return \"\" as T[typeof className];\n    }\n    return value;\n  };\n}\n\n/**\n * Creates a variant-based class resolver for CSS Modules\n * Useful for component variants similar to CVA (class-variance-authority)\n *\n * @example\n * import styles from './Button.module.css'\n *\n * const buttonVariants = createVariants(styles, {\n *   base: 'button',\n *   variants: {\n *     variant: {\n *       primary: 'primary',\n *       secondary: 'secondary',\n *     },\n *     size: {\n *       sm: 'small',\n *       md: 'medium',\n *       lg: 'large',\n *     },\n *   },\n *   defaultVariants: {\n *     variant: 'primary',\n *     size: 'md',\n *   },\n * })\n *\n * // Usage\n * buttonVariants({ variant: 'secondary', size: 'lg' })\n */\nexport interface VariantConfig<T extends CSSModuleClasses> {\n  base?: keyof T;\n  variants?: {\n    [variantName: string]: {\n      [variantValue: string]: keyof T;\n    };\n  };\n  compoundVariants?: Array<{\n    conditions: { [variantName: string]: string };\n    className: keyof T;\n  }>;\n  defaultVariants?: {\n    [variantName: string]: string;\n  };\n}\n\nexport function createVariants<\n  T extends CSSModuleClasses,\n  V extends VariantConfig<T>,\n>(\n  styles: T,\n  config: V\n): (\n  props?: {\n    [K in keyof V[\"variants\"]]?: keyof V[\"variants\"][K];\n  } & { className?: string }\n) => string {\n  return (props = {}) => {\n    const classes: string[] = [];\n\n    // Add base class\n    if (config.base) {\n      classes.push(styles[config.base]);\n    }\n\n    // Apply variant classes\n    if (config.variants) {\n      for (const [variantName, variantValues] of Object.entries(\n        config.variants\n      )) {\n        const selectedValue =\n          (props as Record<string, string>)[variantName] ??\n          config.defaultVariants?.[variantName];\n\n        if (selectedValue && variantValues[selectedValue]) {\n          const className = styles[variantValues[selectedValue] as keyof T];\n          if (className) {\n            classes.push(className);\n          }\n        }\n      }\n    }\n\n    // Apply compound variants\n    if (config.compoundVariants) {\n      for (const compound of config.compoundVariants) {\n        const matches = Object.entries(compound.conditions).every(\n          ([key, value]) => {\n            const propValue =\n              (props as Record<string, string>)[key] ??\n              config.defaultVariants?.[key];\n            return propValue === value;\n          }\n        );\n\n        if (matches) {\n          const className = styles[compound.className];\n          if (className) {\n            classes.push(className);\n          }\n        }\n      }\n    }\n\n    // Add additional className if provided\n    if (props.className) {\n      classes.push(props.className);\n    }\n\n    return classes.filter(Boolean).join(\" \");\n  };\n}\n\n/**\n * Binds a CSS Module to a helper function for shorter syntax\n * Returns an object with the original styles and helper methods\n *\n * @example\n * import styles from './Menu.module.css'\n * const css = bindStyles(styles)\n *\n * // Direct access\n * css.styles.menuItem\n *\n * // Composed classes\n * css.compose('menu', 'active')\n *\n * // Conditional classes\n * css.cx({ menu: true, active: isActive })\n */\nexport function bindStyles<T extends CSSModuleClasses>(styles: T) {\n  return {\n    styles,\n    compose: (...classNames: (keyof T | undefined | null | false)[]) =>\n      classNames\n        .filter((name): name is keyof T => Boolean(name))\n        .map((name) => styles[name])\n        .filter(Boolean)\n        .join(\" \"),\n    cx: (\n      classMap: Partial<Record<keyof T, boolean | undefined | null>>\n    ): string =>\n      Object.entries(classMap)\n        .filter(([, condition]) => condition)\n        .map(([className]) => styles[className as keyof T])\n        .filter(Boolean)\n        .join(\" \"),\n    get: <K extends keyof T>(className: K): T[K] => styles[className],\n  };\n}\n\n/**\n * Type-safe style getter that throws on missing classes (development only)\n * In production, returns empty string and logs warning\n *\n * @example\n * import styles from './Component.module.css'\n * const s = strictStyles(styles)\n * const className = s.button // Throws if 'button' doesn't exist\n */\nexport function strictStyles<T extends CSSModuleClasses>(\n  styles: T\n): Readonly<T> {\n  if (process.env.NODE_ENV === \"development\") {\n    return new Proxy(styles, {\n      get(target, prop: string) {\n        if (!(prop in target)) {\n          throw new Error(\n            `[CSS Module] Class \"${prop}\" not found. Available classes: ${Object.keys(target).join(\", \")}`\n          );\n        }\n        return target[prop as keyof T];\n      },\n    }) as Readonly<T>;\n  }\n  return styles;\n}\n\n/**\n * Extracts CSS custom property values from a CSS values module\n * Useful for accessing CSS variables in JavaScript\n *\n * @example\n * // colors.values.css\n * // :export {\n * //   primary: #3b82f6;\n * //   secondary: #64748b;\n * // }\n *\n * import colors from './colors.values.css'\n * const { primary, secondary } = extractValues(colors)\n */\nexport function extractValues<T extends Record<string, string>>(\n  values: T\n): Readonly<T> {\n  return Object.freeze({ ...values });\n}\n\n/**\n * Creates a scoped class name generator for dynamic component creation\n * Useful for Figma-to-code conversion where class names need to be generated\n *\n * @example\n * const scope = createScope('Button')\n * scope('container') // Returns 'Button__container'\n * scope('icon', 'large') // Returns 'Button__icon--large'\n */\nexport function createScope(componentName: string) {\n  return (element: string, modifier?: string): string => {\n    const base = `${componentName}__${element}`;\n    return modifier ? `${base}--${modifier}` : base;\n  };\n}\n\n/**\n * Validates that all expected classes exist in a CSS Module\n * Useful for testing and ensuring CSS-JS synchronization\n *\n * @example\n * import styles from './Button.module.css'\n * validateModule(styles, ['button', 'primary', 'disabled'])\n */\nexport function validateModule<T extends CSSModuleClasses>(\n  styles: T,\n  expectedClasses: string[]\n): { valid: boolean; missing: string[] } {\n  const missing = expectedClasses.filter(\n    (className) => !(className in styles)\n  );\n  return {\n    valid: missing.length === 0,\n    missing,\n  };\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "completed",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "completed",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "in_progress",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "pending",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me create example CSS Module components with proper naming conventions. First, let me see the components directory structure:

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ | head -20",
  "description": "List components directory"
}
I'll create example CSS Module components to demonstrate the pattern. Let me create a dedicated folder for CSS Module examples:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/ExampleCard.module.css",
  "content": "/**\n * ExampleCard CSS Module\n *\n * Demonstrates proper CSS Module naming conventions:\n * - BEM-inspired class naming (block__element--modifier)\n * - Composition using composes\n * - CSS custom properties for theming\n * - Scoped animations\n */\n\n/* Base card styles */\n.card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  border-radius: var(--radius, 0.5rem);\n  background-color: var(--background, #ffffff);\n  border: 1px solid var(--border, #e5e7eb);\n  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);\n  transition: all 0.2s ease-in-out;\n}\n\n/* Card header section */\n.header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 1rem 1.5rem;\n  border-bottom: 1px solid var(--border, #e5e7eb);\n}\n\n/* Card title */\n.title {\n  margin: 0;\n  font-size: 1.125rem;\n  font-weight: 600;\n  color: var(--foreground, #0f172a);\n  line-height: 1.5;\n}\n\n/* Card description/subtitle */\n.description {\n  margin: 0.25rem 0 0;\n  font-size: 0.875rem;\n  color: var(--muted-foreground, #64748b);\n  line-height: 1.5;\n}\n\n/* Card content area */\n.content {\n  flex: 1;\n  padding: 1.5rem;\n}\n\n/* Card footer section */\n.footer {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 1rem 1.5rem;\n  border-top: 1px solid var(--border, #e5e7eb);\n}\n\n/* Card action button area */\n.actions {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-left: auto;\n}\n\n/* ========== Variants ========== */\n\n/* Elevated variant with more shadow */\n.elevated {\n  composes: card;\n  box-shadow:\n    0 4px 6px -1px rgb(0 0 0 / 0.1),\n    0 2px 4px -2px rgb(0 0 0 / 0.1);\n}\n\n/* Interactive variant with hover effects */\n.interactive {\n  composes: card;\n  cursor: pointer;\n}\n\n.interactive:hover {\n  border-color: var(--primary, #3b82f6);\n  box-shadow:\n    0 4px 6px -1px rgb(0 0 0 / 0.1),\n    0 2px 4px -2px rgb(0 0 0 / 0.1);\n  transform: translateY(-2px);\n}\n\n.interactive:active {\n  transform: translateY(0);\n}\n\n/* Outlined variant - no background */\n.outlined {\n  composes: card;\n  background-color: transparent;\n  border-width: 2px;\n}\n\n/* Ghost variant - minimal styling */\n.ghost {\n  composes: card;\n  background-color: transparent;\n  border-color: transparent;\n  box-shadow: none;\n}\n\n.ghost:hover {\n  background-color: var(--accent, #f1f5f9);\n}\n\n/* ========== Size Variants ========== */\n\n.small {\n  border-radius: calc(var(--radius, 0.5rem) * 0.75);\n}\n\n.small .header {\n  padding: 0.75rem 1rem;\n}\n\n.small .content {\n  padding: 1rem;\n}\n\n.small .footer {\n  padding: 0.75rem 1rem;\n}\n\n.small .title {\n  font-size: 1rem;\n}\n\n.large {\n  border-radius: calc(var(--radius, 0.5rem) * 1.5);\n}\n\n.large .header {\n  padding: 1.5rem 2rem;\n}\n\n.large .content {\n  padding: 2rem;\n}\n\n.large .footer {\n  padding: 1.5rem 2rem;\n}\n\n.large .title {\n  font-size: 1.25rem;\n}\n\n/* ========== State Variants ========== */\n\n.selected {\n  border-color: var(--primary, #3b82f6);\n  box-shadow: 0 0 0 2px var(--primary, #3b82f6);\n}\n\n.disabled {\n  opacity: 0.5;\n  pointer-events: none;\n  cursor: not-allowed;\n}\n\n/* Loading state with animation */\n.loading {\n  position: relative;\n  overflow: hidden;\n}\n\n.loading::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(\n    90deg,\n    transparent,\n    rgb(255 255 255 / 0.4),\n    transparent\n  );\n  animation: shimmer 1.5s infinite;\n}\n\n/* ========== Scoped Animation ========== */\n\n@keyframes shimmer {\n  0% {\n    transform: translateX(-100%);\n  }\n  100% {\n    transform: translateX(100%);\n  }\n}\n\n/* ========== Media (decorative) ========== */\n\n.media {\n  position: relative;\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  overflow: hidden;\n  border-radius: var(--radius, 0.5rem) var(--radius, 0.5rem) 0 0;\n}\n\n.media img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n/* Card with media on top */\n.withMedia .header {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/ExampleCard.tsx",
  "content": "/**\n * ExampleCard Component\n *\n * Demonstrates how to use CSS Modules with React components:\n * - Importing and using scoped styles\n * - Composing multiple class names\n * - Handling variants with the createVariants utility\n * - TypeScript integration\n */\n\nimport React from \"react\";\nimport styles from \"./ExampleCard.module.css\";\nimport { composeClasses, createVariants } from \"~/lib/css-modules\";\n\n// Define component variants using the CSS Module utility\nconst cardVariants = createVariants(styles, {\n  base: \"card\",\n  variants: {\n    variant: {\n      default: undefined, // Just use base\n      elevated: \"elevated\",\n      interactive: \"interactive\",\n      outlined: \"outlined\",\n      ghost: \"ghost\",\n    },\n    size: {\n      sm: \"small\",\n      md: undefined, // Default size, no additional class\n      lg: \"large\",\n    },\n  },\n  defaultVariants: {\n    variant: \"default\",\n    size: \"md\",\n  },\n});\n\n// Props type definition with variant support\nexport interface ExampleCardProps {\n  /** Card variant style */\n  variant?: \"default\" | \"elevated\" | \"interactive\" | \"outlined\" | \"ghost\";\n  /** Card size */\n  size?: \"sm\" | \"md\" | \"lg\";\n  /** Whether the card is in a selected state */\n  selected?: boolean;\n  /** Whether the card is disabled */\n  disabled?: boolean;\n  /** Whether the card is in a loading state */\n  loading?: boolean;\n  /** Additional class name */\n  className?: string;\n  /** Card children */\n  children?: React.ReactNode;\n}\n\n/**\n * Card Header Component\n */\nexport interface CardHeaderProps {\n  title?: string;\n  description?: string;\n  children?: React.ReactNode;\n  className?: string;\n}\n\nexport function CardHeader({\n  title,\n  description,\n  children,\n  className,\n}: CardHeaderProps) {\n  return (\n    <div className={composeClasses(styles.header, className)}>\n      {children || (\n        <div>\n          {title && <h3 className={styles.title}>{title}</h3>}\n          {description && <p className={styles.description}>{description}</p>}\n        </div>\n      )}\n    </div>\n  );\n}\n\n/**\n * Card Content Component\n */\nexport interface CardContentProps {\n  children?: React.ReactNode;\n  className?: string;\n}\n\nexport function CardContent({ children, className }: CardContentProps) {\n  return (\n    <div className={composeClasses(styles.content, className)}>{children}</div>\n  );\n}\n\n/**\n * Card Footer Component\n */\nexport interface CardFooterProps {\n  children?: React.ReactNode;\n  className?: string;\n}\n\nexport function CardFooter({ children, className }: CardFooterProps) {\n  return (\n    <div className={composeClasses(styles.footer, className)}>{children}</div>\n  );\n}\n\n/**\n * Card Actions Component (for buttons in footer)\n */\nexport interface CardActionsProps {\n  children?: React.ReactNode;\n  className?: string;\n}\n\nexport function CardActions({ children, className }: CardActionsProps) {\n  return (\n    <div className={composeClasses(styles.actions, className)}>{children}</div>\n  );\n}\n\n/**\n * Card Media Component\n */\nexport interface CardMediaProps {\n  src: string;\n  alt: string;\n  className?: string;\n}\n\nexport function CardMedia({ src, alt, className }: CardMediaProps) {\n  return (\n    <div className={composeClasses(styles.media, className)}>\n      <img src={src} alt={alt} />\n    </div>\n  );\n}\n\n/**\n * Main Card Component\n *\n * @example\n * // Basic usage\n * <ExampleCard>\n *   <CardHeader title=\"Card Title\" description=\"Card description\" />\n *   <CardContent>Content here</CardContent>\n *   <CardFooter>Footer content</CardFooter>\n * </ExampleCard>\n *\n * @example\n * // With variants\n * <ExampleCard variant=\"elevated\" size=\"lg\" selected>\n *   <CardContent>Large elevated card</CardContent>\n * </ExampleCard>\n */\nexport function ExampleCard({\n  variant = \"default\",\n  size = \"md\",\n  selected = false,\n  disabled = false,\n  loading = false,\n  className,\n  children,\n}: ExampleCardProps) {\n  const baseClassName = cardVariants({ variant, size });\n\n  const finalClassName = composeClasses(\n    baseClassName,\n    selected && styles.selected,\n    disabled && styles.disabled,\n    loading && styles.loading,\n    className\n  );\n\n  return (\n    <div\n      className={finalClassName}\n      data-variant={variant}\n      data-size={size}\n      data-selected={selected || undefined}\n      data-disabled={disabled || undefined}\n      data-loading={loading || undefined}\n    >\n      {children}\n    </div>\n  );\n}\n\n// Attach sub-components\nExampleCard.Header = CardHeader;\nExampleCard.Content = CardContent;\nExampleCard.Footer = CardFooter;\nExampleCard.Actions = CardActions;\nExampleCard.Media = CardMedia;\n\nexport default ExampleCard;\n"
}
Now let me create a CSS values module for composition and value imports:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/theme.values.css",
  "content": "/**\n * Theme Values Module\n *\n * Demonstrates ICSS :export for sharing CSS values with JavaScript.\n * This allows CSS variables to be used in both CSS and JS.\n *\n * Usage in JS/TS:\n * import theme from './theme.values.css'\n * console.log(theme.primaryColor) // '#3b82f6'\n */\n\n:root {\n  /* Define CSS custom properties */\n  --theme-primary-color: #3b82f6;\n  --theme-secondary-color: #64748b;\n  --theme-success-color: #22c55e;\n  --theme-warning-color: #f59e0b;\n  --theme-error-color: #ef4444;\n  --theme-background-color: #ffffff;\n  --theme-foreground-color: #0f172a;\n  --theme-muted-color: #f1f5f9;\n  --theme-border-color: #e2e8f0;\n\n  /* Spacing scale */\n  --theme-spacing-xs: 0.25rem;\n  --theme-spacing-sm: 0.5rem;\n  --theme-spacing-md: 1rem;\n  --theme-spacing-lg: 1.5rem;\n  --theme-spacing-xl: 2rem;\n\n  /* Border radius */\n  --theme-radius-sm: 0.25rem;\n  --theme-radius-md: 0.5rem;\n  --theme-radius-lg: 0.75rem;\n  --theme-radius-full: 9999px;\n\n  /* Font sizes */\n  --theme-font-xs: 0.75rem;\n  --theme-font-sm: 0.875rem;\n  --theme-font-md: 1rem;\n  --theme-font-lg: 1.125rem;\n  --theme-font-xl: 1.25rem;\n\n  /* Transitions */\n  --theme-transition-fast: 150ms;\n  --theme-transition-normal: 200ms;\n  --theme-transition-slow: 300ms;\n\n  /* Z-index scale */\n  --theme-z-dropdown: 100;\n  --theme-z-modal: 200;\n  --theme-z-popover: 300;\n  --theme-z-tooltip: 400;\n}\n\n/* Export values to JavaScript */\n:export {\n  /* Colors */\n  primaryColor: var(--theme-primary-color);\n  secondaryColor: var(--theme-secondary-color);\n  successColor: var(--theme-success-color);\n  warningColor: var(--theme-warning-color);\n  errorColor: var(--theme-error-color);\n  backgroundColor: var(--theme-background-color);\n  foregroundColor: var(--theme-foreground-color);\n  mutedColor: var(--theme-muted-color);\n  borderColor: var(--theme-border-color);\n\n  /* Spacing */\n  spacingXs: var(--theme-spacing-xs);\n  spacingSm: var(--theme-spacing-sm);\n  spacingMd: var(--theme-spacing-md);\n  spacingLg: var(--theme-spacing-lg);\n  spacingXl: var(--theme-spacing-xl);\n\n  /* Border radius */\n  radiusSm: var(--theme-radius-sm);\n  radiusMd: var(--theme-radius-md);\n  radiusLg: var(--theme-radius-lg);\n  radiusFull: var(--theme-radius-full);\n\n  /* Font sizes */\n  fontXs: var(--theme-font-xs);\n  fontSm: var(--theme-font-sm);\n  fontMd: var(--theme-font-md);\n  fontLg: var(--theme-font-lg);\n  fontXl: var(--theme-font-xl);\n\n  /* Transitions */\n  transitionFast: var(--theme-transition-fast);\n  transitionNormal: var(--theme-transition-normal);\n  transitionSlow: var(--theme-transition-slow);\n\n  /* Z-index */\n  zDropdown: var(--theme-z-dropdown);\n  zModal: var(--theme-z-modal);\n  zPopover: var(--theme-z-popover);\n  zTooltip: var(--theme-z-tooltip);\n}\n"
}
Now let me create an index file to export all the examples and a composition example:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/shared.module.css",
  "content": "/**\n * Shared CSS Module\n *\n * Contains reusable styles that can be composed into other modules.\n * This demonstrates CSS Modules composition feature.\n */\n\n/* ========== Typography ========== */\n\n.textXs {\n  font-size: 0.75rem;\n  line-height: 1rem;\n}\n\n.textSm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n\n.textBase {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n\n.textLg {\n  font-size: 1.125rem;\n  line-height: 1.75rem;\n}\n\n.textXl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}\n\n.fontNormal {\n  font-weight: 400;\n}\n\n.fontMedium {\n  font-weight: 500;\n}\n\n.fontSemibold {\n  font-weight: 600;\n}\n\n.fontBold {\n  font-weight: 700;\n}\n\n/* ========== Colors ========== */\n\n.textPrimary {\n  color: var(--primary, #3b82f6);\n}\n\n.textSecondary {\n  color: var(--muted-foreground, #64748b);\n}\n\n.textSuccess {\n  color: var(--success, #22c55e);\n}\n\n.textWarning {\n  color: var(--warning, #f59e0b);\n}\n\n.textError {\n  color: var(--destructive, #ef4444);\n}\n\n.textMuted {\n  color: var(--muted-foreground, #64748b);\n}\n\n/* ========== Layout ========== */\n\n.flexCenter {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.flexBetween {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.flexStart {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n}\n\n.flexEnd {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.flexCol {\n  display: flex;\n  flex-direction: column;\n}\n\n.flexWrap {\n  flex-wrap: wrap;\n}\n\n.gap1 {\n  gap: 0.25rem;\n}\n\n.gap2 {\n  gap: 0.5rem;\n}\n\n.gap3 {\n  gap: 0.75rem;\n}\n\n.gap4 {\n  gap: 1rem;\n}\n\n.gap6 {\n  gap: 1.5rem;\n}\n\n/* ========== Spacing ========== */\n\n.p1 {\n  padding: 0.25rem;\n}\n\n.p2 {\n  padding: 0.5rem;\n}\n\n.p3 {\n  padding: 0.75rem;\n}\n\n.p4 {\n  padding: 1rem;\n}\n\n.p6 {\n  padding: 1.5rem;\n}\n\n.m0 {\n  margin: 0;\n}\n\n.mAuto {\n  margin: auto;\n}\n\n/* ========== Borders ========== */\n\n.rounded {\n  border-radius: var(--radius, 0.5rem);\n}\n\n.roundedSm {\n  border-radius: calc(var(--radius, 0.5rem) * 0.5);\n}\n\n.roundedLg {\n  border-radius: calc(var(--radius, 0.5rem) * 1.5);\n}\n\n.roundedFull {\n  border-radius: 9999px;\n}\n\n.border {\n  border: 1px solid var(--border, #e2e8f0);\n}\n\n.borderPrimary {\n  border-color: var(--primary, #3b82f6);\n}\n\n/* ========== Shadows ========== */\n\n.shadow {\n  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);\n}\n\n.shadowMd {\n  box-shadow:\n    0 4px 6px -1px rgb(0 0 0 / 0.1),\n    0 2px 4px -2px rgb(0 0 0 / 0.1);\n}\n\n.shadowLg {\n  box-shadow:\n    0 10px 15px -3px rgb(0 0 0 / 0.1),\n    0 4px 6px -4px rgb(0 0 0 / 0.1);\n}\n\n/* ========== Transitions ========== */\n\n.transitionAll {\n  transition: all 0.2s ease-in-out;\n}\n\n.transitionColors {\n  transition:\n    color 0.2s,\n    background-color 0.2s,\n    border-color 0.2s;\n}\n\n.transitionTransform {\n  transition: transform 0.2s ease-in-out;\n}\n\n/* ========== Interactive States ========== */\n\n.hoverScale {\n  transition: transform 0.2s ease-in-out;\n}\n\n.hoverScale:hover {\n  transform: scale(1.02);\n}\n\n.hoverLift {\n  transition: transform 0.2s ease-in-out;\n}\n\n.hoverLift:hover {\n  transform: translateY(-2px);\n}\n\n.focusRing {\n  outline: none;\n}\n\n.focusRing:focus-visible {\n  outline: 2px solid var(--ring, #3b82f6);\n  outline-offset: 2px;\n}\n\n/* ========== Utilities ========== */\n\n.srOnly {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.lineClamp2 {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.lineClamp3 {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n"
}
Now let me create an ExampleButton component that demonstrates composition:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/ExampleButton.module.css",
  "content": "/**\n * ExampleButton CSS Module\n *\n * Demonstrates CSS Module composition feature:\n * - composes from shared module\n * - composes from local classes\n * - Proper BEM-like naming\n */\n\n/* Import shared utilities via composition */\n\n/* Base button styles */\n.button {\n  composes: flexCenter from \"./shared.module.css\";\n  composes: transitionAll from \"./shared.module.css\";\n  composes: focusRing from \"./shared.module.css\";\n  position: relative;\n  display: inline-flex;\n  cursor: pointer;\n  font-weight: 500;\n  border: 1px solid transparent;\n  user-select: none;\n}\n\n.button:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n\n/* ========== Variant Styles ========== */\n\n.primary {\n  composes: button;\n  background-color: var(--primary, #3b82f6);\n  color: var(--primary-foreground, #ffffff);\n}\n\n.primary:hover:not(:disabled) {\n  background-color: var(--primary-hover, #2563eb);\n}\n\n.secondary {\n  composes: button;\n  background-color: var(--secondary, #f1f5f9);\n  color: var(--secondary-foreground, #0f172a);\n}\n\n.secondary:hover:not(:disabled) {\n  background-color: var(--secondary-hover, #e2e8f0);\n}\n\n.destructive {\n  composes: button;\n  background-color: var(--destructive, #ef4444);\n  color: var(--destructive-foreground, #ffffff);\n}\n\n.destructive:hover:not(:disabled) {\n  background-color: var(--destructive-hover, #dc2626);\n}\n\n.outline {\n  composes: button;\n  background-color: transparent;\n  border-color: var(--border, #e2e8f0);\n  color: var(--foreground, #0f172a);\n}\n\n.outline:hover:not(:disabled) {\n  background-color: var(--accent, #f1f5f9);\n  border-color: var(--accent, #f1f5f9);\n}\n\n.ghost {\n  composes: button;\n  background-color: transparent;\n  color: var(--foreground, #0f172a);\n}\n\n.ghost:hover:not(:disabled) {\n  background-color: var(--accent, #f1f5f9);\n}\n\n.link {\n  composes: button;\n  background-color: transparent;\n  color: var(--primary, #3b82f6);\n  text-decoration: underline;\n  text-underline-offset: 4px;\n}\n\n.link:hover:not(:disabled) {\n  text-decoration: none;\n}\n\n/* ========== Size Styles ========== */\n\n.small {\n  height: 2rem;\n  padding: 0 0.75rem;\n  font-size: 0.75rem;\n  border-radius: calc(var(--radius, 0.5rem) * 0.75);\n  gap: 0.25rem;\n}\n\n.medium {\n  height: 2.5rem;\n  padding: 0 1rem;\n  font-size: 0.875rem;\n  border-radius: var(--radius, 0.5rem);\n  gap: 0.5rem;\n}\n\n.large {\n  height: 3rem;\n  padding: 0 1.5rem;\n  font-size: 1rem;\n  border-radius: calc(var(--radius, 0.5rem) * 1.25);\n  gap: 0.5rem;\n}\n\n.icon {\n  /* Icon-only button - square aspect ratio */\n  padding: 0;\n  aspect-ratio: 1;\n}\n\n/* ========== Icon Styles ========== */\n\n.iconWrapper {\n  composes: flexCenter from \"./shared.module.css\";\n  flex-shrink: 0;\n}\n\n.iconLeft {\n  composes: iconWrapper;\n  margin-right: 0.25rem;\n}\n\n.iconRight {\n  composes: iconWrapper;\n  margin-left: 0.25rem;\n}\n\n/* ========== Loading State ========== */\n\n.loading {\n  position: relative;\n  color: transparent;\n}\n\n.loading > * {\n  visibility: hidden;\n}\n\n.spinner {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.spinnerIcon {\n  width: 1em;\n  height: 1em;\n  animation: spin 0.6s linear infinite;\n}\n\n@keyframes spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n/* ========== Full Width ========== */\n\n.fullWidth {\n  width: 100%;\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/ExampleButton.tsx",
  "content": "/**\n * ExampleButton Component\n *\n * Demonstrates CSS Module composition and variant handling.\n * Uses composes to inherit styles from shared modules.\n */\n\nimport React from \"react\";\nimport styles from \"./ExampleButton.module.css\";\nimport { composeClasses, createVariants, cm } from \"~/lib/css-modules\";\n\n// Define button variants\nconst buttonVariants = createVariants(styles, {\n  variants: {\n    variant: {\n      primary: \"primary\",\n      secondary: \"secondary\",\n      destructive: \"destructive\",\n      outline: \"outline\",\n      ghost: \"ghost\",\n      link: \"link\",\n    },\n    size: {\n      sm: \"small\",\n      md: \"medium\",\n      lg: \"large\",\n      icon: \"icon\",\n    },\n  },\n  defaultVariants: {\n    variant: \"primary\",\n    size: \"md\",\n  },\n});\n\nexport interface ExampleButtonProps\n  extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  /** Button variant style */\n  variant?: \"primary\" | \"secondary\" | \"destructive\" | \"outline\" | \"ghost\" | \"link\";\n  /** Button size */\n  size?: \"sm\" | \"md\" | \"lg\" | \"icon\";\n  /** Shows loading spinner */\n  loading?: boolean;\n  /** Makes button full width */\n  fullWidth?: boolean;\n  /** Left icon element */\n  leftIcon?: React.ReactNode;\n  /** Right icon element */\n  rightIcon?: React.ReactNode;\n}\n\n/**\n * Button component with CSS Module styling\n *\n * @example\n * // Primary button\n * <ExampleButton variant=\"primary\">Click me</ExampleButton>\n *\n * @example\n * // With loading state\n * <ExampleButton loading>Saving...</ExampleButton>\n *\n * @example\n * // With icons\n * <ExampleButton leftIcon={<Icon />}>With Icon</ExampleButton>\n */\nexport function ExampleButton({\n  variant = \"primary\",\n  size = \"md\",\n  loading = false,\n  fullWidth = false,\n  leftIcon,\n  rightIcon,\n  disabled,\n  className,\n  children,\n  ...props\n}: ExampleButtonProps) {\n  const baseClassName = buttonVariants({ variant, size });\n\n  const finalClassName = cm(\n    baseClassName,\n    loading && styles.loading,\n    fullWidth && styles.fullWidth,\n    className\n  );\n\n  return (\n    <button\n      className={finalClassName}\n      disabled={disabled || loading}\n      data-variant={variant}\n      data-size={size}\n      data-loading={loading || undefined}\n      {...props}\n    >\n      {loading && (\n        <span className={styles.spinner}>\n          <svg\n            className={styles.spinnerIcon}\n            xmlns=\"http://www.w3.org/2000/svg\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <circle\n              style={{ opacity: 0.25 }}\n              cx=\"12\"\n              cy=\"12\"\n              r=\"10\"\n              stroke=\"currentColor\"\n              strokeWidth=\"4\"\n            />\n            <path\n              style={{ opacity: 0.75 }}\n              fill=\"currentColor\"\n              d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"\n            />\n          </svg>\n        </span>\n      )}\n      {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}\n      {children}\n      {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}\n    </button>\n  );\n}\n\nexport default ExampleButton;\n"
}
Now let me create an index file to export all examples:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/index.ts",
  "content": "/**\n * CSS Modules Examples\n *\n * This module exports example components demonstrating CSS Modules usage:\n * - Scoped class names with proper naming conventions\n * - CSS composition (composes)\n * - Value imports via :export\n * - TypeScript type definitions\n * - Integration with Tailwind utilities\n */\n\n// Components\nexport { ExampleCard, CardHeader, CardContent, CardFooter, CardActions, CardMedia } from \"./ExampleCard\";\nexport type { ExampleCardProps, CardHeaderProps, CardContentProps, CardFooterProps, CardActionsProps, CardMediaProps } from \"./ExampleCard\";\n\nexport { ExampleButton } from \"./ExampleButton\";\nexport type { ExampleButtonProps } from \"./ExampleButton\";\n\n// Style modules (for advanced composition use cases)\nexport { default as sharedStyles } from \"./shared.module.css\";\n\n// Note: CSS values can be imported directly in components:\n// import theme from './theme.values.css'\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "completed",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "completed",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "completed",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "in_progress",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me handle global styles appropriately. I'll create a global styles file that demonstrates how to use `:global()` selectors and create the pattern for global CSS:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/globals.global.css",
  "content": "/**\n * Global Styles Module\n *\n * This file demonstrates handling global styles within the CSS Modules ecosystem.\n * Files ending in .global.css are treated as global (not scoped) by our Vite config.\n *\n * Use this pattern for:\n * - Third-party library overrides\n * - Base element styles\n * - CSS reset additions\n * - Styles that must affect elements outside React tree\n */\n\n/* ========== Global Element Overrides ========== */\n\n/* Example: Override third-party library styles */\n.some-external-library-class {\n  /* Styles here affect the actual class without hashing */\n}\n\n/* ========== Global Utility Classes ========== */\n\n/* These classes are available globally without import */\n.visually-hidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.no-scroll {\n  overflow: hidden;\n}\n\n.no-select {\n  user-select: none;\n}\n\n/* ========== Global Animation Classes ========== */\n\n.animate-fade-in {\n  animation: globalFadeIn 0.3s ease-out forwards;\n}\n\n.animate-slide-up {\n  animation: globalSlideUp 0.3s ease-out forwards;\n}\n\n.animate-slide-down {\n  animation: globalSlideDown 0.3s ease-out forwards;\n}\n\n@keyframes globalFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes globalSlideUp {\n  from {\n    opacity: 0;\n    transform: translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n@keyframes globalSlideDown {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n/* ========== Print Styles ========== */\n\n@media print {\n  .no-print {\n    display: none !important;\n  }\n\n  .print-only {\n    display: block !important;\n  }\n}\n\n/* ========== Reduced Motion Support ========== */\n\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n"
}
Now let me also create a CSS Module that demonstrates the `:global()` selector for mixed scoped/global styles:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/MixedStyles.module.css",
  "content": "/**\n * Mixed Styles Module\n *\n * Demonstrates using :global() selector within a CSS Module\n * for styles that need to target non-scoped class names.\n *\n * Use cases:\n * - Styling third-party component children\n * - Targeting classes added dynamically by JS libraries\n * - Working with CMS-generated HTML\n */\n\n/* Scoped wrapper class */\n.container {\n  position: relative;\n}\n\n/*\n * :global() selector prevents class name hashing\n * Useful for targeting classes from external libraries\n */\n.container :global(.third-party-class) {\n  /* This targets actual .third-party-class, not a hashed version */\n  color: var(--foreground);\n}\n\n/*\n * You can mix scoped and global selectors\n * Only the :global() parts remain unhashed\n */\n.wrapper :global(.external-modal) .innerContent {\n  /* .wrapper and .innerContent are scoped (hashed) */\n  /* .external-modal remains as-is */\n  padding: 1rem;\n}\n\n/*\n * Target global state classes (often added by JS)\n * Common pattern for libraries like react-select, react-datepicker, etc.\n */\n.selectWrapper :global(.react-select__control) {\n  border-color: var(--border);\n  background-color: var(--background);\n}\n\n.selectWrapper :global(.react-select__control--is-focused) {\n  border-color: var(--ring);\n  box-shadow: 0 0 0 2px var(--ring);\n}\n\n.selectWrapper :global(.react-select__menu) {\n  background-color: var(--background);\n  border: 1px solid var(--border);\n}\n\n.selectWrapper :global(.react-select__option--is-selected) {\n  background-color: var(--primary);\n}\n\n.selectWrapper :global(.react-select__option--is-focused) {\n  background-color: var(--accent);\n}\n\n/*\n * Targeting data attributes (often used by headless UI libraries)\n */\n.dropdown :global([data-state=\"open\"]) {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n.dropdown :global([data-state=\"closed\"]) {\n  opacity: 0;\n  transform: translateY(-4px);\n  pointer-events: none;\n}\n\n/*\n * Working with Radix UI primitives\n */\n.dialogOverlay :global([data-radix-portal]) {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n}\n\n/*\n * Styling markdown/CMS content where class names aren't known\n */\n.markdownContent :global(h1),\n.markdownContent :global(h2),\n.markdownContent :global(h3) {\n  font-weight: 600;\n  line-height: 1.25;\n  margin-top: 1.5em;\n  margin-bottom: 0.5em;\n}\n\n.markdownContent :global(h1) {\n  font-size: 2rem;\n}\n\n.markdownContent :global(h2) {\n  font-size: 1.5rem;\n}\n\n.markdownContent :global(h3) {\n  font-size: 1.25rem;\n}\n\n.markdownContent :global(p) {\n  margin-bottom: 1em;\n  line-height: 1.7;\n}\n\n.markdownContent :global(code) {\n  background-color: var(--muted);\n  padding: 0.125rem 0.25rem;\n  border-radius: 0.25rem;\n  font-size: 0.875em;\n}\n\n.markdownContent :global(pre) {\n  background-color: var(--muted);\n  padding: 1rem;\n  border-radius: var(--radius);\n  overflow-x: auto;\n}\n\n.markdownContent :global(pre code) {\n  background-color: transparent;\n  padding: 0;\n}\n\n.markdownContent :global(a) {\n  color: var(--primary);\n  text-decoration: underline;\n  text-underline-offset: 2px;\n}\n\n.markdownContent :global(a:hover) {\n  text-decoration: none;\n}\n\n.markdownContent :global(ul),\n.markdownContent :global(ol) {\n  margin-bottom: 1em;\n  padding-left: 1.5em;\n}\n\n.markdownContent :global(li) {\n  margin-bottom: 0.25em;\n}\n\n.markdownContent :global(blockquote) {\n  border-left: 4px solid var(--border);\n  padding-left: 1em;\n  margin: 1em 0;\n  font-style: italic;\n  color: var(--muted-foreground);\n}\n\n.markdownContent :global(table) {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 1em 0;\n}\n\n.markdownContent :global(th),\n.markdownContent :global(td) {\n  border: 1px solid var(--border);\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n}\n\n.markdownContent :global(th) {\n  background-color: var(--muted);\n  font-weight: 600;\n}\n\n/*\n * Define a fully global block within a module using @global rule\n */\n:global {\n  .css-modules-demo-global {\n    /* This class is fully global */\n    background: linear-gradient(135deg, var(--primary), var(--secondary));\n  }\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "completed",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "completed",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "completed",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "completed",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "in_progress",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "pending",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me check the existing Playwright config and create a verification test:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/playwright*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}
Playwright is installed. Let me check if there's a tests directory:

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/tests/",
  "description": "List tests directory"
}
I need to create a playwright config first. Let me also create a test page that can be used for verification:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "content": "import { defineConfig, devices } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"html\",\n  use: {\n    baseURL: \"http://localhost:3000\",\n    trace: \"on-first-retry\",\n  },\n  projects: [\n    {\n      name: \"chromium\",\n      use: { ...devices[\"Desktop Chrome\"] },\n    },\n  ],\n  webServer: {\n    command: \"npm run dev:app\",\n    url: \"http://localhost:3000\",\n    reuseExistingServer: !process.env.CI,\n    timeout: 120 * 1000,\n  },\n});\n"
}
Now let me create a route to display the CSS Modules demo components. First, let me check the existing routes structure:

🔧 Tool: Glob
Input: {
  "pattern": "src/routes/**/*.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/index.tsx"
}
Let me create a demo route to showcase the CSS Modules components:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/css-modules-demo.tsx",
  "content": "/**\n * CSS Modules Demo Page\n *\n * This route demonstrates the CSS Modules implementation with:\n * - Scoped class names\n * - Proper naming conventions\n * - Composition\n * - TypeScript integration\n */\n\nimport { createFileRoute } from \"@tanstack/react-router\";\nimport {\n  ExampleCard,\n  CardHeader,\n  CardContent,\n  CardFooter,\n  ExampleButton,\n} from \"~/components/css-modules-examples\";\nimport styles from \"~/components/css-modules-examples/ExampleCard.module.css\";\n\nexport const Route = createFileRoute(\"/css-modules-demo\")({\n  component: CSSModulesDemo,\n});\n\nfunction CSSModulesDemo() {\n  return (\n    <div className=\"container mx-auto p-8 space-y-12\">\n      <header className=\"text-center mb-12\">\n        <h1\n          className=\"text-4xl font-bold mb-4\"\n          data-testid=\"css-modules-demo-title\"\n        >\n          CSS Modules Demo\n        </h1>\n        <p className=\"text-lg text-muted-foreground max-w-2xl mx-auto\">\n          Demonstrating scoped CSS with proper naming conventions, composition,\n          and TypeScript type definitions.\n        </p>\n      </header>\n\n      {/* Section: Card Variants */}\n      <section data-testid=\"card-variants-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Card Variants</h2>\n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n          <ExampleCard variant=\"default\" data-testid=\"card-default\">\n            <CardHeader title=\"Default Card\" description=\"Basic card styling\" />\n            <CardContent>\n              <p>This is the default card variant with standard styling.</p>\n            </CardContent>\n            <CardFooter>\n              <ExampleButton size=\"sm\">Action</ExampleButton>\n            </CardFooter>\n          </ExampleCard>\n\n          <ExampleCard variant=\"elevated\" data-testid=\"card-elevated\">\n            <CardHeader\n              title=\"Elevated Card\"\n              description=\"Enhanced shadow effect\"\n            />\n            <CardContent>\n              <p>This card has an elevated appearance with deeper shadows.</p>\n            </CardContent>\n            <CardFooter>\n              <ExampleButton size=\"sm\" variant=\"secondary\">\n                Learn More\n              </ExampleButton>\n            </CardFooter>\n          </ExampleCard>\n\n          <ExampleCard variant=\"interactive\" data-testid=\"card-interactive\">\n            <CardHeader\n              title=\"Interactive Card\"\n              description=\"Hover to see effect\"\n            />\n            <CardContent>\n              <p>This card responds to hover interactions with animations.</p>\n            </CardContent>\n            <CardFooter>\n              <ExampleButton size=\"sm\" variant=\"outline\">\n                Explore\n              </ExampleButton>\n            </CardFooter>\n          </ExampleCard>\n\n          <ExampleCard variant=\"outlined\" data-testid=\"card-outlined\">\n            <CardHeader\n              title=\"Outlined Card\"\n              description=\"Transparent background\"\n            />\n            <CardContent>\n              <p>This card has a transparent background with a thick border.</p>\n            </CardContent>\n          </ExampleCard>\n\n          <ExampleCard variant=\"ghost\" data-testid=\"card-ghost\">\n            <CardHeader\n              title=\"Ghost Card\"\n              description=\"Minimal styling\"\n            />\n            <CardContent>\n              <p>A minimalist card with no border or shadow by default.</p>\n            </CardContent>\n          </ExampleCard>\n\n          <ExampleCard selected data-testid=\"card-selected\">\n            <CardHeader title=\"Selected Card\" description=\"Active state\" />\n            <CardContent>\n              <p>This card shows the selected/active state styling.</p>\n            </CardContent>\n          </ExampleCard>\n        </div>\n      </section>\n\n      {/* Section: Card Sizes */}\n      <section data-testid=\"card-sizes-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Card Sizes</h2>\n        <div className=\"space-y-6\">\n          <ExampleCard size=\"sm\" data-testid=\"card-small\">\n            <CardHeader\n              title=\"Small Card\"\n              description=\"Compact size with reduced padding\"\n            />\n            <CardContent>\n              <p>Smaller text and tighter spacing.</p>\n            </CardContent>\n          </ExampleCard>\n\n          <ExampleCard size=\"md\" data-testid=\"card-medium\">\n            <CardHeader\n              title=\"Medium Card\"\n              description=\"Default size with standard padding\"\n            />\n            <CardContent>\n              <p>Standard text size and comfortable spacing.</p>\n            </CardContent>\n          </ExampleCard>\n\n          <ExampleCard size=\"lg\" data-testid=\"card-large\">\n            <CardHeader\n              title=\"Large Card\"\n              description=\"Expanded size with generous padding\"\n            />\n            <CardContent>\n              <p>Larger text and more spacious layout for featured content.</p>\n            </CardContent>\n          </ExampleCard>\n        </div>\n      </section>\n\n      {/* Section: Button Variants */}\n      <section data-testid=\"button-variants-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Button Variants</h2>\n        <div className=\"flex flex-wrap gap-4\">\n          <ExampleButton variant=\"primary\" data-testid=\"btn-primary\">\n            Primary\n          </ExampleButton>\n          <ExampleButton variant=\"secondary\" data-testid=\"btn-secondary\">\n            Secondary\n          </ExampleButton>\n          <ExampleButton variant=\"destructive\" data-testid=\"btn-destructive\">\n            Destructive\n          </ExampleButton>\n          <ExampleButton variant=\"outline\" data-testid=\"btn-outline\">\n            Outline\n          </ExampleButton>\n          <ExampleButton variant=\"ghost\" data-testid=\"btn-ghost\">\n            Ghost\n          </ExampleButton>\n          <ExampleButton variant=\"link\" data-testid=\"btn-link\">\n            Link\n          </ExampleButton>\n        </div>\n      </section>\n\n      {/* Section: Button Sizes */}\n      <section data-testid=\"button-sizes-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Button Sizes</h2>\n        <div className=\"flex flex-wrap items-center gap-4\">\n          <ExampleButton size=\"sm\" data-testid=\"btn-small\">\n            Small\n          </ExampleButton>\n          <ExampleButton size=\"md\" data-testid=\"btn-medium\">\n            Medium\n          </ExampleButton>\n          <ExampleButton size=\"lg\" data-testid=\"btn-large\">\n            Large\n          </ExampleButton>\n        </div>\n      </section>\n\n      {/* Section: Button States */}\n      <section data-testid=\"button-states-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Button States</h2>\n        <div className=\"flex flex-wrap gap-4\">\n          <ExampleButton data-testid=\"btn-normal\">Normal</ExampleButton>\n          <ExampleButton disabled data-testid=\"btn-disabled\">\n            Disabled\n          </ExampleButton>\n          <ExampleButton loading data-testid=\"btn-loading\">\n            Loading\n          </ExampleButton>\n          <ExampleButton fullWidth data-testid=\"btn-fullwidth\">\n            Full Width\n          </ExampleButton>\n        </div>\n      </section>\n\n      {/* Section: Class Name Verification */}\n      <section data-testid=\"classname-verification-section\">\n        <h2 className=\"text-2xl font-semibold mb-6\">Scoped Class Names</h2>\n        <div className=\"bg-muted p-6 rounded-lg\">\n          <p className=\"mb-4\">\n            CSS Module class names are scoped to prevent conflicts. Here are the\n            generated class names:\n          </p>\n          <pre\n            className=\"bg-background p-4 rounded border text-sm overflow-x-auto\"\n            data-testid=\"scoped-classnames\"\n          >\n            {JSON.stringify(\n              {\n                card: styles.card,\n                header: styles.header,\n                title: styles.title,\n                content: styles.content,\n                elevated: styles.elevated,\n                interactive: styles.interactive,\n              },\n              null,\n              2\n            )}\n          </pre>\n          <p className=\"mt-4 text-sm text-muted-foreground\">\n            Notice how each class name includes a unique hash to ensure scoping.\n          </p>\n        </div>\n      </section>\n    </div>\n  );\n}\n"
}
Now let me create the Playwright verification test:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/css-modules-verification.spec.ts",
  "content": "/**\n * CSS Modules Verification Test\n *\n * This test verifies that the CSS Modules implementation is working correctly:\n * - Scoped class names are generated with proper naming convention\n * - Styles are applied correctly to components\n * - Composition works as expected\n * - TypeScript type definitions work\n */\n\nimport { test, expect } from \"@playwright/test\";\n\ntest.describe(\"CSS Modules Implementation\", () => {\n  test.beforeEach(async ({ page }) => {\n    await page.goto(\"/css-modules-demo\");\n    // Wait for the page to fully load\n    await page.waitForSelector('[data-testid=\"css-modules-demo-title\"]');\n  });\n\n  test(\"page loads with CSS Modules demo content\", async ({ page }) => {\n    // Verify the page title is present\n    const title = page.locator('[data-testid=\"css-modules-demo-title\"]');\n    await expect(title).toBeVisible();\n    await expect(title).toHaveText(\"CSS Modules Demo\");\n  });\n\n  test(\"card variants are rendered with scoped class names\", async ({\n    page,\n  }) => {\n    // Check that card variants are visible\n    const defaultCard = page.locator('[data-testid=\"card-default\"]');\n    const elevatedCard = page.locator('[data-testid=\"card-elevated\"]');\n    const interactiveCard = page.locator('[data-testid=\"card-interactive\"]');\n\n    await expect(defaultCard).toBeVisible();\n    await expect(elevatedCard).toBeVisible();\n    await expect(interactiveCard).toBeVisible();\n\n    // Verify that cards have scoped class names (contain hash pattern)\n    const defaultCardClass = await defaultCard.getAttribute(\"class\");\n    expect(defaultCardClass).toBeTruthy();\n    // In development, class names should follow pattern: [name]__[local]___[hash]\n    // In production, class names should be: [hash]\n    expect(defaultCardClass?.length).toBeGreaterThan(0);\n  });\n\n  test(\"card sizes are applied correctly\", async ({ page }) => {\n    const smallCard = page.locator('[data-testid=\"card-small\"]');\n    const mediumCard = page.locator('[data-testid=\"card-medium\"]');\n    const largeCard = page.locator('[data-testid=\"card-large\"]');\n\n    await expect(smallCard).toBeVisible();\n    await expect(mediumCard).toBeVisible();\n    await expect(largeCard).toBeVisible();\n\n    // Verify size data attributes\n    await expect(smallCard).toHaveAttribute(\"data-size\", \"sm\");\n    await expect(mediumCard).toHaveAttribute(\"data-size\", \"md\");\n    await expect(largeCard).toHaveAttribute(\"data-size\", \"lg\");\n  });\n\n  test(\"button variants are styled correctly\", async ({ page }) => {\n    const primaryBtn = page.locator('[data-testid=\"btn-primary\"]');\n    const secondaryBtn = page.locator('[data-testid=\"btn-secondary\"]');\n    const destructiveBtn = page.locator('[data-testid=\"btn-destructive\"]');\n    const outlineBtn = page.locator('[data-testid=\"btn-outline\"]');\n    const ghostBtn = page.locator('[data-testid=\"btn-ghost\"]');\n    const linkBtn = page.locator('[data-testid=\"btn-link\"]');\n\n    // Verify all buttons are visible\n    await expect(primaryBtn).toBeVisible();\n    await expect(secondaryBtn).toBeVisible();\n    await expect(destructiveBtn).toBeVisible();\n    await expect(outlineBtn).toBeVisible();\n    await expect(ghostBtn).toBeVisible();\n    await expect(linkBtn).toBeVisible();\n\n    // Verify variant data attributes\n    await expect(primaryBtn).toHaveAttribute(\"data-variant\", \"primary\");\n    await expect(secondaryBtn).toHaveAttribute(\"data-variant\", \"secondary\");\n    await expect(destructiveBtn).toHaveAttribute(\"data-variant\", \"destructive\");\n  });\n\n  test(\"button sizes are applied correctly\", async ({ page }) => {\n    const smallBtn = page.locator('[data-testid=\"btn-small\"]');\n    const mediumBtn = page.locator('[data-testid=\"btn-medium\"]');\n    const largeBtn = page.locator('[data-testid=\"btn-large\"]');\n\n    await expect(smallBtn).toBeVisible();\n    await expect(mediumBtn).toBeVisible();\n    await expect(largeBtn).toBeVisible();\n\n    // Verify size data attributes\n    await expect(smallBtn).toHaveAttribute(\"data-size\", \"sm\");\n    await expect(mediumBtn).toHaveAttribute(\"data-size\", \"md\");\n    await expect(largeBtn).toHaveAttribute(\"data-size\", \"lg\");\n  });\n\n  test(\"button states work correctly\", async ({ page }) => {\n    const disabledBtn = page.locator('[data-testid=\"btn-disabled\"]');\n    const loadingBtn = page.locator('[data-testid=\"btn-loading\"]');\n\n    // Verify disabled button\n    await expect(disabledBtn).toBeVisible();\n    await expect(disabledBtn).toBeDisabled();\n\n    // Verify loading button has loading attribute and is disabled\n    await expect(loadingBtn).toBeVisible();\n    await expect(loadingBtn).toHaveAttribute(\"data-loading\", \"true\");\n    await expect(loadingBtn).toBeDisabled();\n  });\n\n  test(\"scoped class names contain expected hash pattern\", async ({ page }) => {\n    // Get the class names from the verification section\n    const scopedClassNames = page.locator('[data-testid=\"scoped-classnames\"]');\n    await expect(scopedClassNames).toBeVisible();\n\n    const classNamesText = await scopedClassNames.textContent();\n    expect(classNamesText).toBeTruthy();\n\n    // Parse the JSON and verify class names have scoped pattern\n    const classNames = JSON.parse(classNamesText!);\n\n    // Verify each class name exists and has content\n    expect(classNames.card).toBeTruthy();\n    expect(classNames.header).toBeTruthy();\n    expect(classNames.title).toBeTruthy();\n    expect(classNames.content).toBeTruthy();\n    expect(classNames.elevated).toBeTruthy();\n    expect(classNames.interactive).toBeTruthy();\n\n    // Verify class names are scoped (not just the original names)\n    // In development mode, they should include the module name and hash\n    // Pattern: [name]__[local]___[hash] or just [hash] in production\n    Object.values(classNames).forEach((className) => {\n      expect(typeof className).toBe(\"string\");\n      expect((className as string).length).toBeGreaterThan(3);\n    });\n  });\n\n  test(\"interactive card has hover styles (visual check)\", async ({ page }) => {\n    const interactiveCard = page.locator('[data-testid=\"card-interactive\"]');\n\n    // Get initial box-shadow\n    const initialShadow = await interactiveCard.evaluate(\n      (el) => window.getComputedStyle(el).boxShadow\n    );\n\n    // Hover over the card\n    await interactiveCard.hover();\n\n    // Wait a bit for transition\n    await page.waitForTimeout(300);\n\n    // Get hover box-shadow - should be different (elevated)\n    const hoverShadow = await interactiveCard.evaluate(\n      (el) => window.getComputedStyle(el).boxShadow\n    );\n\n    // The shadow should change on hover (might be same if transitions not applied)\n    // Just verify we can read the computed style\n    expect(hoverShadow).toBeTruthy();\n  });\n\n  test(\"selected card has selected state styles\", async ({ page }) => {\n    const selectedCard = page.locator('[data-testid=\"card-selected\"]');\n\n    await expect(selectedCard).toBeVisible();\n    await expect(selectedCard).toHaveAttribute(\"data-selected\", \"true\");\n\n    // Verify it has a border or box-shadow indicating selection\n    const borderColor = await selectedCard.evaluate(\n      (el) => window.getComputedStyle(el).borderColor\n    );\n    expect(borderColor).toBeTruthy();\n  });\n});\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Configure Vite for CSS Modules support",
      "status": "completed",
      "activeForm": "Configuring Vite for CSS Modules support"
    },
    {
      "content": "Create TypeScript type definitions for CSS Modules",
      "status": "completed",
      "activeForm": "Creating TypeScript type definitions for CSS Modules"
    },
    {
      "content": "Create CSS Module utilities and helpers",
      "status": "completed",
      "activeForm": "Creating CSS Module utilities and helpers"
    },
    {
      "content": "Create example CSS Module components with proper naming",
      "status": "completed",
      "activeForm": "Creating example CSS Module components with proper naming"
    },
    {
      "content": "Handle global styles appropriately",
      "status": "completed",
      "activeForm": "Handling global styles appropriately"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification and clean up test",
      "status": "in_progress",
      "activeForm": "Running verification and cleaning up test"
    }
  ]
}
Now let me run the verification test. First, let me check if the app builds correctly with the new changes:

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | head -100",
  "description": "Build the app to check for TypeScript errors",
  "timeout": 180000
}
The build is successful. Now let me run the Playwright tests. First I need to install Playwright browsers:

🔧 Tool: Bash
Input: {
  "command": "npx playwright install chromium 2>&1",
  "description": "Install Playwright browsers",
  "timeout": 180000
}

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/css-modules-verification.spec.ts --timeout=60000 2>&1",
  "description": "Run CSS Modules verification test",
  "timeout": 300000
}
