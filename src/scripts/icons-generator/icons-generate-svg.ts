import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { __foldername } from './icons-build.ts';
import { setIconName, setFileName, sortIcon } from './icons-helper.ts';

// Types
import type { ContentType } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (svgs: ContentType[]) => {
  try {
    const log = chalk.hex('#70EAFA');
    const bold = chalk.bold;
    const spinner = ora(`${bold('Generating SVGs...')}`);
    const sortedSvgs = sortIcon(svgs);
    let svgCount = 0;
    let mapString = '';

    spinner.start();

    for (const svg of sortedSvgs) {
      const { name, source } = svg;
      const fileName = setFileName(name);
      const icon_name = setIconName(name);

      mapString += `export const ${icon_name} = '${source}';\n`
      await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/svg/${fileName}.svg`), source);
      svgCount += 1;
    }

    if (svgCount === sortedSvgs.length) {
      // Generate icon-map
      await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/icons.ts`), mapString);

      spinner.stopAndPersist({ symbol: '✅', text: `${log(`(${svgCount}/${svgs.length})`)} ${bold(`SVGs generated`)}` });
    }
  } catch (error) {
    console.error(`[ERROR - icons-generate-svg]: ${error}`);
  }
};
