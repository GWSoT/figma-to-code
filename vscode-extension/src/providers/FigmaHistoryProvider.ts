import * as vscode from 'vscode';
import type { GenerationHistoryItem } from '../types';

export class FigmaHistoryItem extends vscode.TreeItem {
  constructor(public readonly historyItem: GenerationHistoryItem) {
    super(
      historyItem.nodeName,
      vscode.TreeItemCollapsibleState.None
    );

    const date = new Date(historyItem.timestamp);
    this.description = `${historyItem.framework} • ${date.toLocaleDateString()}`;

    this.tooltip = new vscode.MarkdownString();
    this.tooltip.appendMarkdown(`**${historyItem.nodeName}**\n\n`);
    this.tooltip.appendMarkdown(`- Framework: ${historyItem.framework}\n`);
    this.tooltip.appendMarkdown(`- Styling: ${historyItem.styling}\n`);
    this.tooltip.appendMarkdown(`- Output: ${historyItem.outputPath}\n`);
    this.tooltip.appendMarkdown(`- Date: ${date.toLocaleString()}\n`);
    if (!historyItem.success && historyItem.error) {
      this.tooltip.appendMarkdown(`\n**Error:** ${historyItem.error}`);
    }

    this.iconPath = historyItem.success
      ? new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'))
      : new vscode.ThemeIcon('x', new vscode.ThemeColor('testing.iconFailed'));

    this.contextValue = 'historyItem';

    // Command to open the generated file
    if (historyItem.success) {
      this.command = {
        command: 'vscode.open',
        title: 'Open Generated File',
        arguments: [vscode.Uri.file(historyItem.outputPath)],
      };
    }
  }
}

export class FigmaHistoryProvider
  implements vscode.TreeDataProvider<FigmaHistoryItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    FigmaHistoryItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private readonly HISTORY_KEY = 'figmaToCode.generationHistory';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public async addHistoryItem(item: GenerationHistoryItem): Promise<void> {
    const history = this._getHistory();
    history.unshift(item);

    // Keep only last 50 items
    const trimmed = history.slice(0, 50);

    await this.context.globalState.update(this.HISTORY_KEY, trimmed);
    this.refresh();
  }

  public async clearHistory(): Promise<void> {
    await this.context.globalState.update(this.HISTORY_KEY, []);
    this.refresh();
  }

  public getTreeItem(element: FigmaHistoryItem): vscode.TreeItem {
    return element;
  }

  public getChildren(_element?: FigmaHistoryItem): Thenable<FigmaHistoryItem[]> {
    const history = this._getHistory();

    if (history.length === 0) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      history.map((item) => new FigmaHistoryItem(item))
    );
  }

  private _getHistory(): GenerationHistoryItem[] {
    return this.context.globalState.get<GenerationHistoryItem[]>(
      this.HISTORY_KEY
    ) || [];
  }
}
