import * as fs from 'fs';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import * as http from 'http';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { oc } from 'ts-optchain';
import * as url from 'url';
import { promisify } from 'util';
import { GMAIL_SCOPES, OAUTH_SERVER_PORT } from './constants';

const OAUTH_SUCCESSFUL_MESSAGE =
  'Authentication successful! Please return to the console.';

export const getOAuthKeys = () => {
  const keyPath = path.resolve(process.env.OAUTH2_KEY as string);
  let keys;

  if (fs.existsSync(keyPath)) {
    keys = require(keyPath).web;
  }
  return keys;
};

export const createOAuthServer = async (
  onAuthComplete: (code: string) => void,
): Promise<http.Server> => {
  const server = http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (
        oc(req)
          .url('')
          .includes('/oauth2callback')
      ) {
        const { searchParams } = new url.URL(
          oc(req).url(''),
          `http://localhost:${OAUTH_SERVER_PORT}`,
        );
        const code = searchParams.get('code') || '';
        res.end(OAUTH_SUCCESSFUL_MESSAGE);
        onAuthComplete(code);
      }
    },
  );

  return server;
};

const checkAlreadyAuthenticated = async (page: puppeteer.Page) => {
  const bodyText = await page.evaluate(() => {
    const body = document.querySelector('body');

    // ts-optchain doesn't works so use ternary to check null
    return body ? (body.textContent ? body.textContent : '') : '';
  });

  return bodyText === OAUTH_SUCCESSFUL_MESSAGE;
};

export const handleGoogleLogin = async ({
  page,
  authorizeUrl,
}: {
  page: puppeteer.Page;
  authorizeUrl: string;
}): Promise<boolean> => {
  await page.goto(authorizeUrl, {
    waitUntil: 'networkidle2',
  });

  if (await checkAlreadyAuthenticated(page)) {
    return true;
  }

  const { email, password } = process.env;

  // selectors
  const $email = '#identifierId';
  const $emailNext = '#identifierNext';
  const $password = '#password input[type="password"]';
  const $passwordNext = '#passwordNext';

  await page.mainFrame().waitForSelector($email);
  await page.type($email, email as string);
  await page.mainFrame().waitForSelector($emailNext);
  await page.click($emailNext);
  await page.mainFrame().waitForSelector($password, {
    visible: true,
  });
  await page.type($password, password as string, {
    delay: 100,
  });
  await page.click($passwordNext, { delay: 100 });

  return true;
};

const getAuthenticatedClient = (
  page: puppeteer.Page,
): Promise<OAuth2Client> => {
  return new Promise(async resolve => {
    const keys = getOAuthKeys();

    const oAuth2Client = new google.auth.OAuth2(
      keys.client_id,
      keys.client_secret,
      keys.redirect_uris[0],
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES.join(' '),
    });

    const onAuthComplete = async (code: string) => {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
    };

    const oauthServer = await createOAuthServer(onAuthComplete);
    const listen = promisify(oauthServer.listen.bind(oauthServer));
    await listen(OAUTH_SERVER_PORT);
    await handleGoogleLogin({ page, authorizeUrl });
    oauthServer.close();

    resolve(oAuth2Client);
  });
};

export default getAuthenticatedClient;
