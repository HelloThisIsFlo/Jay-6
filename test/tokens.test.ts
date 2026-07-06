import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import mainSource from '../src/main.ts?raw';

const root = resolve(__dirname, '..');

function readProjectFile(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('shared visual tokens', () => {
  it('exposes the locked sketch palette, typography, radii, and spacing tokens', () => {
    const css = readProjectFile('src/styles/tokens.css');

    const requiredSnippets = [
      '--bg-0: #0e0e0e;',
      '--bg-1: #171717;',
      '--bg-2: #1f1f1f;',
      '--bg-3: #2a2a2a;',
      '--bg-4: #3a3a3a;',
      '--bg-5: #4a4a4a;',
      '--fg-0: #eeeeee;',
      '--fg-1: #b8b8b8;',
      '--fg-2: #7a7a7a;',
      '--fg-3: #555555;',
      '--accent: #ff7a1a;',
      '--accent-soft: rgba(255, 122, 26, 0.18);',
      '--system: oklch(0.68 0.045 250);',
      '--system-soft: oklch(0.42 0.04 250 / 0.35);',
      '--cream: #f4f1ea;',
      '--black-key: #2e2e2e;',
      '--frame: #000000;',
      '--mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;',
      '--t-eyebrow: 11px;',
      '--t-body: 14px;',
      '--t-readout: 18px;',
      '--t-display: 28px;',
      '--radius-sm: 4px;',
      '--radius-md: 6px;',
      '--radius-lg: 10px;',
      '--space-1: 4px;',
      '--space-2: 8px;',
      '--space-4: 16px;',
      '--space-6: 24px;',
      '--space-8: 32px;',
      '--space-12: 48px;',
    ];

    for (const snippet of requiredSnippets) {
      expect(css).toContain(snippet);
    }
  });

  it('imports the shared token layer exactly once before App mounts', () => {
    const imports = mainSource.match(/import '\.\/styles\/tokens\.css';/g) ?? [];

    expect(imports).toHaveLength(1);
    expect(mainSource.indexOf("import './styles/tokens.css';")).toBeLessThan(
      mainSource.indexOf("import App from './App.svelte';"),
    );
  });
});
