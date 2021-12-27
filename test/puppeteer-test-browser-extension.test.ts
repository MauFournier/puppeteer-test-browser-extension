import bootstrapExtension from '../src/puppeteer-test-browser-extension';
import { Browser, Page, ElementHandle } from 'puppeteer';

describe('Test browser extension', () => {
	let browser: Browser;
	let contentPage: Page;
	let extensionPage: Page;

	beforeAll(async () => {
		const extensionEnvironment = await bootstrapExtension({
			pathToExtension: './test/test-extension', //The path to the uncompressed extension's folder. It shouldn't be a ZIP file.
			contentUrl: `file:///${process.cwd()}/test/content-page.html`, // The URL of the content page that is being browsed
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

		if (btn) {
			const btnText = await btn.evaluate(
				(node) => (<HTMLElement>node).innerText
			);
			expect(btnText).toEqual('Submit');
			// You can use Puppeteer's features as usual
			//Example: Click the button
			await btn.click();
		}

		// Use extensionPage to nteract with the extension's popup (which has been opened in a separate browser tab).
		// First, activate the popup page
		await extensionPage.bringToFront();

		// (Assuming your content page contains <h1>Extension popup</h1>)
		// The user should see the heading on the popup
		const heading = await extensionPage.$('h1');
		if (heading) {
			const extensionHeadingText = await heading.evaluate(
				(node) => (<HTMLElement>node).innerText
			);
			expect(extensionHeadingText).toEqual('Extension popup');
		}
	});

	afterAll(async () => {
		await browser.close();
	});
});
