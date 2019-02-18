import MockDate from "mockdate";
import * as puppeteer from "puppeteer";

import {
	airbnbLogin,
	answerToReservationMain,
	detectLanguage,
	initPuppeteer,
	needsCheckInOrOut,
	sendMessage,
} from "./src/lib";

describe.skip("needsCheckInOrOut", () => {
	const date = new Date("2019 1. 15.");

	test.each([
		["Jan 13–18, 2019", date, { required: false, type: null }],
		["Jan 13–15, 2019", date, { required: true, type: "check-out" }],
		["Jan 15–17, 2019", date, { required: true, type: "check-in" }],
		["Jan 20–25, 2019", date, { required: false, type: null }],
		["2019. 01. 02", date, undefined],
		["2019. 02. 20-25", date, undefined],
	])("input: %s, %s)", (a, b, expected) => {
		expect(needsCheckInOrOut(a, b)).toEqual(expected);
	});
});

describe.skip("Airbnb message scheduler", () => {
	let browser: puppeteer.Browser;

	beforeEach(async () => {
		browser = await initPuppeteer(false);

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterEach(async () => {
		// await browser.close();
	});

	it.skip("should handle login", async () => {
		const loginResult = await airbnbLogin.bind(browser)({
			email: process.env.email as string,
			password: process.env.password as string,
		});

		expect(loginResult).toBe(true);
	});
});

describe("detect language", () => {
	test.each([
		[
			"안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?",
			"ko",
		],
		[
			"hello, we are coming from germany and looking forward to staying at your place :)",
			"en",
		],
		["Qu'est-ce que vous faites?", "en"], // detect french then reply english
    [".", "ko"],
    ["", "ko"]
	])("should detect `%s` to `%s`", async (input, output, done) => {
		const lang = await detectLanguage(input);
		expect(lang).toBe(output);
		done();
	});
});

describe.skip("answerToReservation", () => {
	let browser: puppeteer.Browser;

	beforeEach(async () => {
		browser = await initPuppeteer(false);
		MockDate.set(new Date("2019. 02. 18. 18:20:00"));

		// puppeteer test takes longer time than usual tests.
		// so override default jest timeout not to interrupt test
		jest.setTimeout(150000);
	});

	afterEach(async () => {
		// await browser.close();
		MockDate.reset();
	});

	it("test", async () => {
		await answerToReservationMain(browser);
	});
});
