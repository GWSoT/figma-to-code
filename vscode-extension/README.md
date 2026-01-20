# Figma to Code VS Code Extension

A VS Code extension that brings Figma design-to-code workflow directly into your editor. View Figma designs, generate code, and maintain bidirectional sync with your project.

## Features

### View Figma Designs in Sidebar
- Browse your Figma files directly from VS Code
- View frames and components in a tree structure
- Quick access to recent files

### Generate Code from Designs
- Select a frame and generate production-ready code
- Support for multiple frameworks:
  - React (TypeScript)
  - Vue 3 (with Composition API)
  - Svelte
  - Plain HTML
- Multiple styling options:
  - Tailwind CSS
  - CSS/CSS Modules
  - Styled Components

### Bidirectional Sync
- Track code changes and link them back to Figma designs
- Open the source design with one click
- File change detection and sync status tracking

### Generation History
- View history of all code generations
- Quick access to previously generated files
- Track success/failure of generations

## Getting Started

### 1. Get a Figma Personal Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Create a new token with read access to your files
4. Copy the token

### 2. Connect Your Account

1. Open VS Code
2. Click on the Figma icon in the Activity Bar
3. Click "Connect Figma Account"
4. Paste your personal access token

### 3. Open a Design

1. Copy the URL of a Figma file
2. Paste it in the "Open Design" input field
3. Browse frames and select one to generate code

### 4. Generate Code

1. Select a frame from the Designs panel
2. Click "Generate Code" or use `Ctrl+Shift+G` (Cmd+Shift+G on Mac)
3. Choose your framework and styling preferences
4. Select output directory
5. The code will be generated and opened in the editor

## Configuration

Access settings via `File > Preferences > Settings` and search for "Figma to Code":

| Setting | Description | Default |
|---------|-------------|---------|
| `figmaToCode.figmaAccessToken` | Your Figma personal access token | - |
| `figmaToCode.defaultFramework` | Default framework for code generation | `react` |
| `figmaToCode.defaultStyling` | Default styling approach | `tailwind` |
| `figmaToCode.outputDirectory` | Default output directory | `./src/components` |
| `figmaToCode.enableBidirectionalSync` | Enable file change tracking | `true` |
| `figmaToCode.autoRefresh` | Auto-refresh designs on focus | `false` |

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Figma to Code: Open Figma Design` | Open a Figma file by URL | - |
| `Figma to Code: Generate Code from Selection` | Generate code from selected frame | `Ctrl+Shift+G` |
| `Figma to Code: Refresh Designs` | Refresh the current design | - |
| `Figma to Code: Connect Figma Account` | Set up Figma authentication | - |
| `Figma to Code: Sync Code Changes to Figma` | Open linked Figma design | - |
| `Figma to Code: Insert Generated Code` | Insert code at cursor position | - |
| `Figma to Code: Open Settings` | Open extension settings | - |

## Keyboard Shortcuts

- `Ctrl+Shift+G` / `Cmd+Shift+G`: Generate code from selected frame

## Development

### Building the Extension

```bash
cd vscode-extension
npm install
npm run compile
```

### Packaging

```bash
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

### Installing from VSIX

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." menu > "Install from VSIX..."
4. Select the generated `.vsix` file

## Troubleshooting

### "Invalid Figma access token"
- Make sure you copied the entire token
- Check that the token hasn't expired
- Create a new token if needed

### "File not found"
- Verify you have access to the Figma file
- Check that the URL is correct
- Make sure the file hasn't been deleted

### "No frames found"
- Ensure the file contains frames (not just pages)
- Try opening a different page in the file

## Privacy & Security

- Your Figma access token is stored securely in VS Code's global state
- No data is sent to external servers except Figma's API
- Design data is only stored locally during the session

## License

MIT
