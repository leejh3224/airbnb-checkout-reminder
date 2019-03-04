import * as puppeteer from "puppeteer";
import { detectLanguage, getMessage, reportError } from ".";
import { Message } from "../types";

interface sendMessageParams {
	reservationCode: string;
	type: Message;
}

const getLanguage = async (page: puppeteer.Page) => {
	const $messagesList = ".message-text > .interweave";

	const [element] = (await page.$$($messagesList)).slice(-1);
	const firstGuestMessage = await page.evaluate(
		(element) => element.textContent,
		element,
	);
	return detectLanguage(firstGuestMessage);
};

const getAptNumber = async (page: puppeteer.Page) => {
	const $aptName = "section div div div div div";

	const waitUntilAptNameLoads = page.waitForFunction(
		(selector) => {
			const aptNameElement = document.querySelector(selector);
			return aptNameElement && aptNameElement.textContent !== "";
		},
		{},
		$aptName,
	);

	await waitUntilAptNameLoads;
	const aptNameElement = await page.$($aptName);
	const aptNameText = await page.evaluate(
		(element) => element.textContent,
		aptNameElement,
	);

	// aptNumber looks something like #4xx #3xx
	const matchesAptName = /#(\d{3})/;
	const [, aptNumber] = aptNameText.match(matchesAptName);

	return aptNumber;
};

async function sendMessage(
	this: puppeteer.Page,
	{ reservationCode, type }: sendMessageParams,
): Promise<boolean | void> {
	try {
		const $sendMessageTextarea = "#send_message_textarea";
		const $messageSubmitButton = 'button[type="submit"]';

		const messaging =
			"https://www.airbnb.com/messaging/qt_for_reservation";
		const fullUrl = `${messaging}/${reservationCode}`;

		// page needs to load some contents dynamically thus add waitUntil option
		await this.goto(fullUrl, { waitUntil: "networkidle0" });

		const lang = await getLanguage(this);
		const aptNumber = await getAptNumber(this);

		const checkInOutMessages = getMessage(type, {
			aptNumber,
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
