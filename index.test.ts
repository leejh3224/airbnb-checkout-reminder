import * as puppeteer from "puppeteer";
import { google } from "googleapis"

import {
	airbnbLogin,
	detectLanguage,
	initPuppeteer,
	needsCheckInOrOut,
	sendMessage,
	getOAuthClient
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

describe.skip("detect language", () => {
	test.each([
		[
			"안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?",
			"ko",
		],
		[
			"hello, we are coming from germany and looking forward to staying at your place :)",
			"en",
		],
		[
			"퇴사하고 그 동안 힘들었던 것 다 정리하며 머리 식힐겸 바다가 너무 보고싶어서 처음으로 포항 여행을 가려고 합니다^^ 혼자 가는 만큼 아늑하고 교통 편리한 숙소를 찾게 되었어요! 밖에서 지인도 만날거고 아침에도 일출도 보고 여유롭게 조용히 숙소에서 쉬고도 싶어서 결정하게 되었습니다^^ 잘 부탁드려요! 깨끗하게 사용할게요♡ ",
			"ko",
		],
		[
			"Hello Joy, we're a couple exploring southern Korea during the hoilday. Thanks for having us!",
			"en",
		],
		["Qu'est-ce que vous faites?", "en"], // detect french then reply english
	])("should detect `%s` to `%s`", async (input, output, done) => {
		const lang = await detectLanguage(input);
		expect(lang).toBe(output);
		done();
	});
});
