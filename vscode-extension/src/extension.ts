import * as vscode from 'vscode';
import { FigmaDesignsProvider } from './providers/FigmaDesignsProvider';
import { FigmaLayersProvider } from './providers/FigmaLayersProvider';
import { FigmaHistoryProvider } from './providers/FigmaHistoryProvider';
import { FigmaService } from './services/FigmaService';
import { CodeGenerationService } from './services/CodeGenerationService';
import { SyncService } from './services/SyncService';
import { registerCommands } from './commands';

let figmaService: FigmaService;
let codeGenerationService: CodeGenerationService;
let syncService: SyncService;

export function activate(context: vscode.ExtensionContext) {
  console.log('Figma to Code extension is now active');

  // Initialize services
  figmaService = new FigmaService(context);
  codeGenerationService = new CodeGenerationService(context, figmaService);
  syncService = new SyncService(context, figmaService);

  // Initialize providers
  const designsProvider = new FigmaDesignsProvider(
    context.extensionUri,
    figmaService
  );
  const layersProvider = new FigmaLayersProvider(figmaService);
  const historyProvider = new FigmaHistoryProvider(context);

  // Register webview provider for designs sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'figmaDesigns',
      designsProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  // Register tree providers
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('figmaLayers', layersProvider)
  );
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('figmaHistory', historyProvider)
  );

  // Register commands
  registerCommands(
    context,
    figmaService,
    codeGenerationService,
    syncService,
    designsProvider,
    layersProvider,
    historyProvider
  );

  // Initialize sync service if enabled
  const config = vscode.workspace.getConfiguration('figmaToCode');
  if (config.get('enableBidirectionalSync')) {
    syncService.start();
  }

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('figmaToCode.enableBidirectionalSync')) {
        const enabled = config.get('enableBidirectionalSync');
        if (enabled) {
          syncService.start();
        } else {
          syncService.stop();
        }
      }
    })
  );

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('hasShownWelcome');
  if (!hasShownWelcome) {
    vscode.window
      .showInformationMessage(
        'Welcome to Figma to Code! Connect your Figma account to get started.',
        'Connect Account',
        'Later'
      )
      .then((selection) => {
        if (selection === 'Connect Account') {
          vscode.commands.executeCommand('figma-to-code.authenticate');
        }
      });
    context.globalState.update('hasShownWelcome', true);
  }
}

export function deactivate() {
  if (syncService) {
    syncService.stop();
  }
}
