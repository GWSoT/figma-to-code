I'll review the previous implementation and verify it's complete. Let me check the current state of the CLI files and run verification tests.

🔧 Tool: Glob
Input: {
  "pattern": "src/cli/**/*"
}

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts --help 2>&1 | head -50",
  "description": "Test CLI help command"
}
The CLI exists and the help command works. Let me run a comprehensive verification of all CLI commands:

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts version 2>&1",
  "description": "Test version command"
}

🔧 Tool: Bash
Input: {
  "command": "cd /tmp && rm -rf cli-test && mkdir -p cli-test && cd cli-test && npx tsx /home/rainman/figma-to-code/figma-to-code/src/cli/index.ts init 2>&1",
  "description": "Test init command"
}

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts validate -c /tmp/cli-test/figma-to-code.config.json 2>&1",
  "description": "Test validate command"
}

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts generate --dry-run -c /tmp/cli-test/figma-to-code.config.json 2>&1",
  "description": "Test dry-run mode"
}

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts generate --dry-run --json -c /tmp/cli-test/figma-to-code.config.json 2>&1",
  "description": "Test JSON output mode"
}
All commands are working. Let me also verify the convert command with URL parsing and error handling:

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts convert --url \"https://www.figma.com/file/abc123/MyDesign?node-id=1-2\" -o /tmp/cli-test --dry-run 2>&1",
  "description": "Test convert command"
}

🔧 Tool: Bash
Input: {
  "command": "cat /tmp/cli-test/figma-to-code.config.json",
  "description": "Check generated config file"
}
The convert command needs the config file. Let me check the convert implementation to see if it should work standalone:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/cli/index.ts"
}
I see the issue - the `convert` command is building a config but then calling `commandGenerate` without using it. Let me fix this bug and then create a Playwright test to verify the CLI:

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/cli/index.ts",
  "old_string": "/**\n * Convert command - convert a single URL\n */\nasync function commandConvert(\n  args: string[],\n  options: CLIOptions,\n  logger: TerminalLogger\n): Promise<number> {\n  const url = args[0];\n\n  if (!url) {\n    logger.error(\"Missing Figma URL. Usage: figma-to-code convert --url <url>\");\n    return 1;\n  }\n\n  // Parse URL to design source\n  let source;\n  try {\n    source = parseDesignSourceFromUrl(url);\n  } catch (error) {\n    logger.error(error instanceof Error ? error.message : String(error));\n    return 1;\n  }\n\n  // Build config from options\n  const config: CLIConfig = {\n    version: \"1.0\",\n    figma: {\n      token: options.token,\n      tokenEnvVar: \"FIGMA_TOKEN\",\n    },\n    output: {\n      directory: options.output || \"./generated\",\n      clean: false,\n      fileNaming: \"PascalCase\",\n      componentStructure: \"folder\",\n    },\n    generation: {\n      framework: options.framework || \"react\",\n      styling: options.styling || \"tailwind\",\n      language: \"typescript\",\n    },\n    sources: [source],\n  };\n\n  // Run conversion\n  return commandGenerate([], { ...options, config: undefined }, logger);\n}",
  "new_string": "/**\n * Convert command - convert a single URL\n */\nasync function commandConvert(\n  args: string[],\n  options: CLIOptions,\n  logger: TerminalLogger\n): Promise<number> {\n  const url = args[0];\n\n  if (!url) {\n    logger.error(\"Missing Figma URL. Usage: figma-to-code convert --url <url>\");\n    return 1;\n  }\n\n  // Parse URL to design source\n  let source;\n  try {\n    source = parseDesignSourceFromUrl(url);\n  } catch (error) {\n    logger.error(error instanceof Error ? error.message : String(error));\n    return 1;\n  }\n\n  // Build config from options\n  const config: CLIConfig = {\n    version: \"1.0\",\n    figma: {\n      token: options.token,\n      tokenEnvVar: \"FIGMA_TOKEN\",\n    },\n    output: {\n      directory: options.output || \"./generated\",\n      clean: false,\n      fileNaming: \"PascalCase\",\n      componentStructure: \"folder\",\n    },\n    generation: {\n      framework: options.framework || \"react\",\n      styling: options.styling || \"tailwind\",\n      language: \"typescript\",\n    },\n    sources: [source],\n  };\n\n  // Setup logger\n  if (options.verbose) {\n    logger.setLevel(\"debug\");\n  } else if (options.quiet) {\n    logger.setLevel(\"warn\");\n  }\n  if (options.json) {\n    logger.setJsonMode(true);\n  }\n\n  // Dry run mode\n  if (options.dryRun) {\n    logger.info(\"Dry run mode - no files will be written\");\n    logger.info(`Would convert: ${source.fileKey}${source.nodeId ? `#${source.nodeId}` : \"\"}`);\n    logger.info(`Output directory: ${config.output.directory}`);\n    logger.info(`Framework: ${config.generation.framework}`);\n    logger.info(`Styling: ${config.generation.styling}`);\n    return 0;\n  }\n\n  // Run conversion\n  logger.header(\"Figma to Code\");\n  logger.progress({\n    type: \"start\",\n    message: \"Starting code generation...\",\n    timestamp: new Date(),\n  });\n\n  const result = await convert(config, logger, (event) => {\n    logger.progress(event);\n  });\n\n  // Output result\n  const { summary, stats } = formatResult(result);\n\n  if (result.success) {\n    logger.progress({\n      type: \"complete\",\n      message: \"Code generation complete\",\n      timestamp: new Date(),\n    });\n    logger.success(summary, stats);\n  } else {\n    logger.progress({\n      type: \"error\",\n      message: \"Code generation failed\",\n      timestamp: new Date(),\n    });\n    logger.failure(summary, result.errors);\n  }\n\n  // Show warnings\n  if (result.warnings.length > 0) {\n    result.warnings.forEach((warning) => {\n      logger.warn(warning);\n    });\n  }\n\n  return result.exitCode;\n}"
}
Now let me verify the convert command works properly:

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts convert --url \"https://www.figma.com/file/abc123/MyDesign?node-id=1-2\" --dry-run 2>&1",
  "description": "Test convert command with dry-run"
}
The convert command now works. Let me also test with framework/styling overrides and JSON output:

🔧 Tool: Bash
Input: {
  "command": "npx tsx src/cli/index.ts convert --url \"https://www.figma.com/file/xyz789/Test?node-id=5-10\" -f vue -s scss --dry-run --json 2>&1",
  "description": "Test convert with overrides and JSON"
}
All commands work. Now let me create a Playwright test to verify the CLI. Since this is a CLI tool rather than a web application, I'll create a test that verifies the CLI commands work correctly:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/cli-verification.spec.ts",
  "content": "import { test, expect } from \"@playwright/test\";\nimport { execSync, spawnSync } from \"child_process\";\nimport * as fs from \"fs\";\nimport * as path from \"path\";\nimport * as os from \"os\";\n\n/**\n * CLI Verification Tests\n *\n * These tests verify the figma-to-code CLI functionality including:\n * - Help and version commands\n * - Init command for config creation\n * - Validate command for config validation\n * - Generate command with dry-run mode\n * - Convert command for single URL conversion\n * - JSON output mode for CI/CD integration\n */\n\nconst CLI_PATH = \"npx tsx src/cli/index.ts\";\nconst TEST_DIR = path.join(os.tmpdir(), \"figma-to-code-test-\" + Date.now());\n\ntest.describe(\"CLI Verification\", () => {\n  test.beforeAll(() => {\n    // Create test directory\n    if (!fs.existsSync(TEST_DIR)) {\n      fs.mkdirSync(TEST_DIR, { recursive: true });\n    }\n  });\n\n  test.afterAll(() => {\n    // Clean up test directory\n    if (fs.existsSync(TEST_DIR)) {\n      fs.rmSync(TEST_DIR, { recursive: true, force: true });\n    }\n  });\n\n  test(\"should display help text\", async () => {\n    const result = spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"--help\"], {\n      encoding: \"utf-8\",\n      cwd: process.cwd(),\n    });\n\n    expect(result.stdout).toContain(\"Figma to Code CLI v1.0.0\");\n    expect(result.stdout).toContain(\"COMMANDS:\");\n    expect(result.stdout).toContain(\"generate\");\n    expect(result.stdout).toContain(\"init\");\n    expect(result.stdout).toContain(\"validate\");\n    expect(result.stdout).toContain(\"convert\");\n    expect(result.stdout).toContain(\"GENERATE OPTIONS:\");\n    expect(result.stdout).toContain(\"--config\");\n    expect(result.stdout).toContain(\"--output\");\n    expect(result.stdout).toContain(\"--framework\");\n    expect(result.stdout).toContain(\"--dry-run\");\n    expect(result.stdout).toContain(\"--json\");\n  });\n\n  test(\"should display version number\", async () => {\n    const result = spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"version\"], {\n      encoding: \"utf-8\",\n      cwd: process.cwd(),\n    });\n\n    expect(result.stdout.trim()).toBe(\"1.0.0\");\n    expect(result.status).toBe(0);\n  });\n\n  test(\"should create config file with init command\", async () => {\n    const configPath = path.join(TEST_DIR, \"figma-to-code.config.json\");\n\n    // Ensure config doesn't exist\n    if (fs.existsSync(configPath)) {\n      fs.unlinkSync(configPath);\n    }\n\n    const result = spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"init\"], {\n      encoding: \"utf-8\",\n      cwd: TEST_DIR,\n    });\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Created configuration file\");\n    expect(fs.existsSync(configPath)).toBe(true);\n\n    // Verify config file contents\n    const config = JSON.parse(fs.readFileSync(configPath, \"utf-8\"));\n    expect(config.version).toBe(\"1.0\");\n    expect(config.figma).toBeDefined();\n    expect(config.output).toBeDefined();\n    expect(config.generation).toBeDefined();\n    expect(config.sources).toBeDefined();\n    expect(Array.isArray(config.sources)).toBe(true);\n  });\n\n  test(\"should validate config file\", async () => {\n    const configPath = path.join(TEST_DIR, \"figma-to-code.config.json\");\n\n    // Ensure config exists from previous test\n    if (!fs.existsSync(configPath)) {\n      spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"init\"], {\n        encoding: \"utf-8\",\n        cwd: TEST_DIR,\n      });\n    }\n\n    const result = spawnSync(\n      \"npx\",\n      [\"tsx\", \"src/cli/index.ts\", \"validate\", \"-c\", configPath],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Configuration is valid\");\n  });\n\n  test(\"should reject invalid config file\", async () => {\n    const invalidConfigPath = path.join(TEST_DIR, \"invalid.config.json\");\n\n    // Create an invalid config file\n    fs.writeFileSync(\n      invalidConfigPath,\n      JSON.stringify({ version: \"1.0\" }), // Missing required fields\n      \"utf-8\"\n    );\n\n    const result = spawnSync(\n      \"npx\",\n      [\"tsx\", \"src/cli/index.ts\", \"validate\", \"-c\", invalidConfigPath],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(1);\n    expect(result.stderr).toContain(\"Missing required field\");\n  });\n\n  test(\"should show dry-run output for generate command\", async () => {\n    const configPath = path.join(TEST_DIR, \"figma-to-code.config.json\");\n\n    // Ensure config exists\n    if (!fs.existsSync(configPath)) {\n      spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"init\"], {\n        encoding: \"utf-8\",\n        cwd: TEST_DIR,\n      });\n    }\n\n    const result = spawnSync(\n      \"npx\",\n      [\"tsx\", \"src/cli/index.ts\", \"generate\", \"--dry-run\", \"-c\", configPath],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Dry run mode\");\n    expect(result.stdout).toContain(\"Would process\");\n    expect(result.stdout).toContain(\"source(s)\");\n  });\n\n  test(\"should output JSON for CI/CD integration\", async () => {\n    const configPath = path.join(TEST_DIR, \"figma-to-code.config.json\");\n\n    const result = spawnSync(\n      \"npx\",\n      [\n        \"tsx\",\n        \"src/cli/index.ts\",\n        \"generate\",\n        \"--dry-run\",\n        \"--json\",\n        \"-c\",\n        configPath,\n      ],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n\n    // Each line should be valid JSON\n    const lines = result.stdout.trim().split(\"\\n\");\n    for (const line of lines) {\n      if (line.trim()) {\n        const parsed = JSON.parse(line);\n        expect(parsed).toHaveProperty(\"level\");\n        expect(parsed).toHaveProperty(\"message\");\n        expect(parsed).toHaveProperty(\"timestamp\");\n      }\n    }\n  });\n\n  test(\"should convert single URL with dry-run\", async () => {\n    const testUrl = \"https://www.figma.com/file/abc123/TestDesign?node-id=1-2\";\n\n    const result = spawnSync(\n      \"npx\",\n      [\"tsx\", \"src/cli/index.ts\", \"convert\", \"--url\", testUrl, \"--dry-run\"],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Dry run mode\");\n    expect(result.stdout).toContain(\"Would convert: abc123#1:2\");\n    expect(result.stdout).toContain(\"Framework: react\");\n    expect(result.stdout).toContain(\"Styling: tailwind\");\n  });\n\n  test(\"should accept framework and styling overrides in convert command\", async () => {\n    const testUrl = \"https://www.figma.com/file/xyz789/Test?node-id=5-10\";\n\n    const result = spawnSync(\n      \"npx\",\n      [\n        \"tsx\",\n        \"src/cli/index.ts\",\n        \"convert\",\n        \"--url\",\n        testUrl,\n        \"-f\",\n        \"vue\",\n        \"-s\",\n        \"scss\",\n        \"--dry-run\",\n      ],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Would convert: xyz789#5:10\");\n    expect(result.stdout).toContain(\"Framework: vue\");\n    expect(result.stdout).toContain(\"Styling: scss\");\n  });\n\n  test(\"should output convert results as JSON for CI/CD\", async () => {\n    const testUrl = \"https://www.figma.com/file/test123/Design?node-id=10-20\";\n\n    const result = spawnSync(\n      \"npx\",\n      [\n        \"tsx\",\n        \"src/cli/index.ts\",\n        \"convert\",\n        \"--url\",\n        testUrl,\n        \"--dry-run\",\n        \"--json\",\n      ],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n\n    // Verify each line is valid JSON\n    const lines = result.stdout.trim().split(\"\\n\");\n    for (const line of lines) {\n      if (line.trim()) {\n        const parsed = JSON.parse(line);\n        expect(parsed).toHaveProperty(\"level\");\n        expect(parsed).toHaveProperty(\"message\");\n      }\n    }\n\n    // Verify content\n    expect(result.stdout).toContain(\"test123#10:20\");\n  });\n\n  test(\"should report error for missing URL in convert command\", async () => {\n    const result = spawnSync(\"npx\", [\"tsx\", \"src/cli/index.ts\", \"convert\"], {\n      encoding: \"utf-8\",\n      cwd: process.cwd(),\n    });\n\n    expect(result.status).toBe(1);\n    expect(result.stderr).toContain(\"Missing Figma URL\");\n  });\n\n  test(\"should report error for unknown command\", async () => {\n    const result = spawnSync(\n      \"npx\",\n      [\"tsx\", \"src/cli/index.ts\", \"unknowncommand\"],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(1);\n    expect(result.stderr).toContain(\"Unknown command\");\n  });\n\n  test(\"should support short option forms\", async () => {\n    const testUrl = \"https://www.figma.com/file/short123/Test?node-id=3-4\";\n\n    const result = spawnSync(\n      \"npx\",\n      [\n        \"tsx\",\n        \"src/cli/index.ts\",\n        \"convert\",\n        \"--url\",\n        testUrl,\n        \"-f\",\n        \"svelte\",\n        \"-s\",\n        \"css-modules\",\n        \"-o\",\n        \"/tmp/output\",\n        \"--dry-run\",\n      ],\n      {\n        encoding: \"utf-8\",\n        cwd: process.cwd(),\n      }\n    );\n\n    expect(result.status).toBe(0);\n    expect(result.stdout).toContain(\"Framework: svelte\");\n    expect(result.stdout).toContain(\"Styling: css-modules\");\n    expect(result.stdout).toContain(\"Output directory: /tmp/output\");\n  });\n});\n"
}
Now let me run the Playwright tests to verify the CLI:

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/cli-verification.spec.ts --reporter=list 2>&1",
  "description": "Run CLI verification tests",
  "timeout": 120000
}

🔧 Tool: TaskOutput
Input: {
  "task_id": "b15ffc9",
  "block": true,
  "timeout": 120000
}
Let me check if there are any tests running or hung:

🔧 Tool: Bash
Input: {
  "command": "cat /tmp/claude/-home-rainman-figma-to-code-figma-to-code/tasks/b15ffc9.output | head -100",
  "description": "Check test output"
}
The test output is empty. Let me kill the background task and try running the tests differently:

🔧 Tool: KillShell
Input: {
  "shell_id": "b15ffc9"
}

🔧 Tool: Bash
Input: {
  "command": "timeout 60 npx playwright test tests/cli-verification.spec.ts --reporter=list 2>&1 || true",
  "description": "Run CLI tests with timeout",
  "timeout": 90000
}
The command seems to hang. Let me try a simpler approach with just running a single test directly:

🔧 Tool: Bash
Input: {
  "command": "node -e \"\nconst { spawnSync } = require('child_process');\nconst result = spawnSync('npx', ['tsx', 'src/cli/index.ts', '--help'], { encoding: 'utf-8' });\nconsole.log('Exit code:', result.status);\nconsole.log('Contains help:', result.stdout.includes('Figma to Code CLI'));\nconsole.log('Contains commands:', result.stdout.includes('COMMANDS:'));\n\" 2>&1",
  "description": "Test CLI with node",
  "timeout": 30000
}

🔧 Tool: Bash
Input: {
  "command": "node -e \"\nconst { spawnSync } = require('child_process');\nconst fs = require('fs');\nconst path = require('path');\nconst os = require('os');\n\nconst testDir = path.join(os.tmpdir(), 'cli-test-' + Date.now());\nfs.mkdirSync(testDir, { recursive: true });\n\n// Test init command\nconst initResult = spawnSync('npx', ['tsx', 'src/cli/index.ts', 'init'], { encoding: 'utf-8', cwd: testDir });\nconsole.log('Init exit code:', initResult.status);\nconsole.log('Init created file:', fs.existsSync(path.join(testDir, 'figma-to-code.config.json')));\n\n// Test validate command\nconst configPath = path.join(testDir, 'figma-to-code.config.json');\nconst validateResult = spawnSync('npx', ['tsx', 'src/cli/index.ts', 'validate', '-c', configPath], { encoding: 'utf-8', cwd: process.cwd() });\nconsole.log('Validate exit code:', validateResult.status);\nconsole.log('Validate passed:', validateResult.stdout.includes('valid'));\n\n// Clean up\nfs.rmSync(testDir, { recursive: true, force: true });\n\" 2>&1",
  "description": "Test CLI init and validate",
  "timeout": 60000
}
The init command failed when running from a different directory. Let me check what's happening:

🔧 Tool: Bash
Input: {
  "command": "node -e \"\nconst { spawnSync } = require('child_process');\nconst fs = require('fs');\nconst path = require('path');\nconst os = require('os');\n\nconst testDir = path.join(os.tmpdir(), 'cli-test-' + Date.now());\nfs.mkdirSync(testDir, { recursive: true });\n\n// Test init command\nconst initResult = spawnSync('npx', ['tsx', path.join(process.cwd(), 'src/cli/index.ts'), 'init'], { encoding: 'utf-8', cwd: testDir });\nconsole.log('Init stdout:', initResult.stdout);\nconsole.log('Init stderr:', initResult.stderr);\nconsole.log('Init exit code:', initResult.status);\n\n// Clean up\nfs.rmSync(testDir, { recursive: true, force: true });\n\" 2>&1",
  "description": "Debug init command",
  "timeout": 60000
}
The test works with the full path. Now let me run a more comprehensive verification:

🔧 Tool: Bash
Input: {
  "command": "node -e \"\nconst { spawnSync } = require('child_process');\nconst fs = require('fs');\nconst path = require('path');\nconst os = require('os');\n\nconst cliPath = path.join(process.cwd(), 'src/cli/index.ts');\nconst testDir = path.join(os.tmpdir(), 'cli-test-' + Date.now());\nfs.mkdirSync(testDir, { recursive: true });\n\nlet passed = 0;\nlet failed = 0;\n\nfunction test(name, fn) {\n  try {\n    fn();\n    console.log('✓', name);\n    passed++;\n  } catch (e) {\n    console.log('✗', name);\n    console.log('  Error:', e.message);\n    failed++;\n  }\n}\n\nfunction assertEqual(actual, expected, msg) {\n  if (actual !== expected) {\n    throw new Error(msg || 'Expected ' + expected + ' but got ' + actual);\n  }\n}\n\nfunction assertContains(str, substr, msg) {\n  if (!str.includes(substr)) {\n    throw new Error(msg || 'Expected string to contain: ' + substr);\n  }\n}\n\n// Test 1: Help command\ntest('Help command displays usage', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, '--help'], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertContains(result.stdout, 'Figma to Code CLI v1.0.0', 'Should show version');\n  assertContains(result.stdout, 'COMMANDS:', 'Should show commands');\n});\n\n// Test 2: Version command\ntest('Version command shows version number', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'version'], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertEqual(result.stdout.trim(), '1.0.0', 'Version should be 1.0.0');\n});\n\n// Test 3: Init command creates config\ntest('Init command creates config file', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'init'], { encoding: 'utf-8', cwd: testDir });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  const configPath = path.join(testDir, 'figma-to-code.config.json');\n  if (!fs.existsSync(configPath)) throw new Error('Config file not created');\n  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));\n  if (!config.version) throw new Error('Config missing version');\n  if (!config.sources) throw new Error('Config missing sources');\n});\n\n// Test 4: Validate command\ntest('Validate command verifies config', () => {\n  const configPath = path.join(testDir, 'figma-to-code.config.json');\n  const result = spawnSync('npx', ['tsx', cliPath, 'validate', '-c', configPath], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertContains(result.stdout, 'valid', 'Should confirm valid config');\n});\n\n// Test 5: Generate dry-run\ntest('Generate command shows dry-run output', () => {\n  const configPath = path.join(testDir, 'figma-to-code.config.json');\n  const result = spawnSync('npx', ['tsx', cliPath, 'generate', '--dry-run', '-c', configPath], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertContains(result.stdout, 'Dry run mode', 'Should show dry run mode');\n  assertContains(result.stdout, 'Would process', 'Should show what would be processed');\n});\n\n// Test 6: Generate with JSON output\ntest('Generate with JSON output for CI/CD', () => {\n  const configPath = path.join(testDir, 'figma-to-code.config.json');\n  const result = spawnSync('npx', ['tsx', cliPath, 'generate', '--dry-run', '--json', '-c', configPath], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  const lines = result.stdout.trim().split('\\n');\n  for (const line of lines) {\n    const parsed = JSON.parse(line);\n    if (!parsed.level || !parsed.message) throw new Error('Invalid JSON structure');\n  }\n});\n\n// Test 7: Convert command\ntest('Convert command parses URL correctly', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'convert', '--url', 'https://www.figma.com/file/abc123/Design?node-id=1-2', '--dry-run'], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertContains(result.stdout, 'Would convert: abc123#1:2', 'Should parse URL correctly');\n});\n\n// Test 8: Convert with framework override\ntest('Convert accepts framework and styling overrides', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'convert', '--url', 'https://www.figma.com/file/xyz/Test?node-id=5-10', '-f', 'vue', '-s', 'scss', '--dry-run'], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  assertContains(result.stdout, 'Framework: vue', 'Should use Vue framework');\n  assertContains(result.stdout, 'Styling: scss', 'Should use SCSS styling');\n});\n\n// Test 9: Convert with JSON output\ntest('Convert outputs JSON for CI/CD', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'convert', '--url', 'https://www.figma.com/file/test/D?node-id=1-1', '--dry-run', '--json'], { encoding: 'utf-8' });\n  assertEqual(result.status, 0, 'Exit code should be 0');\n  const lines = result.stdout.trim().split('\\n');\n  for (const line of lines) {\n    const parsed = JSON.parse(line);\n    if (!parsed.level) throw new Error('Invalid JSON structure');\n  }\n});\n\n// Test 10: Error handling for missing URL\ntest('Convert reports error for missing URL', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'convert'], { encoding: 'utf-8' });\n  assertEqual(result.status, 1, 'Exit code should be 1');\n  assertContains(result.stderr, 'Missing Figma URL', 'Should show error for missing URL');\n});\n\n// Test 11: Unknown command handling\ntest('Unknown command shows error', () => {\n  const result = spawnSync('npx', ['tsx', cliPath, 'unknowncommand'], { encoding: 'utf-8' });\n  assertEqual(result.status, 1, 'Exit code should be 1');\n  assertContains(result.stderr, 'Unknown command', 'Should show unknown command error');\n});\n\n// Test 12: Invalid config rejection\ntest('Validate rejects invalid config', () => {\n  const invalidPath = path.join(testDir, 'invalid.json');\n  fs.writeFileSync(invalidPath, JSON.stringify({ version: '1.0' }), 'utf-8');\n  const result = spawnSync('npx', ['tsx', cliPath, 'validate', '-c', invalidPath], { encoding: 'utf-8' });\n  assertEqual(result.status, 1, 'Exit code should be 1');\n});\n\n// Clean up\nfs.rmSync(testDir, { recursive: true, force: true });\n\nconsole.log('');\nconsole.log('Results:', passed, 'passed,', failed, 'failed');\nprocess.exit(failed > 0 ? 1 : 0);\n\" 2>&1",
  "description": "Run comprehensive CLI tests",
  "timeout": 120000
}
Let me write the test script to a file instead:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/cli-test-runner.js",
  "content": "const { spawnSync } = require(\"child_process\");\nconst fs = require(\"fs\");\nconst path = require(\"path\");\nconst os = require(\"os\");\n\nconst cliPath = path.join(process.cwd(), \"src/cli/index.ts\");\nconst testDir = path.join(os.tmpdir(), \"cli-test-\" + Date.now());\nfs.mkdirSync(testDir, { recursive: true });\n\nlet passed = 0;\nlet failed = 0;\n\nfunction test(name, fn) {\n  try {\n    fn();\n    console.log(\"✓\", name);\n    passed++;\n  } catch (e) {\n    console.log(\"✗\", name);\n    console.log(\"  Error:\", e.message);\n    failed++;\n  }\n}\n\nfunction assertEqual(actual, expected, msg) {\n  if (actual !== expected) {\n    throw new Error(msg || \"Expected \" + expected + \" but got \" + actual);\n  }\n}\n\nfunction assertContains(str, substr, msg) {\n  if (!str.includes(substr)) {\n    throw new Error(msg || \"Expected string to contain: \" + substr);\n  }\n}\n\n// Test 1: Help command\ntest(\"Help command displays usage\", () => {\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"--help\"], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertContains(result.stdout, \"Figma to Code CLI v1.0.0\", \"Should show version\");\n  assertContains(result.stdout, \"COMMANDS:\", \"Should show commands\");\n});\n\n// Test 2: Version command\ntest(\"Version command shows version number\", () => {\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"version\"], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertEqual(result.stdout.trim(), \"1.0.0\", \"Version should be 1.0.0\");\n});\n\n// Test 3: Init command creates config\ntest(\"Init command creates config file\", () => {\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"init\"], {\n    encoding: \"utf-8\",\n    cwd: testDir,\n  });\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  const configPath = path.join(testDir, \"figma-to-code.config.json\");\n  if (!fs.existsSync(configPath)) throw new Error(\"Config file not created\");\n  const config = JSON.parse(fs.readFileSync(configPath, \"utf-8\"));\n  if (!config.version) throw new Error(\"Config missing version\");\n  if (!config.sources) throw new Error(\"Config missing sources\");\n});\n\n// Test 4: Validate command\ntest(\"Validate command verifies config\", () => {\n  const configPath = path.join(testDir, \"figma-to-code.config.json\");\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"validate\", \"-c\", configPath], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertContains(result.stdout, \"valid\", \"Should confirm valid config\");\n});\n\n// Test 5: Generate dry-run\ntest(\"Generate command shows dry-run output\", () => {\n  const configPath = path.join(testDir, \"figma-to-code.config.json\");\n  const result = spawnSync(\n    \"npx\",\n    [\"tsx\", cliPath, \"generate\", \"--dry-run\", \"-c\", configPath],\n    { encoding: \"utf-8\" }\n  );\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertContains(result.stdout, \"Dry run mode\", \"Should show dry run mode\");\n  assertContains(result.stdout, \"Would process\", \"Should show what would be processed\");\n});\n\n// Test 6: Generate with JSON output\ntest(\"Generate with JSON output for CI/CD\", () => {\n  const configPath = path.join(testDir, \"figma-to-code.config.json\");\n  const result = spawnSync(\n    \"npx\",\n    [\"tsx\", cliPath, \"generate\", \"--dry-run\", \"--json\", \"-c\", configPath],\n    { encoding: \"utf-8\" }\n  );\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  const lines = result.stdout.trim().split(\"\\n\");\n  for (const line of lines) {\n    const parsed = JSON.parse(line);\n    if (!parsed.level || !parsed.message)\n      throw new Error(\"Invalid JSON structure\");\n  }\n});\n\n// Test 7: Convert command\ntest(\"Convert command parses URL correctly\", () => {\n  const result = spawnSync(\n    \"npx\",\n    [\n      \"tsx\",\n      cliPath,\n      \"convert\",\n      \"--url\",\n      \"https://www.figma.com/file/abc123/Design?node-id=1-2\",\n      \"--dry-run\",\n    ],\n    { encoding: \"utf-8\" }\n  );\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertContains(\n    result.stdout,\n    \"Would convert: abc123#1:2\",\n    \"Should parse URL correctly\"\n  );\n});\n\n// Test 8: Convert with framework override\ntest(\"Convert accepts framework and styling overrides\", () => {\n  const result = spawnSync(\n    \"npx\",\n    [\n      \"tsx\",\n      cliPath,\n      \"convert\",\n      \"--url\",\n      \"https://www.figma.com/file/xyz/Test?node-id=5-10\",\n      \"-f\",\n      \"vue\",\n      \"-s\",\n      \"scss\",\n      \"--dry-run\",\n    ],\n    { encoding: \"utf-8\" }\n  );\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  assertContains(result.stdout, \"Framework: vue\", \"Should use Vue framework\");\n  assertContains(result.stdout, \"Styling: scss\", \"Should use SCSS styling\");\n});\n\n// Test 9: Convert with JSON output\ntest(\"Convert outputs JSON for CI/CD\", () => {\n  const result = spawnSync(\n    \"npx\",\n    [\n      \"tsx\",\n      cliPath,\n      \"convert\",\n      \"--url\",\n      \"https://www.figma.com/file/test/D?node-id=1-1\",\n      \"--dry-run\",\n      \"--json\",\n    ],\n    { encoding: \"utf-8\" }\n  );\n  assertEqual(result.status, 0, \"Exit code should be 0\");\n  const lines = result.stdout.trim().split(\"\\n\");\n  for (const line of lines) {\n    const parsed = JSON.parse(line);\n    if (!parsed.level) throw new Error(\"Invalid JSON structure\");\n  }\n});\n\n// Test 10: Error handling for missing URL\ntest(\"Convert reports error for missing URL\", () => {\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"convert\"], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 1, \"Exit code should be 1\");\n  assertContains(\n    result.stderr,\n    \"Missing Figma URL\",\n    \"Should show error for missing URL\"\n  );\n});\n\n// Test 11: Unknown command handling\ntest(\"Unknown command shows error\", () => {\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"unknowncommand\"], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 1, \"Exit code should be 1\");\n  assertContains(\n    result.stderr,\n    \"Unknown command\",\n    \"Should show unknown command error\"\n  );\n});\n\n// Test 12: Invalid config rejection\ntest(\"Validate rejects invalid config\", () => {\n  const invalidPath = path.join(testDir, \"invalid.json\");\n  fs.writeFileSync(invalidPath, JSON.stringify({ version: \"1.0\" }), \"utf-8\");\n  const result = spawnSync(\"npx\", [\"tsx\", cliPath, \"validate\", \"-c\", invalidPath], {\n    encoding: \"utf-8\",\n  });\n  assertEqual(result.status, 1, \"Exit code should be 1\");\n});\n\n// Clean up\nfs.rmSync(testDir, { recursive: true, force: true });\n\nconsole.log(\"\");\nconsole.log(\"Results:\", passed, \"passed,\", failed, \"failed\");\nprocess.exit(failed > 0 ? 1 : 0);\n"
}

🔧 Tool: Bash
Input: {
  "command": "node tests/cli-test-runner.js 2>&1",
  "description": "Run CLI verification tests",
  "timeout": 120000
}

🔧 Tool: Bash
Input: {
  "command": "mv tests/cli-test-runner.js tests/cli-test-runner.cjs && node tests/cli-test-runner.cjs 2>&1",
  "description": "Run CLI tests with CommonJS extension",
  "timeout": 120000
}
All 12 tests pass. Now let me clean up the test files:

🔧 Tool: Bash
Input: {
  "command": "rm tests/cli-verification.spec.ts tests/cli-test-runner.cjs",
  "description": "Clean up temporary test files"
}
Let me verify the CLI files are complete by checking all files have proper content:

🔧 Tool: Bash
Input: {
  "command": "wc -l src/cli/*.ts",
  "description": "Count lines in CLI files"
}

🔧 Tool: Bash
Input: {
  "command": "rm -rf /tmp/cli-test 2>/dev/null; echo \"Cleanup complete\"",
  "description": "Final cleanup"
}
