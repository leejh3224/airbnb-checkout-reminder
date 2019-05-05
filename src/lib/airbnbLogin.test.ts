import puppeteer from "puppeteer";

import { airbnbLogin, initPuppeteer } from ".";

describe("airbnb login", () => {
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

	it("should login user", async () => {
		const done = await airbnbLogin.bind(browser)();
		expect(done).toBe(true);
	});
});
