# Puppeteer Test Browser Extension

Perform end-to-end tests of a browser extension using Puppeteer.

Use this to test your browser extension. At this time, only local tests are supported.

Currently, only Google Chrome is supported.

## Installation:

```shell
npm install puppeteer-test-browser-extension
```

## Usage — Local testing:

##### Import the module.

```javascript
const bootstrapExtension = require('puppeteer-test-browser-extension');
```

That's using CommonJS modules. You can also import using ES Modules:

```javascript
import bootstrapExtension from 'puppeteer-test-browser-extension';
```

##### Bootstrap the extension.

```javascript
let browser, contentPage, extensionPage;

const extensionEnvironment = await bootstrapExtension({
	pathToExtension: './test/test-extension', //The path to the uncompressed extension's folder. It shouldn't be a ZIP file.
	contentUrl: `http://127.0.0.1:8080/test/content-page.html`, // The URL of the content page that is being browsed
	//slowMo: 100, //(uncomment this line to slow down Puppeteer's actions)
	//devtools: true, //(uncomment this line to open the browser's devtools)
});

browser = extensionEnvironment.browser;
contentPage = extensionEnvironment.contentPage;
extensionPage = extensionEnvironment.extensionPage;
```

##### Interact with the content page (the page that is being browsed).

```javascript
// First, activate the content page
contentPage.bringToFront();

// (Assuming your content page contains <button>Submit</button>)
// The user should see the button on the web page
const btn = await contentPage.$('button');
const btnText = await btn.evaluate((e) => e.innerText);
expect(btnText).toEqual('Submit');

// You can use Puppeteer's features as usual
//Example: Click the button
await btn.click();
```

##### Interact with the extension's popup (which has been opened in a separate browser tab).

```javascript
// First, activate the popup page
await extensionPage.bringToFront();

// (Assuming your content page contains <h1>Extension popup</h1>)
// The user should see the heading on the popup
const heading = await extensionPage.$('h1');
const extensionHeadingText = await heading.evaluate((e) => e.innerText);
expect(extensionHeadingText).toEqual('Extension popup');
```

##### Close Puppeteer's browser.

```javascript
await browser.close();
```

### Full example — Local testing:

This example uses [jest](https://www.npmjs.com/package/jest) to run tests.

```javascript
const bootstrapExtension = require('puppeteer-test-browser-extension');

describe('Test browser extension', () => {
	let browser, contentPage, extensionPage;

	beforeAll(async () => {
		const extensionEnvironment = await bootstrapExtension({
			pathToExtension: './test/test-extension', //The path to the uncompressed extension's folder. It shouldn't be a ZIP file.
			contentUrl: `http://127.0.0.1:8080/test/content-page.html`, // The URL of the content page that is being browsed
			//slowMo: 100, //(uncomment this line to slow down Puppeteer's actions)
			//devtools: true, //(uncomment this line to open the browser's devtools)
		});

		browser = extensionEnvironment.browser;
		contentPage = extensionEnvironment.contentPage;
		extensionPage = extensionEnvironment.extensionPage;
	});

	it("Should open the extension's popup", async () => {
		// Use contentPage to interact with the content page (the page that is being browsed)
		// First, activate the content page
		contentPage.bringToFront();

		// (Assuming your content page contains <button>Submit</button>)
		// The user should see the button on the web page
		const btn = await contentPage.$('button');
		const btnText = await btn.evaluate((e) => e.innerText);
		expect(btnText).toEqual('Submit');

		// You can use Puppeteer's features as usual
		//Example: Click the button
		await btn.click();

		// Use extensionPage to interact with the extension's popup
		// First, activate the popup
		await extensionPage.bringToFront();

		// (Assuming your content page contains <h1>Extension popup</h1>)
		// The user should see the heading on the popup
		const heading = await extensionPage.$('h1');
		const extensionHeadingText = await heading.evaluate((e) => e.innerText);
		expect(extensionHeadingText).toEqual('Extension popup');
	});

	afterAll(async () => {
		await browser.close();
	});
});
```

## Debugging Tips

Check out [Google's tips for debugging with Puppeteer](https://developers.google.com/web/tools/puppeteer/debugging).

## Website:

- **Github**: [puppeteer-test-browser-extension](https://github.com/maufrontier/puppeteer-test-browser-extension) by [MauFrontier](https://github.com/maufrontier)
- **NPM**: [puppeteer-test-browser-extension](https://www.npmjs.com/package/puppeteer-test-browser-extension) by [MauFrontier](https://www.npmjs.com/~maufrontier)
- **Inspiration**: [puppeteer-test-browser-ext](https://github.com/tweak-extension/puppeteer-test-browser-ext) by [Daniel Caldas](https://github.com/danielcaldas)

## LICENSE:

Licensed under the Apache License, Version 2.0 (the "License"). Check LICENSE.md for more details.

## CREDIT:

[Daniel Caldas](https://github.com/danielcaldas) deserves all the credit here. This is just slightly modified and re-packaged version of the work that he graciously released under the Apache license.

I just wanted to have this available as a public NPM package, and to add a few more features to it.
