/**
 * CSS Modules Examples
 *
 * This module exports example components demonstrating CSS Modules usage:
 * - Scoped class names with proper naming conventions
 * - CSS composition (composes)
 * - Value imports via :export
 * - TypeScript type definitions
 * - Integration with Tailwind utilities
 */

// Components
export { ExampleCard, CardHeader, CardContent, CardFooter, CardActions, CardMedia } from "./ExampleCard";
export type { ExampleCardProps, CardHeaderProps, CardContentProps, CardFooterProps, CardActionsProps, CardMediaProps } from "./ExampleCard";

export { ExampleButton } from "./ExampleButton";
export type { ExampleButtonProps } from "./ExampleButton";

// Style modules (for advanced composition use cases)
export { default as sharedStyles } from "./shared.module.css";

// Note: CSS values can be imported directly in components:
// import theme from './theme.values.css'
