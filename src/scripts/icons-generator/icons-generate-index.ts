import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { setIconName, sortIcon } from './icons-helper.ts';
import { __foldername } from './icons-build.ts';
import type { ContentType } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (icons: ContentType[]) => {
  const bold    = chalk.bold;
  const spinner = ora(`${bold('Generating index...')}`);

  spinner.start();

  const sortedIcons = sortIcon(icons);
  let string = '';

  string += `import ComposIcon from './component';
import {
`;

  sortedIcons.map(icon => {
    const { name } = icon;
    const iconName = setIconName(name);

    string += `  ${iconName},\n`;
  });

  string += `} from './icons';

export {
  ComposIcon as default,
`;

  sortedIcons.map((icon, index, array) => {
    const { name } = icon;
    const iconName = setIconName(name);

    if (index !== array.length - 1) {
      string += `  ${iconName},\n`;
    } else {
      string += `  ${iconName},`;
    }
  });

  string += `\n};`

  try {
    await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/index.ts`), string);

    spinner.stopAndPersist({ symbol: '📃', text: bold('index generated') });
  } catch (error) {
    console.error(`[ERROR - icons-generate-index]: ${error}`);
    spinner.stop();
  }
};
