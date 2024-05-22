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

import puppeteer from 'puppeteer';

interface IBootstrapOptions {
    devtools?: boolean;
    slowMo?: number;
    contentUrl: string;
    pathToExtension: string;
}

const bootstrapExtension = async function (options: IBootstrapOptions) {
    if (options.contentUrl == undefined) {
        throw new TypeError(
            `contentUrl is a required option for bootstrapExtension().`
        );
    }
    if (options.pathToExtension == undefined) {
        throw new TypeError(
            'pathToExtension is a required option for bootstrapExtension().'
        );
    }

    const {
        devtools = false, //Open the browser's devtools
        slowMo = false, //slow down Puppeteer actions
        contentUrl, //The URL of the content page that is being browsed
        pathToExtension, //The path to the extension's folder
    } = options;

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.PUPPETEER_EXEC_PATH, //Needed to run on Github Actions CI - check https://github.com/marketplace/actions/puppeteer-headful-with-commands
        devtools,
        args: [
            `--load-extension=${pathToExtension}`,
            `--disable-extensions-except=${pathToExtension}`,
            ' --no-sandbox',
        ],
        ...(slowMo && { slowMo }),
    });

    // Find Extension's ID inside the "service-worker" target
    const extTarget = await browser.waitForTarget(
        (target) => target.type() === 'service_worker'
    );
    const partialExtensionUrl = extTarget.url() || '';
    const [, , extensionId] = partialExtensionUrl.split('/');

    // Open content page
    const contentPage = await browser.newPage();
    await contentPage.goto(contentUrl, { waitUntil: 'load' });

    // Open extension in a tab
    const extensionPage = await browser.newPage();
    const extensionUrl = `chrome-extension://${extensionId}/index.html`;
    await extensionPage.goto(extensionUrl, { waitUntil: 'load' });

    // Open the DevTools panel for the content page
    const devToolsPage = await browser.newPage();
    const devToolsUrl = `devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${extensionId}/index.html`;
    await devToolsPage.goto(devToolsUrl);

    return {
        contentPage,
        browser,
        extensionUrl,
        extensionPage,
        devToolsPage,
    };
};

export default bootstrapExtension;
