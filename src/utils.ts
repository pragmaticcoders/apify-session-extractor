import { Actor } from 'apify';
import { ElementHandle, Page } from 'puppeteer';
import log from '@apify/log';
import { Step } from './types.js';
import { TOTP } from 'totp-generator';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36';

export const takeScreenshot = async (page: Page) => {
  const timestamp = Date.now();
  const screenshotKey = `screenshot_${timestamp}.png`;

  const screenshot = await page.screenshot();
  await Actor.setValue(screenshotKey, screenshot, { contentType: 'image/png' });
};

export const getElement = async (page: Page, step: Step): Promise<ElementHandle> => {
  if (!step.selector) {
    throw new Error(`Selector missing for step: ${JSON.stringify(step.action)}`);
  }

  const { selector, eq, visible = true } = step;

  await page.waitForSelector(selector, { visible });

  const elements = await page.$$(selector);

  if (elements.length === 0) {
    throw new Error(`Element not found: ${selector}`);
  }

  if(elements.length > 1) {
    log.info(`Multiple elements found: ${selector}`);

    if(!eq) {
      throw new Error(`Missing eq parameter for multiple elements`);
    }

    if(eq === 'first') {
      return elements[0];
    }

    if(eq === 'last') {
      return elements[elements.length - 1];
    }

    return elements[eq];
  }

  return elements[0];
};

export const generateTOTPToken = async (secret: string) => {
  const { otp, expires } = TOTP.generate(secret);

  const remainingTimeSeconds = (expires - Date.now()) / 1000;

  if(remainingTimeSeconds < 5) {
    log.warning(`TOTP token expires in less than 5 seconds, waiting for to generate new token`);
    await sleep(remainingTimeSeconds * 1000 + 1000);

    return TOTP.generate(secret).otp
  }

  return otp;
}
