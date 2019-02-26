import * as puppeteer from "puppeteer";
import { detectLanguage, getMessage, logger } from ".";
import { Message } from "../types";

interface sendMessageParams {
	reservationCode: string;
	type: Message;
}

async function sendMessage(
	this: puppeteer.Page,
	{ reservationCode, type }: sendMessageParams,
): Promise<void> {
	try {
		const $sendMessageTextarea = "#send_message_textarea";
		const $messageSubmitButton = 'button[type="submit"]';
		const $messagesList = ".message-text > .interweave";
		const $aptName = "section div div div div div";

		const messaging =
			"https://www.airbnb.com/messaging/qt_for_reservation";
		const fullUrl = `${messaging}/${reservationCode}`;

		await this.goto(fullUrl);
		await this.waitForSelector($sendMessageTextarea);

		const [element] = (await this.$$($messagesList)).slice(-1);

		const firstGuestMessage = await this.evaluate(
			(element) => element.textContent,
			element,
		);

		await this.waitFor(2000);
		const aptNameElement = await this.$($aptName);
		const aptNameText = await this.evaluate(
			(element) => element.textContent,
			aptNameElement,
		);
		const matchesAptName = /#\d{3}/;

		if (matchesAptName.exec(aptNameText)) {
			/**
			 * aptNumber looks something like #4xx #3xx
			 */
			const [aptNumber] = aptNameText.match(matchesAptName);

			const lang = await detectLanguage(firstGuestMessage);

			if (lang) {
				const checkInOutMessages = getMessage(type, {
					aptNumber: aptNumber.replace("#", ""),
				})![lang];

				for await (const msg of checkInOutMessages) {
					await this.type($sendMessageTextarea, msg);
					await this.waitFor(2000);
					await this.click($messageSubmitButton);
				}
			}
		}
	} catch (error) {
		logger.log("error", error, new Error(error));
	}
}

export default sendMessage;
