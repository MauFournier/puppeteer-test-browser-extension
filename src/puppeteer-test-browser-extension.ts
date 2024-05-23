import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import {
  getDevtoolsPanel,
  setCaptureContentScriptExecutionContexts,
  getContentScriptExcecutionContext,
} from 'puppeteer-devtools';

interface IBootstrapOptions {
  devtools?: boolean;
  slowMo?: number;
  contentUrl: string;
  pathToExtension: string;
}

const bootstrapExtension = async function (options: IBootstrapOptions) {
  if (!options.contentUrl) {
    throw new TypeError('contentUrl is a required option for bootstrapExtension().');
  }
  if (!options.pathToExtension) {
    throw new TypeError('pathToExtension is a required option for bootstrapExtension().');
  }

  const { devtools = false, slowMo = false, contentUrl, pathToExtension } = options;

  // Read and parse the manifest file
  const manifestPath = path.resolve(pathToExtension, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!manifest.action || !manifest.action.default_popup) {
    throw new Error('default_popup not found in manifest.json');
  }

  const defaultPopup = manifest.action.default_popup;
  const devtoolsPage = manifest.devtools_page || 'devtools.html'; // Default to devtools.html if not specified

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.PUPPETEER_EXEC_PATH, // Needed to run on Github Actions CI - check https://github.com/marketplace/actions/puppeteer-headful-with-commands
    devtools,
    args: [
      `--load-extension=${pathToExtension}`,
      `--disable-extensions-except=${pathToExtension}`,
      '--no-sandbox',
    ],
    ...(slowMo && { slowMo }),
  });

  // Find Extension's ID inside the "service-worker" target
  const extTarget = await browser.waitForTarget((target) => target.type() === 'service_worker');
  const partialExtensionUrl = extTarget.url() || '';
  const [, , extensionId] = partialExtensionUrl.split('/');

  // Open content page
  const contentPage = await browser.newPage();
  await setCaptureContentScriptExecutionContexts(contentPage);
  await contentPage.goto(contentUrl, { waitUntil: 'load' });

  // Open extension in a tab
  const extensionPage = await browser.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/${defaultPopup}`;
  await extensionPage.goto(extensionUrl, { waitUntil: 'load' });

  // Open the DevTools panel
  const devToolsPanel = await getDevtoolsPanel(contentPage, { panelName: devtoolsPage });

  return {
    contentPage,
    browser,
    extensionUrl,
    extensionPage,
    devToolsPanel,
  };
};

export default bootstrapExtension;
