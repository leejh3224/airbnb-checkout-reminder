import { gmail_v1, google } from "googleapis";
import puppeteer from "puppeteer";

import {
	airbnbLogin,
	buildMailBody,
	detectLanguage,
	getOAuthClient,
	initPuppeteer,
	needsCheckInOrOut,
	sendMessage,
} from "./src/lib";
import {
	CHECK_IN,
	CHECK_OUT,
	RESERVATION_CONFIRMED,
} from "./src/lib/constants";

describe("needsCheckInOrOut", () => {
	const date = new Date("2019 1. 15.");

	test.each([
		["Jan 13–18, 2019", date, { required: false, type: undefined }],
		["Jan 13–15, 2019", date, { required: true, type: CHECK_OUT }],
		["Jan 15–17, 2019", date, { required: true, type: CHECK_IN }],
		["Jan 15–Feb 1, 2019", date, { required: true, type: CHECK_IN }],
		["Jan 30–Feb 1, 2019", date, { required: false, type: undefined }],
		["Dec 31–Jan 15, 2019", date, { required: true, type: CHECK_OUT }],
	])("input: %s", (a: any, b: any, expected) => {
		expect(needsCheckInOrOut(a, b)).toEqual(expected);
	});
});

describe("detect language", () => {
	test.each([
		["안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?", "ko"],
		[
			"hello, we are coming from germany and looking forward to staying at your place :)",
			"en",
		],
		["Qu'est-ce que vous faites?", "en"], // detect french then reply english
		[".", "ko"],
		["", "ko"],
	])("should detect `%s` to `%s`", async (input, output, done: any) => {
		const lang = await detectLanguage(input);
		expect(lang).toBe(output);
		done();
	});
});

describe("send gmail message", () => {
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

	it("can send mail subject and body containing non ascii characters", async () => {
		const [page] = await browser.pages();
		const oauth2Client = await getOAuthClient(page);

		const gmail = await google.gmail({
			version: "v1",
			auth: oauth2Client as any,
		});

		await gmail.users.messages.send({
			userId: "me",
			resource: {
				raw: buildMailBody({
					title: "한글=갓글",
					body: "<br>갓글로 보내주세요.</br>",
				}),
			},
		} as gmail_v1.Params$Resource$Users$Messages$Send);
	});
});

describe("send message", () => {
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

	test.each([[CHECK_IN], [CHECK_OUT], [RESERVATION_CONFIRMED]])(
		"case %s",
		async (type: any) => {
			const page = await browser.newPage();

			const done = await sendMessage.bind(page)({
				reservationCode: "HMPSHBSPMJ",
				type,
			});

			expect(done).toBe(true);

			await page.close();
		},
	);
});

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
