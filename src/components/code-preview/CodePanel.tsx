import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Copy, Check, FileCode, FileText, FileType } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { CodePanelProps, ElementMapping } from "./types";
import type { GeneratedFile } from "~/utils/code-generation-agent/types";

/**
 * Get file icon based on language
 */
function getFileIcon(language: string) {
  switch (language) {
    case "typescript":
    case "javascript":
      return <FileCode className="h-4 w-4" />;
    case "css":
    case "scss":
      return <FileType className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

/**
 * Simple syntax highlighting for common languages
 */
function highlightCode(code: string, language: string): string {
  // Keywords for different languages
  const keywords: Record<string, string[]> = {
    typescript: [
      "import", "export", "from", "const", "let", "var", "function", "return",
      "if", "else", "for", "while", "class", "interface", "type", "extends",
      "implements", "new", "this", "async", "await", "try", "catch", "throw",
      "default", "as", "typeof", "instanceof", "in", "of", "true", "false", "null", "undefined"
    ],
    javascript: [
      "import", "export", "from", "const", "let", "var", "function", "return",
      "if", "else", "for", "while", "class", "extends", "new", "this", "async",
      "await", "try", "catch", "throw", "default", "typeof", "instanceof", "in", "of",
      "true", "false", "null", "undefined"
    ],
    css: [
      "display", "flex", "grid", "position", "width", "height", "margin", "padding",
      "border", "background", "color", "font", "text", "align", "justify", "items",
      "content", "gap", "overflow", "z-index", "opacity", "transform", "transition"
    ],
    html: ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "button", "input", "form", "label", "ul", "li", "nav", "header", "footer", "main", "section", "article"]
  };

  const langKeywords = keywords[language] || keywords.javascript;

  // Escape HTML
  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight strings
  result = result.replace(
    /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    '<span class="text-green-400">$&</span>'
  );

  // Highlight comments
  result = result.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    '<span class="text-muted-foreground italic">$&</span>'
  );

  // Highlight keywords
  const keywordPattern = new RegExp(`\\b(${langKeywords.join("|")})\\b`, "g");
  result = result.replace(
    keywordPattern,
    '<span class="text-purple-400 font-medium">$&</span>'
  );

  // Highlight numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="text-orange-400">$&</span>'
  );

  // Highlight JSX tags
  if (language === "typescript" || language === "javascript") {
    result = result.replace(
      /(&lt;\/?)([A-Z][a-zA-Z0-9]*)/g,
      '$1<span class="text-cyan-400">$2</span>'
    );
  }

  return result;
}

/**
 * Find element mapping for a given line number
 */
function findElementForLine(
  line: number,
  file: string,
  mappings: ElementMapping[]
): ElementMapping | null {
  for (const mapping of mappings) {
    if (
      mapping.codeLocation.file === file &&
      line >= mapping.codeLocation.startLine &&
      line <= mapping.codeLocation.endLine
    ) {
      return mapping;
    }
  }
  return null;
}

/**
 * Panel for displaying generated code with syntax highlighting
 */
export function CodePanel({
  files,
  selectedFileIndex,
  onFileSelect,
  elementMappings,
  highlightState,
  onElementHover,
  onElementClick,
  onScroll,
  syncScrollPosition,
  scrollToLine,
}: CodePanelProps) {
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isSyncingRef = useRef(false);

  const selectedFile = files[selectedFileIndex];

  // Split code into lines with highlighting info
  const codeLines = useMemo(() => {
    if (!selectedFile) return [];
    const lines = selectedFile.content.split("\n");
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const element = findElementForLine(
        lineNumber,
        selectedFile.path,
        elementMappings
      );
      return {
        number: lineNumber,
        content: line,
        highlighted: highlightCode(line, selectedFile.language),
        elementId: element?.id ?? null,
      };
    });
  }, [selectedFile, elementMappings]);

  // Handle scroll sync from design panel
  useEffect(() => {
    if (syncScrollPosition !== undefined && codeContainerRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const container = codeContainerRef.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = syncScrollPosition * maxScroll;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    }
  }, [syncScrollPosition]);

  // Scroll to specific line when requested
  useEffect(() => {
    if (scrollToLine !== undefined && codeContainerRef.current) {
      const lineHeight = 24; // Approximate line height
      codeContainerRef.current.scrollTop = (scrollToLine - 5) * lineHeight;
    }
  }, [scrollToLine]);

  // Handle local scroll
  const handleScroll = useCallback(() => {
    if (codeContainerRef.current && !isSyncingRef.current) {
      const container = codeContainerRef.current;
      onScroll(container.scrollTop, container.scrollHeight);
    }
  }, [onScroll]);

  // Copy code to clipboard
  const handleCopy = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopiedIndex(selectedFileIndex);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle line hover
  const handleLineHover = (lineNumber: number) => {
    const element = findElementForLine(
      lineNumber,
      selectedFile?.path ?? "",
      elementMappings
    );
    onElementHover(element?.id ?? null);
  };

  // Handle line click
  const handleLineClick = (lineNumber: number) => {
    const element = findElementForLine(
      lineNumber,
      selectedFile?.path ?? "",
      elementMappings
    );
    onElementClick(element?.id ?? null);
  };

  // Check if a line is in a highlighted element's range
  const isLineHighlighted = (lineNumber: number): boolean => {
    const highlightedId = highlightState.hoveredElementId ?? highlightState.selectedElementId;
    if (!highlightedId || !selectedFile) return false;

    const mapping = elementMappings.find((m) => m.id === highlightedId);
    if (!mapping || mapping.codeLocation.file !== selectedFile.path) return false;

    return (
      lineNumber >= mapping.codeLocation.startLine &&
      lineNumber <= mapping.codeLocation.endLine
    );
  };

  const isLineSelected = (lineNumber: number): boolean => {
    if (!highlightState.selectedElementId || !selectedFile) return false;

    const mapping = elementMappings.find(
      (m) => m.id === highlightState.selectedElementId
    );
    if (!mapping || mapping.codeLocation.file !== selectedFile.path) return false;

    return (
      lineNumber >= mapping.codeLocation.startLine &&
      lineNumber <= mapping.codeLocation.endLine
    );
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col h-full bg-muted/30 items-center justify-center">
        <FileCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No generated code</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Generate code from a design to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* File tabs */}
      <div className="flex items-center justify-between border-b border-border/50 bg-[#252526]">
        <div className="flex overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={file.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm border-r border-border/30 transition-colors whitespace-nowrap",
                index === selectedFileIndex
                  ? "bg-[#1e1e1e] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#2d2d2d]"
              )}
              onClick={() => onFileSelect(index)}
            >
              {getFileIcon(file.language)}
              <span>{file.path.split("/").pop()}</span>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 h-7 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copiedIndex === selectedFileIndex ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-auto font-mono text-sm"
        onScroll={handleScroll}
      >
        <div className="min-w-max">
          {codeLines.map((line) => (
            <div
              key={line.number}
              className={cn(
                "flex hover:bg-white/5 transition-colors",
                isLineHighlighted(line.number) && "bg-primary/10",
                isLineSelected(line.number) && "bg-primary/20"
              )}
              onMouseEnter={() => handleLineHover(line.number)}
              onMouseLeave={() => onElementHover(null)}
              onClick={() => handleLineClick(line.number)}
            >
              {/* Line number */}
              <span className="w-12 px-3 py-0.5 text-right text-muted-foreground/50 select-none border-r border-border/30">
                {line.number}
              </span>
              {/* Code content */}
              <pre className="flex-1 px-4 py-0.5">
                <code
                  dangerouslySetInnerHTML={{ __html: line.highlighted || "&nbsp;" }}
                />
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground border-t border-border/50 bg-[#252526]">
        <span>{selectedFile?.language ?? "Unknown"}</span>
        <span>{codeLines.length} lines</span>
      </div>
    </div>
  );
}
