import * as puppeteer from "puppeteer";
import { detectLanguage, getMessage } from ".";
import { Message } from "../types";

interface sendMessageParams {
	reservationCode: string;
	type: Message;
}

async function sendMessage(
	this: puppeteer.Page,
	{ reservationCode, type }: sendMessageParams,
): Promise<void> {
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

	const lang = await detectLanguage(firstGuestMessage);

	await this.waitFor(2000);
	const aptNameElement = await this.$($aptName);
	const aptNameText = await this.evaluate(
		(element) => element.textContent,
		aptNameElement,
	);

	if (/#\d{3}/.exec(aptNameText)) {
		/**
		 * aptNumber looks something like #4xx #3xx
		 */
		const [aptNumber] = aptNameText.match(/#\d{3}/);

		const checkInOutMessages = getMessage(type, {
			aptNumber: aptNumber.replace("#", ""),
		})![lang];

		for await (const msg of checkInOutMessages) {
			await this.type($sendMessageTextarea, msg);
			await this.waitFor(2000);
			await this.click($messageSubmitButton);
		}
	} else {
		throw new Error("cannot find proper aptName text");
	}
}

export default sendMessage;
