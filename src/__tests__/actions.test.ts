import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Step } from '../types.js';
import { getElement, sleep, takeScreenshot } from '../utils.js';
import { Actor } from 'apify';

jest.mock('puppeteer');
jest.mock('totp-generator');
jest.mock('apify', () => ({
  Actor: {
    init: jest.fn(),
    getInput: jest.fn(),
    pushData: jest.fn(),
    setValue: jest.fn(),
    exit: jest.fn(),
  },
}));

interface MockElementHandle {
  focus: ReturnType<typeof jest.fn>;
  click: ReturnType<typeof jest.fn>;
  type: ReturnType<typeof jest.fn>;
  press: ReturnType<typeof jest.fn>;
}

interface MockPage {
  $: ReturnType<typeof jest.fn>;
  $$: ReturnType<typeof jest.fn>;
  waitForSelector: ReturnType<typeof jest.fn>;
  waitForNavigation: ReturnType<typeof jest.fn>;
  evaluate: ReturnType<typeof jest.fn>;
  screenshot: ReturnType<typeof jest.fn>;
}

describe('Actions', () => {
  let page: MockPage;
  let element: MockElementHandle;

  beforeEach(() => {
    jest.clearAllMocks();

    element = {
      focus: jest.fn(() => Promise.resolve()),
      click: jest.fn(() => Promise.resolve()),
      type: jest.fn(() => Promise.resolve()),
      press: jest.fn(() => Promise.resolve()),
    };

    page = {
      $: jest.fn(() => Promise.resolve(element)),
      $$: jest.fn(() => Promise.resolve([element])),
      waitForSelector: jest.fn(() => Promise.resolve(element)),
      waitForNavigation: jest.fn(() => Promise.resolve()),
      evaluate: jest.fn(),
      screenshot: jest.fn(() => Promise.resolve(Buffer.from(''))),
    };
  });

  describe('getElement', () => {
    it('should throw error if selector is missing', async () => {
      const step: Step = {
        action: 'click',
      };

      await expect(getElement(page as any, step)).rejects.toThrow('Selector missing for step: "click"');
    });

    it('should throw error if no elements found', async () => {
      const step: Step = {
        action: 'click',
        selector: '#button',
      };

      page.$$.mockResolvedValue([]);

      await expect(getElement(page as any, step)).rejects.toThrow('Element not found: #button');
    });

    it('should throw error if multiple elements found without eq parameter', async () => {
      const step: Step = {
        action: 'click',
        selector: '#button',
      };

      const multipleElements = Array(3).fill(element);
      page.$$.mockResolvedValue(multipleElements);

      await expect(getElement(page as any, step)).rejects.toThrow('Missing eq parameter for multiple elements');
    });

    it('should return first element when eq is "first"', async () => {
      const step: Step = {
        action: 'click',
        selector: '#button',
        eq: 'first',
      };

      const multipleElements = Array(3).fill(element);
      page.$$.mockResolvedValue(multipleElements);

      const result = await getElement(page as any, step);
      expect(result).toBe(multipleElements[0]);
    });

    it('should return last element when eq is "last"', async () => {
      const step: Step = {
        action: 'click',
        selector: '#button',
        eq: 'last',
      };

      const multipleElements = Array(3).fill(element);
      page.$$.mockResolvedValue(multipleElements);

      const result = await getElement(page as any, step);
      expect(result).toBe(multipleElements[multipleElements.length - 1]);
    });

    it('should return element at specified index when eq is a number', async () => {
      const step: Step = {
        action: 'click',
        selector: '#button',
        eq: 1,
      };

      const multipleElements = Array(3).fill(element);
      page.$$.mockResolvedValue(multipleElements);

      const result = await getElement(page as any, step);
      expect(result).toBe(multipleElements[1]);
    });
  });

  describe('sleep', () => {
    it('should sleep for the specified duration', async () => {
      const start = Date.now();
      await sleep(1000);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('takeScreenshot', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(123456789);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should take screenshot and save it to key-value store', async () => {
      const screenshotBuffer = Buffer.from('test screenshot');
      page.screenshot.mockResolvedValue(screenshotBuffer);

      await takeScreenshot(page as any);

      expect(page.screenshot).toHaveBeenCalled();
      expect(Actor.setValue).toHaveBeenCalledWith(
        'screenshot_123456789.png',
        screenshotBuffer,
        { contentType: 'image/png' }
      );
    });
  });
});
