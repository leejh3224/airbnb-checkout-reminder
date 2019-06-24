import puppeteer from 'puppeteer';
import {
  airbnbLogin,
  getReservationStatus,
  logger,
  reportError,
  retry,
  sendMessage,
} from '.';
import './ArrayExt';
import { CHECK_IN, CHECK_OUT, ROOM_ID_MAP } from './constants';
import { ReservationStatus } from './types';

type ICellParser = (
  element: any,
  cellSelector: string,
  periodSelector: string,
) => string;

const waitOrReload = async (page: puppeteer.Page) => {
  const $table = 'table';

  try {
    await page.waitForSelector($table);
  } catch (error) {
    await page.reload();
  }
};

export const getReservationTable = async (page: puppeteer.Page) => {
  await retry(waitOrReload, page, 5, 1000, true);

  const $table = 'table';
  const $row = `${$table} > tbody > tr`;
  const table = await page.$$($row);

  return table;
};

const parsePeriod: ICellParser = (element, cellSelector, periodSelector) => {
  const [, , , periodCell] = element.querySelectorAll(cellSelector);
  return periodCell.querySelector(periodSelector).textContent;
};

const parseRoomName: ICellParser = (element, cellSelector, periodSelector) => {
  const [, , , , , roomNameCell] = element.querySelectorAll(cellSelector);
  return roomNameCell.querySelector(periodSelector).textContent;
};

const getCellData = async (
  page: puppeteer.Page,
  row: puppeteer.ElementHandle<Element>,
  {
    selector,
    parser,
  }: {
    selector: string;
    parser: ICellParser;
  },
) => {
  const $cell = 'td';

  return page.evaluate(parser, row, $cell, selector);
};

const filterByCheckInStatus = async (
  page: puppeteer.Page,
  row: puppeteer.ElementHandle<Element>,
) => {
  const $period = 'td > div > div';

  const period = await getCellData(page, row, {
    selector: $period,
    parser: parsePeriod,
  });
  const status = getReservationStatus(period);
  const willCheckInOrOut = status === CHECK_IN || status === CHECK_OUT;

  return willCheckInOrOut;
};

export const parseTableRow = async (
  page: puppeteer.Page,
  row: puppeteer.ElementHandle<Element>,
) => {
  const $itineraryButton = 'a[href^="/reservation/itinerary"]';
  const $roomName = 'td > div > div';
  const $period = 'td > div > div';

  const roomName = await getCellData(page, row, {
    selector: $roomName,
    parser: parseRoomName,
  });
  const period = await getCellData(page, row, {
    selector: $period,
    parser: parsePeriod,
  });
  const status = getReservationStatus(period);
  const itineraryButton = await row.$($itineraryButton);
  const itineraryUrl = await page.evaluate(
    element => element.href,
    itineraryButton,
  );
  const [, reservationCode] = new URL(itineraryUrl).search.split('=');

  return {
    roomName,
    period,
    reservationCode,
    status,
  };
};

export const setup = async (browser: puppeteer.Browser) => {
  await airbnbLogin.bind(browser)();
  const reservationsUrl =
    'https://www.airbnb.com/hosting/reservations/upcoming';

  const [page] = await browser.pages();

  /**
   * In order to show itinerary button, viewport width must be at least 1200
   * and itinerary button is used for getting reservation code
   */
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(reservationsUrl);

  return page;
};

const remindCheckIn = async (browser: puppeteer.Browser) => {
  try {
    const page = await setup(browser);
    const table = await getReservationTable(page);

    const result = await table.asyncFilter(row =>
      filterByCheckInStatus(page, row),
    );

    return result.asyncForEach(async row => {
      const { period, reservationCode, status, roomName } = await parseTableRow(
        page,
        row,
      );

      const newTab = await browser.newPage();
      await sendMessage.bind(newTab)({
        reservationCode,
        type: status as ReservationStatus,
        roomId: ROOM_ID_MAP[roomName],
      });

      logger.info(
        `${period} 기간의 예약에 대해 ${status} 메시지를 전송했습니다.`,
      );
    });
  } catch (error) {
    const page = await browser.newPage();
    await reportError(page, error);
  }
};

export default remindCheckIn;
