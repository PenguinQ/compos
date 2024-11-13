import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

import { __foldername } from './icons-build.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async () => {
  const componentTemplate = `const composIconRegistry = new Map<string, string>();

export function addIcons(icons: Record<string, string>) {
  Object.entries(icons).forEach(([name, svg]) => {
    composIconRegistry.set(name, svg);
  });
};

class ComposIcon extends HTMLElement {
  static observedAttributes = ['name', 'icon', 'size', 'color'];
  static _cache = new Map();
  static _fetchPromises = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setAttribute('role', 'img');
    this.removeAttribute('icon');
    this.removeAttribute('size');
    this.removeAttribute('color');
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) this.render();
  }

  async fetchIcon(url: string) {
    if (ComposIcon._cache.has(url)) return ComposIcon._cache.get(url);

    if (ComposIcon._fetchPromises.has(url)) return ComposIcon._fetchPromises.get(url);

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url);
        const svgContent = await response.text();
        ComposIcon._cache.set(url, svgContent);

        return svgContent;
      } catch (error) {
        console.error(\`[ERROR]: \${error}\`);

        return null;
      } finally {
        ComposIcon._fetchPromises.delete(url);
      }
    })();

    ComposIcon._fetchPromises.set(url, fetchPromise);

    return fetchPromise;
  }

  getSize() {
    const size = this.getAttribute('size');

    return isNaN(Number(size)) ? size : \`\${size}px\`;
  }

  async render() {
    const svgIcon = this.getAttribute('icon') || this.getAttribute('name');

    if (!svgIcon) return;

    let svgContent = composIconRegistry.get(svgIcon);

    if (!svgContent) {
      if (svgIcon.startsWith('<svg')) {
        svgContent = svgIcon;
      } else {
        svgContent = await this.fetchIcon(svgIcon);

        if (!svgContent) return;
      }
    }

    const size = this.getSize();
    const color = this.getAttribute('color');
    const template = document.createElement('template');

    if (size) {
      this.style.width = size;
      this.style.height = size;
    }

    if (color) {
      this.style.color = color;
    }

    template.innerHTML = \`
      <style>
        :host {
          width: 24px;
          height: 24px;
          fill: currentColor;
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
      \${svgContent}
    \`;

    this.shadowRoot?.replaceChildren(template.content.cloneNode(true));
  }
}

if (!customElements.get('compos-icon')) customElements.define('compos-icon', ComposIcon);

export default 'compos-icon';
`;

  try {
    await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/component.ts`), componentTemplate);
  } catch (error) {
    console.error(`[ERROR - icons-generate-component]: ${error}`);
  }
};
