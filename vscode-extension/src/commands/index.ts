import * as vscode from 'vscode';
import * as path from 'path';
import { FigmaService } from '../services/FigmaService';
import { CodeGenerationService } from '../services/CodeGenerationService';
import { SyncService } from '../services/SyncService';
import { FigmaDesignsProvider } from '../providers/FigmaDesignsProvider';
import { FigmaLayersProvider } from '../providers/FigmaLayersProvider';
import { FigmaHistoryProvider } from '../providers/FigmaHistoryProvider';
import type { GenerationOptions, FigmaFrame, SyncMapping } from '../types';

export function registerCommands(
  context: vscode.ExtensionContext,
  figmaService: FigmaService,
  codeGenerationService: CodeGenerationService,
  syncService: SyncService,
  designsProvider: FigmaDesignsProvider,
  layersProvider: FigmaLayersProvider,
  historyProvider: FigmaHistoryProvider
): void {
  // Open Figma Design command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.openDesign', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter Figma file URL or file key',
        placeHolder: 'https://figma.com/file/...',
      });

      if (url) {
        // The webview will handle opening the file
        vscode.commands.executeCommand('workbench.view.extension.figma-to-code');
      }
    })
  );

  // Generate Code command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.generateCode', async () => {
      const currentFrame = designsProvider.getCurrentFrame();
      const currentFile = designsProvider.getCurrentFile();

      if (!currentFrame || !currentFile) {
        vscode.window.showErrorMessage(
          'Please select a frame from the Figma Designs panel first'
        );
        return;
      }

      // Get generation options from user
      const options = await getGenerationOptions();
      if (!options) {
        return; // User cancelled
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating code from Figma design...',
          cancellable: false,
        },
        async () => {
          try {
            // Generate code
            const generatedCode = await codeGenerationService.generateCode(
              currentFile.key,
              currentFrame,
              options
            );

            // Save the generated code
            const savedFiles = await codeGenerationService.saveGeneratedCode(
              generatedCode,
              options.outputPath || './src/components'
            );

            // Add sync mapping for bidirectional sync
            if (savedFiles.length > 0) {
              await syncService.addMapping(
                currentFile.key,
                currentFrame.id,
                savedFiles[0]
              );
            }

            // Add to history
            await historyProvider.addHistoryItem({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              figmaFileKey: currentFile.key,
              figmaNodeId: currentFrame.id,
              nodeName: currentFrame.name,
              framework: options.framework,
              styling: options.styling,
              outputPath: savedFiles[0] || options.outputPath || './src/components',
              success: true,
            });

            // Open the generated file
            if (savedFiles.length > 0) {
              const doc = await vscode.workspace.openTextDocument(savedFiles[0]);
              await vscode.window.showTextDocument(doc);
            }

            vscode.window.showInformationMessage(
              `Successfully generated ${savedFiles.length} file(s)`
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Add failed attempt to history
            await historyProvider.addHistoryItem({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              figmaFileKey: currentFile.key,
              figmaNodeId: currentFrame.id,
              nodeName: currentFrame.name,
              framework: options.framework,
              styling: options.styling,
              outputPath: options.outputPath || './src/components',
              success: false,
              error: errorMessage,
            });

            vscode.window.showErrorMessage(`Code generation failed: ${errorMessage}`);
          }
        }
      );
    })
  );

  // Refresh Designs command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.refreshDesigns', async () => {
      await designsProvider.refresh();
    })
  );

  // Sync to Figma command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.syncToFigma', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active file');
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const mapping = syncService.getMapping(filePath);

      if (!mapping) {
        vscode.window.showInformationMessage(
          'This file is not linked to a Figma design. Generate code from a Figma frame first.'
        );
        return;
      }

      // Open Figma to the linked node
      const figmaUrl = `https://www.figma.com/file/${mapping.figmaFileKey}?node-id=${encodeURIComponent(mapping.figmaNodeId)}`;

      const result = await vscode.window.showInformationMessage(
        'Opening the linked Figma design in your browser. Changes to code are tracked for reference.',
        'Open Figma',
        'Cancel'
      );

      if (result === 'Open Figma') {
        vscode.env.openExternal(vscode.Uri.parse(figmaUrl));
      }
    })
  );

  // Authenticate command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.authenticate', async () => {
      const token = await vscode.window.showInputBox({
        prompt: 'Enter your Figma Personal Access Token',
        placeHolder: 'figd_...',
        password: true,
        ignoreFocusOut: true,
      });

      if (!token) {
        return;
      }

      const success = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Verifying Figma access token...',
        },
        async () => {
          return await figmaService.setAccessToken(token);
        }
      );

      if (success) {
        vscode.window.showInformationMessage(
          'Successfully connected to Figma!'
        );
        await designsProvider.refresh();
      } else {
        vscode.window.showErrorMessage(
          'Invalid Figma access token. Please check and try again.'
        );
      }
    })
  );

  // Insert Code command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.insertCode', async () => {
      const currentFrame = designsProvider.getCurrentFrame();
      const currentFile = designsProvider.getCurrentFile();

      if (!currentFrame || !currentFile) {
        vscode.window.showErrorMessage('Please select a frame first');
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
      }

      const options = await getGenerationOptions();
      if (!options) {
        return;
      }

      try {
        const generatedCode = await codeGenerationService.generateCode(
          currentFile.key,
          currentFrame,
          options
        );

        // Insert at cursor position
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, generatedCode.componentCode);
        });

        vscode.window.showInformationMessage('Code inserted successfully');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to insert code: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    })
  );

  // Open Settings command
  context.subscriptions.push(
    vscode.commands.registerCommand('figma-to-code.openSettings', async () => {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'figmaToCode'
      );
    })
  );

  // Internal command: Frame selected
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'figma-to-code.internal.frameSelected',
      (frame: FigmaFrame) => {
        layersProvider.setCurrentFrame(frame);
        designsProvider.setCurrentFrame(frame);
      }
    )
  );

  // Internal command: Regenerate from mapping
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'figma-to-code.internal.regenerateFromMapping',
      async (mapping: SyncMapping) => {
        const node = await figmaService.getNode(
          mapping.figmaFileKey,
          mapping.figmaNodeId
        );

        if (!node) {
          vscode.window.showErrorMessage('Could not fetch design from Figma');
          return;
        }

        // Detect framework and styling from existing file
        const ext = path.extname(mapping.localFilePath);
        let framework: GenerationOptions['framework'] = 'react';
        if (ext === '.vue') framework = 'vue';
        else if (ext === '.svelte') framework = 'svelte';
        else if (ext === '.html') framework = 'html';

        const config = vscode.workspace.getConfiguration('figmaToCode');
        const styling = config.get<GenerationOptions['styling']>('defaultStyling') || 'tailwind';

        const options: GenerationOptions = {
          framework,
          styling,
          outputPath: path.dirname(mapping.localFilePath),
          componentName: path.basename(mapping.localFilePath, ext),
        };

        const generatedCode = await codeGenerationService.generateCode(
          mapping.figmaFileKey,
          node,
          options
        );

        await codeGenerationService.saveGeneratedCode(
          generatedCode,
          options.outputPath!
        );

        vscode.window.showInformationMessage(
          `Successfully regenerated ${path.basename(mapping.localFilePath)}`
        );
      }
    )
  );
}

async function getGenerationOptions(): Promise<GenerationOptions | undefined> {
  const config = vscode.workspace.getConfiguration('figmaToCode');

  // Framework selection
  const framework = await vscode.window.showQuickPick(
    [
      { label: 'React', value: 'react' as const },
      { label: 'Vue', value: 'vue' as const },
      { label: 'Svelte', value: 'svelte' as const },
      { label: 'HTML', value: 'html' as const },
    ],
    {
      placeHolder: 'Select framework',
      title: 'Code Generation Options',
    }
  );

  if (!framework) {
    return undefined;
  }

  // Styling selection
  const styling = await vscode.window.showQuickPick(
    [
      { label: 'Tailwind CSS', value: 'tailwind' as const },
      { label: 'CSS', value: 'css' as const },
      { label: 'CSS Modules', value: 'css-modules' as const },
      { label: 'Styled Components', value: 'styled-components' as const },
    ],
    {
      placeHolder: 'Select styling approach',
    }
  );

  if (!styling) {
    return undefined;
  }

  // Component name
  const componentName = await vscode.window.showInputBox({
    prompt: 'Component name (leave empty for auto-generated)',
    placeHolder: 'MyComponent',
  });

  // Output path
  const defaultPath = config.get<string>('outputDirectory') || './src/components';
  const outputPath = await vscode.window.showInputBox({
    prompt: 'Output directory',
    value: defaultPath,
  });

  if (!outputPath) {
    return undefined;
  }

  return {
    framework: framework.value,
    styling: styling.value,
    componentName: componentName || undefined,
    outputPath,
    includeImages: true,
    responsive: true,
  };
}
