const withGlobals = (values: string[]) => {
  const global = ['-moz-initial', 'inherit', 'initial', 'revert', 'revert-layer', 'unset'];

  return [...new Set([...values, ...global])]
};

export const CSS = {
  textAlign: ['center', 'end', 'justify', 'left', 'match-parent', 'right', 'start'],
  textDecorationSkip: withGlobals(['all', 'auto', 'none']),
  textDecorationSkipInk: withGlobals(['all', 'auto', 'none']),
  textDecorationStyle: withGlobals(['dashed', 'dotted', 'double', 'solid', 'wavy']),
  textJustify: withGlobals(['auto', 'inter-character', 'inter-word', 'none']),
  textOrientation: withGlobals(['mixed', 'sideways', 'upright']),
  textRendering: withGlobals(['auto', 'geometricPrecision', 'optimizeLegibility', 'optimizeSpeed']),
  textTransform: withGlobals(['capitalize', 'full-size-kana', 'full-width', 'lowercase', 'none', 'uppercase']),
};
