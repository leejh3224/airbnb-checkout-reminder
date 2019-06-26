import puppeteer from 'puppeteer';
import { initPuppeteer } from '.';
import remindCheckIn from './remindCheckIn';

describe('remindCheckIn', () => {
  let browser: puppeteer.Browser;

  beforeAll(async () => {
    browser = await initPuppeteer(false);

    // puppeteer test takes longer time than usual tests.
    // so override default jest timeout not to interrupt test
    jest.setTimeout(150000);
  });

  afterAll(async () => {
    await browser.close();
  });
});
