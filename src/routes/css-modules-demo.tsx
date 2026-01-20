/**
 * CSS Modules Demo Page
 *
 * This route demonstrates the CSS Modules implementation with:
 * - Scoped class names
 * - Proper naming conventions
 * - Composition
 * - TypeScript integration
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  ExampleCard,
  CardHeader,
  CardContent,
  CardFooter,
  ExampleButton,
} from "~/components/css-modules-examples";
import styles from "~/components/css-modules-examples/ExampleCard.module.css";

export const Route = createFileRoute("/css-modules-demo")({
  component: CSSModulesDemo,
});

function CSSModulesDemo() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <header className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          data-testid="css-modules-demo-title"
        >
          CSS Modules Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Demonstrating scoped CSS with proper naming conventions, composition,
          and TypeScript type definitions.
        </p>
      </header>

      {/* Section: Card Variants */}
      <section data-testid="card-variants-section">
        <h2 className="text-2xl font-semibold mb-6">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ExampleCard variant="default" data-testid="card-default">
            <CardHeader title="Default Card" description="Basic card styling" />
            <CardContent>
              <p>This is the default card variant with standard styling.</p>
            </CardContent>
            <CardFooter>
              <ExampleButton size="sm">Action</ExampleButton>
            </CardFooter>
          </ExampleCard>

          <ExampleCard variant="elevated" data-testid="card-elevated">
            <CardHeader
              title="Elevated Card"
              description="Enhanced shadow effect"
            />
            <CardContent>
              <p>This card has an elevated appearance with deeper shadows.</p>
            </CardContent>
            <CardFooter>
              <ExampleButton size="sm" variant="secondary">
                Learn More
              </ExampleButton>
            </CardFooter>
          </ExampleCard>

          <ExampleCard variant="interactive" data-testid="card-interactive">
            <CardHeader
              title="Interactive Card"
              description="Hover to see effect"
            />
            <CardContent>
              <p>This card responds to hover interactions with animations.</p>
            </CardContent>
            <CardFooter>
              <ExampleButton size="sm" variant="outline">
                Explore
              </ExampleButton>
            </CardFooter>
          </ExampleCard>

          <ExampleCard variant="outlined" data-testid="card-outlined">
            <CardHeader
              title="Outlined Card"
              description="Transparent background"
            />
            <CardContent>
              <p>This card has a transparent background with a thick border.</p>
            </CardContent>
          </ExampleCard>

          <ExampleCard variant="ghost" data-testid="card-ghost">
            <CardHeader
              title="Ghost Card"
              description="Minimal styling"
            />
            <CardContent>
              <p>A minimalist card with no border or shadow by default.</p>
            </CardContent>
          </ExampleCard>

          <ExampleCard selected data-testid="card-selected">
            <CardHeader title="Selected Card" description="Active state" />
            <CardContent>
              <p>This card shows the selected/active state styling.</p>
            </CardContent>
          </ExampleCard>
        </div>
      </section>

      {/* Section: Card Sizes */}
      <section data-testid="card-sizes-section">
        <h2 className="text-2xl font-semibold mb-6">Card Sizes</h2>
        <div className="space-y-6">
          <ExampleCard size="sm" data-testid="card-small">
            <CardHeader
              title="Small Card"
              description="Compact size with reduced padding"
            />
            <CardContent>
              <p>Smaller text and tighter spacing.</p>
            </CardContent>
          </ExampleCard>

          <ExampleCard size="md" data-testid="card-medium">
            <CardHeader
              title="Medium Card"
              description="Default size with standard padding"
            />
            <CardContent>
              <p>Standard text size and comfortable spacing.</p>
            </CardContent>
          </ExampleCard>

          <ExampleCard size="lg" data-testid="card-large">
            <CardHeader
              title="Large Card"
              description="Expanded size with generous padding"
            />
            <CardContent>
              <p>Larger text and more spacious layout for featured content.</p>
            </CardContent>
          </ExampleCard>
        </div>
      </section>

      {/* Section: Button Variants */}
      <section data-testid="button-variants-section">
        <h2 className="text-2xl font-semibold mb-6">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <ExampleButton variant="primary" data-testid="btn-primary">
            Primary
          </ExampleButton>
          <ExampleButton variant="secondary" data-testid="btn-secondary">
            Secondary
          </ExampleButton>
          <ExampleButton variant="destructive" data-testid="btn-destructive">
            Destructive
          </ExampleButton>
          <ExampleButton variant="outline" data-testid="btn-outline">
            Outline
          </ExampleButton>
          <ExampleButton variant="ghost" data-testid="btn-ghost">
            Ghost
          </ExampleButton>
          <ExampleButton variant="link" data-testid="btn-link">
            Link
          </ExampleButton>
        </div>
      </section>

      {/* Section: Button Sizes */}
      <section data-testid="button-sizes-section">
        <h2 className="text-2xl font-semibold mb-6">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <ExampleButton size="sm" data-testid="btn-small">
            Small
          </ExampleButton>
          <ExampleButton size="md" data-testid="btn-medium">
            Medium
          </ExampleButton>
          <ExampleButton size="lg" data-testid="btn-large">
            Large
          </ExampleButton>
        </div>
      </section>

      {/* Section: Button States */}
      <section data-testid="button-states-section">
        <h2 className="text-2xl font-semibold mb-6">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <ExampleButton data-testid="btn-normal">Normal</ExampleButton>
          <ExampleButton disabled data-testid="btn-disabled">
            Disabled
          </ExampleButton>
          <ExampleButton loading data-testid="btn-loading">
            Loading
          </ExampleButton>
          <ExampleButton fullWidth data-testid="btn-fullwidth">
            Full Width
          </ExampleButton>
        </div>
      </section>

      {/* Section: Class Name Verification */}
      <section data-testid="classname-verification-section">
        <h2 className="text-2xl font-semibold mb-6">Scoped Class Names</h2>
        <div className="bg-muted p-6 rounded-lg">
          <p className="mb-4">
            CSS Module class names are scoped to prevent conflicts. Here are the
            generated class names:
          </p>
          <pre
            className="bg-background p-4 rounded border text-sm overflow-x-auto"
            data-testid="scoped-classnames"
          >
            {JSON.stringify(
              {
                card: styles.card,
                header: styles.header,
                title: styles.title,
                content: styles.content,
                elevated: styles.elevated,
                interactive: styles.interactive,
              },
              null,
              2
            )}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            Notice how each class name includes a unique hash to ensure scoping.
          </p>
        </div>
      </section>
    </div>
  );
}
