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

async function bootstrapExtension(options = {}) {
	const {
		devtools = false, //Open the browser's devtools
		slowMo = false, //slow down Puppeteer actions
		maxAttemptsToFindExtension = 20, //Maximum attempts to find the extension's service worker - sometimes it takes a bit
		contentUrl, //The URL of the content page that is being browsed
		pathToExtension, //The path to the extension's folder
	} = options;
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: process.env.PUPPETEER_EXEC_PATH, //Needed to run on Github Actions CI - check https://github.com/marketplace/actions/puppeteer-headful-with-commands
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

	extensionId = await findExtensionId(browser, maxAttemptsToFindExtension);

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

const findExtensionId = async (browser, maxAttemptsToFindExtension) => {
	const delay = 50;
	let attempts = 0;
	let targets, extensionTarget;

	//Wait for extension's service worker to appear among targets.
	//Sometimes it takes a bit.
	while (attempts++ < maxAttemptsToFindExtension && !extensionTarget) {
		targets = await browser.targets();
		extensionTarget = targets.find(
			(target) => target.type() === 'service_worker'
		);
		!extensionTarget && (await sleep(delay));
	}

	const partialExtensionUrl = extensionTarget._targetInfo.url || '';
	const [, , extensionId] = partialExtensionUrl.split('/');
	return extensionId;
};

const sleep = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = { bootstrapExtension };
