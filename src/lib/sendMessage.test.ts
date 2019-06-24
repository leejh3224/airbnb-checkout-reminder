import puppeteer from 'puppeteer';

import { initPuppeteer, sendMessage } from '.';
import {
  CHECK_IN,
  CHECK_OUT,
  RESERVATION_CONFIRMED,
  TEST_RESERVATION_CODE,
} from './constants';

describe('send message', () => {
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

  test.each([[CHECK_IN], [CHECK_OUT], [RESERVATION_CONFIRMED]])(
    'case %s',
    async (type: any) => {
      const page = await browser.newPage();

      const done = await sendMessage.bind(page)({
        reservationCode: TEST_RESERVATION_CODE,
        type,
        roomId: '32050698',
      });

      expect(done).toBe(true);

      await page.close();
    },
  );
});
