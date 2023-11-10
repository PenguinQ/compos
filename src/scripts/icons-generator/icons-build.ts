import optimizeSVG from './icons-optimize-svg.ts';
import generateVueComponents from './icons-generate-vue.ts';
import generateVueIndex from './icons-generate-index.ts';

optimizeSVG('src/assets/icons/**/*.svg', glyphs => {
  generateVueComponents(glyphs as any);
  generateVueIndex(glyphs as any);
});
