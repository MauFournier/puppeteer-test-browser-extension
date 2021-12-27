/**
 * Like in Puppeteer, our module is exposed via `export default bootstrapExtension` in `src/puppeteer-test-browser-extension.ts`
 * But TypeScript compiles that to `exports.default = `, which forces clients to use
 * `require('puppeteer-test-browser-extension').default`, which is not the desired interface.
 *
 * We mimic Puppeteer's solution to this by making this file our entry point,
 * re-mapping the `default` export via `module.exports.` instead.
 * This allows CJS clients to require our module without `.default`
 */

const bootstrapExtension = require('./lib/cjs/puppeteer-test-browser-extension');
module.exports = bootstrapExtension.default;
