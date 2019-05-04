import { gmail_v1, google } from "googleapis";
import puppeteer from "puppeteer";
import { oc } from "ts-optchain";

import {
	airbnbLogin,
	buildMailBody,
	getAuthenticatedClient,
	logger,
	sendMessage,
} from ".";
import {
	ANSWER_TO_RESERVATION_PERIOD,
	RESERVATION_CONFIRMED,
} from "./constants";
import "./DateExt";
import reportError from "./reportError";

class ReservationAutoResponder {
	private gmail?: gmail_v1.Gmail;
	private browser: puppeteer.Browser;

	constructor({ browser }: { browser: puppeteer.Browser }) {
		this.browser = browser;
	}

	public async main() {
		try {
			const mails = await this.getInbox();

			if (!mails.length) {
				return;
			}

			for await (const mail of mails!) {
				const data = await this.getSingleMail({ id: mail.id });
				const { title, body, dateReceived } = this.parseMail(data);

				if (this.checkMailIsNew(dateReceived)) {
					return;
				}

				const shouldAnswer = ["예약 확정", "Reservation confirmed"].some((word) =>
					title.includes(word),
				);

				const reservationCode = this.getReservationCode(body);
				await this.respond({
					reservationCode,
					reservationTitle: title,
					shouldAnswer,
				});

				await this.deleteMail({ id: mail.id });
			}
		} catch (error) {
			const [page] = await this.browser.pages();
			await reportError(page, error);
		}
	}

	public async deleteMail({ id }: { id?: string }) {
		const gmail = await this.getGmailClient();
		await gmail.users.messages.trash({
			id,
			userId: "me",
		});
	}

	public async respond({
		reservationCode,
		reservationTitle,
		shouldAnswer,
	}: {
		reservationCode: string;
		reservationTitle: string;
		shouldAnswer: boolean;
	}) {
		if (shouldAnswer) {
			await airbnbLogin.bind(this.browser)();

			const newPage = await this.browser.newPage();
			const done = await sendMessage.bind(newPage)({
				reservationCode,
				type: RESERVATION_CONFIRMED,
			});

			logger.info(`done sending message for ${reservationCode}`);

			if (done) {
				const gmail = await this.getGmailClient();
				await gmail.users.messages.send({
					userId: "me",
					resource: {
						raw: buildMailBody({
							title: `[전송 완료] ${reservationTitle}`,
						}),
					},
				} as gmail_v1.Params$Resource$Users$Messages$Send);
			}
		}
	}

	public checkMailIsNew(receivedDate: string) {
		const UTC_OFFSET = 9;

		const receivedDateLocal = new Date(receivedDate).add({
			hour: UTC_OFFSET,
		});

		const lastRunDateLocal = new Date(Date.now()).add({
			hour: UTC_OFFSET,
			minutes: -ANSWER_TO_RESERVATION_PERIOD,
		});

		return lastRunDateLocal < receivedDateLocal;
	}

	public getReservationCode(mailBody: string) {
		// Airbnb reservation code is consisted of capital letters and numbers
		const matchReservationCode = /[A-Z0-9]{10}/;
		const matched = mailBody.match(matchReservationCode);

		if (!matched) {
			throw new Error(
				"메일에서 예약 코드를 찾을 수 없습니다. 예약 코드를 매칭하는 규칙을 개선하세요.",
			);
		}

		const [reservationCode] = matched;
		return reservationCode;
	}

	public parseMail(mail: gmail_v1.Schema$Message) {
		const headers = oc(mail).payload.headers([]);
		const dateReceived = oc(
			headers.find((header) => header.name === "Date"),
		).value("");
		const title = oc(headers.find((v) => v.name === "Subject")).value("");
		let body = oc(mail).payload.parts[0].body.data("");
		body = Buffer.from(body, "base64").toString("utf-8");

		return {
			dateReceived,
			title,
			body,
		};
	}

	public async getGmailClient() {
		const [page] = await this.browser.pages();
		const oauth2Client = await getAuthenticatedClient(page);

		if (!this.gmail) {
			this.gmail = await google.gmail({
				version: "v1",
				auth: oauth2Client as any,
			});
		}

		return this.gmail;
	}

	public async getSingleMail({ id }: { id?: string }) {
		const gmail = await this.getGmailClient();

		const { data } = await gmail.users.messages.get({
			id,
			userId: "me",
			format: "full",
		});

		return data;
	}

	public async getInbox() {
		const gmail = await this.getGmailClient();

		const {
			data: { messages = [] },
		} = await gmail.users.messages.list({
			userId: "me",
			labelIds: [process.env.AIRBNB_MAIL_LABEL_ID],
			maxResults: 20,
		} as any);

		return messages;
	}
}

export default ReservationAutoResponder;
