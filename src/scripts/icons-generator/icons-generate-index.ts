import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra'
import { setComponentName } from './icons-helper.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateVueIndex = (glyphs: []) => {
  let string = '';

  glyphs.map(glyph => {
    const { name } = glyph;
    const componentName = setComponentName(name);

    string += `export { default as ${componentName} } from './${componentName}.vue';\n`;
  });

  fs.outputFile(path.join(__dirname, '../../components/icons/index.ts'), string);
};

export default generateVueIndex;
