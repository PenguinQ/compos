export default () => {
  return navigator.vendor.match(/apple/i) &&
        // @ts-ignore
        !navigator.brave &&
        !navigator.userAgent.match(/crios/i) &&
        !navigator.userAgent.match(/fxios/i) &&
        !navigator.userAgent.match(/Opera|OPT\//);
};
