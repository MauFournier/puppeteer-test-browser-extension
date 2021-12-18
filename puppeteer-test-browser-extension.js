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

const puppeteer = require('puppeteer');

async function bootstrap(options = {}) {
	const {
		devtools = false, //Open the browser's devtools
		slowMo = false, //slow down Puppeteer actions
		contentUrl, //The URL of the content page that is being browsed
		pathToExtension, //The path to the extension's folder
	} = options;
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: process.env.PUPPETEER_EXEC_PATH,
		devtools,
		args: [
			`--disable-extensions-except=${pathToExtension}`,
			`--load-extension=${pathToExtension}`,
			'--no-sandbox',
		],
		...(slowMo && { slowMo }),
	});

	//Open content page
	const contentPage = await browser.newPage();
	await contentPage.goto(contentUrl, { waitUntil: 'load' });

	//Find extension ID
	const targets = await browser.targets();
	const extensionTarget = targets.find(target => target.type() === 'service_worker');
	const partialExtensionUrl = extensionTarget._targetInfo.url || '';
	const [, , extensionId] = partialExtensionUrl.split('/');

	//Open extension in a tab
	const extensionPage = await browser.newPage();
	const extensionUrl = `chrome-extension://${extensionId}/index.html`;
	await extensionPage.goto(extensionUrl, { waitUntil: 'load' });

	return {
		contentPage,
		browser,
		extensionUrl,
		extensionPage,
	};
}

module.exports = { bootstrap };