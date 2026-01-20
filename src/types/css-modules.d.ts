/**
 * TypeScript Type Definitions for CSS Modules
 *
 * This file provides type safety for CSS Module imports throughout the application.
 * It handles both generic .module.css imports and specific module declarations.
 */

/**
 * Base type for CSS Module class mappings
 * All CSS Modules export an object with string keys (class names) and string values (scoped class names)
 */
declare type CSSModuleClasses = {
  readonly [key: string]: string;
};

/**
 * CSS Module with composition support
 * Allows tracking of composed classes from other modules
 */
declare interface CSSModuleWithComposition extends CSSModuleClasses {
  readonly __composed?: readonly string[];
}

/**
 * Default module declaration for all .module.css files
 * This enables TypeScript to understand CSS Module imports
 */
declare module "*.module.css" {
  const classes: CSSModuleClasses;
  export default classes;
}

/**
 * SCSS Module support for projects using SCSS
 */
declare module "*.module.scss" {
  const classes: CSSModuleClasses;
  export default classes;
}

/**
 * SASS Module support
 */
declare module "*.module.sass" {
  const classes: CSSModuleClasses;
  export default classes;
}

/**
 * LESS Module support
 */
declare module "*.module.less" {
  const classes: CSSModuleClasses;
  export default classes;
}

/**
 * Global CSS imports (non-module CSS files)
 * These don't export class names and are used for side effects only
 */
declare module "*.global.css" {
  const content: string;
  export default content;
}

/**
 * CSS values import support (icss :export)
 * Allows exporting CSS values as JavaScript variables
 */
declare module "*.values.css" {
  const values: {
    readonly [key: string]: string;
  };
  export default values;
}

/**
 * Utility type for extracting class names from a CSS Module
 * @example
 * import styles from './Button.module.css'
 * type ButtonClasses = CSSModuleClassName<typeof styles>
 */
export type CSSModuleClassName<T extends CSSModuleClasses> = keyof T;

/**
 * Utility type for creating a typed className prop
 * @example
 * interface ButtonProps {
 *   variant: CSSModuleClassValue<typeof styles>
 * }
 */
export type CSSModuleClassValue<T extends CSSModuleClasses> = T[keyof T];

/**
 * Type for composable class name argument
 * Supports string, undefined, null, false for conditional class application
 */
export type ClassValue =
  | string
  | undefined
  | null
  | false
  | 0
  | { [key: string]: boolean | undefined | null };

/**
 * Utility type for mapping Figma component variants to CSS Module classes
 * Useful for the Figma-to-code conversion feature
 */
export interface CSSModuleVariantMap<T extends CSSModuleClasses> {
  readonly base: CSSModuleClassValue<T>;
  readonly variants?: {
    [variantName: string]: {
      [variantValue: string]: CSSModuleClassValue<T>;
    };
  };
  readonly compoundVariants?: Array<{
    conditions: { [variantName: string]: string };
    className: CSSModuleClassValue<T>;
  }>;
  readonly defaultVariants?: {
    [variantName: string]: string;
  };
}
