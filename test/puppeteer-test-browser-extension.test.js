const { bootstrapExtension } = require('puppeteer-test-browser-extension');

describe('Test browser extension', () => {
	let browser, contentPage, extensionPage;

	beforeAll(async () => {
		const extensionEnvironment = await bootstrapExtension({
			pathToExtension: './test/test-extension',
			contentUrl: `file:///${process.cwd()}/test/content-page.html`, // The URL of the content page that is being browsed
			//slowMo: 100, //(uncomment this line to slow down Puppeteer's actions)
			//devtools: true, //(uncomment this line to open the browser's devtools)
			//maxAttemptsToFindExtension: 20, //(Maximum attempts to find the extension's service worker, as sometimes it takes a while to load - uncomment and increase number if your tests fail with "TypeError: Cannot read property '_targetInfo' of undefined")
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
