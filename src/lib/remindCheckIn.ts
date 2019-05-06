import puppeteer from "puppeteer";
import {
	airbnbLogin,
	getReservationStatus,
	logger,
	reportError,
	sendMessage,
} from ".";
import "./ArrayExt";
import { CHECK_IN, CHECK_OUT } from "./constants";
import { ReservationStatus } from "./types";

export const getReservationTable = async (page: puppeteer.Page) => {
	// selectors
	const $table = "table";
	const $row = `${$table} > tbody > tr`;

	const table = await page.waitForSelector($table);

	// retry
	if (table === null) {
		await page.reload();
		await page.waitForSelector($table);
	}

	return page.$$($row);
};

const parsePeriod = (
	element: any,
	cellSelector: string,
	periodSelector: string,
) => {
	// reservation period is the 4th cell
	const [, , , periodCell] = element.querySelectorAll(cellSelector);
	return periodCell.querySelector(periodSelector).textContent;
};

const getPeriod = async (
	page: puppeteer.Page,
	row: puppeteer.ElementHandle<Element>,
) => {
	// selectors
	const $cell = "td";
	const $period = "td > div > div";

	return page.evaluate(parsePeriod, row, $cell, $period);
};

const filterByCheckInStatus = async (
	page: puppeteer.Page,
	row: puppeteer.ElementHandle<Element>,
) => {
	const period = await getPeriod(page, row);
	const status = getReservationStatus(period);
	const willCheckInOrOut = status === CHECK_IN || status === CHECK_OUT;

	return willCheckInOrOut;
};

export const parseTableRow = async (
	page: puppeteer.Page,
	row: puppeteer.ElementHandle<Element>,
) => {
	const $itineraryButton = 'a[href^="/reservation/itinerary"]';

	const period = await getPeriod(page, row);
	const status = getReservationStatus(period);
	const itineraryButton = await row.$($itineraryButton);
	const itineraryUrl = await page.evaluate(
		(element) => element.href,
		itineraryButton,
	);
	const [, reservationCode] = new URL(itineraryUrl).search.split("=");

	return {
		period,
		reservationCode,
		status,
	};
};

export const setup = async (browser: puppeteer.Browser) => {
	await airbnbLogin.bind(browser)();
	const reservationsUrl =
		"https://www.airbnb.com/hosting/reservations/upcoming";

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

		const result = await table.asyncFilter((row) =>
			filterByCheckInStatus(page, row),
		);

		return result.asyncForEach(async (row) => {
			const { period, reservationCode, status } = await parseTableRow(
				page,
				row,
			);

			const newTab = await browser.newPage();
			await sendMessage.bind(newTab)({
				reservationCode,
				type: status as ReservationStatus,
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
