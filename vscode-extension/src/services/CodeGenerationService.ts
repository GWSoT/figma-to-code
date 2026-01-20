import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FigmaService } from './FigmaService';
import type {
  FigmaFrame,
  GenerationOptions,
  GeneratedCode,
  GeneratedAsset,
  FigmaColor,
  FigmaFill,
} from '../types';

export class CodeGenerationService {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly figmaService: FigmaService
  ) {}

  public async generateCode(
    fileKey: string,
    frame: FigmaFrame,
    options: GenerationOptions
  ): Promise<GeneratedCode> {
    const componentName =
      options.componentName || this._sanitizeComponentName(frame.name);

    // Get images for the frame if needed
    let assets: GeneratedAsset[] = [];
    if (options.includeImages) {
      assets = await this._extractAssets(fileKey, frame);
    }

    // Generate code based on framework
    let componentCode: string;
    let styleCode: string | undefined;
    let fileName: string;
    let styleFileName: string | undefined;

    switch (options.framework) {
      case 'react':
        const reactResult = this._generateReactCode(
          frame,
          componentName,
          options
        );
        componentCode = reactResult.code;
        styleCode = reactResult.styles;
        fileName = `${componentName}.tsx`;
        if (
          options.styling === 'css' ||
          options.styling === 'css-modules'
        ) {
          styleFileName =
            options.styling === 'css-modules'
              ? `${componentName}.module.css`
              : `${componentName}.css`;
        }
        break;

      case 'vue':
        componentCode = this._generateVueCode(frame, componentName, options);
        fileName = `${componentName}.vue`;
        break;

      case 'svelte':
        componentCode = this._generateSvelteCode(
          frame,
          componentName,
          options
        );
        fileName = `${componentName}.svelte`;
        break;

      case 'html':
      default:
        const htmlResult = this._generateHtmlCode(
          frame,
          componentName,
          options
        );
        componentCode = htmlResult.code;
        styleCode = htmlResult.styles;
        fileName = `${componentName}.html`;
        styleFileName = `${componentName}.css`;
        break;
    }

    return {
      componentCode,
      styleCode,
      fileName,
      styleFileName,
      assets,
    };
  }

  public async saveGeneratedCode(
    code: GeneratedCode,
    outputPath: string
  ): Promise<string[]> {
    const savedFiles: string[] = [];
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      throw new Error('No workspace folder open');
    }

    const fullOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(workspaceFolder.uri.fsPath, outputPath);

    // Ensure directory exists
    if (!fs.existsSync(fullOutputPath)) {
      fs.mkdirSync(fullOutputPath, { recursive: true });
    }

    // Save component file
    const componentPath = path.join(fullOutputPath, code.fileName);
    fs.writeFileSync(componentPath, code.componentCode, 'utf8');
    savedFiles.push(componentPath);

    // Save style file if exists
    if (code.styleCode && code.styleFileName) {
      const stylePath = path.join(fullOutputPath, code.styleFileName);
      fs.writeFileSync(stylePath, code.styleCode, 'utf8');
      savedFiles.push(stylePath);
    }

    // Download and save assets
    for (const asset of code.assets) {
      try {
        const assetPath = path.join(fullOutputPath, 'assets', asset.name);
        const assetDir = path.dirname(assetPath);

        if (!fs.existsSync(assetDir)) {
          fs.mkdirSync(assetDir, { recursive: true });
        }

        // Download asset
        const response = await fetch(asset.url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(assetPath, Buffer.from(buffer));
        savedFiles.push(assetPath);
      } catch (error) {
        console.error(`Failed to download asset ${asset.name}:`, error);
      }
    }

    return savedFiles;
  }

  private _generateReactCode(
    frame: FigmaFrame,
    componentName: string,
    options: GenerationOptions
  ): { code: string; styles?: string } {
    const styles = this._generateStyles(frame, options);
    const jsx = this._generateJsx(frame, options);

    let code: string;

    if (options.styling === 'tailwind') {
      code = `import React from 'react';

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    ${jsx}
  );
}

export default ${componentName};
`;
    } else if (options.styling === 'styled-components') {
      code = `import React from 'react';
import styled from 'styled-components';

${styles.styledComponents}

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    ${jsx}
  );
}

export default ${componentName};
`;
    } else if (options.styling === 'css-modules') {
      code = `import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    ${this._generateJsx(frame, options, 'styles.')}
  );
}

export default ${componentName};
`;
      return { code, styles: styles.css };
    } else {
      code = `import React from 'react';
import './${componentName}.css';

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    ${jsx}
  );
}

export default ${componentName};
`;
      return { code, styles: styles.css };
    }

    return { code };
  }

  private _generateVueCode(
    frame: FigmaFrame,
    componentName: string,
    options: GenerationOptions
  ): string {
    const styles = this._generateStyles(frame, options);
    const template = this._generateVueTemplate(frame, options);

    return `<template>
  ${template}
</template>

<script setup lang="ts">
interface Props {
  class?: string;
}

defineProps<Props>();
</script>

<style${options.styling === 'tailwind' ? '' : ' scoped'}>
${options.styling === 'tailwind' ? '' : styles.css}
</style>
`;
  }

  private _generateSvelteCode(
    frame: FigmaFrame,
    componentName: string,
    options: GenerationOptions
  ): string {
    const styles = this._generateStyles(frame, options);
    const template = this._generateSvelteTemplate(frame, options);

    return `<script lang="ts">
  export let className: string = '';
</script>

${template}

<style>
${options.styling === 'tailwind' ? '' : styles.css}
</style>
`;
  }

  private _generateHtmlCode(
    frame: FigmaFrame,
    componentName: string,
    options: GenerationOptions
  ): { code: string; styles: string } {
    const styles = this._generateStyles(frame, options);
    const html = this._generateHtml(frame, options);

    const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  ${options.styling === 'tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : `<link rel="stylesheet" href="${componentName}.css">`}
</head>
<body>
  ${html}
</body>
</html>`;

    return { code, styles: styles.css || '' };
  }

  private _generateStyles(
    frame: FigmaFrame,
    options: GenerationOptions
  ): { css?: string; styledComponents?: string } {
    const cssRules: string[] = [];
    const scRules: string[] = [];

    const generateNodeStyles = (
      node: FigmaFrame,
      className: string,
      depth: number = 0
    ) => {
      const styles: string[] = [];

      // Layout styles
      if (node.layoutMode === 'HORIZONTAL') {
        styles.push('display: flex');
        styles.push('flex-direction: row');
      } else if (node.layoutMode === 'VERTICAL') {
        styles.push('display: flex');
        styles.push('flex-direction: column');
      }

      if (node.itemSpacing !== undefined) {
        styles.push(`gap: ${node.itemSpacing}px`);
      }

      if (node.paddingTop !== undefined) {
        styles.push(`padding-top: ${node.paddingTop}px`);
      }
      if (node.paddingBottom !== undefined) {
        styles.push(`padding-bottom: ${node.paddingBottom}px`);
      }
      if (node.paddingLeft !== undefined) {
        styles.push(`padding-left: ${node.paddingLeft}px`);
      }
      if (node.paddingRight !== undefined) {
        styles.push(`padding-right: ${node.paddingRight}px`);
      }

      // Size
      if (node.absoluteBoundingBox) {
        styles.push(`width: ${node.absoluteBoundingBox.width}px`);
        styles.push(`height: ${node.absoluteBoundingBox.height}px`);
      }

      // Background
      if (node.fills && node.fills.length > 0) {
        const fill = node.fills.find((f: FigmaFill) => f.visible !== false);
        if (fill?.color) {
          styles.push(`background-color: ${this._colorToRgba(fill.color)}`);
        }
      }

      // Border radius
      if (node.cornerRadius !== undefined) {
        styles.push(`border-radius: ${node.cornerRadius}px`);
      } else if (node.rectangleCornerRadii) {
        styles.push(
          `border-radius: ${node.rectangleCornerRadii.join('px ')}px`
        );
      }

      // Text styles
      if (node.style) {
        if (node.style.fontFamily) {
          styles.push(`font-family: "${node.style.fontFamily}"`);
        }
        if (node.style.fontSize) {
          styles.push(`font-size: ${node.style.fontSize}px`);
        }
        if (node.style.fontWeight) {
          styles.push(`font-weight: ${node.style.fontWeight}`);
        }
        if (node.style.letterSpacing) {
          styles.push(`letter-spacing: ${node.style.letterSpacing}px`);
        }
        if (node.style.lineHeightPx) {
          styles.push(`line-height: ${node.style.lineHeightPx}px`);
        }
        if (node.style.textAlignHorizontal) {
          styles.push(
            `text-align: ${node.style.textAlignHorizontal.toLowerCase()}`
          );
        }
      }

      if (styles.length > 0) {
        cssRules.push(`.${className} {\n  ${styles.join(';\n  ')};\n}`);
        scRules.push(
          `const ${this._toPascalCase(className)} = styled.div\`\n  ${styles.join(';\n  ')};\n\`;`
        );
      }

      // Process children
      if (node.children) {
        node.children.forEach((child, index) => {
          const childClassName = `${className}-${this._sanitizeClassName(child.name || `child-${index}`)}`;
          generateNodeStyles(child, childClassName, depth + 1);
        });
      }
    };

    const rootClassName = this._sanitizeClassName(frame.name);
    generateNodeStyles(frame, rootClassName);

    return {
      css: cssRules.join('\n\n'),
      styledComponents: scRules.join('\n\n'),
    };
  }

  private _generateJsx(
    frame: FigmaFrame,
    options: GenerationOptions,
    stylePrefix: string = ''
  ): string {
    return this._renderNodeJsx(frame, options, stylePrefix, 0);
  }

  private _renderNodeJsx(
    node: FigmaFrame,
    options: GenerationOptions,
    stylePrefix: string,
    depth: number
  ): string {
    const indent = '  '.repeat(depth + 2);
    const className = this._sanitizeClassName(node.name);

    let classAttr: string;
    if (options.styling === 'tailwind') {
      classAttr = `className={\`${this._generateTailwindClasses(node)} \${className}\`}`;
    } else if (stylePrefix) {
      classAttr = `className={\`\${${stylePrefix}${className}} \${className}\`}`;
    } else {
      classAttr = `className={\`${className} \${className}\`}`;
    }

    if (node.type === 'TEXT') {
      return `${indent}<span ${classAttr}>${node.characters || ''}</span>`;
    }

    let children = '';
    if (node.children && node.children.length > 0) {
      children = node.children
        .map((child) =>
          this._renderNodeJsx(child, options, stylePrefix, depth + 1)
        )
        .join('\n');
    }

    if (children) {
      return `${indent}<div ${classAttr}>\n${children}\n${indent}</div>`;
    } else {
      return `${indent}<div ${classAttr} />`;
    }
  }

  private _generateVueTemplate(
    frame: FigmaFrame,
    options: GenerationOptions
  ): string {
    return this._renderNodeVue(frame, options, 0);
  }

  private _renderNodeVue(
    node: FigmaFrame,
    options: GenerationOptions,
    depth: number
  ): string {
    const indent = '  '.repeat(depth + 1);
    const className = this._sanitizeClassName(node.name);

    let classAttr: string;
    if (options.styling === 'tailwind') {
      classAttr = `:class="[\`${this._generateTailwindClasses(node)}\`, $props.class]"`;
    } else {
      classAttr = `:class="['${className}', $props.class]"`;
    }

    if (node.type === 'TEXT') {
      return `${indent}<span ${classAttr}>${node.characters || ''}</span>`;
    }

    let children = '';
    if (node.children && node.children.length > 0) {
      children = node.children
        .map((child) => this._renderNodeVue(child, options, depth + 1))
        .join('\n');
    }

    if (children) {
      return `${indent}<div ${classAttr}>\n${children}\n${indent}</div>`;
    } else {
      return `${indent}<div ${classAttr} />`;
    }
  }

  private _generateSvelteTemplate(
    frame: FigmaFrame,
    options: GenerationOptions
  ): string {
    return this._renderNodeSvelte(frame, options, 0);
  }

  private _renderNodeSvelte(
    node: FigmaFrame,
    options: GenerationOptions,
    depth: number
  ): string {
    const indent = '  '.repeat(depth);
    const className = this._sanitizeClassName(node.name);

    let classAttr: string;
    if (options.styling === 'tailwind') {
      classAttr = `class="${this._generateTailwindClasses(node)} {className}"`;
    } else {
      classAttr = `class="${className} {className}"`;
    }

    if (node.type === 'TEXT') {
      return `${indent}<span ${classAttr}>${node.characters || ''}</span>`;
    }

    let children = '';
    if (node.children && node.children.length > 0) {
      children = node.children
        .map((child) => this._renderNodeSvelte(child, options, depth + 1))
        .join('\n');
    }

    if (children) {
      return `${indent}<div ${classAttr}>\n${children}\n${indent}</div>`;
    } else {
      return `${indent}<div ${classAttr} />`;
    }
  }

  private _generateHtml(
    frame: FigmaFrame,
    options: GenerationOptions
  ): string {
    return this._renderNodeHtml(frame, options, 0);
  }

  private _renderNodeHtml(
    node: FigmaFrame,
    options: GenerationOptions,
    depth: number
  ): string {
    const indent = '  '.repeat(depth + 1);
    const className = this._sanitizeClassName(node.name);

    let classAttr: string;
    if (options.styling === 'tailwind') {
      classAttr = `class="${this._generateTailwindClasses(node)}"`;
    } else {
      classAttr = `class="${className}"`;
    }

    if (node.type === 'TEXT') {
      return `${indent}<span ${classAttr}>${node.characters || ''}</span>`;
    }

    let children = '';
    if (node.children && node.children.length > 0) {
      children = node.children
        .map((child) => this._renderNodeHtml(child, options, depth + 1))
        .join('\n');
    }

    if (children) {
      return `${indent}<div ${classAttr}>\n${children}\n${indent}</div>`;
    } else {
      return `${indent}<div ${classAttr}></div>`;
    }
  }

  private _generateTailwindClasses(node: FigmaFrame): string {
    const classes: string[] = [];

    // Layout
    if (node.layoutMode === 'HORIZONTAL') {
      classes.push('flex', 'flex-row');
    } else if (node.layoutMode === 'VERTICAL') {
      classes.push('flex', 'flex-col');
    }

    // Spacing
    if (node.itemSpacing !== undefined) {
      classes.push(`gap-[${node.itemSpacing}px]`);
    }

    // Padding
    if (node.paddingTop !== undefined) {
      classes.push(`pt-[${node.paddingTop}px]`);
    }
    if (node.paddingBottom !== undefined) {
      classes.push(`pb-[${node.paddingBottom}px]`);
    }
    if (node.paddingLeft !== undefined) {
      classes.push(`pl-[${node.paddingLeft}px]`);
    }
    if (node.paddingRight !== undefined) {
      classes.push(`pr-[${node.paddingRight}px]`);
    }

    // Size
    if (node.absoluteBoundingBox) {
      classes.push(`w-[${node.absoluteBoundingBox.width}px]`);
      classes.push(`h-[${node.absoluteBoundingBox.height}px]`);
    }

    // Background
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills.find((f: FigmaFill) => f.visible !== false);
      if (fill?.color) {
        classes.push(`bg-[${this._colorToHex(fill.color)}]`);
      }
    }

    // Border radius
    if (node.cornerRadius !== undefined) {
      if (node.cornerRadius === 9999) {
        classes.push('rounded-full');
      } else {
        classes.push(`rounded-[${node.cornerRadius}px]`);
      }
    }

    // Text styles
    if (node.style) {
      if (node.style.fontSize) {
        classes.push(`text-[${node.style.fontSize}px]`);
      }
      if (node.style.fontWeight) {
        const weightMap: Record<number, string> = {
          100: 'font-thin',
          200: 'font-extralight',
          300: 'font-light',
          400: 'font-normal',
          500: 'font-medium',
          600: 'font-semibold',
          700: 'font-bold',
          800: 'font-extrabold',
          900: 'font-black',
        };
        classes.push(weightMap[node.style.fontWeight] || 'font-normal');
      }
    }

    return classes.join(' ');
  }

  private async _extractAssets(
    fileKey: string,
    frame: FigmaFrame
  ): Promise<GeneratedAsset[]> {
    const assets: GeneratedAsset[] = [];
    const nodeIds: string[] = [];

    const findImages = (node: FigmaFrame) => {
      if (node.fills) {
        const imageFill = node.fills.find(
          (f: FigmaFill) => f.type === 'IMAGE' && f.imageRef
        );
        if (imageFill) {
          nodeIds.push(node.id);
        }
      }
      if (node.children) {
        node.children.forEach(findImages);
      }
    };

    findImages(frame);

    if (nodeIds.length > 0) {
      const images = await this.figmaService.getImages(
        fileKey,
        nodeIds,
        'png',
        2
      );
      for (const [nodeId, url] of Object.entries(images)) {
        assets.push({
          name: `image-${nodeId.replace(':', '-')}.png`,
          url,
        });
      }
    }

    return assets;
  }

  private _sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '_$&')
      .replace(/^./, (c) => c.toUpperCase());
  }

  private _sanitizeClassName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/^[0-9]/, '_$&')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private _toPascalCase(str: string): string {
    return str
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private _colorToRgba(color: FigmaColor): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
  }

  private _colorToHex(color: FigmaColor): string {
    const r = Math.round(color.r * 255)
      .toString(16)
      .padStart(2, '0');
    const g = Math.round(color.g * 255)
      .toString(16)
      .padStart(2, '0');
    const b = Math.round(color.b * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}
