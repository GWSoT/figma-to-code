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

export function CodeGenerationSettings() {
  const {
    cssFramework,
    jsFramework,
    options,
    setCSSFramework,
    setJSFramework,
    setOptions,
  } = useCSSFrameworkConfig();

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Code Generation Settings
        </PanelTitle>
        <PanelDescription>
          Configure how your Figma designs are converted to code. Choose your
          preferred CSS approach and target JavaScript framework.
        </PanelDescription>
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
