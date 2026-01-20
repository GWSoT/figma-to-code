/**
 * ExampleButton Component
 *
 * Demonstrates CSS Module composition and variant handling.
 * Uses composes to inherit styles from shared modules.
 */

import React from "react";
import styles from "./ExampleButton.module.css";
import { composeClasses, createVariants, cm } from "~/lib/css-modules";

// Define button variants
const buttonVariants = createVariants(styles, {
  variants: {
    variant: {
      primary: "primary",
      secondary: "secondary",
      destructive: "destructive",
      outline: "outline",
      ghost: "ghost",
      link: "link",
    },
    size: {
      sm: "small",
      md: "medium",
      lg: "large",
      icon: "icon",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ExampleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  /** Button size */
  size?: "sm" | "md" | "lg" | "icon";
  /** Shows loading spinner */
  loading?: boolean;
  /** Makes button full width */
  fullWidth?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
}

/**
 * Button component with CSS Module styling
 *
 * @example
 * // Primary button
 * <ExampleButton variant="primary">Click me</ExampleButton>
 *
 * @example
 * // With loading state
 * <ExampleButton loading>Saving...</ExampleButton>
 *
 * @example
 * // With icons
 * <ExampleButton leftIcon={<Icon />}>With Icon</ExampleButton>
 */
export function ExampleButton({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ExampleButtonProps) {
  const baseClassName = buttonVariants({ variant, size });

  const finalClassName = cm(
    baseClassName,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    className
  );

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg
            className={styles.spinnerIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
    </button>
  );
}

export default ExampleButton;
