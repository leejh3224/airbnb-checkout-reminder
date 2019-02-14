import cron from "node-cron";

import {
	airbnbLogin,
	getMessage,
	initPuppeteer,
	needsCheckInOrOut,
} from "lib";

const checkInReminder = () =>
	cron.schedule(
		"40 7 * * *", // 07:40 everyday
		async () => {
			try {
				const browser = await initPuppeteer();

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

				// helpers
				const getPeriodText = (
					element: any,
					cellSelector: string,
					periodSelector: string,
				) => {
					// reservation period is the 3rd cell
					const [, , periodCell] = element.querySelectorAll(
						cellSelector,
					);
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

							// TODO: before sending a message check if message is already sent
							await newTab.type(
								$sendMessageTextarea,
								getMessage(checkInOut.type as any),
							);
							await newTab.click($messageSubmitButton)
							await newTab.close();

							console.log(
								`done sending message for ${period} ${reservationCode}`,
							);
						}
					}
				}

				await browser.close();
			} catch (error) {
				console.log(error);
			}
		},
		{
			timezone: "Asia/Seoul",
		},
	);

export default checkInReminder;
