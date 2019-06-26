import { promises as fs } from 'fs';
import moment from 'moment';
import puppeteer from 'puppeteer';

import { initPuppeteer } from '.';
import * as testMail from '../fixtures/gmail/messages.get.json';
import { RESERVATIONS_FILE_PATH, TEST_RESERVATION_CODE } from './constants';
import ReservationAutoResponder from './reservationAutoResponder';

describe('reservationAutoResponder', () => {
  let browser: puppeteer.Browser;

  beforeAll(async () => {
    // browser = await initPuppeteer(false);

    // puppeteer test takes longer time than usual tests.
    // so override default jest timeout not to interrupt test
    jest.setTimeout(150000);
  });

  afterAll(async () => {
    await browser.close();
  });

  it('tests respond', async () => {
    const responder = new ReservationAutoResponder({ browser });

    await responder.respond({
      reservationCode: TEST_RESERVATION_CODE,
      reservationTitle: '테스트 예약',
      roomId: '32050698',
    });
  });

  it('tests parseMail', async () => {
    const responder = new ReservationAutoResponder({ browser });

    const { title, body } = await responder.parseMail(testMail);

    expect(title).not.toBeFalsy();
    expect(body).not.toBeFalsy();
  });

  it('tests getLastExecutedAtTimestamp', () => {
    const responder = new ReservationAutoResponder({ browser });
    const lastExecuted = responder.getLastExecutedAtTimestamp();
    const now = moment().unix();

    expect(lastExecuted).toBeLessThan(now);
  });

  it('tests getInbox', async () => {
    const responder = new ReservationAutoResponder({ browser });
    const mails = await responder.getInbox();
    expect(mails).toEqual([]);
  });

  it('tests getRoomId', async () => {
    const responder = new ReservationAutoResponder({ browser });
    const { body } = await responder.parseMail(testMail);
    const roomId = responder.getRoomId(body);

    expect(roomId).not.toBe('');
  });
});
