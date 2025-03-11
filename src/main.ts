import { Actor } from 'apify';
import puppeteer from 'puppeteer';
import log from '@apify/log';
import totp from 'totp-generator';
import { DEFAULT_USER_AGENT, getElement, sleep, takeScreenshot } from './utils.js';
import { InputSchema } from './types.js';

await Actor.init();

const input = await Actor.getInput<InputSchema>();
if (!input) throw new Error('No input provided');

const {
  signInPageURL,
  steps,
  cookieDomains,
  gotoTimeout,
  userAgent = DEFAULT_USER_AGENT,
  headless = false,
  storageName = 'SESSION_DATA',
  totpSecret,
} = input;

log.info(`Launching Puppeteer...`);

const browser = await puppeteer.launch({
  headless,
  defaultViewport: {
    width: 1200,
    height: 900,
  },
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const context = browser.defaultBrowserContext();
const page = await browser.newPage();

await page.setUserAgent(userAgent);

try {
  log.info(`Navigating to ${signInPageURL}...`);
  await page.goto(signInPageURL, {
    timeout: (gotoTimeout || 30) * 1000,
    waitUntil: 'networkidle2',
  });

  log.info(`Executing steps`);

  for (const step of steps) {
    const { action, selector, value, pressEnter, waitForNavigation } = step;

    if (action === 'sleep') {
      const sleepTime = value as number;
      log.info(`Sleeping for ${sleepTime}ms`);
      await sleep(sleepTime);

      continue;
    }

    if (action === 'click') {
      await takeScreenshot(page);

      const element = await getElement(page, step);

      log.info(`Clicking on ${selector}`);

      await element.focus();
      await element.click();

      await sleep(1000);

      continue;
    }

    if (action === 'type') {
      if (!value) throw new Error(`Typing requires a value`);

      await takeScreenshot(page);

      const element = await getElement(page, step);

      log.info(`Typing into ${selector}`);

      await element.type(value.toString(), { delay: 50 });

      if (pressEnter) {
        log.info(`Pressing Enter`);
        await element.press('Enter');
      }

      if (waitForNavigation) {
        log.info(`Waiting for navigation`);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      await sleep(1000);

      continue;
    }

    if (action === 'totp') {
      if (!totpSecret) throw new Error('TOTP action requires totpSecret to be set in input');
      if (!selector) throw new Error('TOTP action requires a selector');

      await takeScreenshot(page);

      const element = await getElement(page, step);
      const token = totp(totpSecret);

      log.info(`Typing TOTP code into ${selector}`);

      await element.type(token, { delay: 50 });

      if (pressEnter) {
        log.info(`Pressing Enter`);
        await element.press('Enter');
      }

      if (waitForNavigation) {
        log.info(`Waiting for navigation`);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      await sleep(1000);

      continue;
    }

    throw new Error(`Unknown action: ${action}`);
  }

  log.info(`All steps executed successfully`);
  await takeScreenshot(page);

  log.info(`Retrieving session data`);

  const browserCookies = await browser.cookies();
  const allCookies = await context.cookies();
  const filteredCookies: Record<string, any> = {};
  for (const domain of cookieDomains) {
    filteredCookies[domain] = allCookies.filter(cookie => cookie.domain.includes(domain));
  }

  const localStorageData = await page.evaluate(() => Object.entries(localStorage));
  const sessionStorageData = await page.evaluate(() => Object.entries(sessionStorage));

  const sessionData = {
    cookies: filteredCookies,
    allCookies,
    browserCookies,
    localStorage: Object.fromEntries(localStorageData),
    sessionStorage: Object.fromEntries(sessionStorageData),
  };

  log.info(`Session data retrieved successfully`);

  await Actor.pushData(sessionData);
  await Actor.setValue(storageName, sessionData);

  log.info(`Session data saved!`);
} catch (error) {
  await takeScreenshot(page);

  if (error instanceof Error) {
    log.error(`Error: ${error.message}`);
  } else {
    log.error(`An unknown error occurred: ${JSON.stringify(error)}`);
  }
} finally {
  await browser.close();
  log.info(`Browser closed`);
}

await Actor.exit();
