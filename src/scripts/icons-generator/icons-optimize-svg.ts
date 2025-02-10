import path from 'node:path';
import fs from 'fs-extra';
import * as glob from 'glob';
import { optimize } from 'svgo';
import { DOMParser, XMLSerializer } from 'xmldom';
import chalk from 'chalk';
import ora from 'ora';

// Types
import type { XastElement } from 'svgo/lib/types';
import type { ContentType } from './types';

const getName = (filePath: string) => path.basename(filePath, path.extname(filePath));

const updateShapes = (svgString: string) => {
  const parser    = new DOMParser();
  const svgDoc    = parser.parseFromString(svgString, 'image/svg+xml');
  const svgShapes = svgDoc.getElementsByTagName('*');
  const shapeMap = [
    'circle',
    'ellipse',
    'image',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
    'text',
  ];

  let validFormat  = true;
  let shapeFills   = <string[]>[];
  let shapeStrokes = <string[]>[];

  for (const shape of Array.from(svgShapes)) {
    if (shapeMap.includes(shape.tagName.toLocaleLowerCase())) {
      let inDefs = false;
      let parent = shape.parentNode as Element;

      /**
       * Lookup to check if shape are inside a <defs /> which is should not be included.
       */
      while (parent && parent.nodeType === 1) {
        if (parent.tagName.toLowerCase() === 'defs') {
          inDefs = true;
          break;
        }

        parent = parent?.parentNode as Element;
      }

      /**
       * If the shape are not inside a <defs />, get the value of fill and stroke. If the shape has fill and stroke, do comparison between them and
       * if the stroke value and fill value are different, break the operation immediately and set the validFormat value as false.
       *
       * Notes:
       * 1. fill="none" are assumed as valid fill value, this means if a shape has a stroke and fill like:
       *
       *      <path d="..." stroke="black" fill="none" />
       *
       *    Will be resulted in validFormat = false, because "black" !== "none". This is because "none" value in a fill are valid value,
       *    see the explanation below:
       *
       *      <path d="..." stroke="black" />
       *
       *    In the example path above, it will resulted in a shape with a black stroke with black color as it's fill, it's happened because
       *    if fill is not defined, the fill value will be set to black by default.
       *
       *    Based on these conditions, I've decided to set any shape with stroke and fill="none" will be resulted in invalid format (validFormat = false)
       */
      if (!inDefs) {
        const shapeFill   = shape.getAttribute('fill');
        const shapeStroke = shape.getAttribute('stroke');

        if (
          (shapeFill && shapeStroke) && (shapeFill !== shapeStroke) ||
          shapeFill?.startsWith('url') ||
          shapeStroke?.startsWith('url')
        ) {
          validFormat = false;
          break;
        }

        if (shapeFill)   shapeFills.push(shapeFill);
        if (shapeStroke) shapeStrokes.push(shapeStroke);
      }
    }
  }

  if (validFormat) {
    let isFillsSame   = false;
    let isStrokesSame = false;
    let isBothSame    = false;

    if (shapeFills.length && shapeStrokes.length) {
      isFillsSame   = shapeFills.every(color => shapeFills[0] === color);
      isStrokesSame = shapeStrokes.every(color => shapeStrokes[0] === color);
    } else if (shapeFills.length && !shapeStrokes.length) {
      isFillsSame = shapeFills.every(color => shapeFills[0] === color);
    } else if (!shapeFills.length && shapeStrokes.length) {
      isStrokesSame = shapeStrokes.every(color => shapeStrokes[0] === color);
    }

    if (isFillsSame && isStrokesSame) {
      isBothSame = shapeFills[0] === shapeStrokes[0] ? true : false;
    }

    if (
      isBothSame ||
      !isBothSame && (isFillsSame && !isStrokesSame) ||
      !isBothSame && (!isFillsSame && isStrokesSame)
    ) {
      for (const shape of Array.from(svgShapes)) {
        if (shapeMap.includes(shape.tagName.toLocaleLowerCase())) {
          let inDefs = false;
          let parent = shape.parentNode as Element;

          while (parent && parent.nodeType === 1) {
            if (parent.tagName.toLowerCase() === 'defs') {
              inDefs = true;
              break;
            }

            parent = parent?.parentNode as Element;
          }

          if (!inDefs) {
            const shapeFill   = shape.getAttribute('fill');
            const shapeStroke = shape.getAttribute('stroke');

            if (shapeFill)   shape.setAttribute('fill', 'currentColor');
            if (shapeStroke) shape.setAttribute('stroke', 'currentColor');
          }
        }
      }
    }
  }

  return new XMLSerializer().serializeToString(svgDoc);
};

const optimizeSVG = (pattern: string, callback: (glyphs: ContentType[]) => void) => {
  const svgList  = <ContentType[]>[];
  const filePath = glob.sync(pattern);
  const log      = chalk.hex('#70EAFA');
  const bold     = chalk.bold;
  const spinner  = ora(`${bold('Optimizing SVGs...')}`);

  spinner.start();

  filePath.forEach((path, _, paths) => {
    const name  = getName(path);
    const total = paths.length;

    fs.readFile(path, 'utf-8', (error, data) => {
      if (error) throw error;

      const result = optimize(data, {
        path,
        multipass: true,
        plugins  : [
          'cleanupAttrs',
          'cleanupIds',
          'removeComments',
          'removeUselessDefs',
          'removeDesc',
          'removeEmptyAttrs',
          'removeEmptyText',
          'removeHiddenElems',
          'removeTitle',
          'removeXMLProcInst',
          {
            name: 'sortXMLNS',
            fn  : () => {
              return {
                root: {
                  enter: (node) => {
                    node.children.map(child => {
                      const { _xmlns, ...rest } = (child as XastElement).attributes;

                      (child as XastElement).attributes = { xmlns: 'http://www.w3.org/2000/svg', ...rest };
                    });
                  },
                },
              };
            },
          },
          // 'cleanupEnableBackground',
          // 'cleanupListOfValues',
          // 'cleanupNumericValues',
          // 'collapseGroups',
          // 'convertColors',
          // 'convertEllipseToCircle',
          // 'convertOneStopGradients',
          // 'convertPathData',
          // 'convertShapeToPath',
          // 'convertStyleToAttrs',
          // 'convertTransform',
          // 'inlineStyles',
          // 'mergePaths',
          // 'mergeStyles',
          // 'minifyStyles',
          // 'moveElemsAttrsToGroup',
          // 'moveGroupAttrsToElems',
          // 'prefixIds',
          // 'preset-default',
          // 'removeDimensions',
          // 'removeDoctype',
          // 'removeEditorsNSData',
          // 'removeEmptyContainers',
          // 'removeMetadata',
          // 'removeNonInheritableGroupAttrs',
          // 'removeOffCanvasPaths',
          // 'removeRasterImages',
          // 'removeScriptElement',
          // 'removeStyleElement',
          // 'removeUnknownsAndDefaults',
          // 'removeUnusedNS',
          // 'removeUselessStrokeAndFill',
          // 'removeViewBox',
          // 'removeXlink',
          // 'removeXMLNS',
          // 'reusePaths',
          // 'sortAttrs',
          // 'sortDefsChildren',
        ],
      });

      svgList.push({ name: name, source: updateShapes(result.data) });

      if (svgList.length === filePath.length) {
        spinner.stopAndPersist({ symbol: '✅', text: `${log(`(${svgList.length}/${total})`)} ${bold(`SVGs optimized`)}` });
        callback(svgList);
      }
    });
  });
};

export default optimizeSVG;
