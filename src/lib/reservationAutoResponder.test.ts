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
			shouldAnswer: true,
		});
	});

	it("tests parseMail", async () => {
		const responder = new ReservationAutoResponder({ browser });

		const { dateReceived, title, body } = await responder.parseMail(testMail);

		expect(title).not.toBeFalsy();
		expect(dateReceived).not.toBeFalsy();
		expect(body).not.toBeFalsy();
	});

	it("tests checkMailIsNew", () => {
		const date = "Fri, 03 May 2019 16:47:43 +0000 (UTC)";
		const responder = new ReservationAutoResponder({ browser });
		const result = responder.checkMailIsNew(date);
		expect(result).toBeFalsy();
	});
});
