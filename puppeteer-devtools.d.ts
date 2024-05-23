declare module 'puppeteer-devtools' {
  import { Page, Frame } from 'puppeteer';

  export function getDevtoolsPanel(page: Page, options: { panelName: string; timeout?: number | null }): Promise<Frame>;
  export function setCaptureContentScriptExecutionContexts(page: Page): Promise<void>;
  export function getContentScriptExcecutionContext(page: Page): Promise<any>;
}
