import puppeteer from "puppeteer";
import {
	airbnbLogin,
	getReservationStatus,
	logger,
	reportError,
	sendMessage,
} from ".";
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

export const parseTableRow = async (
	page: puppeteer.Page,
	row: puppeteer.ElementHandle<Element>,
) => {
	// selectors
	const $cell = "td";
	const $period = "td > div > div";
	const $itineraryButton = 'a[href^="/reservation/itinerary"]';

	const parsePeriod = (
		element: any,
		cellSelector: string,
		periodSelector: string,
	) => {
		// reservation period is the 4th cell
		const [, , , periodCell] = element.querySelectorAll(cellSelector);
		return periodCell.querySelector(periodSelector).textContent;
	};

	const period = await page.evaluate(parsePeriod, row, $cell, $period);
	const status = getReservationStatus(period);

	/**
	 * Two types of button
	 * 1. itinerary button -> green, means guest's not left yet
	 * 2. review button -> red, means guest already left the room. Therefore, no need to send the message.
	 */
	const itineraryButton = await row.$($itineraryButton);
	const willCheckInOrOut = status === CHECK_IN || status === CHECK_OUT;

	if (itineraryButton && willCheckInOrOut) {
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
	}

	return {
		period: "",
		reservationCode: "",
		status: "",
	};
};

export const setup = async (browser: puppeteer.Browser) => {
	await airbnbLogin.bind(browser)();
	const reservationsUrl =
		"https://www.airbnb.com/hosting/reservations/upcoming";

	const [page] = await browser.pages();
	await page.goto(reservationsUrl);

	return page;
};

const remindCheckIn = async (browser: puppeteer.Browser) => {
	try {
		const page = await setup(browser);
		const table = await getReservationTable(page);

		for await (const [_, row] of table.entries()) {
			const newTab = await browser.newPage();

			const { period, reservationCode, status } = await parseTableRow(
				newTab,
				row,
			);

			await sendMessage.bind(newTab)({
				reservationCode,
				type: status as ReservationStatus,
			});

			logger.info(`done sending message for ${period} ${reservationCode}`);
		}
	} catch (error) {
		const page = await browser.newPage();
		await reportError(page, error);
	}
};

export default remindCheckIn;
