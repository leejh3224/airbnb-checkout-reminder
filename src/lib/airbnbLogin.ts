import puppeteer from 'puppeteer';
import { reportError } from '.';
import { AIRBNB_LOGIN_URL } from './constants';

async function airbnbLogin(this: puppeteer.Browser) {
  try {
    const $emailInput = '#signin_email';
    const $passwordInput = '#signin_password';
    const $submitButton = '#user-login-btn';

    const [page] = await this.pages();

    await page.goto(AIRBNB_LOGIN_URL, { waitUntil: 'networkidle0' });

    if (page.url() !== AIRBNB_LOGIN_URL) {
      return true;
    } else {
      const { email, password } = process.env;

      if (email && password) {
        await page.waitForSelector($emailInput);
        await page.waitForSelector($passwordInput);
        await page.type($emailInput, email);
        await page.type($passwordInput, password);
        await Promise.all([
          page.click($submitButton),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
      }

      return page.url().includes('hosting');
    }
  } catch (error) {
    const [page] = await this.pages();
    await reportError(page, error);
  }
}

export default airbnbLogin;
