import optimizeSVG from './icons-optimize-svg.ts';
import { generateVueComponents } from './icons-generate-vue.ts';
import generateVueIndex from './icons-generate-index.ts';
import type { ContentType } from './types.ts'

export const __foldername = 'IconsVue';

optimizeSVG('src/assets/icons/**/*.svg', async (glyphs: ContentType[]) => {
  await generateVueComponents(glyphs);
  await generateVueIndex(glyphs);
});
