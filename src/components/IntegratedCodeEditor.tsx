/**
 * IntegratedCodeEditor Component
 *
 * A full-featured code editor with:
 * - Syntax highlighting for all supported languages
 * - Find/replace with regex support
 * - Multiple cursors
 * - Code folding
 * - Error highlighting
 * - Autocomplete
 */

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react";
import type * as MonacoEditor from "monaco-editor";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  FileCode,
  Palette,
  FileType,
  Code2,
  Copy,
  Check,
  Search,
  Replace,
  ChevronDown,
  ChevronRight,
  X,
  FoldVertical,
  UnfoldVertical,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { GeneratedFile } from "~/utils/code-generation-agent/types";

// ============================================================================
// Types
// ============================================================================

export interface EditorError {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface IntegratedCodeEditorProps {
  files: GeneratedFile[];
  selectedFile: GeneratedFile | null;
  onFileSelect: (file: GeneratedFile) => void;
  onCodeChange: (content: string) => void;
  errors?: EditorError[];
  readOnly?: boolean;
  theme?: "vs-dark" | "light";
  showMinimap?: boolean;
  wordWrap?: "on" | "off" | "wordWrapColumn" | "bounded";
}

// ============================================================================
// Language Mapping
// ============================================================================

const getMonacoLanguage = (file: GeneratedFile): string => {
  const extension = file.path.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",

    // Web
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",

    // Frameworks
    vue: "vue",
    svelte: "svelte",

    // Data
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",

    // Other
    md: "markdown",
    mdx: "markdown",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
  };

  // Check file language property first
  if (file.language) {
    const langMap: Record<string, string> = {
      typescript: "typescript",
      javascript: "javascript",
      css: "css",
      scss: "scss",
      html: "html",
      vue: "vue",
      svelte: "svelte",
    };
    if (langMap[file.language]) {
      return langMap[file.language];
    }
  }

  return extension ? languageMap[extension] || "plaintext" : "plaintext";
};

// ============================================================================
// File Tab Component
// ============================================================================

function FileTab({
  file,
  isSelected,
  hasErrors,
  hasWarnings,
  onClick,
}: {
  file: GeneratedFile;
  isSelected: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  onClick: () => void;
}) {
  const getFileIcon = (type: GeneratedFile["type"]) => {
    switch (type) {
      case "component":
        return <FileCode className="h-4 w-4" />;
      case "styles":
        return <Palette className="h-4 w-4" />;
      case "types":
        return <FileType className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 shrink-0 relative"
    >
      {getFileIcon(file.type)}
      <span>{file.path}</span>
      {hasErrors && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
      )}
      {!hasErrors && hasWarnings && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" />
      )}
    </Button>
  );
}

// ============================================================================
// Find/Replace Panel Component
// ============================================================================

function FindReplacePanel({
  editor,
  onClose,
}: {
  editor: MonacoEditor.editor.IStandaloneCodeEditor | null;
  onClose: () => void;
}) {
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  const handleFind = useCallback(() => {
    if (!editor || !findValue) return;

    const model = editor.getModel();
    if (!model) return;

    // Use Monaco's built-in find
    editor.getAction("actions.find")?.run();

    // Count matches
    try {
      const regex = isRegex
        ? new RegExp(findValue, isCaseSensitive ? "g" : "gi")
        : new RegExp(
            findValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            isCaseSensitive ? "g" : "gi"
          );
      const matches = model.getValue().match(regex);
      setMatchCount(matches?.length || 0);
    } catch {
      setMatchCount(0);
    }
  }, [editor, findValue, isRegex, isCaseSensitive]);

  const handleFindNext = useCallback(() => {
    if (!editor) return;
    editor.getAction("editor.action.nextMatchFindAction")?.run();
  }, [editor]);

  const handleFindPrevious = useCallback(() => {
    if (!editor) return;
    editor.getAction("editor.action.previousMatchFindAction")?.run();
  }, [editor]);

  const handleReplace = useCallback(() => {
    if (!editor) return;
    const selection = editor.getSelection();
    if (selection) {
      editor.executeEdits("replace", [
        {
          range: selection,
          text: replaceValue,
        },
      ]);
      handleFindNext();
    }
  }, [editor, replaceValue, handleFindNext]);

  const handleReplaceAll = useCallback(() => {
    if (!editor || !findValue) return;

    const model = editor.getModel();
    if (!model) return;

    const content = model.getValue();
    let newContent: string;

    try {
      if (isRegex) {
        const regex = new RegExp(findValue, isCaseSensitive ? "g" : "gi");
        newContent = content.replace(regex, replaceValue);
      } else {
        const regex = new RegExp(
          findValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          isCaseSensitive ? "g" : "gi"
        );
        newContent = content.replace(regex, replaceValue);
      }

      editor.executeEdits("replaceAll", [
        {
          range: model.getFullModelRange(),
          text: newContent,
        },
      ]);

      setMatchCount(0);
    } catch {
      // Invalid regex
    }
  }, [editor, findValue, replaceValue, isRegex, isCaseSensitive]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFindNext();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        handleFindPrevious();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    const input = findInputRef.current;
    input?.addEventListener("keydown", handleKeyDown);
    return () => input?.removeEventListener("keydown", handleKeyDown);
  }, [handleFindNext, handleFindPrevious, onClose]);

  // Auto-search on value change
  useEffect(() => {
    const timer = setTimeout(handleFind, 200);
    return () => clearTimeout(timer);
  }, [findValue, isRegex, isCaseSensitive, isWholeWord, handleFind]);

  return (
    <div className="border-b bg-muted/30 p-2 space-y-2">
      {/* Find row */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowReplace(!showReplace)}
        >
          {showReplace ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={findInputRef}
            type="text"
            placeholder="Find"
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {matchCount !== null && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={isCaseSensitive ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setIsCaseSensitive(!isCaseSensitive)}
            title="Match Case"
          >
            Aa
          </Button>
          <Button
            variant={isWholeWord ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setIsWholeWord(!isWholeWord)}
            title="Match Whole Word"
          >
            ab
          </Button>
          <Button
            variant={isRegex ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs font-mono"
            onClick={() => setIsRegex(!isRegex)}
            title="Use Regular Expression"
          >
            .*
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div className="flex items-center gap-2 pl-8">
          <input
            type="text"
            placeholder="Replace"
            value={replaceValue}
            onChange={(e) => setReplaceValue(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleReplace}
            disabled={!findValue}
          >
            Replace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleReplaceAll}
            disabled={!findValue}
          >
            Replace All
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error Panel Component
// ============================================================================

function ErrorPanel({ errors }: { errors: EditorError[] }) {
  const getSeverityIcon = (severity: EditorError["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (errors.length === 0) return null;

  return (
    <div className="border-t bg-muted/30 max-h-32 overflow-auto">
      <div className="p-2 text-xs space-y-1">
        {errors.map((error, index) => (
          <div key={index} className="flex items-start gap-2">
            {getSeverityIcon(error.severity)}
            <span className="text-muted-foreground">
              [{error.line}:{error.column}]
            </span>
            <span>{error.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function IntegratedCodeEditor({
  files,
  selectedFile,
  onFileSelect,
  onCodeChange,
  errors = [],
  readOnly = false,
  theme = "vs-dark",
  showMinimap = true,
  wordWrap = "on",
}: IntegratedCodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Group errors by file
  const fileErrors = useMemo(() => {
    const grouped: Record<string, EditorError[]> = {};
    errors.forEach((error) => {
      // Assuming errors apply to the selected file if not specified
      const fileKey = selectedFile?.path || "";
      if (!grouped[fileKey]) grouped[fileKey] = [];
      grouped[fileKey].push(error);
    });
    return grouped;
  }, [errors, selectedFile]);

  const currentFileErrors = selectedFile
    ? fileErrors[selectedFile.path] || []
    : [];

  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: showMinimap },
      wordWrap: wordWrap,
      folding: true,
      foldingStrategy: "auto",
      showFoldingControls: "always",
      lineNumbers: "on",
      renderLineHighlight: "all",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      parameterHints: { enabled: true },
      // Multi-cursor support
      multiCursorModifier: "alt",
      cursorStyle: "line",
      cursorBlinking: "smooth",
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowFindReplace(true);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      setShowFindReplace(true);
    });

    // Register Svelte as a custom language if not registered
    if (!monaco.languages.getLanguages().some((lang) => lang.id === "svelte")) {
      monaco.languages.register({ id: "svelte" });
      monaco.languages.setMonarchTokensProvider("svelte", {
        tokenizer: {
          root: [
            [/<script[^>]*>/, { token: "tag", next: "@script" }],
            [/<style[^>]*>/, { token: "tag", next: "@style" }],
            [/<\/?[\w\-:]+/, "tag"],
            [/\{[#/:]?\w+/, "keyword"],
            [/\}/, "keyword"],
            [/[^<{]+/, ""],
          ],
          script: [
            [/<\/script>/, { token: "tag", next: "@pop" }],
            [/.+/, "source.js"],
          ],
          style: [
            [/<\/style>/, { token: "tag", next: "@pop" }],
            [/.+/, "source.css"],
          ],
        },
      });
    }

    // Register Vue as a custom language if not registered
    if (!monaco.languages.getLanguages().some((lang) => lang.id === "vue")) {
      monaco.languages.register({ id: "vue" });
      monaco.languages.setMonarchTokensProvider("vue", {
        tokenizer: {
          root: [
            [/<template[^>]*>/, { token: "tag", next: "@template" }],
            [/<script[^>]*>/, { token: "tag", next: "@script" }],
            [/<style[^>]*>/, { token: "tag", next: "@style" }],
            [/<\/?[\w\-:]+/, "tag"],
            [/\{\{/, { token: "delimiter", next: "@expression" }],
            [/[^<{]+/, ""],
          ],
          template: [
            [/<\/template>/, { token: "tag", next: "@pop" }],
            [/<\/?[\w\-:]+/, "tag"],
            [/\{\{/, { token: "delimiter", next: "@expression" }],
            [/[^<{]+/, ""],
          ],
          expression: [[/\}\}/, { token: "delimiter", next: "@pop" }], [/.+/, "source.js"]],
          script: [
            [/<\/script>/, { token: "tag", next: "@pop" }],
            [/.+/, "source.js"],
          ],
          style: [
            [/<\/style>/, { token: "tag", next: "@pop" }],
            [/.+/, "source.css"],
          ],
        },
      });
    }
  }, [showMinimap, wordWrap]);

  // Update markers (errors/warnings) when errors change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !selectedFile) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: MonacoEditor.editor.IMarkerData[] = currentFileErrors.map(
      (error) => ({
        severity:
          error.severity === "error"
            ? monacoRef.current!.MarkerSeverity.Error
            : error.severity === "warning"
              ? monacoRef.current!.MarkerSeverity.Warning
              : monacoRef.current!.MarkerSeverity.Info,
        message: error.message,
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.endLine || error.line,
        endColumn: error.endColumn || error.column + 1,
      })
    );

    monacoRef.current.editor.setModelMarkers(model, "owner", markers);
  }, [currentFileErrors, selectedFile]);

  // Handle copy
  const handleCopy = useCallback(async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedFile]);

  // Handle fold/unfold all
  const handleFoldAll = useCallback(() => {
    editorRef.current?.getAction("editor.foldAll")?.run();
  }, []);

  const handleUnfoldAll = useCallback(() => {
    editorRef.current?.getAction("editor.unfoldAll")?.run();
  }, []);

  // Get language for Monaco
  const language = selectedFile ? getMonacoLanguage(selectedFile) : "plaintext";

  // Count errors and warnings per file
  const getFileStatus = (file: GeneratedFile) => {
    const errs = fileErrors[file.path] || [];
    return {
      hasErrors: errs.some((e) => e.severity === "error"),
      hasWarnings: errs.some((e) => e.severity === "warning"),
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* File tabs */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 overflow-x-auto">
        {files.map((file) => {
          const status = getFileStatus(file);
          return (
            <FileTab
              key={file.path}
              file={file}
              isSelected={selectedFile?.path === file.path}
              hasErrors={status.hasErrors}
              hasWarnings={status.hasWarnings}
              onClick={() => onFileSelect(file)}
            />
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {selectedFile && (
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFoldAll}
            title="Fold All"
          >
            <FoldVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnfoldAll}
            title="Unfold All"
          >
            <UnfoldVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Find/Replace panel */}
      {showFindReplace && (
        <FindReplacePanel
          editor={editorRef.current}
          onClose={() => setShowFindReplace(false)}
        />
      )}

      {/* Editor content */}
      <div className="flex-1 overflow-hidden">
        {selectedFile ? (
          <Editor
            height="100%"
            language={language}
            value={selectedFile.content}
            theme={theme}
            onChange={(value) => onCodeChange(value || "")}
            onMount={handleEditorMount}
            options={{
              readOnly,
              minimap: { enabled: showMinimap },
              wordWrap,
              folding: true,
              foldingStrategy: "auto",
              showFoldingControls: "always",
              lineNumbers: "on",
              renderLineHighlight: "all",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              quickSuggestions: {
                other: true,
                comments: false,
                strings: true,
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              parameterHints: { enabled: true },
              multiCursorModifier: "alt",
              cursorStyle: "line",
              cursorBlinking: "smooth",
            }}
            loading={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading editor...
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </div>

      {/* Error panel */}
      <ErrorPanel errors={currentFileErrors} />
    </div>
  );
}

export default IntegratedCodeEditor;
