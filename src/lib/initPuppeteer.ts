import puppeteer from 'puppeteer';

const initPuppeteer = async (headless: boolean = true) => {
  return puppeteer.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
      '--window-size=1920,1080',
    ],

    // reuse user profile session
    userDataDir: './userData',
  });
};

export default initPuppeteer;
