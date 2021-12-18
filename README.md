# Puppeteer Test Browser Extension

Perform end-to-end tests of a browser extension using Puppeteer.

Use this to test your browser extension locally while in development, or as part of your CI/CD pipeline (details below).

Currently, only Google Chrome is supported.

## Installation:

    npm install puppeteer-test-browser-extension

## Usage:

### Local development:
    
    const { bootstrap } = require('puppeteer-test-browser-extension');

    describe('Test browser extension', () => {
        let browser, contentPage, extensionPage;
        
        beforeAll(async () => {
            const extensionEnvironment = await bootstrap({
                appUrl: 'http://127.0.0.1:8080/test-page-001/' // The URL of the content page that is being browsed
                // , slowMo: 100 (uncomment to slow down Puppeteer actions)
                //, devtools: true (uncomment to open the browser's devtools)
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
            const btn = await appPage.$('button');
            const btnText = await btn.evaluate(e => e.innerText);
            expect(btnText).toEqual('Submit');

            // You can use Puppeteer's features as usual
            //Example: Click the button
            await btn.click();

            // Use extensionPage to interact with the extension's popup
            // First, activate the popup
            await extensionPage.bringToFront();

            // (Assuming your content page contains <h1>Extension popup</h1>)
            // The user should see the heading on the popup
            const extensionPageDocument = await extensionPage.getDocument();
            const extensionHeading = await extensionPageDocument.getByText('Extension popup');
            const extensionHeadingText = await extensionHeading.evaluate(node => node.innerText);

            expect(extensionHeadingText).toEqual('Extension popup');
        });
        
        afterAll(async () => {
            await browser.close();
        });
    });

### As part of a CI/CD pipeline:

You can use this to run end-to-end teests of your browser extension as part of your CI/CD pipeline.

You'll need to be able to open a headful (non-headless) version of Chrome.

Check out my [Puppeteer Headful with Commands](https://github.com/marketplace/actions/puppeteer-headful-with-commands)] Github action for instructions and an example.

## LICENSE:

Licensed under the Apache License, Version 2.0 (the "License"). Check LICENSE.md for more details.

## CREDIT:

[Daniel Caldas](https://github.com/danielcaldas) deserves all the credit here. This is just slightly modified and re-packaged version of the work that he graciously released under the Apache license.

I just wanted to have this available as a public NPM package.

## Website:

- [Github: maufrontier/puppeteer-test-browser-extension](https://github.com/maufrontier/puppeteer-test-browser-extension) by [MauFrontier](https://github.com/maufrontier)
- [Source: puppeteer-test-browser-ext](https://github.com/tweak-extension/puppeteer-test-browser-ext) by [Daniel Caldas](https://github.com/danielcaldas)