import { OAuth2Client } from 'googleapis-common';
import { Server } from 'http';
import puppeteer from 'puppeteer';
import { initPuppeteer } from '.';
import { createOAuthServer, getOAuthKeys } from './getAuthenticatedClient';
import getAuthenticatedClient from './getAuthenticatedClient';

describe('getAuthenticatedClient', () => {
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

  it('retrieves oauth2 keys from project root', () => {
    const keys = getOAuthKeys();

    expect(keys).toHaveProperty('client_id');
    expect(keys).toHaveProperty('client_secret');
    expect(keys).toHaveProperty('redirect_uris');
  });

  it('creates oauth2 server', async () => {
    // tslint:disable-next-line: no-empty
    const fakeOnAuthCompleteCallback = () => {};
    const server = await createOAuthServer(fakeOnAuthCompleteCallback);
    expect(server).toBeInstanceOf(Server);
  });

  it('returns authenticated client', async () => {
    const page = await browser.newPage();
    const oauth2Client = await getAuthenticatedClient(page);

    expect(oauth2Client).toBeInstanceOf(OAuth2Client);
  });
});
