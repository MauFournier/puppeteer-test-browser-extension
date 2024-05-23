import puppeteer from 'puppeteer';
interface IBootstrapOptions {
    devtools?: boolean;
    slowMo?: number;
    contentUrl: string;
    pathToExtension: string;
}
declare const bootstrapExtension: (options: IBootstrapOptions) => Promise<{
    contentPage: puppeteer.Page;
    browser: puppeteer.Browser;
    extensionUrl: string;
    extensionPage: puppeteer.Page;
    devToolsPanel: puppeteer.Frame;
}>;
export default bootstrapExtension;
