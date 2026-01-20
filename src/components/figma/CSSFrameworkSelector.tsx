import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Tooltip } from "~/components/ui/tooltip";
import {
  Palette,
  Wind,
  Box,
  Code,
  Sparkles,
  FileCode,
  Atom,
  Triangle,
  Shield,
  Flame,
  Zap,
  Layers,
  Check,
  X,
  AlertTriangle,
  Info,
  Settings2,
} from "lucide-react";
import type {
  CSSFramework,
  JSFramework,
  CSSFrameworkOptions,
  VanillaCSSOptions,
  TailwindOptions,
  CSSModulesOptions,
  StyledComponentsOptions,
  EmotionOptions,
  SCSSOptions,
  CompatibilityLevel,
} from "~/types/css-frameworks";
import {
  CSS_FRAMEWORKS,
  JS_FRAMEWORKS,
  COMPATIBILITY_MATRIX,
  DEFAULT_OPTIONS,
} from "~/types/css-frameworks";

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Wind,
  Box,
  Code,
  Sparkles,
  FileCode,
  Atom,
  Triangle,
  Shield,
  Flame,
  Zap,
  Layers,
};

interface CSSFrameworkSelectorProps {
  selectedCSSFramework: CSSFramework;
  selectedJSFramework: JSFramework;
  options: CSSFrameworkOptions;
  onCSSFrameworkChange: (framework: CSSFramework) => void;
  onJSFrameworkChange: (framework: JSFramework) => void;
  onOptionsChange: (options: CSSFrameworkOptions) => void;
}

// Compatibility badge component
function CompatibilityBadge({ level }: { level: CompatibilityLevel }) {
  switch (level) {
    case "full":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-600 gap-1">
          <Check className="h-3 w-3" />
          Full Support
        </Badge>
      );
    case "partial":
      return (
        <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-600 text-white gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial
        </Badge>
      );
    case "none":
      return (
        <Badge variant="destructive" className="gap-1">
          <X className="h-3 w-3" />
          Not Supported
        </Badge>
      );
  }
}

// Vanilla CSS Options Panel
function VanillaCSSOptionsPanel({
  options,
  onChange,
}: {
  options: VanillaCSSOptions;
  onChange: (options: VanillaCSSOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useCustomProperties">CSS Custom Properties</Label>
          <p className="text-xs text-muted-foreground">
            Use CSS variables for colors, spacing, etc.
          </p>
        </div>
        <Switch
          id="useCustomProperties"
          checked={options.useCustomProperties}
          onCheckedChange={(checked) =>
            onChange({ ...options, useCustomProperties: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generateReset">Generate CSS Reset</Label>
          <p className="text-xs text-muted-foreground">
            Include a modern CSS reset/normalize
          </p>
        </div>
        <Switch
          id="generateReset"
          checked={options.generateReset}
          onCheckedChange={(checked) =>
            onChange({ ...options, generateReset: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useNesting">Native CSS Nesting</Label>
          <p className="text-xs text-muted-foreground">
            Use native CSS nesting syntax
          </p>
        </div>
        <Switch
          id="useNesting"
          checked={options.useNesting}
          onCheckedChange={(checked) =>
            onChange({ ...options, useNesting: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Media Query Strategy</Label>
        <Select
          value={options.mediaQueryStrategy}
          onValueChange={(value: "mobile-first" | "desktop-first") =>
            onChange({ ...options, mediaQueryStrategy: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile-first">Mobile First</SelectItem>
            <SelectItem value="desktop-first">Desktop First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Tailwind Options Panel
function TailwindOptionsPanel({
  options,
  onChange,
}: {
  options: TailwindOptions;
  onChange: (options: TailwindOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tailwind Version</Label>
        <Select
          value={options.version}
          onValueChange={(value: "3" | "4") =>
            onChange({ ...options, version: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">v4 (Latest)</SelectItem>
            <SelectItem value="3">v3 (Legacy)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useArbitraryValues">Arbitrary Values</Label>
          <p className="text-xs text-muted-foreground">
            Allow values like w-[123px] for exact sizing
          </p>
        </div>
        <Switch
          id="useArbitraryValues"
          checked={options.useArbitraryValues}
          onCheckedChange={(checked) =>
            onChange({ ...options, useArbitraryValues: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generateConfig">Generate Config</Label>
          <p className="text-xs text-muted-foreground">
            Create tailwind.config.js with design tokens
          </p>
        </div>
        <Switch
          id="generateConfig"
          checked={options.generateConfig}
          onCheckedChange={(checked) =>
            onChange({ ...options, generateConfig: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="prefixClasses">Prefix Classes</Label>
          <p className="text-xs text-muted-foreground">
            Add a prefix to all Tailwind classes
          </p>
        </div>
        <Switch
          id="prefixClasses"
          checked={options.prefixClasses}
          onCheckedChange={(checked) =>
            onChange({ ...options, prefixClasses: checked })
          }
        />
      </div>

      {options.prefixClasses && (
        <div className="space-y-2">
          <Label htmlFor="classPrefix">Class Prefix</Label>
          <Input
            id="classPrefix"
            value={options.classPrefix || ""}
            onChange={(e) =>
              onChange({ ...options, classPrefix: e.target.value })
            }
            placeholder="e.g., tw-"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Dark Mode Strategy</Label>
        <Select
          value={options.darkModeStrategy}
          onValueChange={(value: "class" | "media") =>
            onChange({ ...options, darkModeStrategy: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="class">Class-based (.dark)</SelectItem>
            <SelectItem value="media">System preference</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// CSS Modules Options Panel
function CSSModulesOptionsPanel({
  options,
  onChange,
}: {
  options: CSSModulesOptions;
  onChange: (options: CSSModulesOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generateTypings">TypeScript Typings</Label>
          <p className="text-xs text-muted-foreground">
            Generate .d.ts files for class names
          </p>
        </div>
        <Switch
          id="generateTypings"
          checked={options.generateTypings}
          onCheckedChange={(checked) =>
            onChange({ ...options, generateTypings: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="camelCaseOnly">camelCase Class Names</Label>
          <p className="text-xs text-muted-foreground">
            Convert class names to camelCase
          </p>
        </div>
        <Switch
          id="camelCaseOnly"
          checked={options.camelCaseOnly}
          onCheckedChange={(checked) =>
            onChange({ ...options, camelCaseOnly: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Scope Behaviour</Label>
        <Select
          value={options.scopeBehaviour}
          onValueChange={(value: "local" | "global") =>
            onChange({ ...options, scopeBehaviour: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Local (scoped)</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hashPrefix">Hash Prefix (optional)</Label>
        <Input
          id="hashPrefix"
          value={options.hashPrefix || ""}
          onChange={(e) =>
            onChange({ ...options, hashPrefix: e.target.value || undefined })
          }
          placeholder="e.g., app_"
        />
      </div>
    </div>
  );
}

// Styled Components Options Panel
function StyledComponentsOptionsPanel({
  options,
  onChange,
}: {
  options: StyledComponentsOptions;
  onChange: (options: StyledComponentsOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useServerStyleSheet">Server-Side Rendering</Label>
          <p className="text-xs text-muted-foreground">
            Include ServerStyleSheet setup for SSR
          </p>
        </div>
        <Switch
          id="useServerStyleSheet"
          checked={options.useServerStyleSheet}
          onCheckedChange={(checked) =>
            onChange({ ...options, useServerStyleSheet: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generateTheme">Generate Theme</Label>
          <p className="text-xs text-muted-foreground">
            Create a theme object with design tokens
          </p>
        </div>
        <Switch
          id="generateTheme"
          checked={options.generateTheme}
          onCheckedChange={(checked) =>
            onChange({ ...options, generateTheme: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useCSSProp">CSS Prop</Label>
          <p className="text-xs text-muted-foreground">
            Enable the css prop for inline styles
          </p>
        </div>
        <Switch
          id="useCSSProp"
          checked={options.useCSSProp}
          onCheckedChange={(checked) =>
            onChange({ ...options, useCSSProp: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="babelPlugin">Babel Plugin</Label>
          <p className="text-xs text-muted-foreground">
            Include babel-plugin-styled-components config
          </p>
        </div>
        <Switch
          id="babelPlugin"
          checked={options.babelPlugin}
          onCheckedChange={(checked) =>
            onChange({ ...options, babelPlugin: checked })
          }
        />
      </div>
    </div>
  );
}

// Emotion Options Panel
function EmotionOptionsPanel({
  options,
  onChange,
}: {
  options: EmotionOptions;
  onChange: (options: EmotionOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useSSR">Server-Side Rendering</Label>
          <p className="text-xs text-muted-foreground">
            Include SSR setup with extractCritical
          </p>
        </div>
        <Switch
          id="useSSR"
          checked={options.useSSR}
          onCheckedChange={(checked) =>
            onChange({ ...options, useSSR: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generateTheme">Generate Theme</Label>
          <p className="text-xs text-muted-foreground">
            Create a theme object with design tokens
          </p>
        </div>
        <Switch
          id="generateTheme"
          checked={options.generateTheme}
          onCheckedChange={(checked) =>
            onChange({ ...options, generateTheme: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useCSSProp">CSS Prop</Label>
          <p className="text-xs text-muted-foreground">
            Enable the css prop via @emotion/react
          </p>
        </div>
        <Switch
          id="useCSSProp"
          checked={options.useCSSProp}
          onCheckedChange={(checked) =>
            onChange({ ...options, useCSSProp: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Label Format</Label>
        <Select
          value={options.labelFormat}
          onValueChange={(value: "component" | "filename" | "none") =>
            onChange({ ...options, labelFormat: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="component">Component name</SelectItem>
            <SelectItem value="filename">Filename</SelectItem>
            <SelectItem value="none">None (production)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// SCSS Options Panel
function SCSSOptionsPanel({
  options,
  onChange,
}: {
  options: SCSSOptions;
  onChange: (options: SCSSOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useVariables">SCSS Variables</Label>
          <p className="text-xs text-muted-foreground">
            Use $variables for design tokens
          </p>
        </div>
        <Switch
          id="useVariables"
          checked={options.useVariables}
          onCheckedChange={(checked) =>
            onChange({ ...options, useVariables: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useMixins">Mixins</Label>
          <p className="text-xs text-muted-foreground">
            Generate reusable @mixin definitions
          </p>
        </div>
        <Switch
          id="useMixins"
          checked={options.useMixins}
          onCheckedChange={(checked) =>
            onChange({ ...options, useMixins: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useNesting">Nesting</Label>
          <p className="text-xs text-muted-foreground">
            Use nested selectors for component scoping
          </p>
        </div>
        <Switch
          id="useNesting"
          checked={options.useNesting}
          onCheckedChange={(checked) =>
            onChange({ ...options, useNesting: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="generatePartials">Partials</Label>
          <p className="text-xs text-muted-foreground">
            Split into _partial.scss files
          </p>
        </div>
        <Switch
          id="generatePartials"
          checked={options.generatePartials}
          onCheckedChange={(checked) =>
            onChange({ ...options, generatePartials: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Output Style</Label>
        <Select
          value={options.outputStyle}
          onValueChange={(value: "expanded" | "compressed") =>
            onChange({ ...options, outputStyle: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expanded">Expanded (readable)</SelectItem>
            <SelectItem value="compressed">Compressed (minified)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Framework Options Panel (renders the appropriate panel based on framework)
function FrameworkOptionsPanel({
  options,
  onChange,
}: {
  options: CSSFrameworkOptions;
  onChange: (options: CSSFrameworkOptions) => void;
}) {
  switch (options.framework) {
    case "vanilla-css":
      return (
        <VanillaCSSOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "vanilla-css", options: opts })}
        />
      );
    case "tailwind":
      return (
        <TailwindOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "tailwind", options: opts })}
        />
      );
    case "css-modules":
      return (
        <CSSModulesOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "css-modules", options: opts })}
        />
      );
    case "styled-components":
      return (
        <StyledComponentsOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "styled-components", options: opts })}
        />
      );
    case "emotion":
      return (
        <EmotionOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "emotion", options: opts })}
        />
      );
    case "scss":
      return (
        <SCSSOptionsPanel
          options={options.options}
          onChange={(opts) => onChange({ framework: "scss", options: opts })}
        />
      );
    default:
      return null;
  }
}

export function CSSFrameworkSelector({
  selectedCSSFramework,
  selectedJSFramework,
  options,
  onCSSFrameworkChange,
  onJSFrameworkChange,
  onOptionsChange,
}: CSSFrameworkSelectorProps) {
  const compatibility = useMemo(() => {
    return COMPATIBILITY_MATRIX[selectedCSSFramework][selectedJSFramework];
  }, [selectedCSSFramework, selectedJSFramework]);

  const handleCSSFrameworkChange = (framework: CSSFramework) => {
    onCSSFrameworkChange(framework);
    // Reset options to defaults for the new framework
    onOptionsChange(DEFAULT_OPTIONS[framework]);
  };

  return (
    <div className="space-y-6">
      {/* CSS Framework Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">CSS Approach</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(CSS_FRAMEWORKS).map((framework) => {
            const IconComponent = ICON_MAP[framework.icon];
            const isSelected = selectedCSSFramework === framework.id;
            const compat = COMPATIBILITY_MATRIX[framework.id][selectedJSFramework];

            return (
              <Tooltip
                key={framework.id}
                content={framework.features.join(" • ")}
              >
                <button
                  onClick={() => handleCSSFrameworkChange(framework.id)}
                  className={`relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all hover:border-primary/50 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  } ${compat.level === "none" ? "opacity-60" : ""}`}
                >
                  {/* Compatibility indicator */}
                  <div className="absolute top-2 right-2">
                    {compat.level === "full" && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {compat.level === "partial" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    {compat.level === "none" && (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-medium">{framework.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {framework.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {framework.requiresRuntime && (
                      <Badge variant="outline" className="text-xs">
                        Runtime
                      </Badge>
                    )}
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* JS Framework Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Target JS Framework</Label>
        <div className="flex flex-wrap gap-2">
          {Object.values(JS_FRAMEWORKS).map((framework) => {
            const IconComponent = ICON_MAP[framework.icon];
            const isSelected = selectedJSFramework === framework.id;

            return (
              <Button
                key={framework.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onJSFrameworkChange(framework.id)}
                className="gap-2"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {framework.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Compatibility Status */}
      <Card
        className={`${
          compatibility.level === "full"
            ? "border-green-500/50 bg-green-500/5"
            : compatibility.level === "partial"
            ? "border-yellow-500/50 bg-yellow-500/5"
            : "border-destructive/50 bg-destructive/5"
        }`}
      >
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <CompatibilityBadge level={compatibility.level} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {CSS_FRAMEWORKS[selectedCSSFramework].name} +{" "}
                {JS_FRAMEWORKS[selectedJSFramework].name}
              </p>
              {compatibility.notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {compatibility.notes}
                </p>
              )}
              {compatibility.level === "none" && (
                <p className="text-sm text-destructive mt-1">
                  This combination is not recommended. Consider choosing a different
                  CSS approach for {JS_FRAMEWORKS[selectedJSFramework].name}.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework-Specific Options */}
      <Accordion type="single" collapsible defaultValue="options">
        <AccordionItem value="options" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span>
                {CSS_FRAMEWORKS[selectedCSSFramework].name} Options
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <FrameworkOptionsPanel options={options} onChange={onOptionsChange} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Export a hook for managing CSS framework state
export function useCSSFrameworkConfig() {
  const [cssFramework, setCSSFramework] = useState<CSSFramework>("tailwind");
  const [jsFramework, setJSFramework] = useState<JSFramework>("react");
  const [options, setOptions] = useState<CSSFrameworkOptions>(
    DEFAULT_OPTIONS["tailwind"]
  );

  const handleCSSFrameworkChange = (framework: CSSFramework) => {
    setCSSFramework(framework);
    setOptions(DEFAULT_OPTIONS[framework]);
  };

  return {
    cssFramework,
    jsFramework,
    options,
    setCSSFramework: handleCSSFrameworkChange,
    setJSFramework,
    setOptions,
    compatibility: COMPATIBILITY_MATRIX[cssFramework][jsFramework],
  };
}
