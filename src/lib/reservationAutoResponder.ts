import { promises as fs } from 'fs';
import { gmail_v1, google } from 'googleapis';
import moment from 'moment';
import puppeteer from 'puppeteer';
import { oc } from 'ts-optchain';

import {
  airbnbLogin,
  buildMailBody,
  getAuthenticatedClient,
  logger,
  sendMessage,
} from '.';
import {
  ANSWER_TO_RESERVATION_PERIOD,
  RESERVATION_CONFIRMED,
  RESERVATIONS_FILE_PATH,
  ROOM_ID_MAP,
  TEST_RESERVATION_CODE,
} from './constants';
import reportError from './reportError';
import { Reservation } from './types';

class ReservationAutoResponder {
  private gmail?: gmail_v1.Gmail;
  private browser: puppeteer.Browser;

  constructor({ browser }: { browser: puppeteer.Browser }) {
    this.browser = browser;
  }

  public async main() {
    try {
      const mails = await this.getInbox();

      if (!mails.length) {
        return;
      }

      const newReservations: Reservation[] = [];

      for await (const mail of mails) {
        const data = await this.getSingleMail({ id: mail.id });
        const { title, body } = this.parseMail(data);

        const reservationCode = this.getReservationCode(body);
        const roomId = this.getRoomId(body);
        const roomName = this.getRoomName(body);
        const { startDate, endDate } = this.getPeriod(body);

        newReservations.push({ startDate, endDate, roomName, reservationCode });

        await this.respond({
          reservationCode,
          reservationTitle: title,
          roomId,
        });

        await this.deleteMail({ id: mail.id });
      }

      const oldReservations = await fs.readFile(RESERVATIONS_FILE_PATH, {
        encoding: 'utf-8',
      });
      await this.updateReservationsFile(
        JSON.parse(oldReservations as string),
        newReservations,
      );
    } catch (error) {
      const [page] = await this.browser.pages();
      await reportError(page, error);
    }
  }

  public async deleteMail({ id }: { id?: string }) {
    const gmail = await this.getGmailClient();
    await gmail.users.messages.trash({
      id,
      userId: 'me',
    });
  }

  public async respond({
    reservationCode,
    reservationTitle,
    roomId,
  }: {
    reservationCode: string;
    reservationTitle: string;
    roomId: string;
  }) {
    await airbnbLogin.bind(this.browser)();

    const newPage = await this.browser.newPage();
    const done = await sendMessage.bind(newPage)({
      reservationCode,
      roomId,
      type: RESERVATION_CONFIRMED,
    });

    if (done && reservationCode !== TEST_RESERVATION_CODE) {
      logger.info(
        `예약 번호 ${reservationCode}에 대해 ${RESERVATION_CONFIRMED} 메시지를 전송했습니다.`,
      );

      const gmail = await this.getGmailClient();
      await gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: buildMailBody({
            title: `[전송 완료] ${reservationTitle}`,
          }),
        },
      } as gmail_v1.Params$Resource$Users$Messages$Send);
    }
  }

  public getReservationCode(mailBody: string) {
    // Airbnb reservation code is consisted of capital letters and numbers
    const matchReservationCode = /[A-Z0-9]{10}/;
    const matched = mailBody.match(matchReservationCode);
    const errorMessage = '메일에서 예약 코드를 찾을 수 없습니다.';

    if (!matched) {
      throw new Error(errorMessage);
    }

    const [reservationCode] = matched;

    if (!reservationCode) {
      throw new Error(errorMessage);
    }

    return reservationCode;
  }

  public getRoomId(mailBody: string) {
    const matchRoomUrl = /(https:\/\/www.airbnb.co.kr\/rooms\/)([0-9]{8})/;
    const matched = mailBody.match(matchRoomUrl);
    const errorMessage = '메일에서 roomId를 찾을 수 없습니다.';

    if (!matched) {
      throw new Error(errorMessage);
    }

    const [, , roomId] = matched;

    if (!roomId) {
      throw new Error(errorMessage);
    }

    return roomId;
  }

  public parseMail(mail: gmail_v1.Schema$Message) {
    const headers = oc(mail).payload.headers([]);
    const title = oc(headers.find(v => v.name === 'Subject')).value('');
    let body = oc(mail).payload.parts[0].body.data('');
    body = Buffer.from(body, 'base64').toString('utf-8');

    return {
      title,
      body,
    };
  }

  public async getGmailClient() {
    const [page] = await this.browser.pages();
    const oauth2Client = await getAuthenticatedClient(page);

    if (!this.gmail) {
      this.gmail = await google.gmail({
        version: 'v1',
        auth: oauth2Client as any,
      });
    }

    return this.gmail;
  }

  public async getSingleMail({ id }: { id?: string }) {
    const gmail = await this.getGmailClient();

    const { data } = await gmail.users.messages.get({
      id,
      userId: 'me',
      format: 'full',
    });

    return data;
  }

  public getLastExecutedAtTimestamp = () => {
    const lastExecutedAt = moment().subtract(
      ANSWER_TO_RESERVATION_PERIOD,
      'minutes',
    );
    return lastExecutedAt.unix();
  };

  public async getInbox() {
    const gmail = await this.getGmailClient();

    const {
      data: { messages = [] },
    } = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
      maxResults: 20,

      /*
       * google mail search
       * reference: https://support.google.com/mail/answer/7190
       */
      q: `after:${this.getLastExecutedAtTimestamp()} subject:{'예약 확정' 'Reservation confirmed'}`,
    } as any);

    return messages;
  }

  public async updateReservationsFile(
    oldReservations: Reservation[],
    newReservations: Reservation[],
  ) {
    return fs.writeFile(
      RESERVATIONS_FILE_PATH,
      JSON.stringify([...oldReservations, ...newReservations]),
      'utf-8',
    );
  }

  public getPeriod(mailBody: string) {
    const matchPeriod = /\d{4}년\s\d{1,2}월\s\d{1,2}일/g;
    const matched = mailBody.match(matchPeriod);
    const errorMessage = '메일에서 기간을 찾을 수 없습니다.';

    if (!matched) {
      throw new Error(errorMessage);
    }

    const [startDate, endDate] = matched;

    if (!startDate || !endDate) {
      throw new Error(errorMessage);
    }

    return {
      startDate: moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      endDate: moment(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    };
  }

  public getRoomName(findRoomId: string) {
    const room = Object.entries(ROOM_ID_MAP).find(
      ([_, roomId]) => roomId === findRoomId,
    );

    if (room) {
      return room[0];
    }

    throw new Error('roomName을 찾을 수 없습니다.');
  }
}

export default ReservationAutoResponder;
