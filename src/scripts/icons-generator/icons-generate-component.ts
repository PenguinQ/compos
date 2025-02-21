import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { __foldername } from './icons-build.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export default async () => {
  const bold    = chalk.bold;
  const spinner = ora(`${bold('Generating component...')}`);

  spinner.start();

  const componentTemplate = `const composIconRegistry = new Map<string, string>();

export function addIcons(icons: Record<string, string>) {
  Object.entries(icons).forEach(([name, svg]) => {
    composIconRegistry.set(name, svg);
  });
};

class ComposIcon extends HTMLElement {
  static observedAttributes = ['name', 'icon', 'size', 'color'];
  static _cache = new Map();
  static _pendingFetches = new Map();
  private connected: boolean = false;
  private content: string | undefined = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.connected) {
      this.render();
      this.setAttribute('role', 'img');
      this.removeAttribute('icon');

      this.connected = true;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (!this.connected || oldValue === newValue) return;

    if (newValue) {
      switch (name) {
        case 'icon':
        case 'name':
          this.content = '';
          this.render();
          this.removeAttribute('icon');
          break;
        case 'color':
        case 'size':
          this.render();
          break;
      }
    }
  }

  async fetchIcon(url: string) {
    if (ComposIcon._cache.has(url)) return ComposIcon._cache.get(url);

    if (ComposIcon._pendingFetches.has(url)) return ComposIcon._pendingFetches.get(url);

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');

        if (!contentType?.includes('svg')) throw new Error('Invalid icon source');

        const svgContent = await response.text();

        if (!svgContent.includes('<svg')) throw new Error('Invalid SVG content');

        ComposIcon._cache.set(url, svgContent);

        return svgContent;
      } catch (error) {
        console.error(\`[ERROR]: \${error}\`);

        return null;
      } finally {
        ComposIcon._pendingFetches.delete(url);
      }
    })();

    ComposIcon._pendingFetches.set(url, fetchPromise);

    return fetchPromise;
  }

  getSize() {
    const size = this.getAttribute('size');

    return size ? isNaN(Number(size)) ? size : \`\${size}px\` : undefined;
  }

  async render() {
    if (!this.content) {
      const svg = this.getAttribute('icon') || this.getAttribute('name');

      if (!svg) return;

      let icon = composIconRegistry.get(svg);

      if (!icon) {
        icon = svg.startsWith('<svg') ? svg : await this.fetchIcon(svg);

        if (!icon) return;
      }

      this.content = icon;
    }

    const size = this.getSize();
    const color = this.getAttribute('color');
    const template = document.createElement('template');

    template.innerHTML = \`
      <style>
        :host {
          width: \${size || '24px'};
          height: \${size || '24px'};
          fill: \${color || 'currentColor'};
          vertical-align: middle;
          display: inline-block;
          contain: strict;
        }

        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
      \${this.content}
    \`;

    this.shadowRoot?.replaceChildren(template.content.cloneNode(true));
  }
}

if (!customElements.get('compos-icon')) customElements.define('compos-icon', ComposIcon);

export default 'compos-icon';
`;

  try {
    await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/component.ts`), componentTemplate);

    spinner.stopAndPersist({ symbol: '📃', text: bold('Component generated') });
  } catch (error) {
    console.error(`[ERROR - icons-generate-component]: ${error}`);
    spinner.stop();
  }
};
