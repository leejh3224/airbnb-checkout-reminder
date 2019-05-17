import * as puppeteer from "puppeteer";
import { detectLanguage, getMessage, reportError } from ".";
import { LANGUAGE_KOREAN } from "./constants";
import { ReservationStatus } from "./types";
interface SendMessageParams {
	reservationCode: string;
	roomId: string;
	type: ReservationStatus;
}

const getLanguage = async (page: puppeteer.Page) => {
	const $messagesList = ".message-text > .interweave";

	const messagesList = await page.$$($messagesList);

	// if guest doesn't send message, just assume he/she speaks korean
	if (!messagesList.length) {
		return LANGUAGE_KOREAN;
	}

	const [element] = messagesList.slice(-1);
	const firstGuestMessage = await page.evaluate((el) => el.textContent, element);

	return detectLanguage(firstGuestMessage);
};

async function sendMessage(
	this: puppeteer.Page,
	{ reservationCode, type, roomId }: SendMessageParams,
): Promise<boolean | void> {
	try {
		const $sendMessageTextarea = "#send_message_textarea";
		const $messageSubmitButton = 'button[type="submit"]';

		const messaging = "https://www.airbnb.com/messaging/qt_for_reservation";
		const fullUrl = `${messaging}/${reservationCode}`;

		// page needs to load some contents dynamically thus add waitUntil option
		await this.goto(fullUrl, { waitUntil: "networkidle0" });

		const lang = await getLanguage(this);
		const checkInOutMessages = getMessage(type, {
			roomId,
		})![lang!];

		for await (const msg of checkInOutMessages) {
			await this.type($sendMessageTextarea, msg);
			await this.click($messageSubmitButton);
		}

		return true;
	} catch (error) {
		await reportError(this, error);
	}
}

export default sendMessage;
