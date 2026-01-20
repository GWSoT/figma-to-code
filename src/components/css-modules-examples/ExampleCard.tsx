/**
 * ExampleCard Component
 *
 * Demonstrates how to use CSS Modules with React components:
 * - Importing and using scoped styles
 * - Composing multiple class names
 * - Handling variants with the createVariants utility
 * - TypeScript integration
 */

import React from "react";
import styles from "./ExampleCard.module.css";
import { composeClasses, createVariants } from "~/lib/css-modules";

// Define component variants using the CSS Module utility
const cardVariants = createVariants(styles, {
  base: "card",
  variants: {
    variant: {
      default: undefined, // Just use base
      elevated: "elevated",
      interactive: "interactive",
      outlined: "outlined",
      ghost: "ghost",
    },
    size: {
      sm: "small",
      md: undefined, // Default size, no additional class
      lg: "large",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

// Props type definition with variant support
export interface ExampleCardProps {
  /** Card variant style */
  variant?: "default" | "elevated" | "interactive" | "outlined" | "ghost";
  /** Card size */
  size?: "sm" | "md" | "lg";
  /** Whether the card is in a selected state */
  selected?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Whether the card is in a loading state */
  loading?: boolean;
  /** Additional class name */
  className?: string;
  /** Card children */
  children?: React.ReactNode;
}

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  children,
  className,
}: CardHeaderProps) {
  return (
    <div className={composeClasses(styles.header, className)}>
      {children || (
        <div>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Card Content Component
 */
export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={composeClasses(styles.content, className)}>{children}</div>
  );
}

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={composeClasses(styles.footer, className)}>{children}</div>
  );
}

/**
 * Card Actions Component (for buttons in footer)
 */
export interface CardActionsProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardActions({ children, className }: CardActionsProps) {
  return (
    <div className={composeClasses(styles.actions, className)}>{children}</div>
  );
}

/**
 * Card Media Component
 */
export interface CardMediaProps {
  src: string;
  alt: string;
  className?: string;
}

export function CardMedia({ src, alt, className }: CardMediaProps) {
  return (
    <div className={composeClasses(styles.media, className)}>
      <img src={src} alt={alt} />
    </div>
  );
}

/**
 * Main Card Component
 *
 * @example
 * // Basic usage
 * <ExampleCard>
 *   <CardHeader title="Card Title" description="Card description" />
 *   <CardContent>Content here</CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </ExampleCard>
 *
 * @example
 * // With variants
 * <ExampleCard variant="elevated" size="lg" selected>
 *   <CardContent>Large elevated card</CardContent>
 * </ExampleCard>
 */
export function ExampleCard({
  variant = "default",
  size = "md",
  selected = false,
  disabled = false,
  loading = false,
  className,
  children,
}: ExampleCardProps) {
  const baseClassName = cardVariants({ variant, size });

  const finalClassName = composeClasses(
    baseClassName,
    selected && styles.selected,
    disabled && styles.disabled,
    loading && styles.loading,
    className
  );

  return (
    <div
      className={finalClassName}
      data-variant={variant}
      data-size={size}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
    >
      {children}
    </div>
  );
}

// Attach sub-components
ExampleCard.Header = CardHeader;
ExampleCard.Content = CardContent;
ExampleCard.Footer = CardFooter;
ExampleCard.Actions = CardActions;
ExampleCard.Media = CardMedia;

export default ExampleCard;
