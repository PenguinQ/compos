import optimizeSVG from './icons-optimize-svg.ts';
import { generateVueComponents } from './icons-generate-vue.ts';
import generateVueIndex from './icons-generate-index.ts';

export type ContentType = {
  name: string;
  source: string;
};

optimizeSVG('src/assets/icons/**/*.svg', async (glyphs: ContentType[]) => {
  await generateVueComponents(glyphs);
  await generateVueIndex(glyphs);
});
