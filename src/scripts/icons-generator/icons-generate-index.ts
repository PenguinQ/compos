import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { setComponentName } from './icons-helper.ts';
import type { ContentType } from './icons-build.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateVueIndex = (glyphs: ContentType[]) => {
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

  glyphs.map((glyph) => {
    const { name } = glyph;
    const componentName = setComponentName(name);

    string += `export { default as ${componentName} } from './${componentName}.vue';\n`;
  });

  fs.outputFile(
    path.join(__dirname, '../../components/icons/modules.d.ts'),
    moduleString,
  );
  fs.outputFile(
    path.join(__dirname, '../../components/icons/types.ts'),
    typesString,
  );
  fs.outputFile(
    path.join(__dirname, '../../components/icons/index.ts'),
    string,
  );
};

export default generateVueIndex;
