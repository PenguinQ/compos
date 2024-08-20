import optimizeSVG from './icons-optimize-svg.ts';
import generateSVG from './icons-generate-svg.ts';
import generateComponent from './icons-generate-component.ts';
import generateIndex from './icons-generate-index.ts';
import type { ContentType } from './types.ts';

export const __foldername = 'Icons';

optimizeSVG('src/assets/icons/**/*.svg', async (glyphs: ContentType[]) => {
  await generateSVG(glyphs);
  await generateComponent();
  await generateIndex(glyphs);
});
