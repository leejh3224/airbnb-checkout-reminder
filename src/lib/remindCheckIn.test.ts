import puppeteer from "puppeteer";
import { getReservationTable, parseTableRow, setup } from "./remindCheckIn";

import { initPuppeteer } from ".";

describe("remindCheckIn", () => {
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

	it("retrieves Airbnb reservation table elements", async () => {
		const page = await setup(browser);
		const table = await getReservationTable(page);

		expect(Array.isArray(table)).toBeTruthy();
	});

	it("parses each row and return period, reservation code and status", async () => {
		const page = await setup(browser);
		const table = await getReservationTable(page);
		const parsed = await parseTableRow(page, table[0]);

		expect(parsed.period).not.toBe("");
		expect(parsed.reservationCode).not.toBe("");
		expect(parsed.status).not.toBe("");
	});
});
