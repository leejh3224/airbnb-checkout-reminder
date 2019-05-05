import moment from "moment";
import puppeteer from "puppeteer";

import { initPuppeteer } from ".";
import * as testMail from "../fixtures/gmail/messages.get.json";
import ReservationAutoResponder from "./reservationAutoResponder";

describe("reservationAutoResponder", () => {
	let browser: puppeteer.Browser;

	beforeAll(async () => {
		browser = await initPuppeteer(false);

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterAll(async () => {
		await browser.close();
	});

	it("tests respond function", async () => {
		const responder = new ReservationAutoResponder({ browser });

		await responder.respond({
			reservationCode: "HMNHKJAY3Q",
			reservationTitle: "테스트 예약",
		});
	});

	it("tests parseMail", async () => {
		const responder = new ReservationAutoResponder({ browser });

		const { title, body } = await responder.parseMail(testMail);

		expect(title).not.toBeFalsy();
		expect(body).not.toBeFalsy();
	});

	it("tests getLastExecutedAtTimestamp", () => {
		const responder = new ReservationAutoResponder({ browser });
		const lastExecuted = responder.getLastExecutedAtTimestamp();
		const now = moment().unix();

		expect(lastExecuted).toBeLessThan(now);
	});

	it("tests getInbox", async () => {
		const responder = new ReservationAutoResponder({ browser });
		const mails = await responder.getInbox();
		expect(mails).toEqual([]);
	});
});