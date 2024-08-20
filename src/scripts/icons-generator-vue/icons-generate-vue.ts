import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { setFileName } from './icons-helper.ts';
import { __foldername } from './icons-build.ts';
import type { ContentType } from './types.ts'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamicTemplate = `<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import type { IconProps } from './types';

interface DynamicIconProps extends IconProps {
  name: string;
}

const props = defineProps<DynamicIconProps>();

const DynamicIcon = defineAsyncComponent(() => import(\`./icon-\${props.name}.vue\`));
</script>

<template>
  <component :is="DynamicIcon" v-bind="$props" />
</template>`;

const staticTemplate = ({ name, source }: { name: string, source: string}) => {
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
    data-cp-icon="${iconName}"
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

const generateVueComponents = async (glyphs: ContentType[]) => {
  try {
    const log = chalk.hex('#70EAFA');
    const bold = chalk.bold;
    const spinner = ora(`${bold('Generating icon components...')}`);
    let count = 0;

    spinner.start();

    await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/icon.vue`), dynamicTemplate);

    for (const glyph of glyphs) {
      const { name, source } = glyph;
      const fileName = setFileName(name);

      await fs.outputFile(path.join(__dirname, `../../components/${__foldername}/${fileName}.vue`), staticTemplate({ name, source }));

      count += 1;
    }

    if (count === glyphs.length) {
      spinner.stopAndPersist({ symbol: '✅', text: `${log(`(${count}/${glyphs.length})`)} ${bold(`Icon components generated\n\nIcon components are located in /src/components/${__foldername}`)}` });
    }
  } catch (error) {
    console.error(`[ERROR - icons-generate-vue]: ${error}`);
  }
};

export { generateVueComponents };
