import { gmail_v1, google } from 'googleapis';
import puppeteer from 'puppeteer';

import { buildMailBody, getAuthenticatedClient, initPuppeteer } from '.';

describe('send gmail message', () => {
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

  it('can send mail subject and body containing non ascii characters', async () => {
    const [page] = await browser.pages();
    const oauth2Client = await getAuthenticatedClient(page);

    const gmail = await google.gmail({
      version: 'v1',
      auth: oauth2Client as any,
    });

    await gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: buildMailBody({
          title: '한글=갓글',
          body: '<br>갓글로 보내주세요.</br>',
        }),
      },
    } as gmail_v1.Params$Resource$Users$Messages$Send);
  });
});
