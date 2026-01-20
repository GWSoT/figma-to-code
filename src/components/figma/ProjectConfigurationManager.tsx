import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Save,
  FolderOpen,
  Plus,
  MoreVertical,
  Star,
  Copy,
  Trash2,
  Share2,
  Settings2,
  FileCode,
  Layers,
  FileText,
  Check,
  Loader2,
} from "lucide-react";
import type { ProjectConfiguration } from "~/db/schema";
import type { CSSFramework, JSFramework, CSSFrameworkOptions } from "~/types/css-frameworks";
import {
  CSS_FRAMEWORKS,
  JS_FRAMEWORKS,
  DEFAULT_OPTIONS,
} from "~/types/css-frameworks";
import {
  useProjectConfigurations,
  useDefaultProjectConfiguration,
  useTemplateConfigurations,
  useCreateProjectConfiguration,
  useUpdateProjectConfiguration,
  useDeleteProjectConfiguration,
  useSetDefaultProjectConfiguration,
  useDuplicateProjectConfiguration,
  type CreateConfigurationInput,
} from "~/hooks/useProjectConfigurations";

// Code style options
const CODE_STYLES = [
  { value: "camelCase", label: "camelCase", example: "myVariable" },
  { value: "kebab-case", label: "kebab-case", example: "my-variable" },
  { value: "PascalCase", label: "PascalCase", example: "MyVariable" },
  { value: "snake_case", label: "snake_case", example: "my_variable" },
] as const;

// Component structure options
const COMPONENT_STRUCTURES = [
  {
    value: "flat",
    label: "Flat",
    description: "All components in one directory",
  },
  {
    value: "folder",
    label: "Folder per component",
    description: "Each component in its own folder",
  },
  {
    value: "feature-based",
    label: "Feature-based",
    description: "Grouped by feature/domain",
  },
] as const;

interface ProjectConfigurationManagerProps {
  currentConfig: {
    cssFramework: CSSFramework;
    jsFramework: JSFramework;
    options: CSSFrameworkOptions;
  };
  onLoadConfiguration: (config: {
    cssFramework: CSSFramework;
    jsFramework: JSFramework;
    options: CSSFrameworkOptions;
  }) => void;
}

export function ProjectConfigurationManager({
  currentConfig,
  onLoadConfiguration,
}: ProjectConfigurationManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);

  // Form state for saving
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saveCodeStyle, setSaveCodeStyle] = useState<string>("camelCase");
  const [saveComponentNaming, setSaveComponentNaming] = useState<string>("PascalCase");
  const [saveFileNaming, setSaveFileNaming] = useState<string>("kebab-case");
  const [saveComponentStructure, setSaveComponentStructure] = useState<string>("folder");
  const [saveIsShared, setSaveIsShared] = useState(false);

  // Hooks
  const { data: configurations, isLoading } = useProjectConfigurations();
  const { data: defaultConfig } = useDefaultProjectConfiguration();
  const { data: templates } = useTemplateConfigurations();
  const createConfig = useCreateProjectConfiguration();
  const updateConfig = useUpdateProjectConfiguration();
  const deleteConfig = useDeleteProjectConfiguration();
  const setDefault = useSetDefaultProjectConfiguration();
  const duplicateConfig = useDuplicateProjectConfiguration();

  // Parse configuration for display
  const parseConfigOptions = (config: ProjectConfiguration): CSSFrameworkOptions | null => {
    try {
      return JSON.parse(config.cssOptions);
    } catch {
      return null;
    }
  };

  // Handle save
  const handleSave = () => {
    if (!saveName.trim()) return;

    const input: CreateConfigurationInput = {
      name: saveName.trim(),
      description: saveDescription.trim() || undefined,
      jsFramework: currentConfig.jsFramework,
      cssFramework: currentConfig.cssFramework,
      cssOptions: currentConfig.options,
      codeStyle: saveCodeStyle as "camelCase" | "kebab-case" | "PascalCase" | "snake_case",
      componentNaming: saveComponentNaming as "camelCase" | "kebab-case" | "PascalCase" | "snake_case",
      fileNaming: saveFileNaming as "camelCase" | "kebab-case" | "PascalCase" | "snake_case",
      componentStructure: saveComponentStructure as "flat" | "folder" | "feature-based",
      isShared: saveIsShared,
    };

    createConfig.mutate(input, {
      onSuccess: () => {
        setSaveDialogOpen(false);
        resetSaveForm();
      },
    });
  };

  // Reset save form
  const resetSaveForm = () => {
    setSaveName("");
    setSaveDescription("");
    setSaveCodeStyle("camelCase");
    setSaveComponentNaming("PascalCase");
    setSaveFileNaming("kebab-case");
    setSaveComponentStructure("folder");
    setSaveIsShared(false);
  };

  // Handle load
  const handleLoad = (config: ProjectConfiguration) => {
    const options = parseConfigOptions(config);
    if (!options) return;

    onLoadConfiguration({
      cssFramework: config.cssFramework as CSSFramework,
      jsFramework: config.jsFramework as JSFramework,
      options,
    });
    setLoadDialogOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (!configToDelete) return;
    deleteConfig.mutate(configToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
      },
    });
  };

  // Handle set default
  const handleSetDefault = (id: string) => {
    setDefault.mutate(id);
  };

  // Handle duplicate
  const handleDuplicate = (config: ProjectConfiguration) => {
    duplicateConfig.mutate({
      sourceId: config.id,
      name: `${config.name} (Copy)`,
    });
  };

  // Combined list with templates
  const allConfigurations = useMemo(() => {
    const userConfigs = configurations || [];
    const templateConfigs = templates || [];
    return { userConfigs, templateConfigs };
  }, [configurations, templates]);

  return (
    <div className="flex gap-2">
      {/* Save Button */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Config
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current code generation settings as a reusable configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current settings summary */}
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">{JS_FRAMEWORKS[currentConfig.jsFramework]?.name}</Badge>
                  <Badge variant="outline">{CSS_FRAMEWORKS[currentConfig.cssFramework]?.name}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="config-name">Name *</Label>
              <Input
                id="config-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., React Tailwind Setup"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="config-description">Description</Label>
              <Textarea
                id="config-description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Describe when to use this configuration..."
                rows={2}
              />
            </div>

            {/* Naming Conventions */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Naming Conventions</Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code-style" className="text-sm text-muted-foreground">
                    Variables & Functions
                  </Label>
                  <Select value={saveCodeStyle} onValueChange={setSaveCodeStyle}>
                    <SelectTrigger id="code-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CODE_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <span className="flex items-center gap-2">
                            {style.label}
                            <span className="text-muted-foreground text-xs">
                              ({style.example})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component-naming" className="text-sm text-muted-foreground">
                    Components
                  </Label>
                  <Select value={saveComponentNaming} onValueChange={setSaveComponentNaming}>
                    <SelectTrigger id="component-naming">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CODE_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <span className="flex items-center gap-2">
                            {style.label}
                            <span className="text-muted-foreground text-xs">
                              ({style.example})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-naming" className="text-sm text-muted-foreground">
                    Files
                  </Label>
                  <Select value={saveFileNaming} onValueChange={setSaveFileNaming}>
                    <SelectTrigger id="file-naming">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CODE_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <span className="flex items-center gap-2">
                            {style.label}
                            <span className="text-muted-foreground text-xs">
                              ({style.example})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component-structure" className="text-sm text-muted-foreground">
                    File Structure
                  </Label>
                  <Select value={saveComponentStructure} onValueChange={setSaveComponentStructure}>
                    <SelectTrigger id="component-structure">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_STRUCTURES.map((structure) => (
                        <SelectItem key={structure.value} value={structure.value}>
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sharing */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-config">Share with team</Label>
                <p className="text-xs text-muted-foreground">
                  Allow team members to use this configuration
                </p>
              </div>
              <Switch
                id="share-config"
                checked={saveIsShared}
                onCheckedChange={setSaveIsShared}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!saveName.trim() || createConfig.isPending}
            >
              {createConfig.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Button */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Load Config
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Load Configuration</DialogTitle>
            <DialogDescription>
              Select a saved configuration to apply to your code generation settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* User's Configurations */}
                {allConfigurations.userConfigs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Your Configurations
                    </h4>
                    <div className="space-y-2">
                      {allConfigurations.userConfigs.map((config) => (
                        <ConfigurationCard
                          key={config.id}
                          config={config}
                          isDefault={defaultConfig?.id === config.id}
                          onLoad={() => handleLoad(config)}
                          onSetDefault={() => handleSetDefault(config.id)}
                          onDuplicate={() => handleDuplicate(config)}
                          onDelete={() => {
                            setConfigToDelete(config.id);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates */}
                {allConfigurations.templateConfigs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Templates
                    </h4>
                    <div className="space-y-2">
                      {allConfigurations.templateConfigs.map((config) => (
                        <ConfigurationCard
                          key={config.id}
                          config={config}
                          isTemplate
                          onLoad={() => handleLoad(config)}
                          onDuplicate={() => handleDuplicate(config)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {allConfigurations.userConfigs.length === 0 &&
                  allConfigurations.templateConfigs.length === 0 && (
                    <div className="text-center py-8">
                      <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No saved configurations yet</p>
                      <p className="text-sm text-muted-foreground/70">
                        Save your current settings to create your first configuration.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this configuration? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfigToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConfig.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Configuration card component
interface ConfigurationCardProps {
  config: ProjectConfiguration;
  isDefault?: boolean;
  isTemplate?: boolean;
  onLoad: () => void;
  onSetDefault?: () => void;
  onDuplicate: () => void;
  onDelete?: () => void;
}

function ConfigurationCard({
  config,
  isDefault,
  isTemplate,
  onLoad,
  onSetDefault,
  onDuplicate,
  onDelete,
}: ConfigurationCardProps) {
  return (
    <Card
      className={`transition-colors hover:bg-muted/50 ${
        isDefault ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <CardContent className="py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{config.name}</h4>
              {isDefault && (
                <Badge variant="default" className="gap-1 shrink-0">
                  <Star className="h-3 w-3" />
                  Default
                </Badge>
              )}
              {isTemplate && (
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <FileText className="h-3 w-3" />
                  Template
                </Badge>
              )}
              {config.isShared && !isTemplate && (
                <Badge variant="outline" className="gap-1 shrink-0">
                  <Share2 className="h-3 w-3" />
                  Shared
                </Badge>
              )}
            </div>
            {config.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {config.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {JS_FRAMEWORKS[config.jsFramework as JSFramework]?.name || config.jsFramework}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {CSS_FRAMEWORKS[config.cssFramework as CSSFramework]?.name || config.cssFramework}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {config.componentStructure}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={onLoad}>
              <Check className="h-4 w-4 mr-1" />
              Load
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {onSetDefault && !isDefault && (
                  <DropdownMenuItem onClick={onSetDefault}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectConfigurationManager;
