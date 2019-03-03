import { gmail_v1, google } from "googleapis";
import puppeteer from "puppeteer";

import { buildMailBody, getOAuthClient, logger, sendMessage } from ".";
import {
	ANSWER_TO_RESERVATION_PERIOD,
	CHECK_IN_REMINDER_START_HOUR,
	CHECK_IN_REMINDER_START_MINUTES,
	RESERVATION_CONFIRMED,
} from "./constants";
import "./DateExt";
import reportError from "./reportError";

const answerToReservationMain = async (
	browser: puppeteer.Browser,
) => {
	try {
		const date = new Date();
		const hour = date.getHours();
		const minutes = date.getMinutes();

		// not to interrupt `checkInReminder`
		if (
			hour === CHECK_IN_REMINDER_START_HOUR &&
			minutes >=
				CHECK_IN_REMINDER_START_MINUTES - ANSWER_TO_RESERVATION_PERIOD
		) {
			return;
		}

		const [page] = await browser.pages();
		const oauth2Client = await getOAuthClient(page);

		const gmail = await google.gmail({
			version: "v1",
			auth: oauth2Client as any,
		});

		const {
			data: { messages },
		} = await gmail.users.messages.list({
			userId: "me",
			labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
			maxResults: 20,
		} as any);

		if (!messages) {
			return;
		}

		for await (const msg of messages as any) {
			const {
				data: { payload },
			} = await gmail.users.messages.get({
				id: msg.id,
				userId: "me",
				format: "full",
			});

			if (payload) {
				const receivedDate =
					payload.headers &&
					payload.headers.find((header) => header.name === "Date");

				if (receivedDate && receivedDate.value) {
					const UTC_OFFSET = 9;

					const receivedDateLocal = new Date(receivedDate.value).add({
						hour: UTC_OFFSET,
					});
					const lastRunDateLocal = new Date(Date.now()).add({
						hour: UTC_OFFSET,
						minutes: -ANSWER_TO_RESERVATION_PERIOD,
					});

					if (lastRunDateLocal < receivedDateLocal) {
						const messageBody =
							payload.parts &&
							payload.parts[0] &&
							payload.parts[0].body &&
							payload.parts[0].body.data;

						if (typeof messageBody === "string") {
							const title =
								payload.headers &&
								payload.headers.find((v) => v.name === "Subject")!.value;
							const body = Buffer.from(
								messageBody,
								"base64",
							).toString("utf-8");

							const keywords = ["예약 확정", "Reservation confirmed"];

							if (
								typeof title === "string" &&
								keywords.some((word) => title.includes(word))
							) {
								const page = await browser.newPage();

								const matchReservationCode = /[A-Z0-9]{10}/;
								const matched = body.match(matchReservationCode);

								const [reservationCode] = matched!;

								logger.info(`sending message for ${title}!`);

								const done = await sendMessage.bind(page)({
									reservationCode,
									type: RESERVATION_CONFIRMED,
								});

								if (done) {
									await gmail.users.messages.send({
										userId: "me",
										resource: {
											raw: buildMailBody({
												title: `[전송 완료] ${title}`,
											}),
										},
									} as gmail_v1.Params$Resource$Users$Messages$Send);
								}
							}
						}
					}
				}
			}

			await gmail.users.messages.trash({
				id: msg.id,
				userId: "me",
			});
		}
	} catch (error) {
		const [page] = await browser.pages();
		await reportError(page, error);
	}
};

export default answerToReservationMain;
