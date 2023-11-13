import optimizeSVG from './icons-optimize-svg.ts';
import generateVueComponents from './icons-generate-vue.ts';
import generateVueIndex from './icons-generate-index.ts';

export interface ContentType {
  name: string;
  source: string;
}

optimizeSVG('src/assets/icons/**/*.svg', (glyphs: ContentType[]) => {
  generateVueComponents(glyphs);
  generateVueIndex(glyphs);
});
