import puppeteer from "puppeteer";
import { airbnbLogin, needsCheckInOrOut, sendMessage } from ".";

const main = async (browser: puppeteer.Browser, isTest = false) => {
	await airbnbLogin.bind(browser)({
		email: process.env.email as string,
		password: process.env.password as string,
	});

	// selectors
	const $table = "table";
	const $row = `${$table} > tbody > tr`;
	const $cell = "td";
	const $period = "td > div > div";
	const $itineraryButton = 'a[href^="/reservation/itinerary"]';

	// helpers
	const getPeriodText = (
		element: any,
		cellSelector: string,
		periodSelector: string,
	) => {
		// reservation period is the 4th cell
		const [, , , periodCell] = element.querySelectorAll(cellSelector);
		return periodCell.querySelector(periodSelector).textContent;
	};

	const [page] = await browser.pages();

	const reservations =
		"https://www.airbnb.com/hosting/reservations/upcoming";
	await page.goto(reservations);

	await page.waitForSelector($table);
	const tableRows = await page.$$($row);

	for await (const [_, row] of tableRows.entries()) {
		const period = await page.evaluate(
			getPeriodText,
			row,
			$cell,
			$period,
		);

		const checkInOut = needsCheckInOrOut(period);

		/**
		 * Two types of button
		 * 1. itinerary button -> green, means guest's not left yet
		 * 2. review button -> red, means guest already left the room. Therefore, no need to send the message.
		 */
		const itineraryButton = await row.$($itineraryButton);

		if (checkInOut && checkInOut.required && itineraryButton) {
			const itineraryUrl = await page.evaluate(
				(element) => element.href,
				itineraryButton,
			);
			const [, reservationCode] = new URL(itineraryUrl).search.split(
				"=",
			);

			const newTab = await browser.newPage();

			if (checkInOut.type !== undefined) {
				await sendMessage.bind(newTab)({
					reservationCode,
					type: checkInOut.type,
					isTest,
				});
			}

			console.log(
				`done sending message for ${period} ${reservationCode}`,
			);
		}
	}
};

export default main;
