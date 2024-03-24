import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { setComponentName, setFileName } from './icons-helper.ts';
import type { ContentType } from './icons-build.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateVueIndex = async (glyphs: ContentType[]) => {
  let string = '';
  const typesString = `import { SVGAttributes } from 'vue';

export interface IconProps extends /* @vue-ignore */ SVGAttributes {
  title?: string;
  size?: string | number;
  color?: string;
  rotate?: number;
  margin?: string;
}`;
  const moduleString = `declare module '@icons';

/**
 * KEEP THIS FOR FUTURE CHANGES.
 * Currently type definition from declare module are not supported, see:
 * https://github.com/vuejs/core/issues/8468#issuecomment-1586003267
 */
// declare module '@icons/types' {
//   export interface IconProps extends SVGElement {
//     title?: string,
//     size?: number | string,
//     color?: string,
//     rotate?: number,
//     margin?: string,
//   }
// }`;

  string += `import Icon from './icon.vue';\n`;

  glyphs.map((glyph) => {
    const { name } = glyph;
    const componentName = setComponentName(name);
    const fileName = setFileName(name);

    // string += `export { default as ${componentName} } from './${fileName}.vue';\n`;

    string += `import ${componentName} from './${fileName}.vue';\n`;
  });

  string += `\nexport {\n  Icon as default,\n`

  glyphs.map((glyph, index, array) => {
    const { name } = glyph;
    const componentName = setComponentName(name);

    if (index !== array.length - 1) {
      string += `  ${componentName},\n`;
    } else {
      string += `  ${componentName},`;
    }
  });

  string += `\n};`

  try {
    await fs.outputFile(path.join(__dirname, '../../components/icons/modules.d.ts'), moduleString);
    await fs.outputFile(path.join(__dirname, '../../components/icons/types.ts'), typesString);
    await fs.outputFile(path.join(__dirname, '../../components/icons/index.ts'), string);
  } catch (error) {
    console.error('Error:', error);
  }
};

export default generateVueIndex;
