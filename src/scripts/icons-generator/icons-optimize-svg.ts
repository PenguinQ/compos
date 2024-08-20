// @ts-nocheck
import fs from 'fs-extra';
import path from 'node:path';
import * as glob from 'glob';
import { optimize } from 'svgo';
import chalk from 'chalk';
import ora from 'ora';
import type { ContentType } from './types.ts';

const getName = (filePath: string) => path.basename(filePath, path.extname(filePath));

const optimizeSVG = (pattern: string, callback: (glyphs: ContentType[]) => void) => {
  const svgList: ContentType[] = [];
  const filePath = glob.sync(pattern);
  const log = chalk.hex('#70EAFA');
  const bold = chalk.bold;
  const oraSpinner = ora(`${bold('Optimizing SVGs...')}`);

  const addXMLNS = (content: string): string => {
    const xmlns = 'xmlns="http://www.w3.org/2000/svg"';
    const svg = '<svg';
    const svgIndex = content.indexOf(svg);
    const contentStart = content.substring(0, svgIndex + svg.length).trim();
    const contentEnd = content.substring(svgIndex + svg.length).trim();

    return [contentStart, xmlns, contentEnd].join(' ');
  };

  const updatePaths = (svgString: string): string => {
    const pathRegex = /<path\s[^>]*?(?:\/?>|>.*?<\/path>)/gs;
    const paths = svgString.match(pathRegex) || [];

    /**
     * --------------------------------------
     * 1. If there's only one path in the svg
     * --------------------------------------
     */
    if (paths.length === 1) {
      const path = paths[0];
      let newPath: string;

      // 1.1. If path have fill attribute, change it's value with currentColor
      if (path.includes('fill="')) {
        newPath = path.replace(/fill="[^"]*"/, 'fill="currentColor"');
      }
      // 1.2. If path has doesn't have fill attribute, set fill attribute and set the value to currentColor
      else {
        newPath = path.replace(/^<path/, '<path fill="currentColor"');
      }

      return svgString.replace(path, newPath);
    }
    /**
     * --------------------------------------
     * 2. If there's multiple path in the svg
     * --------------------------------------
     */
    else if (paths.length > 1) {
      const fillValues = new Set();
      let pathsWithFill = 0;

      paths.forEach(path => {
        const fillMatch = path.match(/fill="([^"]*)"/);
        if (fillMatch) {
          fillValues.add(fillMatch[1]);
          pathsWithFill++;
        }
      });

      // 2.1. If all of the paths doesn't have fill attribute, do nothing
      if (pathsWithFill === 0) return svgString;

      // 2.2. If all of the paths have fill attribute and has the same value, set the value to currentColor
      if (fillValues.size === 1 && pathsWithFill === paths.length) {
        return paths.reduce((acc, path) => {
          const newPath = path.replace(/fill="[^"]*"/, 'fill="currentColor"');
          return acc.replace(path, newPath);
        }, svgString);
      }

      // 2.3. If some of the paths has different fills value or some of the path doesn't have fill attribute, do nothing
      return svgString;
    }

    return svgString;
  };

  oraSpinner.start();

  filePath.forEach((path, _, paths) => {
    const name = getName(path);
    const total = paths.length;

    fs.readFile(path, 'utf-8', (error, data) => {
      if (error) throw error;

      const result = optimize(data, {
        path,
        multipass: true,
        plugins: [
          'removeXMLNS',
          'removeComments',
          'removeXMLProcInst',
          // 'cleanupAttrs',
          // 'removeDoctype',
          // 'removeXMLProcInst',
          // 'removeMetadata',
          // 'removeEditorsNSData',
          // 'mergeStyles',
          // 'inlineStyles',
          // 'minifyStyles',
          // 'cleanupIds',
          // 'cleanupNumericValues',
          // 'convertColors',
          // 'mergePaths',
          // 'removeUselessDefs',
          // 'removeHiddenElems',
          // 'removeUselessStrokeAndFill',
          // 'removeUnknownsAndDefaults',
          // 'removeNonInheritableGroupAttrs',
          // 'cleanupEnableBackground',
          // 'removeEmptyText',
          // 'convertShapeToPath',
          // 'convertEllipseToCircle',
          // 'moveElemsAttrsToGroup',
          // 'moveGroupAttrsToElems',
          // 'convertPathData',
          // 'convertTransform',
          // 'removeEmptyAttrs',
          // 'removeEmptyContainers',
          // 'removeUnusedNS',
          // 'sortDefsChildren',
          // 'removeTitle',
          // 'removeDesc',
          // 'collapseGroups',
          // 'removeViewBox',
          // -- Disabled Plugins --
          // 'removeXMLNS',
          // 'convertStyleToAttrs',
          // 'prefixIds',
          // 'cleanupListOfValues',
          // 'removeRasterImages',
          // 'removeDimensions',
          // 'removeAttrs',
          // 'removeAttributesBySelector',
          // 'removeElementsByAttr',
          // 'addClassesToSVGElement',
          // 'removeOffCanvasPaths',
          // 'removeStyleElement',
          // 'removeScriptElement',
          // 'reusePaths',
        ],
      });

      svgList.push({ name: name, source: updatePaths(addXMLNS(result.data)) });

      if (svgList.length === filePath.length) {
        oraSpinner.stopAndPersist({ symbol: '✅', text: `${log(`(${svgList.length}/${total})`)} ${bold(`SVGs optimized`)}` });
        callback(svgList);
      }
    });
  });
};

export default optimizeSVG;
