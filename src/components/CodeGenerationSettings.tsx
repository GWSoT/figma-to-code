import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "~/components/ui/panel";
import { Code } from "lucide-react";
import {
  CSSFrameworkSelector,
  useCSSFrameworkConfig,
} from "~/components/figma/CSSFrameworkSelector";
import { ProjectConfigurationManager } from "~/components/figma/ProjectConfigurationManager";
import type { CSSFramework, JSFramework, CSSFrameworkOptions } from "~/types/css-frameworks";
import { DEFAULT_OPTIONS } from "~/types/css-frameworks";

export function CodeGenerationSettings() {
  const {
    cssFramework,
    jsFramework,
    options,
    setCSSFramework,
    setJSFramework,
    setOptions,
  } = useCSSFrameworkConfig();

  // Handle loading a configuration
  const handleLoadConfiguration = (config: {
    cssFramework: CSSFramework;
    jsFramework: JSFramework;
    options: CSSFrameworkOptions;
  }) => {
    setCSSFramework(config.cssFramework);
    setJSFramework(config.jsFramework);
    setOptions(config.options);
  };

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <PanelTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Generation Settings
            </PanelTitle>
            <PanelDescription>
              Configure how your Figma designs are converted to code. Choose your
              preferred CSS approach and target JavaScript framework.
            </PanelDescription>
          </div>
          <ProjectConfigurationManager
            currentConfig={{
              cssFramework,
              jsFramework,
              options,
            }}
            onLoadConfiguration={handleLoadConfiguration}
          />
        </div>
      </PanelHeader>
      <PanelContent>
        <CSSFrameworkSelector
          selectedCSSFramework={cssFramework}
          selectedJSFramework={jsFramework}
          options={options}
          onCSSFrameworkChange={setCSSFramework}
          onJSFrameworkChange={setJSFramework}
          onOptionsChange={setOptions}
        />
      </PanelContent>
    </Panel>
  );
}
