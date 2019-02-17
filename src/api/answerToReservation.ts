import { google } from "googleapis";
import cron from "node-cron";

import { getOAuthClient, initPuppeteer, sendMessage } from "lib";
import {
	CHECK_IN_REMINDER_START_HOUR,
	CHECK_IN_REMINDER_START_MINUTES,
} from "lib/constants";

const answerToReservation = (schedule: string) => {
	cron.schedule(schedule, async () => {
		try {
			const date = new Date();
			const hour = date.getHours();
			const minutes = date.getMinutes();

			// not to interrupt `checkInReminder`
			if (
				hour === CHECK_IN_REMINDER_START_HOUR &&
				minutes >= CHECK_IN_REMINDER_START_MINUTES - 10
			) {
				const browser = await initPuppeteer();
				const oauth2Client = await getOAuthClient(browser);

				const gmail = await google.gmail({
					version: "v1",
					auth: oauth2Client as any,
				});

				const {
					data: { messages },
				} = await gmail.users.messages.list({
					userId: "me",
					labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
					maxResults: 10,
				} as any);

				if (!messages) {
					console.log("no message found!");
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

					const body = Buffer.from(
						payload!.parts![0]!.body!.data as string,
						"base64",
					).toString("utf-8");

					const title = payload!.headers!.find(
						(v) => v.name === "Subject",
					)!.value;

					if (title!.includes("예약 확정")) {
						const page = await browser.newPage();

						const matchReservationCode = /[A-Z0-9]{10}/;
						const matched = body.match(matchReservationCode);

						if (matched) {
							const [reservationCode] = matched;

							await sendMessage.bind(page)({
								reservationCode,
								type: "reservation-confirmed",
							});
						} else {
							throw new Error("본문에서 예약 코드를 찾지 못했습니다.");
						}
					}

					await gmail.users.messages.trash({
						id: msg.id,
						userId: "me",
					});
				}

				await browser.close();
			}
		} catch (error) {
			console.log(error);
		}
	});
};

export default answerToReservation;
