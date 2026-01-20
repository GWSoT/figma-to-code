import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FigmaService } from './FigmaService';
import type { SyncMapping } from '../types';

export class SyncService {
  private _fileWatcher: vscode.FileSystemWatcher | undefined;
  private _syncMappings: Map<string, SyncMapping> = new Map();
  private readonly MAPPINGS_KEY = 'figmaToCode.syncMappings';
  private _debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private _isRunning: boolean = false;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly figmaService: FigmaService
  ) {
    this._loadMappings();
  }

  public start(): void {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;

    // Watch for file changes in the workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    // Watch for changes in component files
    this._fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceFolder, '**/*.{tsx,vue,svelte,html}')
    );

    this._fileWatcher.onDidChange((uri) => this._onFileChange(uri));
    this._fileWatcher.onDidDelete((uri) => this._onFileDelete(uri));

    this.context.subscriptions.push(this._fileWatcher);

    console.log('Figma sync service started');
  }

  public stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;

    if (this._fileWatcher) {
      this._fileWatcher.dispose();
      this._fileWatcher = undefined;
    }

    // Clear any pending debounce timers
    for (const timer of this._debounceTimers.values()) {
      clearTimeout(timer);
    }
    this._debounceTimers.clear();

    console.log('Figma sync service stopped');
  }

  public async addMapping(
    figmaFileKey: string,
    figmaNodeId: string,
    localFilePath: string
  ): Promise<void> {
    const content = await this._readFile(localFilePath);
    const checksum = this._calculateChecksum(content);

    const mapping: SyncMapping = {
      figmaFileKey,
      figmaNodeId,
      localFilePath,
      lastSyncedAt: Date.now(),
      checksum,
    };

    this._syncMappings.set(localFilePath, mapping);
    await this._saveMappings();

    vscode.window.showInformationMessage(
      `Sync mapping created for ${path.basename(localFilePath)}`
    );
  }

  public async removeMapping(localFilePath: string): Promise<void> {
    this._syncMappings.delete(localFilePath);
    await this._saveMappings();
  }

  public getMapping(localFilePath: string): SyncMapping | undefined {
    return this._syncMappings.get(localFilePath);
  }

  public getAllMappings(): SyncMapping[] {
    return Array.from(this._syncMappings.values());
  }

  public async syncFromFigma(localFilePath: string): Promise<boolean> {
    const mapping = this._syncMappings.get(localFilePath);
    if (!mapping) {
      vscode.window.showErrorMessage('No sync mapping found for this file');
      return false;
    }

    try {
      // Get the latest design from Figma
      const node = await this.figmaService.getNode(
        mapping.figmaFileKey,
        mapping.figmaNodeId
      );

      if (!node) {
        vscode.window.showErrorMessage('Could not fetch design from Figma');
        return false;
      }

      // Show notification that sync from Figma would regenerate code
      const result = await vscode.window.showWarningMessage(
        `This will regenerate code from the Figma design and overwrite ${path.basename(localFilePath)}. Continue?`,
        'Yes',
        'No'
      );

      if (result !== 'Yes') {
        return false;
      }

      // Trigger code regeneration command
      await vscode.commands.executeCommand(
        'figma-to-code.internal.regenerateFromMapping',
        mapping
      );

      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }

  private async _onFileChange(uri: vscode.Uri): Promise<void> {
    const filePath = uri.fsPath;
    const mapping = this._syncMappings.get(filePath);

    if (!mapping) {
      return;
    }

    // Debounce file changes
    const existingTimer = this._debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this._debounceTimers.delete(filePath);
      await this._handleFileChange(uri, mapping);
    }, 1000);

    this._debounceTimers.set(filePath, timer);
  }

  private async _handleFileChange(
    uri: vscode.Uri,
    mapping: SyncMapping
  ): Promise<void> {
    const content = await this._readFile(uri.fsPath);
    const newChecksum = this._calculateChecksum(content);

    if (newChecksum === mapping.checksum) {
      return; // No actual change
    }

    // Update the mapping
    mapping.checksum = newChecksum;
    mapping.lastSyncedAt = Date.now();
    await this._saveMappings();

    // Show notification about detected change
    const config = vscode.workspace.getConfiguration('figmaToCode');
    if (config.get('enableBidirectionalSync')) {
      // For now, just notify - actual Figma update would require write API access
      vscode.window.showInformationMessage(
        `Changes detected in ${path.basename(uri.fsPath)}. Sync mapping updated.`,
        'View in Figma'
      ).then((selection) => {
        if (selection === 'View in Figma') {
          vscode.env.openExternal(
            vscode.Uri.parse(
              `https://www.figma.com/file/${mapping.figmaFileKey}?node-id=${encodeURIComponent(mapping.figmaNodeId)}`
            )
          );
        }
      });
    }
  }

  private _onFileDelete(uri: vscode.Uri): void {
    const filePath = uri.fsPath;
    if (this._syncMappings.has(filePath)) {
      this._syncMappings.delete(filePath);
      this._saveMappings();
      console.log(`Sync mapping removed for deleted file: ${filePath}`);
    }
  }

  private async _readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private _calculateChecksum(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private _loadMappings(): void {
    const stored = this.context.globalState.get<SyncMapping[]>(
      this.MAPPINGS_KEY
    );
    if (stored) {
      for (const mapping of stored) {
        this._syncMappings.set(mapping.localFilePath, mapping);
      }
    }
  }

  private async _saveMappings(): Promise<void> {
    const mappings = Array.from(this._syncMappings.values());
    await this.context.globalState.update(this.MAPPINGS_KEY, mappings);
  }
}
