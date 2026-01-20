import * as vscode from 'vscode';
import { FigmaService } from '../services/FigmaService';
import type { FigmaFile, FigmaFrame } from '../types';

export class FigmaDesignsProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _currentFile?: FigmaFile;
  private _currentFrame?: FigmaFrame;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly figmaService: FigmaService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'openFile':
          await this._openFigmaFile(message.url);
          break;
        case 'selectFrame':
          await this._selectFrame(message.frameId);
          break;
        case 'generateCode':
          await vscode.commands.executeCommand('figma-to-code.generateCode');
          break;
        case 'refreshDesigns':
          await this.refresh();
          break;
        case 'authenticate':
          await vscode.commands.executeCommand('figma-to-code.authenticate');
          break;
        case 'getRecentFiles':
          await this._sendRecentFiles();
          break;
      }
    });

    // Send initial state
    this._updateWebview();
  }

  public async refresh() {
    if (this._currentFile) {
      await this._openFigmaFile(
        `https://figma.com/file/${this._currentFile.key}`
      );
    }
    await this._sendRecentFiles();
  }

  public setCurrentFrame(frame: FigmaFrame) {
    this._currentFrame = frame;
    this._updateWebview();
  }

  public getCurrentFrame(): FigmaFrame | undefined {
    return this._currentFrame;
  }

  public getCurrentFile(): FigmaFile | undefined {
    return this._currentFile;
  }

  private async _openFigmaFile(url: string) {
    try {
      const fileKey = this._extractFileKey(url);
      if (!fileKey) {
        vscode.window.showErrorMessage('Invalid Figma URL');
        return;
      }

      this._postMessage({ command: 'loading', isLoading: true });

      const fileData = await this.figmaService.getFile(fileKey);
      if (!fileData) {
        vscode.window.showErrorMessage('Failed to load Figma file');
        return;
      }

      this._currentFile = {
        key: fileKey,
        name: fileData.name,
        lastModified: fileData.lastModified,
        thumbnailUrl: fileData.thumbnailUrl,
      };

      // Get frame thumbnail
      const frames = this._extractFrames(fileData.document);

      // Add to recent files
      await this._addToRecentFiles(this._currentFile);

      this._postMessage({
        command: 'fileLoaded',
        file: this._currentFile,
        frames,
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load Figma file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      this._postMessage({ command: 'loading', isLoading: false });
    }
  }

  private async _selectFrame(frameId: string) {
    if (!this._currentFile) return;

    try {
      const nodeData = await this.figmaService.getNode(
        this._currentFile.key,
        frameId
      );
      if (nodeData) {
        this._currentFrame = nodeData;
        vscode.commands.executeCommand(
          'figma-to-code.internal.frameSelected',
          nodeData
        );
        this._postMessage({
          command: 'frameSelected',
          frame: nodeData,
        });
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to select frame: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private _extractFileKey(url: string): string | null {
    // Handle various Figma URL formats
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]+)$/, // Just the key itself
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  private _extractFrames(document: any): FigmaFrame[] {
    const frames: FigmaFrame[] = [];

    const traverse = (node: any) => {
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        frames.push({
          id: node.id,
          name: node.name,
          type: node.type,
          absoluteBoundingBox: node.absoluteBoundingBox,
        });
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    if (document.children) {
      for (const page of document.children) {
        traverse(page);
      }
    }

    return frames;
  }

  private async _sendRecentFiles() {
    const config = vscode.workspace.getConfiguration('figmaToCode');
    const recentFiles = config.get<FigmaFile[]>('recentFiles') || [];
    this._postMessage({
      command: 'recentFiles',
      files: recentFiles,
    });
  }

  private async _addToRecentFiles(file: FigmaFile) {
    const config = vscode.workspace.getConfiguration('figmaToCode');
    const recentFiles = config.get<FigmaFile[]>('recentFiles') || [];

    // Remove if already exists
    const filtered = recentFiles.filter((f) => f.key !== file.key);

    // Add to beginning
    filtered.unshift(file);

    // Keep only last 10
    const updated = filtered.slice(0, 10);

    await config.update(
      'recentFiles',
      updated,
      vscode.ConfigurationTarget.Global
    );
  }

  private _updateWebview() {
    const isAuthenticated = this.figmaService.isAuthenticated();
    this._postMessage({
      command: 'updateState',
      isAuthenticated,
      currentFile: this._currentFile,
      currentFrame: this._currentFrame,
    });
  }

  private _postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;">
  <title>Figma Designs</title>
  <style>
    body {
      padding: 0;
      margin: 0;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
    }

    .container {
      padding: 12px;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }

    .input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    input {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-size: 13px;
    }

    input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    button {
      padding: 6px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .frame-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .frame-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 2px;
    }

    .frame-item:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .frame-item.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .frame-icon {
      margin-right: 8px;
      opacity: 0.7;
    }

    .frame-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-card {
      padding: 12px;
      background: var(--vscode-editor-background);
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .file-name {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .file-meta {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .auth-prompt {
      text-align: center;
      padding: 24px 12px;
    }

    .auth-prompt p {
      margin-bottom: 16px;
      color: var(--vscode-descriptionForeground);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--vscode-progressBar-background);
      border-top-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--vscode-descriptionForeground);
    }

    .recent-files {
      margin-top: 16px;
    }

    .recent-file {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .recent-file:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .preview-container {
      margin-top: 16px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      overflow: hidden;
    }

    .preview-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .generate-btn {
      width: 100%;
      margin-top: 12px;
      padding: 10px;
      font-weight: 600;
    }

    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="auth-prompt" class="auth-prompt hidden">
      <p>Connect your Figma account to view and generate code from your designs.</p>
      <button onclick="authenticate()">Connect Figma Account</button>
    </div>

    <div id="main-content">
      <div class="section">
        <div class="section-title">Open Design</div>
        <div class="input-group">
          <input type="text" id="figma-url" placeholder="Paste Figma URL or file key..." />
          <button onclick="openFile()">Open</button>
        </div>
      </div>

      <div id="loading" class="loading hidden">
        <div class="spinner"></div>
      </div>

      <div id="file-info" class="hidden">
        <div class="file-card">
          <div class="file-name" id="file-name"></div>
          <div class="file-meta" id="file-meta"></div>
        </div>

        <div class="section">
          <div class="section-title">Frames</div>
          <ul class="frame-list" id="frame-list"></ul>
        </div>

        <div id="selected-frame" class="hidden">
          <div class="section-title">Selected Frame</div>
          <div class="preview-container">
            <img id="preview-image" class="preview-image" alt="Frame preview" />
          </div>
          <button class="generate-btn" onclick="generateCode()">Generate Code</button>
        </div>
      </div>

      <div id="recent-section" class="recent-files">
        <div class="section-title">Recent Files</div>
        <div id="recent-list"></div>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    let currentFrameId = null;

    function authenticate() {
      vscode.postMessage({ command: 'authenticate' });
    }

    function openFile() {
      const url = document.getElementById('figma-url').value;
      if (url) {
        vscode.postMessage({ command: 'openFile', url });
      }
    }

    function selectFrame(frameId) {
      currentFrameId = frameId;
      vscode.postMessage({ command: 'selectFrame', frameId });

      // Update selection UI
      document.querySelectorAll('.frame-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === frameId);
      });
    }

    function generateCode() {
      vscode.postMessage({ command: 'generateCode' });
    }

    function openRecentFile(fileKey) {
      document.getElementById('figma-url').value = 'https://figma.com/file/' + fileKey;
      openFile();
    }

    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case 'loading':
          document.getElementById('loading').classList.toggle('hidden', !message.isLoading);
          break;

        case 'updateState':
          document.getElementById('auth-prompt').classList.toggle('hidden', message.isAuthenticated);
          document.getElementById('main-content').classList.toggle('hidden', !message.isAuthenticated);
          break;

        case 'fileLoaded':
          document.getElementById('file-info').classList.remove('hidden');
          document.getElementById('file-name').textContent = message.file.name;
          document.getElementById('file-meta').textContent = 'Last modified: ' + new Date(message.file.lastModified).toLocaleDateString();

          const frameList = document.getElementById('frame-list');
          frameList.innerHTML = '';
          message.frames.forEach(frame => {
            const li = document.createElement('li');
            li.className = 'frame-item';
            li.dataset.id = frame.id;
            li.innerHTML = '<span class="frame-icon">◫</span><span class="frame-name">' + frame.name + '</span>';
            li.onclick = () => selectFrame(frame.id);
            frameList.appendChild(li);
          });
          break;

        case 'frameSelected':
          document.getElementById('selected-frame').classList.remove('hidden');
          // Preview image would be loaded here
          break;

        case 'recentFiles':
          const recentList = document.getElementById('recent-list');
          if (message.files.length === 0) {
            recentList.innerHTML = '<div class="empty-state">No recent files</div>';
          } else {
            recentList.innerHTML = '';
            message.files.forEach(file => {
              const div = document.createElement('div');
              div.className = 'recent-file';
              div.innerHTML = '<span class="frame-icon">📄</span>' + file.name;
              div.onclick = () => openRecentFile(file.key);
              recentList.appendChild(div);
            });
          }
          break;
      }
    });

    // Request initial state
    vscode.postMessage({ command: 'getRecentFiles' });
  </script>
</body>
</html>`;
  }

  private _getNonce(): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
