import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { setComponentName } from './icons-helper.ts';
import type { ContentType } from './icons-build.ts'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateVueIcons = ({ name, source }: { name: string, source: string}) => {
  const color = 'var(--color-black, #000)';
  const iconName = name.replaceAll('_', '-');

  return `<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { IconProps } from './types';

const props = defineProps<IconProps>();

const iconRef = ref(null);
const iconStyle = reactive({
  display: 'inline-block',
  verticalAlign: 'middle',
  margin: props.margin,
  transform: props.rotate ? \`rotate(\${props.rotate}deg)\` : undefined,
});

defineExpose({ ref: iconRef });
</script>

<template>
  <svg
    ref="iconRef"
    xmlns="http://www.w3.org/2000/svg"
    class="cp-icon"
    viewBox="0 0 24 24"
    data-mt-icon="${iconName}"
    :title="title"
    :width="size ? size : 24"
    :height="size ? size : 24"
    :fill="color ? color : '${color}'"
    :style="iconStyle"
  >
    ${source}
  </svg>
</template>
`;
};

const generateVueComponents = (glyphs: ContentType[]) => {
  const log = chalk.hex('#70EAFA');
  const bold = chalk.bold;
  const spinner = ora(`${bold('Generating SVG components...')}`);
  let count = 0;

  spinner.start();

  glyphs.map(glyph => {
    const { name, source } = glyph;
    const componentName = setComponentName(name);
    const componentContent = generateVueIcons({ name, source });

    fs.outputFile(path.join(__dirname, `../../components/icons/${componentName}.vue`), componentContent);

    count += 1;

    if (count === glyphs.length) {
      spinner.stopAndPersist({ symbol: '✅', text: `${log(`(${count}/${glyphs.length})`)} ${bold(`Icon components generated\n\nIcon components are located in /src/components/icons`)}` });
    }
  });
};

export default generateVueComponents;
