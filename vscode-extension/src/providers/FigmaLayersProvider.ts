import * as vscode from 'vscode';
import { FigmaService } from '../services/FigmaService';
import type { FigmaFrame } from '../types';

export class FigmaLayerItem extends vscode.TreeItem {
  constructor(
    public readonly frame: FigmaFrame,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: FigmaFrame[]
  ) {
    super(frame.name, collapsibleState);

    this.tooltip = `${frame.type}: ${frame.name}`;
    this.description = frame.type;

    // Set icon based on type
    this.iconPath = this._getIconForType(frame.type);

    // Set context value for menu contributions
    this.contextValue = frame.type.toLowerCase();
  }

  private _getIconForType(type: string): vscode.ThemeIcon {
    switch (type) {
      case 'FRAME':
        return new vscode.ThemeIcon('window');
      case 'COMPONENT':
        return new vscode.ThemeIcon('symbol-class');
      case 'INSTANCE':
        return new vscode.ThemeIcon('symbol-reference');
      case 'TEXT':
        return new vscode.ThemeIcon('symbol-string');
      case 'RECTANGLE':
      case 'ELLIPSE':
      case 'POLYGON':
      case 'STAR':
      case 'VECTOR':
        return new vscode.ThemeIcon('symbol-misc');
      case 'GROUP':
        return new vscode.ThemeIcon('folder');
      default:
        return new vscode.ThemeIcon('symbol-misc');
    }
  }
}

export class FigmaLayersProvider
  implements vscode.TreeDataProvider<FigmaLayerItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    FigmaLayerItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _currentFrame?: FigmaFrame;

  constructor(private readonly figmaService: FigmaService) {}

  public setCurrentFrame(frame: FigmaFrame) {
    this._currentFrame = frame;
    this.refresh();
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: FigmaLayerItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: FigmaLayerItem): Thenable<FigmaLayerItem[]> {
    if (!this._currentFrame) {
      return Promise.resolve([]);
    }

    if (!element) {
      // Root level - return the current frame as root
      const hasChildren =
        this._currentFrame.children && this._currentFrame.children.length > 0;
      return Promise.resolve([
        new FigmaLayerItem(
          this._currentFrame,
          hasChildren
            ? vscode.TreeItemCollapsibleState.Expanded
            : vscode.TreeItemCollapsibleState.None,
          this._currentFrame.children
        ),
      ]);
    }

    // Return children of the current element
    if (element.children && element.children.length > 0) {
      return Promise.resolve(
        element.children.map((child) => {
          const hasChildren = child.children && child.children.length > 0;
          return new FigmaLayerItem(
            child,
            hasChildren
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            child.children
          );
        })
      );
    }

    return Promise.resolve([]);
  }

  public getParent(_element: FigmaLayerItem): vscode.ProviderResult<FigmaLayerItem> {
    // Tree walking for parent is complex; returning undefined for now
    return undefined;
  }
}
