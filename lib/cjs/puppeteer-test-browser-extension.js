"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const puppeteer_devtools_1 = require("puppeteer-devtools");
const bootstrapExtension = function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.contentUrl) {
            throw new TypeError('contentUrl is a required option for bootstrapExtension().');
        }
        if (!options.pathToExtension) {
            throw new TypeError('pathToExtension is a required option for bootstrapExtension().');
        }
        const { devtools = false, slowMo = false, contentUrl, pathToExtension } = options;
        // Read and parse the manifest file
        const manifestPath = path_1.default.resolve(pathToExtension, 'manifest.json');
        const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf8'));
        if (!manifest.action || !manifest.action.default_popup) {
            throw new Error('default_popup not found in manifest.json');
        }
        const defaultPopup = manifest.action.default_popup;
        const devtoolsPage = manifest.devtools_page || 'devtools.html'; // Default to devtools.html if not specified
        const browser = yield puppeteer_1.default.launch(Object.assign({ headless: false, executablePath: process.env.PUPPETEER_EXEC_PATH, devtools, args: [
                `--load-extension=${pathToExtension}`,
                `--disable-extensions-except=${pathToExtension}`,
                '--no-sandbox',
            ] }, (slowMo && { slowMo })));
        // Find Extension's ID inside the "service-worker" target
        const extTarget = yield browser.waitForTarget((target) => target.type() === 'service_worker');
        const partialExtensionUrl = extTarget.url() || '';
        const [, , extensionId] = partialExtensionUrl.split('/');
        // Open content page
        const contentPage = yield browser.newPage();
        yield (0, puppeteer_devtools_1.setCaptureContentScriptExecutionContexts)(contentPage);
        yield contentPage.goto(contentUrl, { waitUntil: 'load' });
        // Open extension in a tab
        const extensionPage = yield browser.newPage();
        const extensionUrl = `chrome-extension://${extensionId}/${defaultPopup}`;
        yield extensionPage.goto(extensionUrl, { waitUntil: 'load' });
        // Close the first (blank) tab
        const pages = yield browser.pages();
        if (pages.length > 2) {
            yield pages[0].close();
        }
        // Ensure the DevTools tab is opened and active
        const targets = yield browser.targets();
        const devToolsTarget = targets.find(target => target.url().includes(devtoolsPage));
        if (devToolsTarget) {
            const devToolsPage = yield devToolsTarget.page();
            yield (devToolsPage === null || devToolsPage === void 0 ? void 0 : devToolsPage.bringToFront());
        }
        // Add a delay to ensure the DevTools panel loads completely
        yield new Promise(resolve => setTimeout(resolve, 2000));
        // Open the DevTools panel
        const devToolsFrame = yield (0, puppeteer_devtools_1.getDevtoolsPanel)(contentPage, { panelName: devtoolsPage, timeout: 7000 });
        return {
            contentPage,
            browser,
            extensionUrl,
            extensionPage,
            devToolsFrame,
        };
    });
};
exports.default = bootstrapExtension;
