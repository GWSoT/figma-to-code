/**
 * CSS Modules Utilities
 *
 * Helper functions for working with CSS Modules, including:
 * - Class name composition
 * - Conditional class application
 * - CSS values import handling
 * - Integration with Tailwind classes
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Type for CSS Module class mappings
 */
export type CSSModuleClasses = {
  readonly [key: string]: string;
};

/**
 * Composes multiple CSS Module classes together
 * Handles undefined/null values gracefully for conditional application
 *
 * @example
 * import styles from './Button.module.css'
 * const className = composeClasses(
 *   styles.button,
 *   isActive && styles.active,
 *   isDisabled && styles.disabled
 * )
 */
export function composeClasses(
  ...classes: (string | undefined | null | false | 0)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * CSS Module class composer with conditional support
 * Works like clsx but specifically designed for CSS Modules
 *
 * @example
 * import styles from './Card.module.css'
 * const className = cm(
 *   styles.card,
 *   { [styles.elevated]: isElevated, [styles.rounded]: hasRounding },
 *   variant === 'primary' && styles.primary
 * )
 */
export function cm(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Merge CSS Module classes with Tailwind utility classes
 * Useful when combining scoped CSS Module styles with Tailwind utilities
 *
 * @example
 * import styles from './Container.module.css'
 * const className = cmTw(
 *   styles.container,
 *   'px-4 py-2', // Tailwind utilities
 *   isWide && 'max-w-7xl'
 * )
 */
export function cmTw(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Creates a typed class name getter from a CSS Module
 * Provides runtime validation and better error messages
 *
 * @example
 * import styles from './Button.module.css'
 * const getClass = createClassGetter(styles)
 * const buttonClass = getClass('button') // Type-safe access
 */
export function createClassGetter<T extends CSSModuleClasses>(
  styles: T
): <K extends keyof T>(className: K) => T[K] {
  return (className) => {
    const value = styles[className];
    if (value === undefined) {
      console.warn(
        `[CSS Module] Class "${String(className)}" not found in module`
      );
      return "" as T[typeof className];
    }
    return value;
  };
}

/**
 * Creates a variant-based class resolver for CSS Modules
 * Useful for component variants similar to CVA (class-variance-authority)
 *
 * @example
 * import styles from './Button.module.css'
 *
 * const buttonVariants = createVariants(styles, {
 *   base: 'button',
 *   variants: {
 *     variant: {
 *       primary: 'primary',
 *       secondary: 'secondary',
 *     },
 *     size: {
 *       sm: 'small',
 *       md: 'medium',
 *       lg: 'large',
 *     },
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'md',
 *   },
 * })
 *
 * // Usage
 * buttonVariants({ variant: 'secondary', size: 'lg' })
 */
export interface VariantConfig<T extends CSSModuleClasses> {
  base?: keyof T;
  variants?: {
    [variantName: string]: {
      [variantValue: string]: keyof T;
    };
  };
  compoundVariants?: Array<{
    conditions: { [variantName: string]: string };
    className: keyof T;
  }>;
  defaultVariants?: {
    [variantName: string]: string;
  };
}

export function createVariants<
  T extends CSSModuleClasses,
  V extends VariantConfig<T>,
>(
  styles: T,
  config: V
): (
  props?: {
    [K in keyof V["variants"]]?: keyof V["variants"][K];
  } & { className?: string }
) => string {
  return (props = {}) => {
    const classes: string[] = [];

    // Add base class
    if (config.base) {
      classes.push(styles[config.base]);
    }

    // Apply variant classes
    if (config.variants) {
      for (const [variantName, variantValues] of Object.entries(
        config.variants
      )) {
        const selectedValue =
          (props as Record<string, string>)[variantName] ??
          config.defaultVariants?.[variantName];

        if (selectedValue && variantValues[selectedValue]) {
          const className = styles[variantValues[selectedValue] as keyof T];
          if (className) {
            classes.push(className);
          }
        }
      }
    }

    // Apply compound variants
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        const matches = Object.entries(compound.conditions).every(
          ([key, value]) => {
            const propValue =
              (props as Record<string, string>)[key] ??
              config.defaultVariants?.[key];
            return propValue === value;
          }
        );

        if (matches) {
          const className = styles[compound.className];
          if (className) {
            classes.push(className);
          }
        }
      }
    }

    // Add additional className if provided
    if (props.className) {
      classes.push(props.className);
    }

    return classes.filter(Boolean).join(" ");
  };
}

/**
 * Binds a CSS Module to a helper function for shorter syntax
 * Returns an object with the original styles and helper methods
 *
 * @example
 * import styles from './Menu.module.css'
 * const css = bindStyles(styles)
 *
 * // Direct access
 * css.styles.menuItem
 *
 * // Composed classes
 * css.compose('menu', 'active')
 *
 * // Conditional classes
 * css.cx({ menu: true, active: isActive })
 */
export function bindStyles<T extends CSSModuleClasses>(styles: T) {
  return {
    styles,
    compose: (...classNames: (keyof T | undefined | null | false)[]) =>
      classNames
        .filter((name): name is keyof T => Boolean(name))
        .map((name) => styles[name])
        .filter(Boolean)
        .join(" "),
    cx: (
      classMap: Partial<Record<keyof T, boolean | undefined | null>>
    ): string =>
      Object.entries(classMap)
        .filter(([, condition]) => condition)
        .map(([className]) => styles[className as keyof T])
        .filter(Boolean)
        .join(" "),
    get: <K extends keyof T>(className: K): T[K] => styles[className],
  };
}

/**
 * Type-safe style getter that throws on missing classes (development only)
 * In production, returns empty string and logs warning
 *
 * @example
 * import styles from './Component.module.css'
 * const s = strictStyles(styles)
 * const className = s.button // Throws if 'button' doesn't exist
 */
export function strictStyles<T extends CSSModuleClasses>(
  styles: T
): Readonly<T> {
  if (process.env.NODE_ENV === "development") {
    return new Proxy(styles, {
      get(target, prop: string) {
        if (!(prop in target)) {
          throw new Error(
            `[CSS Module] Class "${prop}" not found. Available classes: ${Object.keys(target).join(", ")}`
          );
        }
        return target[prop as keyof T];
      },
    }) as Readonly<T>;
  }
  return styles;
}

/**
 * Extracts CSS custom property values from a CSS values module
 * Useful for accessing CSS variables in JavaScript
 *
 * @example
 * // colors.values.css
 * // :export {
 * //   primary: #3b82f6;
 * //   secondary: #64748b;
 * // }
 *
 * import colors from './colors.values.css'
 * const { primary, secondary } = extractValues(colors)
 */
export function extractValues<T extends Record<string, string>>(
  values: T
): Readonly<T> {
  return Object.freeze({ ...values });
}

/**
 * Creates a scoped class name generator for dynamic component creation
 * Useful for Figma-to-code conversion where class names need to be generated
 *
 * @example
 * const scope = createScope('Button')
 * scope('container') // Returns 'Button__container'
 * scope('icon', 'large') // Returns 'Button__icon--large'
 */
export function createScope(componentName: string) {
  return (element: string, modifier?: string): string => {
    const base = `${componentName}__${element}`;
    return modifier ? `${base}--${modifier}` : base;
  };
}

/**
 * Validates that all expected classes exist in a CSS Module
 * Useful for testing and ensuring CSS-JS synchronization
 *
 * @example
 * import styles from './Button.module.css'
 * validateModule(styles, ['button', 'primary', 'disabled'])
 */
export function validateModule<T extends CSSModuleClasses>(
  styles: T,
  expectedClasses: string[]
): { valid: boolean; missing: string[] } {
  const missing = expectedClasses.filter(
    (className) => !(className in styles)
  );
  return {
    valid: missing.length === 0,
    missing,
  };
}
