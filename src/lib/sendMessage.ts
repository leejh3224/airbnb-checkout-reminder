import * as puppeteer from "puppeteer";
import { detectLanguage, getMessage } from ".";
import { checkInOut } from "../types";

interface sendMessageParams {
	reservationCode: string;
	type: checkInOut;
	isTest: boolean;
}

async function sendMessage(
	this: puppeteer.Page,
	{ reservationCode, type, isTest = false }: sendMessageParams,
): Promise<void> {
	const $sendMessageTextarea = "#send_message_textarea";
	const $messageSubmitButton = 'button[type="submit"]';
	const $messagesList = ".message-text > .interweave";

	const messaging =
		"https://www.airbnb.com/messaging/qt_for_reservation";
	await this.goto(`${messaging}/${reservationCode}`);
	await this.waitForSelector($sendMessageTextarea);

	const [element] = (await this.$$($messagesList)).slice(-1);
	const firstGuestMessage = await this.evaluate(
		(element) => element.textContent,
		element,
	);
	const lang = await detectLanguage(firstGuestMessage);

	const checkInOutMessages = getMessage(type)![lang];

	for await (const msg of checkInOutMessages) {
		await this.type($sendMessageTextarea, msg);
		!isTest && (await this.click($messageSubmitButton));
	}
}

export default sendMessage;
