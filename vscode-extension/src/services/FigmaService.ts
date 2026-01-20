import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';
import type { FigmaFile, FigmaFrame, FigmaProject, FigmaTeam } from '../types';

export class FigmaService {
  private _client: AxiosInstance;
  private _accessToken: string | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      timeout: 30000,
    });

    // Load token from configuration
    this._loadToken();

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('figmaToCode.figmaAccessToken')) {
        this._loadToken();
      }
    });
  }

  private _loadToken(): void {
    const config = vscode.workspace.getConfiguration('figmaToCode');
    this._accessToken = config.get<string>('figmaAccessToken');

    if (this._accessToken) {
      this._client.defaults.headers.common['X-Figma-Token'] = this._accessToken;
    }
  }

  public isAuthenticated(): boolean {
    return !!this._accessToken && this._accessToken.length > 0;
  }

  public async setAccessToken(token: string): Promise<boolean> {
    try {
      // Verify the token works
      const testClient = axios.create({
        baseURL: 'https://api.figma.com/v1',
        headers: { 'X-Figma-Token': token },
      });

      await testClient.get('/me');

      // Token is valid, save it
      const config = vscode.workspace.getConfiguration('figmaToCode');
      await config.update(
        'figmaAccessToken',
        token,
        vscode.ConfigurationTarget.Global
      );

      this._accessToken = token;
      this._client.defaults.headers.common['X-Figma-Token'] = token;

      return true;
    } catch (error) {
      return false;
    }
  }

  public async getMe(): Promise<any> {
    this._ensureAuthenticated();
    const response = await this._client.get('/me');
    return response.data;
  }

  public async getTeams(): Promise<FigmaTeam[]> {
    this._ensureAuthenticated();
    const me = await this.getMe();
    // Figma API doesn't directly return teams, need to get from user's files
    // This is a simplified implementation
    return [];
  }

  public async getProjects(teamId: string): Promise<FigmaProject[]> {
    this._ensureAuthenticated();
    const response = await this._client.get(`/teams/${teamId}/projects`);
    return response.data.projects;
  }

  public async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
    this._ensureAuthenticated();
    const response = await this._client.get(`/projects/${projectId}/files`);
    return response.data.files;
  }

  public async getFile(fileKey: string): Promise<any> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('File not found. Check the file key or your access permissions.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Make sure you have access to this file.');
        }
      }
      throw error;
    }
  }

  public async getNode(fileKey: string, nodeId: string): Promise<FigmaFrame | null> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/nodes`, {
        params: { ids: nodeId },
      });

      const nodes = response.data.nodes;
      if (nodes && nodes[nodeId]) {
        return nodes[nodeId].document as FigmaFrame;
      }
      return null;
    } catch (error) {
      console.error('Failed to get node:', error);
      return null;
    }
  }

  public async getImages(
    fileKey: string,
    nodeIds: string[],
    format: 'png' | 'svg' | 'jpg' = 'png',
    scale: number = 2
  ): Promise<Record<string, string>> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/images/${fileKey}`, {
        params: {
          ids: nodeIds.join(','),
          format,
          scale,
        },
      });

      return response.data.images || {};
    } catch (error) {
      console.error('Failed to get images:', error);
      return {};
    }
  }

  public async getImageFills(fileKey: string): Promise<Record<string, string>> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/images`);
      return response.data.meta?.images || {};
    } catch (error) {
      console.error('Failed to get image fills:', error);
      return {};
    }
  }

  public async getComments(fileKey: string): Promise<any[]> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/comments`);
      return response.data.comments || [];
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  public async getFileVersions(fileKey: string): Promise<any[]> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/versions`);
      return response.data.versions || [];
    } catch (error) {
      console.error('Failed to get file versions:', error);
      return [];
    }
  }

  public async getStyles(fileKey: string): Promise<any> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/styles`);
      return response.data;
    } catch (error) {
      console.error('Failed to get styles:', error);
      return null;
    }
  }

  public async getComponents(fileKey: string): Promise<any> {
    this._ensureAuthenticated();
    try {
      const response = await this._client.get(`/files/${fileKey}/components`);
      return response.data;
    } catch (error) {
      console.error('Failed to get components:', error);
      return null;
    }
  }

  private _ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Not authenticated. Please set your Figma access token in settings.'
      );
    }
  }
}
