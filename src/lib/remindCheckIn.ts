import { promises as fs } from 'fs';
import moment from 'moment';
import puppeteer from 'puppeteer';
import { airbnbLogin, logger, reportError, sendMessage } from '.';
import reservations from '../../reservations.json';
import './ArrayExt';
import {
  CHECK_IN,
  CHECK_OUT,
  GUEST_STAYING,
  OUT_OF_RANGE,
  RESERVATIONS_FILE_PATH,
  ROOM_ID_MAP,
} from './constants';
import { Reservation, ReservationStatus } from './types';

const filterOldReservations = (reservationsArray: Reservation[]) => {
  return reservationsArray.filter(reservation => {
    const now = moment(new Date());
    const isOld = moment(reservation.endDate).isBefore(now, 'day');
    return !isOld;
  });
};

const getReservationStatus = (startDate: Date, endDate: Date) => {
  const now = moment(new Date());
  const start = moment(startDate);
  const end = moment(endDate);
  let status: ReservationStatus;

  const willCheckIn = start.isSame(now, 'day');
  const willCheckOut = end.isSame(now, 'day');
  const willStay = now.isBetween(start, end, 'day', '()');

  if (willCheckIn) {
    status = CHECK_IN;
  } else if (willCheckOut) {
    status = CHECK_OUT;
  } else if (willStay) {
    status = GUEST_STAYING;
  } else {
    status = OUT_OF_RANGE;
  }

  return status;
};

const remindCheckIn = async (browser: puppeteer.Browser) => {
  try {
    await airbnbLogin.bind(browser)();

    const remindCheckInPromises = reservations.map(
      async ({ reservationCode, startDate, endDate, roomName }) => {
        const status = getReservationStatus(
          new Date(startDate),
          new Date(endDate),
        );

        const newTab = await browser.newPage();
        await sendMessage.bind(newTab)({
          reservationCode,
          type: status as ReservationStatus,
          roomId: ROOM_ID_MAP[roomName],
        });

        logger.info(
          `${startDate} ~ ${endDate} 기간의 예약에 대해 ${status} 메시지를 전송했습니다.`,
        );
      },
    );

    await Promise.all(remindCheckInPromises);

    await fs.writeFile(
      RESERVATIONS_FILE_PATH,
      JSON.stringify(filterOldReservations(reservations)),
      'utf-8',
    );
  } catch (error) {
    const page = await browser.newPage();
    await reportError(page, error);
  }
};

export default remindCheckIn;
