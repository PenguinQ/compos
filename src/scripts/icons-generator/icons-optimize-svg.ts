import fs from 'fs-extra';
import path from 'node:path';
import * as glob from 'glob';
import { optimize } from 'svgo';
import chalk from 'chalk';
import ora from 'ora';
import type { ContentType } from './icons-build.ts';

const getName = (filePath: string) => path.basename(filePath, path.extname(filePath));

const optimizeSVG = (pattern: string, callback: (glyphs: ContentType[]) => void) => {
  const svgList: ContentType[] = [];
  const filePath = glob.sync(pattern);
  const log = chalk.hex('#70EAFA');
  const bold = chalk.bold;
  const oraSpinner = ora(`${bold('Optimizing SVGs...')}`);

  const cleanGroup = (source: any) => {
    const pattern = '<g.*?>';
    const regex=  new RegExp(pattern, 'g');

    return source.replaceAll(regex, '<g>');
  };

  const cleanFill = (source: any) => {
    const pattern = '(fill="(.*?)")';
    const regex = new RegExp(pattern, 'g');

    return source.replaceAll(regex, '');
  };

  const getIndexOf = (start: string, end: string, string: string) => ({
    start: string.indexOf(start),
    startLength: start.length,
    end: string.indexOf(end),
    endLength: end.length,
  });

  const filterDefs = (source: any) => {
    const defs = '<defs>';
    const defsIndex = source.indexOf(defs);

    return defsIndex !== -1 ? source.slice(0, defsIndex) + '</svg>' : source;
  };

  const filterGroup = (source: any) => {
    const groupPattern = '<g.*?>(.*?)</g>';
    const groupRegex = new RegExp(groupPattern, 'g');

    if (groupRegex.test(source)) {
      const cleanedSource = cleanGroup(source);
      const { start, startLength, end } = getIndexOf('<g>', '</g>', cleanedSource);
      const sourceContent = cleanedSource.substring(start + startLength, end);

      return cleanFill(sourceContent);
    }

    const { start, end } = getIndexOf('>', '</svg>', source);
    const sourceContent = source.substring(start + 1, end);

    return cleanFill(sourceContent);
  };

  oraSpinner.start();

  filePath.forEach((p, _, a) => {
    const name = getName(p);
    const total = a.length;

    fs.readFile(p, 'utf-8', (error, data) => {
      if (error) {
        throw error;
      }

      const result = optimize(data, {
        path: p,
        multipass: true,
        // plugins: [
        //   'removeDoctype',
        //   'removeXMLProcInst',
        //   'removeComments',
        //   'removeMetadata',
        //   'removeEditorsNSData',
        //   'cleanupAttrs',
        //   'mergeStyles',
        //   'inlineStyles',
        //   'minifyStyles',
        //   'cleanupIds',
        //   'removeUselessDefs',
        //   'cleanupNumericValues',
        //   'convertColors',
        //   'removeUnknownsAndDefaults',
        //   'removeNonInheritableGroupAttrs',
        //   'removeUselessStrokeAndFill',
        //   'cleanupEnableBackground',
        //   'removeHiddenElems',
        //   'removeEmptyText',
        //   'convertShapeToPath',
        //   'convertEllipseToCircle',
        //   'moveElemsAttrsToGroup',
        //   'moveGroupAttrsToElems',
        //   'convertPathData',
        //   'convertTransform',
        //   'removeEmptyAttrs',
        //   'removeEmptyContainers',
        //   'mergePaths',
        //   'removeUnusedNS',
        //   'sortDefsChildren',
        //   'removeTitle',
        //   'removeDesc',
        //   'collapseGroups',
        //   'removeViewBox',
        //   // -- Disabled Plugins --
        //   // 'removeXMLNS',
        //   // 'convertStyleToAttrs',
        //   // 'prefixIds',
        //   // 'cleanupListOfValues',
        //   // 'removeRasterImages',
        //   // 'removeDimensions',
        //   // 'removeAttrs',
        //   // 'removeAttributesBySelector',
        //   // 'removeElementsByAttr',
        //   // 'addClassesToSVGElement',
        //   // 'addAttributesToSVGElement',
        //   // 'removeOffCanvasPaths',
        //   // 'removeStyleElement',
        //   // 'removeScriptElement',
        //   // 'reusePaths',
        // ],
      });

      svgList.push({
        name: name,
        source: filterGroup(filterDefs(result.data)),
      });

      if (svgList.length === filePath.length) {
        oraSpinner.stopAndPersist({ symbol: '✅', text: `${log(`(${svgList.length}/${total})`)} ${bold(`SVGs optimized`)}` });
        callback(svgList);
      }
    });
  });
};

export default optimizeSVG;
