//  Copyright 2021 Daniel Caldas
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//  This file has been modified from its original source by Mauricio Fournier - https://github.com/maufrontier/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
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
        const manifestPath = path.resolve(pathToExtension, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!manifest.action || !manifest.action.default_popup) {
            throw new Error('default_popup not found in manifest.json');
        }
        const defaultPopup = manifest.action.default_popup;
        const browser = yield puppeteer.launch(Object.assign({ headless: false, executablePath: process.env.PUPPETEER_EXEC_PATH, // Needed to run on Github Actions CI - check https://github.com/marketplace/actions/puppeteer-headful-with-commands
            devtools, args: [
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
        yield contentPage.goto(contentUrl, { waitUntil: 'load' });
        // Open extension in a tab
        const extensionPage = yield browser.newPage();
        const extensionUrl = `chrome-extension://${extensionId}/${defaultPopup}`;
        yield extensionPage.goto(extensionUrl, { waitUntil: 'load' });
        // Open the DevTools panel for the content page
        const devToolsPage = yield browser.newPage();
        const devToolsUrl = `devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${extensionId}/index.html`;
        yield devToolsPage.goto(devToolsUrl);
        return {
            contentPage,
            browser,
            extensionUrl,
            extensionPage,
            devToolsPage,
        };
    });
};
export default bootstrapExtension;
