import puppeteer from "puppeteer";
import {
	airbnbLogin,
	detectLanguage,
	getMessage,
	needsCheckInOrOut,
} from ".";

const sendMessage = async (browser: puppeteer.Browser) => {
	await airbnbLogin.bind(browser)({
		email: process.env.email as string,
		password: process.env.password as string,
	});

	// selectors
	const $table = "table._iqk9th";
	const $row = "table._iqk9th > tbody > tr";
	const $cell = "._xc2l5fg";
	const $period = "._9zwlhy1 > ._9zwlhy1";
	const $sendMessageTextarea = "#send_message_textarea";
	const $itineraryButton = 'a[href^="/reservation/itinerary"]';
	const $messageSubmitButton = "button._1u3zpdpw";
	const $messagesList = ".message-text > .interweave";

	// helpers
	const getPeriodText = (
		element: any,
		cellSelector: string,
		periodSelector: string,
	) => {
		// reservation period is the 3rd cell
		const [, , periodCell] = element.querySelectorAll(cellSelector);
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

		if (checkInOut && checkInOut.required) {
			const messaging =
				"https://www.airbnb.com/messaging/qt_for_reservation";

			/**
			 * Two types of button
			 * 1. itinerary button -> green, means guest's not left yet
			 * 2. review button -> red, means guest already left the room. Therefore, no need to send the message.
			 */
			const itineraryButton = await row.$($itineraryButton);

			if (itineraryButton) {
				const itineraryUrl = await page.evaluate(
					(element) => element.href,
					itineraryButton,
				);
				const [, reservationCode] = new URL(
					itineraryUrl,
				).search.split("=");

				const newTab = await browser.newPage();
				await newTab.goto(`${messaging}/${reservationCode}`);
				await newTab.waitForSelector($sendMessageTextarea);

				if (
					checkInOut.type === "check-in" ||
					checkInOut.type === "check-out"
				) {
					const [element] = (await newTab.$$($messagesList)).slice(-1);
					const firstGuestMessage = await newTab.evaluate(
						(element) => element.textContent,
						element,
					);
					const lang = await detectLanguage(firstGuestMessage);
					const checkInOutMessages = getMessage(checkInOut.type)[lang];

					await Promise.all(
						checkInOutMessages.map((msg) => {
							newTab.type($sendMessageTextarea, msg);
							newTab.click($messageSubmitButton);
						}),
					);

					await newTab.close();
				}

				console.log(
					`done sending message for ${period} ${reservationCode}`,
				);
			}
		}
	}
};

export default sendMessage;
